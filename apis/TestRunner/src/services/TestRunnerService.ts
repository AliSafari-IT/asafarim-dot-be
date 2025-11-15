import createTestCafe from 'testcafe';
import { nanoid } from 'nanoid';
import { TestRunRequest, TestRunStatus, TestCase } from './types';
import { logger } from '../utils/logger';
import fs from 'fs/promises';
import path from 'path';
import { SignalRService } from './SignalRService';

// Shape of the API response for GET /api/test-suites/{id}/testcafe-file
interface TestCafeFileResponse {
    fileContent: string;
    filePath?: string; // Relative path to the generated test file
    generatedAt?: string | Date | null;
}

// Shape of the API response for POST /api/test-suites/{id}/generate-testcafe
interface TestCafeGenerationResponse {
    message?: string;
    generatedAt?: string | Date | null;
    success?: boolean;
}

export class TestRunnerService {
    private testCafe: any;
    private runningRuns: Map<string, TestRunStatus> = new Map();
    private signalR: SignalRService;
    // Use project temp-tests directory to avoid permission issues
    private tempDir = process.env.TEMP_TESTS_DIR || path.join(process.cwd(), 'temp-tests');
    private apiUrl: string;
    private apiKey: string;

    constructor(signalRService: SignalRService) {
        this.signalR = signalRService;
        this.apiUrl = process.env.API_URL || 'http://localhost:5106';
        this.apiKey = process.env.API_KEY || 'test-runner-api-key-2024';

        logger.info('🔗 Connecting to TestAutomation API at:', this.apiUrl);

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
                    testCaseId: result.testCaseId,
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
                        testCaseId: result.testCaseId,
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
        const forceHeadless = process.env.FORCE_HEADLESS === 'true';
        const defaultBrowser = process.env.BROWSER || 'chrome:headless';
        const edgePath = process.env.EDGE_PATH;

        // In production or when FORCE_HEADLESS is set, only use headless browsers
        if (forceHeadless) {
            logger.info('🎭 Force headless mode enabled');
            // Use environment variable browser or default to chrome:headless with stability flags
            if (defaultBrowser.includes('chrome')) {
                // Add comprehensive flags for stability in production
                const chromeFlags = [
                    'chrome:headless',
                    '--no-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--disable-software-rasterizer',
                    '--disable-extensions',
                    '--disable-setuid-sandbox',
                    '--single-process',
                    '--disable-background-networking',
                    '--disable-default-apps',
                    '--disable-sync',
                    '--metrics-recording-only',
                    '--mute-audio',
                    '--no-first-run',
                    '--safebrowsing-disable-auto-update',
                    '--disable-web-security'
                ].join(' ');
                list.push(chromeFlags);
            } else if (defaultBrowser.includes('edge')) {
                // Use Edge headless
                logger.info(`🎯 Using Edge headless mode`);
                list.push('edge:headless');
            } else {
                list.push(defaultBrowser);
            }
            // Fallback options for production
            list.push('chrome:headless --no-sandbox --disable-dev-shm-usage');
            return Array.from(new Set(list));
        }

        // Development mode: try both headless and headed browsers
        if (isWin) {
            // Prefer Edge first on Windows for reliability (no explicit path needed if in PATH)
            list.push('edge:headless', 'edge');
            if (req) list.push(req);
            if (req && !req.includes(':')) list.push(`${req}:headless`);
            list.push('chrome:headless', 'chrome');
            // Optionally try Firefox too
            list.push('firefox:headless', 'firefox');
        } else {
            if (req) list.push(req);
            if (req && !req.includes(':')) list.push(`${req}:headless`);
            list.push('chrome:headless', 'chrome', 'firefox:headless', 'firefox');
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

    async runTests(requestOrId: TestRunRequest | string): Promise<string> {
        // Handle both string (testSuiteId) and full TestRunRequest
        if (typeof requestOrId === 'string') {
            // Legacy endpoint - just return a runId
            const runId = nanoid();
            logger.info('🚀 Starting test run (legacy)', this.context(runId, { testSuiteId: requestOrId }));

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

        // Full TestRunRequest - execute the tests
        const request = requestOrId;
        const runId = request.runId || nanoid();

        logger.info('🚀 Starting test run', this.context(runId, {
            testSuitesCount: request.testSuites?.length || 0,
            testCasesCount: request.testCases?.length || 0,
            browser: request.browser
        }));

        // Initialize run status
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

        // Execute tests asynchronously
        this.executeTestRun(request).catch((error) => {
            logger.error('Test run execution failed', this.context(runId, {
                error: error.message,
                stack: error.stack
            }));

            // Update status to failed
            const currentStatus = this.runningRuns.get(runId);
            if (currentStatus) {
                currentStatus.status = 'failed';
                currentStatus.errorMessage = { message: error.message, stack: error.stack };
                currentStatus.endTime = new Date();
                this.runningRuns.set(runId, currentStatus);
            }
        });

        return runId;
    }

    private async executeTestRun(request: TestRunRequest): Promise<void> {
        const runId = request.runId;

        try {
            // Fetch test suite data from API if needed
            const testSuites = request.testSuites || [];
            const testCases = request.testCases || [];

            if (testSuites.length === 0 && testCases.length === 0) {
                throw new Error('No test suites or test cases provided');
            }

            // Collect all test files from all suites
            const testFiles: Array<{ suiteId: string; fileContent: string; filePath: string }> = [];

            // For each test suite, regenerate and fetch TestCafe file
            for (let i = 0; i < testSuites.length; i++) {
                const suite = testSuites[i];
                const progress = Math.floor((i / testSuites.length) * 30); // 0-30% for preparation

                logger.info('📦 Processing test suite', this.context(runId, {
                    suiteId: suite.id,
                    suiteName: suite.name,
                    testCasesCount: suite.testCases?.length || 0,
                    suiteIndex: i + 1,
                    totalSuites: testSuites.length
                }));

                // Update progress: Starting regeneration
                await this.sendSignalRUpdate(runId, {
                    status: 'running',
                    progress: progress + 5,
                    currentStep: `Regenerating test file for ${suite.name}... (${i + 1}/${testSuites.length})`,
                    errorMessage: null
                });

                // Always regenerate TestCafe file to ensure latest test scripts are used
                await this.regenerateTestSuite(suite.id, runId);

                // Update progress: Fetching generated file
                await this.sendSignalRUpdate(runId, {
                    status: 'running',
                    progress: progress + 10,
                    currentStep: `Fetching generated test file for ${suite.name}... (${i + 1}/${testSuites.length})`,
                    errorMessage: null
                });

                // Fetch the freshly generated TestCafe file
                const { fileContent, filePath } = await this.fetchTestCafeFile(suite.id, runId);

                if (!filePath) {
                    throw new Error(`No file path returned for test suite ${suite.id}`);
                }

                testFiles.push({ suiteId: suite.id, fileContent, filePath });
            }

            // Now run all test files together in a single TestCafe execution
            await this.sendSignalRUpdate(runId, {
                status: 'running',
                progress: 35,
                currentStep: `Running ${testFiles.length} test suite(s)...`,
                errorMessage: null
            });

            await this.runMultipleTestCafeFiles(testFiles, request.browser, runId);

            logger.info('✅ Test run completed successfully', this.context(runId));

        } catch (error: any) {
            logger.error('❌ Test run failed', this.context(runId, {
                error: error.message,
                stack: error.stack
            }));
            throw error;
        }
    }

    /**
     * Regenerates TestCafe file for a test suite to ensure latest test scripts are used
     */
    private async regenerateTestSuite(suiteId: string, runId: string): Promise<void> {
        const maxRetries = 3;
        const baseDelay = 500; // milliseconds

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                logger.info('🔄 Regenerating TestCafe file', this.context(runId, {
                    suiteId,
                    attempt,
                    maxRetries
                }));

                const response = await fetch(`${this.apiUrl}/api/test-suites/${suiteId}/generate-testcafe`, {
                    method: 'POST',
                    headers: {
                        'X-API-Key': this.apiKey,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP ${response.status} ${response.statusText}: ${errorText}`);
                }

                const result = (await response.json()) as TestCafeGenerationResponse;
                logger.info('✅ TestCafe file regenerated successfully', this.context(runId, {
                    suiteId,
                    attempt,
                    generatedAt: result.generatedAt || new Date().toISOString()
                }));

                return; // Success, exit retry loop

            } catch (error: any) {
                const isLastAttempt = attempt === maxRetries;

                logger.warn(`⚠️ TestCafe regeneration attempt ${attempt}/${maxRetries} failed`, this.context(runId, {
                    suiteId,
                    attempt,
                    error: error.message,
                    willRetry: !isLastAttempt
                }));

                if (isLastAttempt) {
                    throw new Error(`Failed to regenerate TestCafe file after ${maxRetries} attempts: ${error.message}`);
                }

                // Exponential backoff: 500ms, 1000ms, 1500ms
                const delay = baseDelay * attempt;
                logger.info(`⏳ Retrying in ${delay}ms...`, this.context(runId, { suiteId, attempt }));
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    /**
     * Fetches the generated TestCafe file content and path from the API
     */
    private async fetchTestCafeFile(suiteId: string, runId: string): Promise<{ fileContent: string; filePath?: string }> {
        const maxRetries = 3;
        const baseDelay = 300; // milliseconds

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                logger.info('📄 Fetching TestCafe file', this.context(runId, {
                    suiteId,
                    attempt,
                    maxRetries
                }));

                const response = await fetch(`${this.apiUrl}/api/test-suites/${suiteId}/testcafe-file`, {
                    headers: {
                        'X-API-Key': this.apiKey,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP ${response.status} ${response.statusText}: ${errorText}`);
                }

                // Parse JSON response and extract fileContent and filePath
                const jsonResponse = (await response.json()) as TestCafeFileResponse;
                const fileContent = jsonResponse.fileContent;
                const filePath = jsonResponse.filePath;

                if (!fileContent || typeof fileContent !== 'string') {
                    throw new Error(`Invalid or empty fileContent in response`);
                }

                logger.info('✅ TestCafe file fetched successfully', this.context(runId, {
                    suiteId,
                    attempt,
                    fileSize: fileContent.length,
                    filePath,
                    generatedAt: jsonResponse.generatedAt
                }));

                return { fileContent, filePath };

            } catch (error: any) {
                const isLastAttempt = attempt === maxRetries;

                logger.warn(`⚠️ TestCafe file fetch attempt ${attempt}/${maxRetries} failed`, this.context(runId, {
                    suiteId,
                    attempt,
                    error: error.message,
                    willRetry: !isLastAttempt
                }));

                if (isLastAttempt) {
                    throw new Error(`Failed to fetch TestCafe file after ${maxRetries} attempts: ${error.message}`);
                }

                // Linear backoff: 300ms, 600ms, 900ms
                const delay = baseDelay * attempt;
                logger.info(`⏳ Retrying in ${delay}ms...`, this.context(runId, { suiteId, attempt }));
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        // This should never be reached due to throw on last attempt, but TypeScript requires it
        throw new Error(`Failed to fetch TestCafe file after ${maxRetries} attempts`);
    }

    /**
     * Extracts TEST_CASE_ID from generated test file content
     * Uses robust regex to handle multi-line test declarations and special characters
     */
    private extractTestCaseIdMapping(fileContent: string, runId: string): Record<string, string> {
        const testCaseMap: Record<string, string> = {};

        try {
            // Robust regex pattern that handles:
            // - test.skip() and test.only() modifiers
            // - Multi-line test declarations
            // - Special characters and nested quotes in test names
            // - TEST_CASE_ID comment right after opening brace
            // Match single-quoted, double-quoted, or backtick-quoted strings separately
            const patterns = [
                /test(?:\.skip|\.only)?\s*\(\s*'([^']*)'[^{]*\{[^}]*?\/\/\s*TEST_CASE_ID:\s*([a-f0-9\-]+)/gs,  // single quotes
                /test(?:\.skip|\.only)?\s*\(\s*"([^"]*)"[^{]*\{[^}]*?\/\/\s*TEST_CASE_ID:\s*([a-f0-9\-]+)/gs,  // double quotes
                /test(?:\.skip|\.only)?\s*\(\s*`([^`]*)`[^{]*\{[^}]*?\/\/\s*TEST_CASE_ID:\s*([a-f0-9\-]+)/gs   // backticks
            ];

            for (const pattern of patterns) {
                let match;
                while ((match = pattern.exec(fileContent)) !== null) {
                    const testName = match[1];
                    const testCaseId = match[2];
                    testCaseMap[testName] = testCaseId;
                    logger.info(`✅ Extracted TEST_CASE_ID mapping: "${testName}" → ${testCaseId}`, this.context(runId));
                }
            }

            logger.info('📋 Test case ID extraction complete', this.context(runId, {
                count: Object.keys(testCaseMap).length,
                mapping: testCaseMap
            }));
        } catch (err: any) {
            logger.warn('⚠️ Failed to extract test case IDs from file content', this.context(runId, {
                error: err.message
            }));
        }

        return testCaseMap;
    }

    /**
     * Run multiple TestCafe files in a single execution
     */
    private async runMultipleTestCafeFiles(
        testFiles: Array<{ suiteId: string; fileContent: string; filePath: string }>,
        browser: string,
        runId: string
    ): Promise<void> {
        logger.info('🚀 Starting TestCafe execution for multiple suites', this.context(runId, {
            suiteCount: testFiles.length,
            suites: testFiles.map(f => f.suiteId)
        }));

        // Prepare all test files and collect their paths
        const filePaths: string[] = [];
        const testCaseMap: { [testName: string]: string } = {};

        for (const testFile of testFiles) {
            // Extract TEST_CASE_ID mappings from all files
            const suiteTestCaseMap = this.extractTestCaseIdMapping(testFile.fileContent, runId);
            Object.assign(testCaseMap, suiteTestCaseMap);

            // Construct file path
            const normalizedTempDir = path.normalize(this.tempDir);
            const normalizedFilePath = path.normalize(testFile.filePath);

            let filePath: string;
            if (normalizedFilePath.startsWith(normalizedTempDir)) {
                filePath = normalizedFilePath;
            } else {
                filePath = path.join(this.tempDir, testFile.filePath);
            }

            // Write test file
            logger.info('📝 Writing test file', { filePath, suiteId: testFile.suiteId });
            try {
                await fs.mkdir(path.dirname(filePath), { recursive: true });
                await fs.writeFile(filePath, testFile.fileContent, 'utf8');
                logger.info('✅ Test file written successfully', { filePath, size: testFile.fileContent.length });
                filePaths.push(filePath);
            } catch (error: any) {
                logger.error('Failed to write test file', {
                    error: error.message,
                    stack: error.stack,
                    filePath,
                    suiteId: testFile.suiteId
                });
                throw new Error(`Failed to write test file for suite ${testFile.suiteId}: ${error.message}`);
            }
        }

        // Create a single report path for all tests under a dedicated 'runs' folder
        const reportDir = path.join(this.tempDir, 'runs');
        await fs.mkdir(reportDir, { recursive: true });
        const reportPath = path.join(reportDir, `${runId}.report.json`);

        logger.info('📁 All test files prepared', {
            fileCount: filePaths.length,
            reportPath,
            testCaseCount: Object.keys(testCaseMap).length
        });

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
            progress: 40,
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
                progress: 45 + (attemptedBrowsers.length * 5),
                errorMessage: `Attempting browser: ${browserConfig}`
            });

            try {
                const runner = await this.getTestCafeRunner();
                logger.info('🎯 TestCafe runner obtained, starting test execution', this.context(runId, { browserConfig, fileCount: filePaths.length }));

                // Convert all file paths to TestCafe-compatible format
                const testCafeFilePaths = filePaths.map(fp => {
                    const absolutePath = path.resolve(fp);
                    return absolutePath.replace(/\\/g, '/');
                });

                const absoluteReportPath = path.resolve(reportPath);
                const testCafeReportPath = absoluteReportPath.replace(/\\/g, '/');

                logger.info('📂 TestCafe file paths:', {
                    testFiles: testCafeFilePaths,
                    reportPath: testCafeReportPath
                });

                await this.sendSignalRUpdate(runId, {
                    status: 'running',
                    progress: 50,
                    errorMessage: `Starting tests with ${browserConfig}...`
                });

                // Run all test files together
                const isProduction = process.env.NODE_ENV === 'production' || process.env.FORCE_HEADLESS === 'true';
                const runPromise = runner
                    .src(testCafeFilePaths)  // Pass all test files at once
                    .browsers(browserConfig)
                    .reporter('json', testCafeReportPath)
                    .run({
                        pageLoadTimeout: isProduction ? 120000 : 60000,
                        browserInitTimeout: isProduction ? 300000 : 180000,
                        selectorTimeout: isProduction ? 30000 : 15000,
                        assertionTimeout: isProduction ? 30000 : 15000,
                        speed: 1,
                        skipJsErrors: true,
                        quarantineMode: false,
                        stopOnFirstFail: false
                    });

                logger.info('⏳ Test execution started, waiting for completion...', this.context(runId, { browserConfig }));
                failedCount = await runPromise;
                succeeded = true;

                logger.info('✅ Test execution completed successfully', this.context(runId, { browserConfig, failedCount }));
                break;

            } catch (runError: any) {
                lastRunError = runError;
                const errorDetails = {
                    browser: browserConfig,
                    error: runError?.message || String(runError),
                    stack: runError?.stack,
                    code: runError?.code,
                    type: runError?.constructor?.name
                };

                logger.error(`❌ Browser ${browserConfig} failed to run tests`, this.context(runId, errorDetails));
                logger.error(`Full error object:`, runError);

                await this.sendSignalRUpdate(runId, {
                    status: 'running',
                    progress: Math.max(50, 100 - (browserCandidates.length - attemptedBrowsers.length) * 10),
                    errorMessage: `Browser ${browserConfig} failed: ${runError?.message || String(runError)}`
                });
            }
        }

        if (!succeeded && lastRunError) {
            logger.error('🚨 All browser attempts failed, final error', this.context(runId, {
                attemptedBrowsers,
                finalError: lastRunError.message,
                stack: lastRunError.stack
            }));

            await this.sendTestResult(runId, {
                name: 'Test Preparation Failed',
                status: 'failed',
                durationMs: 0,
                errorMessage: lastRunError.message || 'Test preparation failed',
                stackTrace: lastRunError.stack
            });

            await this.sendSignalRUpdate(runId, {
                status: 'failed',
                progress: 100,
                errorMessage: `All browsers failed. Last error: ${lastRunError.message}`,
                failedTests: 1,
                totalTests: 1
            });

            throw lastRunError;
        }

        // Parse JSON report and send results
        await this.parseAndSendTestResults(runId, reportPath, testCaseMap);
    }

    /**
     * Parse TestCafe JSON report and send individual test results
     */
    private async parseAndSendTestResults(
        runId: string,
        reportPath: string,
        testCaseMap: { [testName: string]: string }
    ): Promise<void> {
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
                            const testCaseId = testCaseMap[test.name];
                            if (!testCaseId) {
                                logger.warn(`⚠️ Test case ID not found for test: "${test.name}"`, this.context(runId, {
                                    availableTests: Object.keys(testCaseMap)
                                }));
                            }

                            await this.sendTestResult(runId, {
                                name: test.name,
                                testCaseId: testCaseId,
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

            // Send final status update
            await this.sendSignalRUpdate(runId, {
                status: actualFailedTests > 0 ? 'failed' : 'completed',
                progress: 100,
                totalTests: actualTotalTests,
                passedTests: actualPassedTests,
                failedTests: actualFailedTests,
                completedTests: actualTotalTests,
                errorMessage: null
            });

        } catch (error: any) {
            logger.error('❌ Failed to parse test report', this.context(runId, {
                error: error.message,
                stack: error.stack,
                reportPath
            }));

            await this.sendSignalRUpdate(runId, {
                status: 'failed',
                progress: 100,
                errorMessage: `Failed to parse test report: ${error.message}`
            });

            throw error;
        }
    }

    /**
     * @deprecated Use runMultipleTestCafeFiles instead
     */
    async runGeneratedTestCafeFile(suiteId: string, fileContent: string, browser: string, runId: string, generatedFilePath?: string): Promise<{ runId: string; status: TestRunStatus['status']; failedCount: number }> {
        logger.info('🚀 Starting TestCafe execution', this.context(runId, { suiteId, generatedFilePath }));

        // Extract TEST_CASE_ID from generated file content
        const testCaseMap = this.extractTestCaseIdMapping(fileContent, runId);
        logger.info('📁 Temp directory ensured', { tempDir: this.tempDir });

        // Use the generated file path if provided, otherwise create a temporary one
        let filePath: string;
        let reportPath: string;

        if (generatedFilePath) {
            // Check if the path already includes the temp directory
            const normalizedTempDir = path.normalize(this.tempDir);
            const normalizedFilePath = path.normalize(generatedFilePath);

            if (normalizedFilePath.startsWith(normalizedTempDir)) {
                // If the path already includes the temp dir, use it as is
                filePath = normalizedFilePath;
            } else {
                // Otherwise, join them
                filePath = path.join(this.tempDir, generatedFilePath);
            }

            // Create report path with .report.json suffix, next to the test file
            const fileNameWithoutExt = path.basename(generatedFilePath, '.test.js');
            const dirName = path.dirname(filePath);
            reportPath = path.join(dirName, `${fileNameWithoutExt}.report.json`);
        } else {
            // We should always receive a generatedFilePath from the API layer.
            // Throwing here prevents creating unexpected root-level temp files.
            throw new Error('runGeneratedTestCafeFile called without generatedFilePath. Backend must supply filePath to avoid root-level temp files.');
        }
        logger.info('File path construction', {
            tempDir: this.tempDir,
            generatedFilePath,
            finalPath: filePath,
            reportPath
        });
        logger.info('📝 Writing test file', { filePath });
        try {
            await fs.mkdir(path.dirname(filePath), { recursive: true });
            await fs.writeFile(filePath, fileContent, 'utf8');
            logger.info('Test file written successfully', { filePath });
        } catch (error: any) {
            logger.error('Failed to write test file', {
                error: error.message,
                stack: error.stack,
                filePath,
                tempDir: this.tempDir
            });
            throw new Error(`Failed to write test file: ${error.message}`);
        }
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

                // Log the exact file path being used
                const absoluteFilePath = path.resolve(filePath);
                const absoluteReportPath = path.resolve(reportPath);

                // Convert Windows backslashes to forward slashes for TestCafe compatibility
                const testCafeFilePath = absoluteFilePath.replace(/\\/g, '/');
                const testCafeReportPath = absoluteReportPath.replace(/\\/g, '/');

                logger.info('📂 TestCafe file path details:', {
                    originalPath: filePath,
                    absolutePath: absoluteFilePath,
                    testCafePath: testCafeFilePath,
                    fileExists: require('fs').existsSync(absoluteFilePath)
                });

                await this.sendSignalRUpdate(runId, {
                    status: 'running',
                    progress: 15 + (attemptedBrowsers.length * 5),
                    errorMessage: `Starting tests with ${browserConfig}...`
                });

                // Increase timeouts significantly for production headless mode
                const isProduction = process.env.NODE_ENV === 'production' || process.env.FORCE_HEADLESS === 'true';
                const runPromise = runner.src([testCafeFilePath]).browsers(browserConfig).reporter('json', testCafeReportPath).run({
                    pageLoadTimeout: isProduction ? 120000 : 60000,      // 2 minutes in production, 1 minute in dev
                    browserInitTimeout: isProduction ? 300000 : 180000,  // 5 minutes in production, 3 minutes in dev (increased)
                    selectorTimeout: isProduction ? 30000 : 15000,       // 30 seconds in production, 15 seconds in dev
                    assertionTimeout: isProduction ? 30000 : 15000,      // 30 seconds in production, 15 seconds in dev
                    speed: 1,
                    skipJsErrors: true,                                   // Skip JS errors to prevent crashes
                    quarantineMode: false,
                    stopOnFirstFail: false
                });

                logger.info('⏳ Test execution started, waiting for completion...', this.context(runId, { browserConfig }));
                failedCount = await runPromise;
                succeeded = true;

                logger.info('✅ Test execution completed successfully', this.context(runId, { browserConfig, failedCount }));
                break;

            } catch (runError: any) {
                lastRunError = runError;
                const errorDetails = {
                    browser: browserConfig,
                    error: runError?.message || String(runError),
                    stack: runError?.stack,
                    code: runError?.code,
                    type: runError?.constructor?.name
                };

                logger.error(`❌ Browser ${browserConfig} failed to run tests`, this.context(runId, errorDetails));
                logger.error(`Full error object:`, runError);

                await this.sendSignalRUpdate(runId, {
                    status: 'running',
                    progress: Math.max(10, 100 - (browserCandidates.length - attemptedBrowsers.length) * 10),
                    errorMessage: `Browser ${browserConfig} failed: ${runError?.message || String(runError)}`
                });
            }
        }

        if (!succeeded && lastRunError) {
            logger.error('🚨 All browser attempts failed, final error', this.context(runId, {
                attemptedBrowsers,
                finalError: lastRunError.message,
                stack: lastRunError.stack
            }));

            // Send a generic test failure result since we couldn't run the tests
            // This ensures the failure is recorded in the database
            await this.sendTestResult(runId, {
                name: 'Test Preparation Failed',
                status: 'failed',
                durationMs: 0,
                errorMessage: lastRunError.message || 'Test preparation failed',
                stackTrace: lastRunError.stack
            });

            await this.sendSignalRUpdate(runId, {
                status: 'failed',
                progress: 100,
                errorMessage: `All browsers failed. Last error: ${lastRunError.message}`,
                failedTests: 1,
                totalTests: 1
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
                            const testCaseId = testCaseMap[test.name];
                            if (!testCaseId) {
                                logger.warn(`⚠️ Test case ID not found for test: "${test.name}"`, this.context(runId, {
                                    availableTests: Object.keys(testCaseMap)
                                }));
                            }

                            await this.sendTestResult(runId, {
                                name: test.name,
                                testCaseId: testCaseId,
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
        this.runningRuns.set(runId, { ...status, ...finalStatus });

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
