import { BaseApiClient } from '../lib/base-client';
import { ServerHealth, ServerStatus, ServerDebugInfo, LogSubmitParams } from '../types/server';
export declare class ServerService extends BaseApiClient {
    /**
     * Health check
     */
    checkHealth(): Promise<ServerHealth>;
    /**
     * Simple ping
     */
    ping(): Promise<{
        pong: boolean;
    }>;
    /**
     * Hello endpoint
     */
    hello(): Promise<{
        message: string;
    }>;
    /**
     * Get server status
     */
    getStatus(): Promise<ServerStatus>;
    /**
     * Stop the server
     */
    stopServer(): Promise<{
        success: boolean;
    }>;
    /**
     * Get runtime debug info
     */
    getDebugInfo(): Promise<ServerDebugInfo>;
    /**
     * Submit logs
     */
    submitLogs(logs: LogSubmitParams[]): Promise<{
        received: number;
    }>;
    /**
     * Clear logs
     */
    clearLogs(): Promise<{
        cleared: number;
    }>;
}
//# sourceMappingURL=server.d.ts.map