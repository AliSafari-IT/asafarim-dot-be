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
    private tempDir = path.join(process.cwd(), 'temp-tests');

    constructor(signalRService: SignalRService) {
        this.signalR = signalRService;
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
                logger.info(`📡 Sending webhook update to ${apiUrl}/api/runner-webhook/status (attempt ${attempt}/${retries})`, { runId, status: update.status });
                const response = await fetch(`${apiUrl}/api/runner-webhook/status`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
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
                logger.warn(`❌ Failed to send webhook update (attempt ${attempt}/${retries})`, { error: err.message, runId });
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
                logger.info(`📊 Sending test result to ${apiUrl}/api/runner-webhook/result (attempt ${attempt}/${retries})`, { runId, testName: result.name, status: result.status });
                const response = await fetch(`${apiUrl}/api/runner-webhook/result`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        runId,
                        testCaseId: null, // Will be matched by name in backend
                        status: result.status,
                        durationMs: result.durationMs,
                        errorMessage: result.errorMessage,
                        stackTrace: result.stackTrace,
                        jsonReport: result
                    }),
                    signal: AbortSignal.timeout(10000) // 10 second timeout
                });
                
                if (!response.ok) {
                    logger.warn(`❌ Test result webhook failed: ${response.status}`, { runId, testName: result.name, attempt });
                    if (attempt < retries) {
                        await new Promise(resolve => setTimeout(resolve, 500 * attempt));
                        continue;
                    }
                } else {
                    logger.info(`✅ Test result sent successfully`, { runId, testName: result.name, attempt });
                    return; // Success
                }
            } catch (err: any) {
                logger.warn(`❌ Failed to send test result (attempt ${attempt}/${retries})`, { error: err.message, runId, testName: result.name });
                if (attempt < retries) {
                    await new Promise(resolve => setTimeout(resolve, 500 * attempt));
                    continue;
                }
            }
        }
        
        logger.error(`❌ All test result attempts failed after ${retries} retries`, { runId, testName: result.name });
    }

    private async createTempDir() {
        await fs.mkdir(this.tempDir, { recursive: true });
    }

    // --- TestCafe lifecycle --------------------------------------------------

    private async getTestCafeRunner(): Promise<any> {
        if (!this.testCafe) {
            logger.info('Creating new TestCafe instance');
            this.testCafe = await createTestCafe('localhost');
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
                const reportContent = await fs.readFile(reportPath, 'utf8');
                const report = JSON.parse(reportContent);
                
                if (report.fixtures) {
                    report.fixtures.forEach((fixture: any) => {
                        fixture.tests.forEach((test: any) => {
                            const hasErrors = test.errs && test.errs.length > 0;
                            testResults.push({
                                name: test.name,
                                status: hasErrors ? 'failed' : 'passed',
                                durationMs: test.durationMs || 0,
                                errorMessage: hasErrors ? test.errs[0].errMsg : null,
                                stackTrace: hasErrors ? JSON.stringify(test.errs[0].callsite) : null
                            });
                        });
                    });
                }
                
                // Clean up report file
                await fs.unlink(reportPath).catch(() => {});
            } catch (err) {
                logger.warn('Failed to parse TestCafe report', { error: err });
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
            for (const result of testResults) {
                await this.sendTestResult(runId, {
                    ...result,
                    testCaseName: result.name // Map name to testCaseName for backend
                });
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
        const browser = request.browser || 'chrome:headless';
        const start = Date.now();

        try {
            logger.info('Running tests', this.context(runId, { total: allCases.length, browser }));

            const failedCount = await Promise.race([
                runner.src(testFiles).browsers(browser).run({
                    skipJsErrors: true,
                    selectorTimeout: 10000,
                    assertionTimeout: 10000,
                }),
                new Promise<number>((_, reject) =>
                    setTimeout(() => reject(new Error('TestCafe timeout after 2 minutes')), 2 * 60 * 1000)
                ),
            ]);

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
            logger.error('Test run error', this.context(runId, { error: errorDetails }));
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
