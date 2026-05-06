/**
 * Run Isolation System for Matrix Testing
 *
 * This module provides complete isolation between scenario runs to prevent
 * interference and ensure clean execution environments. Each run gets its own
 * temporary directory, database instance, and log files.
 *
 * Required by ticket #5782 - Acceptance Criterion 2.
 */
/**
 * Represents a completely isolated environment for a single scenario run.
 */
export interface IsolationContext {
    /** Unique identifier for this run */
    runId: string;
    /** Root temporary directory for this run */
    tempDir: string;
    /** Path to isolated database directory */
    dbPath: string;
    /** Path to log file for this run */
    logPath: string;
    /** Path to temporary scenario file with overrides applied */
    scenarioPath: string;
    /** Cleanup function that removes all artifacts */
    cleanup: () => Promise<void>;
}
/**
 * Resets the run sequence counter (useful for testing).
 */
export declare function resetRunSequence(): void;
/**
 * Generates a unique run ID with sequence number and hash.
 *
 * @returns Unique run ID in format "run-XXX-hash"
 */
export declare function generateRunId(): string;
/**
 * Creates a completely isolated environment for a scenario run.
 *
 * This function sets up:
 * - Isolated temporary directory
 * - Separate database path
 * - Individual log file
 * - Clean environment state
 *
 * @param runId - Unique identifier for this run
 * @param outputDir - Base output directory for the matrix execution
 * @returns Isolation context with cleanup function
 */
export declare function createIsolatedEnvironment(runId: string, outputDir: string): Promise<IsolationContext>;
/**
 * Completely removes an isolated environment and all its artifacts.
 *
 * @param context - The isolation context to clean up
 */
export declare function cleanupIsolatedEnvironment(context: IsolationContext): Promise<void>;
/**
 * Ensures the isolated database directory is properly configured.
 *
 * @param dbPath - Path to the isolated database directory
 */
export declare function ensureIsolatedDatabase(dbPath: string): Promise<void>;
/**
 * Writes a temporary scenario file with parameter overrides applied.
 *
 * @param scenarioPath - Path where the temporary scenario should be written
 * @param baseScenario - The base scenario object to modify
 * @param parameters - Parameter overrides to apply
 */
export declare function writeTemporaryScenario(scenarioPath: string, baseScenario: Record<string, unknown>, parameters: Record<string, unknown>): Promise<void>;
/**
 * Validates that an isolation context is properly set up.
 *
 * @param context - The isolation context to validate
 * @returns True if the context is valid and ready for use
 */
export declare function validateIsolationContext(context: IsolationContext): Promise<boolean>;
/**
 * Creates environment variables for isolated execution.
 *
 * @param context - The isolation context
 * @returns Environment variables object
 */
export declare function createIsolatedEnvironmentVariables(context: IsolationContext): Record<string, string>;
/**
 * Gets the current system temporary directory with a unique subdirectory.
 *
 * @param prefix - Prefix for the temporary directory name
 * @returns Path to a unique temporary directory
 */
export declare function getIsolatedTempDir(prefix?: string): string;
/**
 * Estimates disk space required for a scenario run.
 *
 * @param baseScenario - The scenario that will be executed
 * @returns Estimated disk space in bytes
 */
export declare function estimateRunDiskSpace(baseScenario: {
    run?: Array<{
        evaluations?: unknown[];
    }>;
}): number;
/**
 * Checks if there's sufficient disk space for a matrix run.
 *
 * @param outputDir - Directory where matrix output will be stored
 * @param estimatedSpace - Estimated space required in bytes
 * @returns True if there's sufficient space
 */
export declare function checkDiskSpace(outputDir: string, _estimatedSpace: number): Promise<boolean>;
/**
 * Monitors an isolated environment for resource usage during execution.
 *
 * @param context - The isolation context to monitor
 * @returns Resource usage information
 */
export declare function monitorIsolatedResources(context: IsolationContext): Promise<{
    diskUsage: number;
    fileCount: number;
    directorySize: number;
}>;
//# sourceMappingURL=run-isolation.d.ts.map