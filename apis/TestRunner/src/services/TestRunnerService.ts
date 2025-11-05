import createTestCafe from 'testcafe';
import { nanoid } from 'nanoid';
import { TestRunRequest, TestRunStatus, TestCase, TestDataSet } from './types';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';
import { SignalRService } from './SignalRService';

export class TestRunnerService {
    private testCafe: any;
    private runningRuns: Map<string, TestRunStatus> = new Map();
    private signalR: SignalRService;

    constructor(signalRService: SignalRService) {
        this.signalR = signalRService;
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
            progress: 0
        };

        this.runningRuns.set(runId, status);

        await this.signalR.joinTestRun(runId);
        await this.signalR.sendTestUpdate(runId, { testRunId: runId, status: 'running', progress: 0 });

        try {
            const allCases = this.collectTestCases(request);
            status.totalTests = allCases.length;

            const testFiles = await this.generateTestFiles(allCases);
            const runner = await this.getTestCafeRunner();

            const start = Date.now();
            const failedCount = await runner
                .src(testFiles)
                .browsers(request.browser || 'chrome')
                .run({ skipJsErrors: true, quarantineMode: false });

            logger.info(`TestCafe run finished: failed ${failedCount}`);

            status.status = failedCount > 0 ? 'failed' : 'completed';
            status.progress = 100;
            await this.signalR.sendTestUpdate(runId, { testRunId: runId, status: status.status, progress: 100 });
        } catch (err: any) {
            const errorDetails = {
                message: err.message,
                stack: err.stack,
                name: err.name,
                code: err.code,
                details: err
            };
            
            logger.error('Test run error', { 
                error: errorDetails,
                runId,
                request: request ? {
                    runId: request.runId,
                    testSuites: request.testSuites?.map(s => s.id),
                    testCases: request.testCases?.map(c => c.id)
                } : null
            });
            
            status.status = 'failed';
            status.error = errorDetails;
            
            await this.signalR.sendTestUpdate(runId, { 
                testRunId: runId, 
                status: 'failed', 
                error: errorDetails,
                timestamp: new Date().toISOString()
            });
        } finally {
            this.runningRuns.set(runId, status);
            await this.disposeTestCafe();
        }
    }

    async cancelTestRun(runId: string) {
        const status = this.runningRuns.get(runId);
        if (!status || status.status !== 'running') return false;
        // TestCafe doesn't support graceful cancel of a run via API; could be implemented with process mgmt
        status.status = 'cancelled';
        this.runningRuns.set(runId, status);
        return true;
    }

    async getTestRunStatus(runId: string) {
        return this.runningRuns.get(runId);
    }

    private collectTestCases(request: TestRunRequest): TestCase[] {
        const cases: TestCase[] = [];
        if (request.testCases?.length) cases.push(...request.testCases);
        request.testSuites?.forEach(s => cases.push(...(s.testCases || [])));
        return cases;
    }

    private async generateTestFiles(cases: TestCase[]): Promise<string[]> {
        const dir = path.join(process.cwd(), 'temp-tests');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);

        const files: string[] = [];
        for (const tc of cases) {
            const filePath = path.join(dir, `${tc.id}.test.ts`);
            const content = tc.testType === 'script' && tc.scriptText
                ? tc.scriptText
                : this.generateFromSteps(tc);
            fs.writeFileSync(filePath, content, 'utf8');
            files.push(filePath);
        }
        return files;
    }

    private generateFromSteps(tc: TestCase): string {
        const steps = tc.steps || [];
        const lines: string[] = [];
        lines.push(`import { Selector } from 'testcafe';`);
        lines.push(`fixture('${tc.name}')`);
        lines.push(`  .page('about:blank');`);
        lines.push(`test('${tc.name}', async t => {`);
        for (const step of steps) {
            switch (step.action) {
                case 'navigate':
                    lines.push(`  await t.navigateTo('${step.value}');`);
                    break;
                case 'click':
                    lines.push(`  await t.click(Selector('${step.target}'));`);
                    break;
                case 'type':
                    lines.push(`  await t.typeText(Selector('${step.target}'), '${step.value}');`);
                    break;
                case 'select':
                    lines.push(`  await t.click(Selector('${step.target}')); // extend: select value`);
                    break;
                case 'wait':
                    lines.push(`  await t.wait(${Number(step.value) || 1000});`);
                    break;
                case 'assert':
                    lines.push(`  await t.expect(Selector('${step.target}').innerText).contains('${step.value}');`);
                    break;
                case 'screenshot':
                    lines.push(`  await t.takeScreenshot();`);
                    break;
                default:
                    lines.push(`  // Unsupported step: ${step.action}`);
            }
        }
        lines.push('});');
        return lines.join('\n');
    }

    private async getTestCafeRunner() {
        if (!this.testCafe) {
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
}