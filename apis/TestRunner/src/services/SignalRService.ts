import * as signalR from '@microsoft/signalr';
import { logger } from '../utils/logger';

export class SignalRService {
    private hubConnection?: signalR.HubConnection;
    private apiUrl: string;

    constructor(apiUrl: string) {
        this.apiUrl = apiUrl;
    }

    async connect() {
        const hubUrl = `${this.apiUrl}/hubs/testrun`;
        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl, {
                accessTokenFactory: () => process.env.API_TOKEN || ''
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        this.hubConnection.onreconnecting(error => {
            logger.warn(`SignalR reconnecting: ${error?.message}`);
        });

        this.hubConnection.onreconnected(connectionId => {
            logger.info(`SignalR reconnected: ${connectionId}`);
        });

        this.hubConnection.onclose(error => {
            logger.error(`SignalR connection closed: ${error?.message}`);
        });

        await this.hubConnection.start();
        logger.info('Connected to SignalR Hub');
    }

    async joinTestRun(runId: string) {
        if (!this.hubConnection) throw new Error('Not connected to SignalR');
        await this.hubConnection.invoke('JoinTestRun', runId);
    }

    async sendTestUpdate(runId: string, message: any) {
        if (!this.hubConnection) throw new Error('Not connected to SignalR');
        await this.hubConnection.invoke('SendTestUpdate', runId, message);
    }
}