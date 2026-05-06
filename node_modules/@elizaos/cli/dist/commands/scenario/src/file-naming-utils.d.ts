/**
 * Utilities for consistent file naming in the scenario system
 */
/**
 * Generates a PST timestamp in the format YYYY-MM-DD-HH-MM-SS
 * @returns Timestamp string in PST timezone
 */
export declare function generatePSTTimestamp(): string;
/**
 * Generates a run filename in the format: run-YYYY-MM-DD-XXX-HH-MM-SS
 * @param index - Run index (e.g., 001, 002)
 * @param timestamp - Optional timestamp, defaults to current PST time
 * @returns Formatted filename
 */
export declare function generateRunFilename(index: number, timestamp?: string): string;
/**
 * Generates a matrix filename in the format: matrix-YYYY-MM-DD-XXX-HH-MM-SS
 * @param index - Matrix index (e.g., 001, 002)
 * @param timestamp - Optional timestamp, defaults to current PST time
 * @returns Formatted filename
 */
export declare function generateMatrixFilename(index: number, timestamp?: string): string;
/**
 * Generates a step-specific filename for evaluation/execution results
 * @param baseFilename - Base filename (e.g., run-2025-08-17-001-14-30-15)
 * @param stepIndex - Step index (0, 1, 2, etc.)
 * @param suffix - File suffix (e.g., 'evaluation', 'execution')
 * @returns Formatted filename with step info
 */
export declare function generateStepFilename(baseFilename: string, stepIndex: number, suffix: string): string;
//# sourceMappingURL=file-naming-utils.d.ts.map