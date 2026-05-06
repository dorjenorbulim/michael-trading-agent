/**
 * Matrix Orchestrator - Main Execution Engine
 *
 * This module orchestrates the execution of all matrix combinations, ensures
 * complete isolation between runs, manages cleanup, and provides comprehensive
 * result collection. This is the core execution engine for the matrix testing system.
 *
 * Required by ticket #5782 - All acceptance criteria.
 */
import { ProgressEventType } from './progress-tracker';
import { ResourceAlert } from './resource-monitor';
import { MatrixCombination } from './matrix-types';
import { MatrixConfig } from './matrix-schema';
/**
 * Results from executing a single matrix run.
 */
export interface MatrixRunResult {
    /** Unique identifier for this run */
    runId: string;
    /** ID of the combination this run belongs to */
    combinationId: string;
    /** Parameters that were applied for this run */
    parameters: Record<string, unknown>;
    /** When the run started */
    startTime: Date;
    /** When the run ended */
    endTime: Date;
    /** Duration in milliseconds */
    duration: number;
    /** Whether the run completed successfully */
    success: boolean;
    /** Results from the scenario execution */
    scenarioResult?: unknown;
    /** Error message if the run failed */
    error?: string;
    /** Performance and resource metrics */
    metrics: {
        /** Peak memory usage during run */
        memoryUsage: number;
        /** Disk space used during run */
        diskUsage: number;
        /** Number of tokens used (if applicable) */
        tokenCount?: number;
        /** Peak CPU usage during run */
        cpuUsage?: number;
    };
}
/**
 * Summary of the entire matrix execution.
 */
export interface MatrixExecutionSummary {
    /** Total number of runs executed */
    totalRuns: number;
    /** Number of successful runs */
    successfulRuns: number;
    /** Number of failed runs */
    failedRuns: number;
    /** Total execution time in milliseconds */
    totalDuration: number;
    /** Average time per run in milliseconds */
    averageRunTime: number;
    /** Success rate as percentage */
    successRate: number;
    /** Summary for each combination */
    combinations: CombinationSummary[];
    /** When the matrix execution started */
    startTime: Date;
    /** When the matrix execution completed */
    endTime: Date;
    /** Resource usage statistics */
    resourceUsage: {
        peakMemoryUsage: number;
        peakDiskUsage: number;
        peakCpuUsage: number;
        averageMemoryUsage: number;
        averageDiskUsage: number;
        averageCpuUsage: number;
    };
}
/**
 * Summary for a specific combination.
 */
export interface CombinationSummary {
    /** Combination identifier */
    combinationId: string;
    /** Parameters for this combination */
    parameters: Record<string, unknown>;
    /** Number of runs for this combination */
    totalRuns: number;
    /** Successful runs */
    successfulRuns: number;
    /** Failed runs */
    failedRuns: number;
    /** Success rate */
    successRate: number;
    /** Average duration */
    averageDuration: number;
    /** Individual run results */
    runs: MatrixRunResult[];
}
/**
 * Configuration options for matrix execution.
 */
export interface MatrixExecutionOptions {
    /** Output directory for results */
    outputDir: string;
    /** Maximum number of parallel runs */
    maxParallel?: number;
    /** Whether to continue on individual run failures */
    continueOnFailure?: boolean;
    /** Timeout for individual runs in milliseconds */
    runTimeout?: number;
    /** Callback for progress updates */
    onProgress?: (message: string, eventType: ProgressEventType, data?: unknown) => void;
    /** Callback when a combination completes */
    onCombinationComplete?: (summary: CombinationSummary) => void;
    /** Callback for resource warnings */
    onResourceWarning?: (alert: ResourceAlert) => void;
    /** Callback for resource updates */
    onResourceUpdate?: (resources: unknown) => void;
    /** Whether to show detailed progress information */
    verbose?: boolean;
}
/**
 * Main function to execute all matrix runs with complete orchestration.
 *
 * This function implements all acceptance criteria from ticket #5782:
 * - Matrix execution loop with progress tracking
 * - Complete run isolation and cleanup
 * - Scenario override integration
 * - Data collection and storage
 * - Error handling and recovery
 * - Resource management
 *
 * @param config - Matrix configuration
 * @param combinations - All combinations to execute
 * @param options - Execution options
 * @returns Array of all run results
 */
export declare function executeMatrixRuns(config: MatrixConfig, combinations: MatrixCombination[], options: MatrixExecutionOptions): Promise<MatrixRunResult[]>;
//# sourceMappingURL=matrix-orchestrator.d.ts.map