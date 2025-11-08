import createTestCafe from 'testcafe';
import { nanoid } from 'nanoid';
import { TestRunRequest, TestRunStatus, TestCase } from './types';
import { logger } from '../utils/logger';
import fs from 'fs/promises';
import path from 'path';
import { SignalRService } from './SignalRService';

export class TestRunnerService {
    private testCafe: any;
    private runningRuns: Map<string, TestRunStatus> = new Map();
    private signalR: SignalRService;
    private tempDir = process.env.TEMP_TESTS_DIR || path.join(process.cwd(), 'temp-tests');

    constructor(signalRService: SignalRService) {
        this.signalR = signalRService;
        // Fire-and-forget cleanup on startup
        this.cleanupTempArtifacts().catch(err => {
            logger.warn('Temp cleanup on startup failed', { error: err?.message });
        });
    }

    // --- Shared helpers ------------------------------------------------------

    private context(runId: string, extra: object = {}) {
        return { runId, ...extra };
    }

    private async ensureSignalR(runId: string) {
        try {
            await this.signalR.joinTestRun(runId);
            await this.signalR.sendTestUpdate(runId, { testRunId: runId, status: 'running', progress: 0 });
        } catch (err: any) {
            logger.warn('SignalR unavailable, proceeding without live updates', {
                error: err.message, runId,
            });
        }
    }

    private async sendSignalRUpdate(runId: string, update: any) {
        try {
            // Send both TestUpdate (for logs) and webhook for progress
            await this.signalR.sendTestUpdate(runId, { ...update, testRunId: runId });
            // Also send progress update via webhook if it has progress info
            if (update.progress !== undefined || update.totalTests !== undefined) {
                await this.sendWebhookUpdate(runId, update);
            }
        } catch (err: any) {
            logger.warn('Failed to send SignalR update', { error: err.message, runId });
        }
    }

    private async sendWebhookUpdate(runId: string, update: any, retries = 3) {
        const apiUrl = process.env.API_URL || 'http://localhost:5200';

        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                logger.info(`📡 Sending webhook update to ${apiUrl}/api/runner-webhook/status (attempt ${attempt}/${retries})`, {
                    runId,
                    status: update.status
                });

                const response = await fetch(`${apiUrl}/api/runner-webhook/status`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': 'test-runner-api-key-2024' // Add API key for authentication
                    },
                    body: JSON.stringify({
                        runId,
                        status: update.status || 'running',
                        totalTests: update.totalTests || 0,
                        passedTests: update.passedTests || 0,
                        failedTests: update.failedTests || 0
                    }),
                    signal: AbortSignal.timeout(10000) // 10 second timeout
                });

                if (!response.ok) {
                    logger.warn(`❌ Webhook update failed: ${response.status}`, { runId, attempt });
                    if (attempt < retries) {
                        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
                        continue;
                    }
                } else {
                    logger.info(`✅ Webhook update successful`, { runId, status: update.status, attempt });
                    return; // Success, exit
                }
            } catch (err: any) {
                logger.warn(`❌ Failed to send webhook update (attempt ${attempt}/${retries})`, {
                    error: err.message,
                    runId
                });
                if (attempt < retries) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
                    continue;
                }
            }
        }

        logger.error(`❌ All webhook update attempts failed after ${retries} retries`, { runId });
    }

    private async sendTestResult(runId: string, result: any, retries = 3) {
        const apiUrl = process.env.API_URL || 'http://localhost:5200';

        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                logger.info(`📊 Sending test result to ${apiUrl}/api/runner-webhook/result (attempt ${attempt}/${retries})`, {
                    runId,
                    testName: result.testCaseName || result.name,
                    status: result.status
                });

                const response = await fetch(`${apiUrl}/api/runner-webhook/result`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': 'test-runner-api-key-2024' // Add API key for authentication
                    },
                    body: JSON.stringify({
                        runId: runId,
                        testCaseName: result.testCaseName || result.name,
                        status: result.status,
                        durationMs: result.durationMs,
                        errorMessage: result.errorMessage,
                        stackTrace: result.stackTrace,
                        jsonReport: result
                    }),
                    signal: AbortSignal.timeout(10000) // 10 second timeout
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    logger.warn(`❌ Test result webhook failed: ${response.status} - ${errorText}`, {
                        runId,
                        testName: result.testCaseName || result.name,
                        attempt
                    });
                    if (attempt < retries) {
                        await new Promise(resolve => setTimeout(resolve, 500 * attempt));
                        continue;
                    }
                } else {
                    logger.info(`✅ Test result sent successfully`, {
                        runId,
                        testName: result.testCaseName || result.name,
                        attempt
                    });
                    return; // Success
                }
            } catch (err: any) {
                logger.warn(`❌ Failed to send test result (attempt ${attempt}/${retries})`, {
                    error: err.message,
                    runId,
                    testName: result.testCaseName || result.name
                });
                if (attempt < retries) {
                    await new Promise(resolve => setTimeout(resolve, 500 * attempt));
                    continue;
                }
            }
        }

        logger.error(`❌ All test result send attempts failed after ${retries} retries`, {
            runId,
            testName: result.testCaseName || result.name
        });
    }

    // --- Temp folder cleanup -------------------------------------------------

    private async cleanupTempArtifacts() {
        try {
            await fs.mkdir(this.tempDir, { recursive: true });

            // Configurable thresholds via env vars
            const maxAgeHours = Number(process.env.TEMP_TESTS_MAX_AGE_HOURS || 24);
            const maxTotalMb = Number(process.env.TEMP_TESTS_MAX_TOTAL_MB || 2048);
            const minFilesToKeep = Number(process.env.TEMP_TESTS_MIN_FILES_TO_KEEP || 5);

            const entries = await fs.readdir(this.tempDir, { withFileTypes: true });
            const items = entries.map(e => ({
                name: e.name,
                path: path.join(this.tempDir, e.name),
                isDir: e.isDirectory(),
            }));

            if (items.length === 0) {
                logger.info('🧹 Temp cleanup: no items to clean');
                return;
            }

            // Collect metadata: mtime, size
            const itemsWithStats = await Promise.all(
                items.map(async item => {
                    try {
                        const stat = await fs.stat(item.path);
                        const size = item.isDir
                            ? await this.getDirectorySize(item.path)
                            : stat.size;
                        return { ...item, mtime: stat.mtime, size };
                    } catch {
                        return { ...item, mtime: new Date(0), size: 0 };
                    }
                })
            );

            // Phase 1: Delete by age (older than maxAgeHours)
            const now = Date.now();
            const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
            const tooOld = itemsWithStats.filter(
                item => now - item.mtime.getTime() > maxAgeMs
            );

            for (const item of tooOld) {
                try {
                    if (item.isDir) {
                        await fs.rm(item.path, { recursive: true, force: true });
                    } else {
                        await fs.unlink(item.path);
                    }
                    logger.info(`🗑️ Cleaned old artifact: ${item.name} (age: ${Math.round((now - item.mtime.getTime()) / 1000 / 60)} min)`);
                } catch (err: any) {
                    logger.warn(`Failed to delete old artifact ${item.name}`, { error: err?.message });
                }
            }

            // Recalculate after phase 1
            const remaining = itemsWithStats.filter(
                item => !tooOld.includes(item)
            );
            const totalSize = remaining.reduce((sum, item) => sum + item.size, 0);
            const totalMb = totalSize / (1024 * 1024);

            // Phase 2: Delete oldest if total size exceeds limit, but keep minimum
            if (totalMb > maxTotalMb && remaining.length > minFilesToKeep) {
                const sorted = remaining.sort((a, b) => a.mtime.getTime() - b.mtime.getTime());
                let currentSize = totalSize;

                for (const item of sorted) {
                    if (remaining.length <= minFilesToKeep || currentSize <= maxTotalMb * 1024 * 1024) {
                        break;
                    }

                    try {
                        if (item.isDir) {
                            await fs.rm(item.path, { recursive: true, force: true });
                        } else {
                            await fs.unlink(item.path);
                        }
                        currentSize -= item.size;
                        remaining.splice(remaining.indexOf(item), 1);
                        logger.info(`🗑️ Cleaned artifact to reduce size: ${item.name} (${(item.size / 1024 / 1024).toFixed(2)} MB)`);
                    } catch (err: any) {
                        logger.warn(`Failed to delete artifact ${item.name}`, { error: err?.message });
                    }
                }

                logger.info(`🧹 Cleanup complete: ${remaining.length} items, ${(currentSize / 1024 / 1024).toFixed(2)} MB total`);
            } else {
                logger.info(`🧹 Cleanup complete: ${remaining.length} items, ${totalMb.toFixed(2)} MB total (within limits)`);
            }
        } catch (err: any) {
            logger.error('❌ Temp cleanup failed', { error: err?.message, stack: err?.stack });
        }
    }

    private async getDirectorySize(dirPath: string): Promise<number> {
        let size = 0;
        try {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);
                if (entry.isDirectory()) {
                    size += await this.getDirectorySize(fullPath);
                } else {
                    const stat = await fs.stat(fullPath);
                    size += stat.size;
                }
            }
        } catch {
            // Ignore errors during size calculation
        }
        return size;
    }

    private async createTempDir() {
        await fs.mkdir(this.tempDir, { recursive: true });
    }

    // --- TestCafe lifecycle --------------------------------------------------

    private async getTestCafeRunner(): Promise<any> {
        if (!this.testCafe) {
            logger.info('Creating new TestCafe instance');
            // Try without hostname parameter to let TestCafe auto-detect
            this.testCafe = await createTestCafe();
        }
        return this.testCafe.createRunner();
    }

    private async disposeTestCafe() {
        if (this.testCafe) {
            await this.testCafe.close();
            this.testCafe = null;
        }
    }

    // --- Core runner ---------------------------------------------------------

    async runGeneratedTestCafeFile(testSuiteId: string, fileContent: string, browser = 'chrome', providedRunId?: string) {
        const runId = providedRunId || nanoid();
        const apiUrl = process.env.API_URL || 'http://localhost:5200';

        // Count the number of test() calls in the file to get total tests
        const testMatches = fileContent.match(/test\s*\(/g);
        const totalTests = testMatches ? testMatches.length : 1;

        const status: TestRunStatus = {
            runId,
            status: 'running',
            totalTests,
            completedTests: 0,
            passedTests: 0,
            failedTests: 0,
            skippedTests: 0,
            progress: 0,
        };
        this.runningRuns.set(runId, status);

        await this.ensureSignalR(runId);
        await this.createTempDir();

        const filePath = path.join(this.tempDir, `${testSuiteId}.test.js`);
        await fs.writeFile(filePath, fileContent, 'utf8');

        // Send initial webhook update
        await this.sendWebhookUpdate(runId, {
            status: 'running',
            totalTests,
            passedTests: 0,
            failedTests: 0
        });

        try {
            const runner = await this.getTestCafeRunner();

            // Track test results - use a temp file for JSON reporter
            const reportPath = path.join(this.tempDir, `${runId}-report.json`);

            const failedCount = await runner
                .src([filePath])
                .browsers(browser)
                .reporter('json', reportPath)
                .run({ skipJsErrors: true });

            // Read and parse the JSON report
            const testResults: any[] = [];
            try {
                logger.info(`📄 Reading TestCafe report from: ${reportPath}`);
                
                // Check if report file exists
                try {
                    await fs.access(reportPath);
                    logger.info(`✅ Report file exists at ${reportPath}`);
                } catch {
                    logger.warn(`⚠️ Report file does NOT exist at ${reportPath}`);
                }
                
                const reportContent = await fs.readFile(reportPath, 'utf8');
                logger.info(`📄 Report content length: ${reportContent.length} bytes`);
                if (reportContent.length === 0) {
                    logger.warn('⚠️ Report file is empty!');
                } else {
                    logger.info(`📄 Report content preview: ${reportContent.substring(0, 200)}`);
                }

                const report = JSON.parse(reportContent);
                logger.info(`📊 Parsed report structure:`, {
                    hasFixtures: !!report.fixtures,
                    fixturesCount: report.fixtures?.length || 0,
                    reportKeys: Object.keys(report)
                });

                if (report.fixtures) {
                    report.fixtures.forEach((fixture: any, fixtureIndex: number) => {
                        logger.info(`🔧 Processing fixture ${fixtureIndex}: ${fixture.name}, tests count: ${fixture.tests?.length || 0}`);
                        fixture.tests.forEach((test: any, testIndex: number) => {
                            const hasErrors = test.errs && test.errs.length > 0;
                            
                            // Extract error message and stack trace
                            let errorMessage = null;
                            let stackTrace = null;
                            
                            if (hasErrors) {
                                const err = test.errs[0];
                                logger.info(`🔍 Full error object for ${test.name}:`, JSON.stringify(err, null, 2));
                                
                                // Try different error message fields
                                errorMessage = err.errMsg || err.message || err.text || err.userAgent || 'Unknown error';
                                
                                // Try different stack trace fields
                                if (err.callsite) {
                                    stackTrace = JSON.stringify(err.callsite);
                                } else if (err.stack) {
                                    stackTrace = err.stack;
                                } else {
                                    stackTrace = JSON.stringify(err);
                                }
                            }
                            
                            const testResult = {
                                name: test.name,
                                status: hasErrors ? 'failed' : 'passed',
                                durationMs: test.durationMs || 0,
                                errorMessage,
                                stackTrace
                            };
                            testResults.push(testResult);
                            logger.info(`✅ Added test result ${testIndex}: ${test.name} - ${testResult.status}`, {
                                hasErrorMessage: !!testResult.errorMessage,
                                hasStackTrace: !!testResult.stackTrace,
                                errorMessagePreview: testResult.errorMessage?.substring(0, 100)
                            });
                        });
                    });
                } else {
                    logger.warn('⚠️ No fixtures found in report!');
                }

                logger.info(`📊 Total test results collected: ${testResults.length}`);

                // Clean up report file
                await fs.unlink(reportPath).catch(() => { });
            } catch (err: any) {
                logger.error('❌ Failed to parse TestCafe report', {
                    error: err.message,
                    stack: err.stack,
                    reportPath
                });
            }

            const passedTests = totalTests - failedCount;
            Object.assign(status, {
                status: failedCount > 0 ? 'failed' : 'completed',
                completedTests: totalTests,
                passedTests,
                failedTests: failedCount,
                progress: 100,
            });

            // Send individual test results to webhook
            logger.info(`🚀 Starting to send ${testResults.length} test results to API`);

            if (testResults.length === 0) {
                logger.warn('⚠️ No test results to send! testResults array is empty.');
            }

            for (const result of testResults) {
                await this.sendTestResult(runId, result);
            }

            // Send final webhook update with results
            await this.sendWebhookUpdate(runId, {
                status: status.status,
                totalTests,
                passedTests,
                failedTests: failedCount
            });

            await this.sendSignalRUpdate(runId, { status: status.status, progress: 100 });
            logger.info('Run complete', this.context(runId, { testSuiteId, totalTests, passedTests, failedCount }));

            return { runId, status: status.status, failedCount };
        } catch (err: any) {
            const errorDetails = {
                id: nanoid(),
                message: err.message,
                stack: err.stack,
                name: err.name,
                code: err.code,
                timestamp: new Date().toISOString(),
            };

            Object.assign(status, { status: 'failed', error: errorDetails });
            logger.error('Test run failed', this.context(runId, { error: errorDetails }));
            await this.sendSignalRUpdate(runId, { status: 'failed', error: errorDetails });
            throw err;
        } finally {
            this.runningRuns.set(runId, status);
            await fs.rm(filePath, { force: true });
            await this.disposeTestCafe();
            // Fire-and-forget cleanup after run completes
            this.cleanupTempArtifacts().catch(err => {
                logger.warn('Temp cleanup after run failed', { error: err?.message });
            });
        }
    }

    async runTests(request: TestRunRequest) {
        const runId = request.runId || nanoid();
        const status: TestRunStatus = {
            runId,
            status: 'running',
            totalTests: 0,
            completedTests: 0,
            passedTests: 0,
            failedTests: 0,
            skippedTests: 0,
            progress: 0,
        };

        this.runningRuns.set(runId, status);
        await this.ensureSignalR(runId);
        await this.createTempDir();

        const allCases = this.collectTestCases(request);
        if (allCases.length === 0) {
            const msg = 'No test cases found in request';
            logger.error(msg, this.context(runId));
            await this.sendSignalRUpdate(runId, { status: 'failed', error: { message: msg } });
            return;
        }

        status.totalTests = allCases.length;

        // Build a map of testCaseId -> pageUrl from suites if provided in request
        const pageUrlMap = new Map<string, string>();
        (request.testSuites || []).forEach((suite: any) => {
            const url: string | undefined = suite?.pageUrl ?? suite?.page ?? suite?.url ?? suite?.fixturePageUrl;
            if (url && suite?.testCases) {
                suite.testCases.forEach((tc: any) => {
                    if (tc?.id) pageUrlMap.set(tc.id, url);
                });
            }
        });
        // Also allow pageUrl directly on test cases
        (request.testCases || []).forEach((tc: any) => {
            const url: string | undefined = tc?.pageUrl ?? tc?.page ?? tc?.url;
            if (url && tc?.id) pageUrlMap.set(tc.id, url);
        });

        const testFiles = await this.generateTestFiles(allCases, pageUrlMap);

        const runner = await this.getTestCafeRunner();
        const browser = request.browser || 'chrome';
        const start = Date.now();

        // Setup JSON reporter to capture test results
        const reportPath = path.join(this.tempDir, `${runId}-report.json`);

        try {
            logger.info('Running tests', this.context(runId, { total: allCases.length, browser }));
            logger.info(`🔧 Test files to run: ${testFiles.join(', ')}`);
            logger.info(`🌐 Browser: ${browser}`);
            logger.info(`📊 Report path: ${reportPath}`);

            logger.info('⏳ Starting TestCafe runner...');
            logger.info(`📋 Runner configuration: browser=${browser}, files=${testFiles.length}, report=${reportPath}`);
            
            let failedCount: number;
            try {
                // Use browser directly without path specification
                logger.info(`🔍 Launching browser: ${browser}`);
                
                failedCount = await runner.src(testFiles).browsers(browser).reporter('json', reportPath).run({
                    skipJsErrors: true,
                    selectorTimeout: 10000,
                    assertionTimeout: 10000,
                    browserInitializationTimeout: 5 * 60 * 1000, // 5 minutes for browser init
                });
                
                logger.info(`✅ TestCafe execution completed. Failed count: ${failedCount}`);
            } catch (runError: any) {
                logger.error('❌ TestCafe runner failed', {
                    error: runError.message,
                    stack: runError.stack,
                    name: runError.name
                });
                throw runError;
            }

            // Parse JSON report and send individual test results
            const testResults: any[] = [];
            try {
                logger.info(`📄 Reading TestCafe report from: ${reportPath}`);
                const reportContent = await fs.readFile(reportPath, 'utf8');
                logger.info(`📄 Report content length: ${reportContent.length} bytes`);

                const report = JSON.parse(reportContent);
                logger.info(`📊 Parsed report structure:`, {
                    hasFixtures: !!report.fixtures,
                    fixturesCount: report.fixtures?.length || 0,
                    reportKeys: Object.keys(report)
                });

                if (report.fixtures) {
                    report.fixtures.forEach((fixture: any, fixtureIndex: number) => {
                        logger.info(`🔧 Processing fixture ${fixtureIndex}: ${fixture.name}, tests count: ${fixture.tests?.length || 0}`);
                        fixture.tests.forEach((test: any, testIndex: number) => {
                            const hasErrors = test.errs && test.errs.length > 0;
                            
                            // Extract error message and stack trace
                            let errorMessage = null;
                            let stackTrace = null;
                            
                            if (hasErrors) {
                                const err = test.errs[0];
                                logger.info(`🔍 Full error object for ${test.name}:`, JSON.stringify(err, null, 2));
                                
                                // Try different error message fields
                                errorMessage = err.errMsg || err.message || err.text || err.userAgent || 'Unknown error';
                                
                                // Try different stack trace fields
                                if (err.callsite) {
                                    stackTrace = JSON.stringify(err.callsite);
                                } else if (err.stack) {
                                    stackTrace = err.stack;
                                } else {
                                    stackTrace = JSON.stringify(err);
                                }
                            }
                            
                            const testResult = {
                                name: test.name,
                                status: hasErrors ? 'failed' : 'passed',
                                durationMs: test.durationMs || 0,
                                errorMessage,
                                stackTrace
                            };
                            testResults.push(testResult);
                            logger.info(`✅ Added test result ${testIndex}: ${test.name} - ${testResult.status}`, {
                                hasErrorMessage: !!testResult.errorMessage,
                                hasStackTrace: !!testResult.stackTrace,
                                errorMessagePreview: testResult.errorMessage?.substring(0, 100)
                            });
                        });
                    });
                } else {
                    logger.warn('⚠️ No fixtures found in report!');
                }

                logger.info(`📊 Total test results collected: ${testResults.length}`);

                // Clean up report file
                await fs.unlink(reportPath).catch(() => { });
            } catch (err: any) {
                logger.error('❌ Failed to parse TestCafe report', {
                    error: err.message,
                    stack: err.stack,
                    reportPath
                });
            }

            // Send individual test results to webhook
            const apiUrl = process.env.API_URL || 'http://localhost:5200';
            logger.info(`🚀 Starting to send ${testResults.length} test results to API`);

            if (testResults.length === 0) {
                logger.warn('⚠️ No test results to send! testResults array is empty.');
            }

            for (const result of testResults) {
                await this.sendTestResult(runId, result);
            }

            status.status = failedCount > 0 ? 'failed' : 'completed';
            status.progress = 100;
            await this.sendSignalRUpdate(runId, {
                status: status.status,
                progress: 100,
                totalTests: allCases.length,
                passedTests: allCases.length - failedCount,
                failedTests: failedCount
            });

            logger.info('Test run completed', this.context(runId, {
                failedCount,
                duration: `${Date.now() - start}ms`,
            }));
        } catch (err: any) {
            const errorDetails = {
                id: nanoid(),
                message: err.message,
                stack: err.stack,
                name: err.name,
                timestamp: new Date().toISOString(),
            };
            logger.error('❌ Test run error', this.context(runId, { error: errorDetails }));
            logger.error('❌ Full error details:', {
                message: err.message,
                name: err.name,
                code: err.code,
                stack: err.stack?.substring(0, 1000),
                toString: err.toString(),
            });
            Object.assign(status, { status: 'failed', error: errorDetails });
            await this.sendSignalRUpdate(runId, {
                status: 'failed',
                error: errorDetails,
                totalTests: allCases.length,
                passedTests: 0,
                failedTests: allCases.length
            });
        } finally {
            this.runningRuns.set(runId, status);
            await this.disposeTestCafe();
            // Fire-and-forget cleanup after run completes
            this.cleanupTempArtifacts().catch(err => {
                logger.warn('Temp cleanup after run failed', { error: err?.message });
            });
        }
    }

    // --- Test file generation -------------------------------------------------

    private collectTestCases(request: TestRunRequest): TestCase[] {
        const cases = [
            ...(request.testCases || []),
            ...(request.testSuites?.flatMap(s => s.testCases || []) || []),
        ];

        logger.info('Collected test cases', {
            total: cases.length,
            fromSuites: request.testSuites?.length || 0,
            directCases: request.testCases?.length || 0,
        });

        return cases;
    }

    private async generateTestFiles(cases: TestCase[], pageUrlMap?: Map<string, string>): Promise<string[]> {
        const files: string[] = [];
        for (const tc of cases) {
            const filePath = path.join(this.tempDir, `${tc.id}.test.ts`);
            const content =
                tc.testType === 'script' && tc.scriptText
                    ? this.generateFromScript(tc, pageUrlMap?.get(tc.id))
                    : this.generateFromSteps(tc, pageUrlMap?.get(tc.id));
            await fs.writeFile(filePath, content, 'utf8');
            files.push(filePath);
        }
        return files;
    }

    private generateFromSteps(tc: TestCase, pageUrl?: string): string {
        const steps = tc.steps || [];
        const esc = (v: string) => v?.replace(/'/g, "\\'") ?? '';

        const body = steps
            .map(step => {
                const s: any = step as any;
                const action = (s.action || '').toLowerCase();
                // Prefer target, but fall back to selector/locator/css if provided by UI
                const target = esc(s.target ?? s.selector ?? s.locator ?? s.css ?? '');
                // Prefer value, but fall back to common aliases from UI
                // For assertions, skip empty string values and check assertionValue first
                const rawValue =
                    (s.value && s.value.trim() !== '' ? s.value : null) ??
                    (s.text && s.text.trim() !== '' ? s.text : null) ??
                    (s.input && s.input.trim() !== '' ? s.input : null) ??
                    s.assertionValue ?? s.AssertionValue ?? s.assertion_value ??
                    s.expected ?? s.Expected ?? s.expectedValue ?? s.ExpectedValue ?? s.expectedText ?? s.ExpectedText ??
                    s.expected_value ?? s.expected_text ?? s.assertValue ?? s.assertText ?? s.assert_value ?? s.assert_text ??
                    s.expected_message ?? s.expectedMessage ?? s.message ?? s.msg ??
                    s.contains ?? s.equals ?? s.equal ?? s.eq ??
                    // nested assertion objects
                    s.assertion?.expected ?? s.assertion?.value ?? s.assertion?.text ?? s.assert?.expected ?? s.assert?.value ?? '';
                const value = esc(rawValue);
                const operator = (
                    s.operator ?? s.assertionType ?? s.comparison ?? s.assertion?.type ?? s.assert?.type ?? ''
                ).toLowerCase();
                switch (action) {
                    case 'navigate': return `await t.navigateTo('${value || target}');`;
                    case 'click': return `await t.click(Selector('${target}'));`;
                    case 'type': return `await t.typeText(Selector('${target}'), '${value}');`;
                    case 'wait': return `await t.wait(${Number(value) || 1000});`;
                    case 'assert':
                    case 'expect': {
                        if (!value) {
                            logger.warn('Assertion step missing expected value', { testCase: tc.id, operator, keys: Object.keys(s), step: s });
                        } else {
                            logger.info('Assertion step parsed', { testCase: tc.id, operator, target, value });
                        }
                        if (operator === 'equals' || operator === 'equal' || operator === 'eql' || operator === '==') {
                            return `await t.expect(Selector('${target}').innerText).eql('${value}')`;
                        }
                        // default to contains
                        return `await t.expect(Selector('${target}').innerText).contains('${value}')`;
                    }
                    case 'screenshot': return `await t.takeScreenshot();`;
                    default:
                        logger.warn('Unknown or missing action in step', { testCase: tc.id, action, keys: Object.keys(s) });
                        return `// Unknown action: ${action}`;
                }
            })
            .join('\n    ');

        const pageLine = esc(pageUrl || 'about:blank');
        return `
import { Selector } from 'testcafe';

fixture('${tc.name}')
  .page('${pageLine}');

test('${tc.name}', async t => {
    ${body}
});
`.trim();
    }

    private generateFromScript(tc: TestCase, pageUrl?: string): string {
        const raw = (tc.scriptText || '').trim();
        if (!raw) {
            return `// Empty script for ${tc.name}`;
        }
        const hasFixture = /\bfixture\s*\(/.test(raw);
        const hasTest = /\btest\s*\(/.test(raw);
        const hasImport = /\bimport\s+\{?\s*Selector/.test(raw);
        const desiredPage = (pageUrl || '').trim();

        // If looks like a full TestCafe file already, return as-is
        if (hasFixture && hasTest && hasImport) return raw;

        // If it has test() but missing import, prepend import only
        if (hasTest && !hasImport) {
            return `import { Selector } from 'testcafe';\n\n${raw}`;
        }

        // Otherwise treat as test body/snippet and wrap it
        const body = raw.replace(/^\s*await\s+t\./, 'await t.');
        const pageLine = desiredPage || 'about:blank';
        return `
import { Selector } from 'testcafe';

fixture('${tc.name}')
  .page('${pageLine}');

test('${tc.name}', async t => {
    ${body}
});
`.trim();
    }

    // --- Run control ----------------------------------------------------------

    async cancelTestRun(runId: string) {
        const status = this.runningRuns.get(runId);
        if (!status || status.status !== 'running') return false;
        status.status = 'cancelled';
        this.runningRuns.set(runId, status);
        return true;
    }

    async getTestRunStatus(runId: string) {
        return this.runningRuns.get(runId);
    }
}
