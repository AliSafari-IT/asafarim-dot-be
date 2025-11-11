import * as signalR from '@microsoft/signalr';
import { logger } from '../utils/logger';

export interface TestUpdateMessage {
    testRunId?: string;
    testId?: string;
    status?: 'running' | 'passed' | 'failed' | 'skipped';
    message?: string;
    progress?: number;
    timestamp?: string;
}

export class SignalRService {
    private hubConnection?: signalR.HubConnection;
    private apiUrl: string;
    private reconnectDelay = 2000; // initial backoff in ms
    private maxReconnectDelay = 15000;

    constructor(apiUrl: string) {
        this.apiUrl = apiUrl;
    }

    /**
     * Initialize and connect to the SignalR hub
     */
    async connect(): Promise<void> {
        const hubUrl = `${this.apiUrl}/hubs/testrun`;

        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl, {
                accessTokenFactory: () => process.env.API_TOKEN || ''
            })
            .configureLogging(signalR.LogLevel.Information)
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: retryContext => {
                    const delay = Math.min(
                        this.reconnectDelay * Math.pow(2, retryContext.previousRetryCount),
                        this.maxReconnectDelay
                    );
                    logger.warn(`Reconnecting to SignalR in ${delay}ms...`);
                    return delay;
                }
            })
            .build();

        // Event: reconnecting
        this.hubConnection.onreconnecting(error => {
            logger.warn(`SignalR reconnecting: ${error?.message}`);
        });

        // Event: reconnected
        this.hubConnection.onreconnected(connectionId => {
            logger.info(`SignalR reconnected: ${connectionId}`);
        });

        // Event: closed
        this.hubConnection.onclose(error => {
            logger.error(`SignalR connection closed: ${error?.message}`);
        });

        try {
            await this.hubConnection.start();
            logger.info('✅ Connected to SignalR Hub');
        } catch (error) {
            logger.error(`❌ Failed to connect to SignalR: ${(error as Error).message}`);
            setTimeout(() => this.connect(), this.reconnectDelay);
        }
    }

    /**
     * Check if the hub is connected
     */
    get isConnected(): boolean {
        return this.hubConnection?.state === signalR.HubConnectionState.Connected;
    }

    /**
     * Ensure the connection is active before performing hub actions
     */
    private async ensureConnected() {
        if (!this.hubConnection) {
            logger.warn('Hub connection not initialized. Reconnecting...');
            await this.connect();
        } else if (this.hubConnection.state !== signalR.HubConnectionState.Connected) {
            logger.warn('Hub not connected. Attempting to reconnect...');
            await this.hubConnection.start().catch(err => {
                logger.error(`Reconnection failed: ${err.message}`);
            });
        }
    }

    /**
     * Join a specific test run group
     */
    async joinTestRun(runId: string) {
        await this.ensureConnected();
        await this.hubConnection!.invoke('JoinTestRun', runId);
        logger.info(`Joined SignalR group for runId: ${runId}`);
    }

    /**
     * Send a test update message
     */
    async sendTestUpdate(runId: string, message: TestUpdateMessage) {
        await this.ensureConnected();
        await this.hubConnection!.invoke('SendTestUpdate', runId, message);
        logger.debug(`📡 Sent test update for runId ${runId}: ${JSON.stringify(message)}`);
    }

    /**
     * Send a test run completion message
     */
    async sendTestRunCompleted(runId: string, result: any) {
        await this.ensureConnected();
        await this.hubConnection!.invoke('SendTestRunCompleted', runId, result);
        logger.info(`✅ Sent test run completion for runId ${runId}`);
    }

    /**
     * Send a test run progress update
     */
    async sendTestRunUpdated(runId: string, update: any) {
        await this.ensureConnected();
        await this.hubConnection!.invoke('SendTestRunUpdated', runId, update);
        logger.debug(`📊 Sent test run progress update for runId ${runId}`);
    }

    /**
     * Subscribe to test updates (real-time result streaming)
     */
    onTestUpdate(callback: (update: TestUpdateMessage) => void) {
        this.hubConnection?.on('ReceiveTestUpdate', callback);
    }

    /**
     * Gracefully close the connection
     */
    async disconnect() {
        if (this.hubConnection) {
            await this.hubConnection.stop();
            logger.info('Disconnected from SignalR Hub');
        }
    }
}
