import type { SessionStatusResponse } from '../types';
/**
 * Poll the cloud API for authentication status
 * Implements exponential backoff on errors
 */
export declare function pollAuthStatus(cloudUrl: string, sessionId: string, timeoutSeconds: number): Promise<SessionStatusResponse>;
//# sourceMappingURL=polling.d.ts.map