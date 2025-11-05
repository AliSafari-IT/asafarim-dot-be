import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { TestRunnerService } from './services/TestRunnerService';
import { SignalRService } from './services/SignalRService';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const API_KEY = process.env.API_KEY || 'test-runner-api-key-2024';
const API_URL = process.env.API_URL || 'http://localhost:5200';

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

app.listen(PORT, () => {
  logger.info(`✅ TestRunner listening on port ${PORT}`);
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'TestRunner' });
});

// Run tests endpoint
app.post('/run-tests', validateApiKey, async (req, res) => {
    try {
        logger.info('Received test run request', { runId: req.body.runId });
        const result = await testRunner.runTests(req.body);
        res.json(result);
    } catch (error: any) {
        logger.error('Error running tests', { error: error.message });
        res.status(500).json({ error: error.message });
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