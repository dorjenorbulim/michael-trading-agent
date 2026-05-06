/**
 * Progress Tracking System for Matrix Testing
 *
 * This module provides real-time progress tracking, ETA calculation, and
 * detailed progress reporting for matrix execution. It tracks both individual
 * run progress and overall matrix completion.
 *
 * Required by ticket #5782 - Acceptance Criterion 4.
 */
/**
 * Types of progress events that can be emitted.
 */
export type ProgressEventType = 'MATRIX_STARTED' | 'COMBINATION_STARTED' | 'RUN_STARTED' | 'PROGRESS_UPDATE' | 'RUN_COMPLETED' | 'RUN_FAILED' | 'TIMEOUT' | 'COMBINATION_COMPLETED' | 'MATRIX_COMPLETED' | 'RESOURCE_WARNING' | 'ERROR';
/**
 * Callback function type for progress updates.
 */
export type ProgressCallback = (message: string, eventType: ProgressEventType, data?: unknown) => void;
/**
 * Overall progress information for the matrix execution.
 */
export interface MatrixProgress {
    /** Total number of combinations in the matrix */
    totalCombinations: number;
    /** Total number of runs across all combinations */
    totalRuns: number;
    /** Number of combinations completed */
    completedCombinations: number;
    /** Number of runs completed */
    completedRuns: number;
    /** Number of runs that failed */
    failedRuns: number;
    /** Number of runs that succeeded */
    successfulRuns: number;
    /** Current combination being executed (0-based) */
    currentCombination: number;
    /** Overall progress as a percentage (0-1) */
    overallProgress: number;
    /** Average duration per run in milliseconds */
    averageRunDuration: number;
    /** Estimated time remaining in milliseconds */
    estimatedTimeRemaining: number | null;
    /** When the matrix execution started */
    startTime: Date;
    /** When the matrix execution will complete (estimated) */
    estimatedCompletionTime: Date | null;
}
/**
 * Progress information for a specific combination.
 */
export interface CombinationProgress {
    /** Unique identifier for the combination */
    combinationId: string;
    /** Parameters for this combination */
    parameters: Record<string, unknown>;
    /** Total runs for this combination */
    totalRuns: number;
    /** Completed runs for this combination */
    completedRuns: number;
    /** Successful runs for this combination */
    successfulRuns: number;
    /** Failed runs for this combination */
    failedRuns: number;
    /** Success rate (0-1) */
    successRate: number;
    /** Average duration for runs in this combination */
    averageDuration: number;
    /** When this combination started */
    startTime: Date | null;
    /** When this combination completed */
    completionTime: Date | null;
}
/**
 * Information about an individual run.
 */
export interface RunProgress {
    /** Unique identifier for the run */
    runId: string;
    /** Combination this run belongs to */
    combinationId: string;
    /** Parameters for this run */
    parameters: Record<string, unknown>;
    /** When the run started */
    startTime: Date;
    /** When the run completed */
    completionTime: Date | null;
    /** Current progress within the run (0-1) */
    progress: number;
    /** Current status message */
    status: string;
    /** Whether the run completed successfully */
    success: boolean | null;
    /** Error message if the run failed */
    error: string | null;
    /** Duration in milliseconds */
    duration: number;
}
/**
 * Configuration for the progress tracker.
 */
export interface ProgressTrackerConfig {
    /** Total number of combinations */
    totalCombinations: number;
    /** Number of runs per combination */
    runsPerCombination: number;
    /** Callback for progress updates */
    onProgress?: ProgressCallback;
    /** Callback when a combination completes */
    onCombinationComplete?: (progress: CombinationProgress) => void;
    /** Whether to show detailed parameter information */
    showParameters?: boolean;
    /** Whether to calculate ETA */
    calculateETA?: boolean;
}
/**
 * Main progress tracking class for matrix execution.
 */
export declare class ProgressTracker {
    private config;
    private startTime;
    private combinations;
    private runs;
    private runDurations;
    private currentCombinationIndex;
    constructor(config: ProgressTrackerConfig);
    /**
     * Starts tracking a new run.
     */
    startRun(runId: string, combinationId: string, parameters: Record<string, unknown>): void;
    /**
     * Updates progress for a currently running scenario.
     */
    updateRunProgress(runId: string, progress: number, status: string): void;
    /**
     * Marks a run as completed successfully.
     */
    completeRun(runId: string, success: boolean, duration: number, error?: string): void;
    /**
     * Marks a run as timed out.
     */
    timeoutRun(runId: string, timeoutMs: number): void;
    /**
     * Marks a combination as completed.
     */
    completeCombination(combinationId: string): void;
    /**
     * Reports a resource warning.
     */
    reportResourceWarning(resource: string, usage: number, message: string): void;
    /**
     * Gets overall progress information.
     */
    getOverallProgress(): MatrixProgress;
    /**
     * Gets progress information for a specific combination.
     */
    getCombinationProgress(combinationId: string): CombinationProgress | undefined;
    /**
     * Exports all progress data for analysis or reporting.
     */
    exportProgressData(): {
        overallProgress: MatrixProgress;
        combinations: Map<string, CombinationProgress>;
        runs: Map<string, RunProgress>;
        startTime: Date;
        statistics: {
            averageRunDuration: number;
            successRate: number;
            failureRate: number;
            totalDuration: number;
        };
    };
    /**
     * Emits ETA update based on current progress.
     */
    private emitETAUpdate;
    /**
     * Emits a progress message to the callback.
     */
    private emitProgress;
    /**
     * Formats a duration in milliseconds to human-readable format.
     */
    private formatDuration;
}
/**
 * Creates a new progress tracker with the specified configuration.
 */
export declare function createProgressTracker(config: ProgressTrackerConfig): ProgressTracker;
//# sourceMappingURL=progress-tracker.d.ts.map