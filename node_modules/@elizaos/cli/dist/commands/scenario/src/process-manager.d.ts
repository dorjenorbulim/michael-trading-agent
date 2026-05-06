/**
 * Process Manager for tracking and cleaning up child processes in matrix runs
 */
export interface ProcessInfo {
    pid: number;
    runId: string;
    type: 'agent-server' | 'scenario-runner';
    startTime: Date;
    port?: number;
}
export declare class ProcessManager {
    private processes;
    private signalHandlersRegistered;
    /**
     * Register a process for tracking
     */
    registerProcess(runId: string, pid: number, type: ProcessInfo['type'], port?: number): void;
    /**
     * Unregister a process when it completes normally
     */
    unregisterProcess(runId: string): void;
    /**
     * Get all registered processes
     */
    getProcesses(): Map<string, ProcessInfo>;
    /**
     * Check if a process is still running
     */
    isProcessRunning(pid: number): boolean;
    /**
     * Gracefully terminate a specific process
     */
    terminateProcess(runId: string, timeout?: number): Promise<boolean>;
    /**
     * Terminate all registered processes
     */
    terminateAllProcesses(timeout?: number): Promise<void>;
    /**
     * Register signal handlers to cleanup on exit
     */
    private registerSignalHandlers;
    /**
     * Get summary of managed processes
     */
    getSummary(): {
        total: number;
        byType: Record<string, number>;
        oldestProcess?: ProcessInfo;
    };
}
export declare const processManager: ProcessManager;
//# sourceMappingURL=process-manager.d.ts.map