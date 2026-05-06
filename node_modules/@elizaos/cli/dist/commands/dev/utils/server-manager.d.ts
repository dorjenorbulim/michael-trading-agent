import type { Subprocess } from 'bun';
import type { ServerProcess } from '../types';
/**
 * Server process manager implementation using functional patterns
 */
export declare const createServerManager: () => ServerProcess;
/**
 * Get the global server manager instance
 */
export declare function getServerManager(): ServerProcess;
/**
 * Stop the server and cleanup
 * @returns true if a server was stopped, false if no server was running
 */
export declare function stopServer(): Promise<boolean>;
/**
 * Start the server with given arguments
 */
export declare function startServer(args?: string[]): Promise<void>;
/**
 * Restart the server with given arguments
 */
export declare function restartServer(args?: string[]): Promise<void>;
/**
 * Check if the server is currently running
 */
export declare function isRunning(): boolean;
/**
 * Get the current server process
 */
export declare function getCurrentProcess(): Subprocess | null;
export interface DevServerManager extends ServerProcess {
}
/**
 * Create a new server manager instance (factory function)
 * @deprecated Use createServerManager() instead
 */
export declare function DevServerManager(): ServerProcess;
//# sourceMappingURL=server-manager.d.ts.map