import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { TestRunnerService } from './services/TestRunnerService';
import { SignalRService } from './services/SignalRService';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const API_KEY = process.env.API_KEY || 'test-runner-api-key-2024';
const API_URL = process.env.API_URL || 'http://testora.asafarim.local:5106';

// Middleware
app.use(cors());
app.use(express.json()); // Built-in body parser

// API Key validation middleware
const validateApiKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== API_KEY) {
        logger.error('Invalid API key');
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// Initialize SignalR service
const signalRService = new SignalRService(API_URL);

// Initialize TestRunner service
const testRunner = new TestRunnerService(signalRService);

// Ensure temp directory exists on startup
const tempDir = process.env.TEMP_TESTS_DIR || 
    (process.platform === 'win32' 
        ? path.join(process.env.TEMP || process.env.TMP || 'C:\\temp', 'testrunner-tests')
        : path.join(process.env.TMPDIR || '/var/tmp', 'testrunner-tests'));

fs.mkdir(tempDir, { recursive: true })
    .then(() => {
        logger.info(`✅ Temp directory ready: ${tempDir}`);
    })
    .catch((err: any) => {
        logger.error(`❌ Failed to create temp directory: ${tempDir}`, { error: err.message });
        logger.error('Service may not function correctly. Please check permissions or set TEMP_TESTS_DIR environment variable.');
    });

// Initialize SignalR connection
let signalRConnected = false;
signalRService.connect()
    .then(() => {
        signalRConnected = true;
        logger.info('✅ SignalR connected successfully');
    })
    .catch((err) => {
        logger.warn('⚠️ Failed to connect to SignalR initially, will retry on demand', { error: err.message });
    });

// Register routes
app.post('/run', validateApiKey, async (req, res) => {
  const { testSuiteId } = req.body;
  try {
    const runId = await testRunner.runTests(testSuiteId);
    res.json({ runId });
  } catch (err) {
    logger.error('Run failed', err);
    res.status(500).json({ error: 'Test run failed' });
  }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'TestRunner' });
});

// Run tests endpoint
app.post('/run-tests', validateApiKey, async (req, res) => {
    try {
        const firstSuite = req.body.testSuites?.[0];
        const firstTestCase = firstSuite?.testCases?.[0];
        
        logger.info('Received test run request', { 
            runId: req.body.runId,
            testSuitesCount: req.body.testSuites?.length || 0,
            testCasesCount: req.body.testCases?.length || 0,
            firstSuiteTestCasesCount: firstSuite?.testCases?.length || 0,
            firstTestCaseHasSteps: !!firstTestCase?.steps,
            firstTestCaseStepsCount: firstTestCase?.steps?.length || 0,
            firstTestCaseStepsPreview: firstTestCase?.steps ? JSON.stringify(firstTestCase.steps).substring(0, 200) : 'none'
        });
        
        // Start test execution asynchronously (don't wait for completion)
        // This allows the API to return immediately while tests run in background
        testRunner.runTests(req.body).catch((error: any) => {
            logger.error('Test execution failed after start', {
                runId: req.body.runId,
                error: error.message,
                stack: error.stack
            });
        });
        
        // Return immediately with runId to indicate test run has started
        res.json({ 
            runId: req.body.runId || 'unknown',
            status: 'started',
            message: 'Test run initiated successfully'
        });
    } catch (error: any) {
        logger.error('Error starting test run', { 
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({ error: error.message, details: error.stack });
    }
});

// Get test run status
app.get('/status/:runId', validateApiKey, (req, res) => {
    const status = testRunner.getTestRunStatus(req.params.runId);
    if (!status) {
        return res.status(404).json({ error: 'Run not found' });
    }
    res.json(status);
});

// Cancel test run
app.post('/cancel/:runId', validateApiKey, async (req, res) => {
    const cancelled = await testRunner.cancelTestRun(req.params.runId);
    if (!cancelled) {
        return res.status(404).json({ error: 'Run not found or cannot be cancelled' });
    }
    res.json({ success: true });
});

// Run generated TestCafe file
app.post('/run-generated-file', validateApiKey, async (req, res) => {
    try {
        const { testSuiteId, fileContent, browser, runId } = req.body;
        
        if (!testSuiteId || !fileContent) {
            return res.status(400).json({ error: 'testSuiteId and fileContent are required' });
        }

        logger.info('Running generated TestCafe file', { testSuiteId, browser, runId });
        const result = await testRunner.runGeneratedTestCafeFile(testSuiteId, fileContent, browser, runId);
        res.json(result);
    } catch (error: any) {
        logger.error('Error running generated TestCafe file', { 
            error: error.message,
            stack: error.stack,
            code: error.code,
            details: error.toString()
        });
        res.status(500).json({ error: error.message, details: error.stack });
    }
});

// Start server
app.listen(PORT, () => {
    logger.info(`TestRunner service started on port ${PORT}`);
    logger.info(`API Key: ${API_KEY}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
});