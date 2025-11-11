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
    // Use project temp-tests directory to avoid permission issues
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
            const current = this.runningRuns.get(runId);
            const enriched: any = { ...update };
            // Preserve totals and counts if not explicitly provided
            if (enriched.totalTests === undefined && current?.totalTests !== undefined) {
                enriched.totalTests = current.totalTests;
            }
            if (enriched.passedTests === undefined && current?.passedTests !== undefined) {
                enriched.passedTests = current.passedTests;
            }
            if (enriched.failedTests === undefined && current?.failedTests !== undefined) {
                enriched.failedTests = current.failedTests;
            }
            // Send both TestUpdate (for logs) and webhook for progress
            await this.signalR.sendTestUpdate(runId, { ...enriched, testRunId: runId });
            // Also send progress update via webhook if it has progress info
            if (enriched.progress !== undefined || enriched.totalTests !== undefined) {
                await this.sendWebhookUpdate(runId, enriched);
            }
        } catch (err: any) {
            logger.warn('Failed to send SignalR update', { error: err.message, runId });
        }
    }

    private async sendWebhookUpdate(runId: string, update: any, retries = 3) {
        const apiUrl = process.env.API_URL || 'http://localhost:5106';

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
        const apiUrl = process.env.API_URL || 'http://localhost:5106';

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
        try {
            await fs.mkdir(this.tempDir, { recursive: true });
            logger.info(`✅ Temp directory ready: ${this.tempDir}`);
        } catch (error: any) {
            logger.error(`❌ Failed to create temp directory: ${this.tempDir}`, {
                error: error.message,
                code: error.code,
                suggestion: 'Check permissions or set TEMP_TESTS_DIR environment variable to a writable location'
            });
            throw new Error(`Cannot create temp directory: ${this.tempDir}. Error: ${error.message}. Please ensure the directory is writable or set TEMP_TESTS_DIR environment variable.`);
        }
    }

    // --- TestCafe lifecycle --------------------------------------------------

    private async cleanupStrayProcesses(browser: string) {
        try {
            const { execSync } = require('child_process');
            const isWindows = process.platform === 'win32';
            
            if (isWindows) {
                // Kill browser processes on Windows
                const browsers = [browser];
                if (browser === 'chrome') {
                    browsers.push('chrome', 'chromium', 'msedge');
                }
                
                for (const b of browsers) {
                    try {
                        execSync(`taskkill /IM ${b}.exe /F 2>nul`, { stdio: 'ignore' });
                        logger.info(`🧹 Killed stray ${b}.exe processes`);
                    } catch (e) {
                        // Process may not exist, that's fine
                    }
                }
            } else {
                // Kill browser processes on Linux/Mac
                try {
                    execSync(`pkill -f ${browser} 2>/dev/null || true`, { stdio: 'ignore' });
                    logger.info(`🧹 Killed stray ${browser} processes`);
                } catch (e) {
                    // Process may not exist, that's fine
                }
            }
        } catch (error: any) {
            logger.warn('⚠️ Failed to cleanup stray processes:', error.message);
            // Don't fail the test run if cleanup fails
        }
    }

    private async getTestCafeRunner(): Promise<any> {
        if (!this.testCafe) {
            logger.info('Creating new TestCafe instance with hostname 127.0.0.1');
            // Bind to localhost to avoid network interface issues causing browser connection errors
            this.testCafe = await createTestCafe('127.0.0.1', 1337, 1338);
            logger.info('TestCafe instance created successfully', { hostname: '127.0.0.1', ports: [1337, 1338] });
        }
        return this.testCafe.createRunner();
    }

    private getBrowserCandidates(requested: string): string[] {
        const list: string[] = [];
        const req = (requested || '').trim();
        const isWin = process.platform === 'win32';
        if (isWin) {
            // Prefer Edge first on Windows for reliability
            list.push('edge', 'edge:headless');
            if (req) list.push(req);
            if (req && !req.includes(':')) list.push(`${req}:headless`);
            list.push('chrome', 'chrome:headless');
            // Optionally try Firefox too
            list.push('firefox', 'firefox:headless');
        } else {
            if (req) list.push(req);
            if (req && !req.includes(':')) list.push(`${req}:headless`);
            list.push('chrome', 'chrome:headless', 'firefox', 'firefox:headless');
        }
        // De-duplicate while preserving order
        return Array.from(new Set(list));
    }

    private async disposeTestCafe() {
        if (this.testCafe) {
            await this.testCafe.close();
            this.testCafe = null;
        }
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

    // --- Test execution --------------------------------------------------------

    async runTests(testSuiteId: string): Promise<string> {
        const runId = nanoid();
        logger.info('🚀 Starting test run', this.context(runId, { testSuiteId }));
        
        // This is a simplified version - in real implementation you'd fetch test suite data
        // For now, return the runId to satisfy the API
        this.runningRuns.set(runId, {
            status: 'running',
            runId,
            startTime: new Date(),
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            completedTests: 0,
            currentStep: null,
            errorMessage: null,
            progress: 0,
            skippedTests: 0,
            endTime: null
        });
        
        return runId;
    }

    async runGeneratedTestCafeFile(testSuiteId: string, fileContent: string, browser = 'chrome', providedRunId?: string) {
        const runId = providedRunId || nanoid();
        logger.info('🚀 Starting TestCafe file execution', this.context(runId, { testSuiteId, browser }));
        
        // Ensure temp directory exists
        await fs.mkdir(this.tempDir, { recursive: true });
        logger.info('📁 Temp directory ensured', { tempDir: this.tempDir });
        
        const filePath = path.join(this.tempDir, `${runId}.test.js`);
        const reportPath = path.join(this.tempDir, `${runId}-report.json`);
        
        logger.info('📝 Writing test file', { filePath });
        await fs.writeFile(filePath, fileContent, 'utf8');
        logger.info('✅ Test file written successfully', { filePath, size: fileContent.length });

        // Initialize run status
        const status: TestRunStatus = {
            status: 'running',
            runId,
            startTime: new Date(),
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            completedTests: 0,
            currentStep: null,
            errorMessage: null,
            progress: 0,
            skippedTests: 0,
            endTime: null
        };
        this.runningRuns.set(runId, status);

        await this.ensureSignalR(runId);

        const browserCandidates = this.getBrowserCandidates(browser);
        logger.info('🌐 Browser candidates prepared', { candidates: browserCandidates, requested: browser });
        
        let failedCount = 0;
        let succeeded = false;
        let lastRunError: Error | null = null;
        let attemptedBrowsers: string[] = [];

        for (const browserConfig of browserCandidates) {
            attemptedBrowsers.push(browserConfig);
            logger.info(`🔄 Attempting browser: ${browserConfig}`, this.context(runId, { attempt: attemptedBrowsers.length }));
            
            await this.sendSignalRUpdate(runId, {
                status: 'running',
                progress: 5 + (attemptedBrowsers.length * 5),
                errorMessage: `Attempting browser: ${browserConfig}`
            });
            
            try {
                const runner = await this.getTestCafeRunner();
                logger.info('🎯 TestCafe runner obtained, starting test execution', this.context(runId, { browserConfig }));
                
                await this.sendSignalRUpdate(runId, {
                    status: 'running',
                    progress: 15 + (attemptedBrowsers.length * 5),
                    errorMessage: `Starting tests with ${browserConfig}...`
                });
                
                const runPromise = runner.src([filePath]).browsers(browserConfig).reporter('json', reportPath).run({
                    pageLoadTimeout: 30000,
                    browserInitTimeout: 60000,
                    selectorTimeout: 10000,
                    assertionTimeout: 10000,
                    speed: 1
                });
                
                logger.info('⏳ Test execution started, waiting for completion...', this.context(runId, { browserConfig }));
                failedCount = await runPromise;
                succeeded = true;
                
                logger.info('✅ Test execution completed successfully', this.context(runId, { browserConfig, failedCount }));
                break;

            } catch (runError: any) {
                lastRunError = runError;
                logger.error(`❌ Browser ${browserConfig} failed to run tests`, this.context(runId, {
                    browser: browserConfig,
                    error: runError?.message || runError,
                    stack: runError?.stack
                }));
                
                await this.sendSignalRUpdate(runId, {
                    status: 'running',
                    progress: 5 + (attemptedBrowsers.length * 5),
                    errorMessage: `Browser ${browserConfig} failed: ${runError?.message || 'Unknown error'}`
                });
                
                // Cleanup stray processes for this browser type
                const browserName = browserConfig.split(':')[0];
                await this.cleanupStrayProcesses(browserName);
            }
        }

        if (!succeeded && lastRunError) {
            logger.error('🚨 All browser attempts failed, final error', this.context(runId, {
                attemptedBrowsers,
                finalError: lastRunError.message,
                stack: lastRunError.stack
            }));
            
            await this.sendSignalRUpdate(runId, {
                status: 'failed',
                progress: 100,
                errorMessage: `All browsers failed. Last error: ${lastRunError.message}`,
                failedTests: 1
            });
            
            throw lastRunError;
        }

// Parse JSON report and send results
        let reportData: any = null;
        let actualPassedTests = 0;
        let actualFailedTests = 0;
        let actualTotalTests = 0;
        
        try {
            const reportContent = await fs.readFile(reportPath, 'utf8');
            reportData = JSON.parse(reportContent);
            
            // Extract actual test results from report and send each test result
            if (reportData?.fixtures) {
                for (const fixture of reportData.fixtures) {
                    if (fixture.tests) {
                        for (const test of fixture.tests) {
                            actualTotalTests++;
                            const hasFailed = test.errs && test.errs.length > 0;
                            
                            if (hasFailed) {
                                actualFailedTests++;
                            } else {
                                actualPassedTests++;
                            }
                            
                            // Send individual test result to webhook
                            await this.sendTestResult(runId, {
                                name: test.name,
                                status: hasFailed ? 'failed' : 'passed',
                                durationMs: test.durationMs || 0,
                                errorMessage: hasFailed ? (test.errs[0]?.errMsg || test.errs[0] || 'Test failed') : undefined,
                                stackTrace: hasFailed ? (test.errs[0]?.stack || test.errs[0]) : undefined
                            });
                        }
                    }
                }
            }
            
            logger.info('📊 Test report parsed successfully', this.context(runId, { 
                totalTests: actualTotalTests,
                passedTests: actualPassedTests,
                failedTests: actualFailedTests
            }));
        } catch (reportError: any) {
            logger.warn('⚠️ Failed to parse TestCafe JSON report', this.context(runId, {
                error: reportError.message,
                reportPath
            }));
        }

        // Send final results with actual test counts
        const finalStatus = {
            status: (actualFailedTests > 0 ? 'failed' : 'completed') as TestRunStatus['status'],
            progress: 100,
            totalTests: actualTotalTests,
            passedTests: actualPassedTests,
            failedTests: actualFailedTests
        };

        await this.sendSignalRUpdate(runId, finalStatus);
        this.runningRuns.set(runId, { ...status , ...finalStatus });

        logger.info('🏁 TestCafe file execution completed', this.context(runId, finalStatus));
        return { runId, status: finalStatus.status, failedCount: actualFailedTests };
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
