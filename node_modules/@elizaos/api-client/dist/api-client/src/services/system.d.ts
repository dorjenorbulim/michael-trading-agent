import { BaseApiClient } from '../lib/base-client';
import { LocalEnvironmentUpdateParams, LocalEnvironmentContentParams } from '../types/system';
export declare class SystemService extends BaseApiClient {
    /**
     * Retrieve the local environment variables from the ElizaOS server.
     *
     * Server route (packages/server/src/api/system):
     *   GET /api/system/env/local  ->  { success: true, data: Record<string,string> }
     */
    getEnvironment(): Promise<Record<string, string>>;
    /**
     * Update (overwrite or merge) the local .env file on the ElizaOS server.
     *
     * Server route (packages/server/src/api/system):
     *   POST /api/system/env/local  ->  { success: true, message: string }
     *   Body: { content: Record<string,string> }
     *
     * For developer-ergonomics we accept several shapes:
     *   1. { variables: Record<string,string>; merge?: boolean }
     *   2. { content:   Record<string,string> }      (server-native)
     *   3. Record<string,string>                      (shorthand)
     */
    updateLocalEnvironment(params: LocalEnvironmentUpdateParams | LocalEnvironmentContentParams | Record<string, string>): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Global logs functionality - implementing via system endpoints
     */
    getGlobalLogs(params?: {
        level?: string;
        agentName?: string;
        agentId?: string;
    }): Promise<{
        logs: Array<{
            level: number;
            time: number;
            msg: string;
            [key: string]: string | number | boolean | null | undefined;
        }>;
        count: number;
        total: number;
        level: string;
        levels: string[];
    }>;
    private buildUrl;
    private getHeaders;
    deleteGlobalLogs(): Promise<{
        status: string;
        message: string;
    }>;
    deleteLog(_logId: string): Promise<void>;
}
//# sourceMappingURL=system.d.ts.map