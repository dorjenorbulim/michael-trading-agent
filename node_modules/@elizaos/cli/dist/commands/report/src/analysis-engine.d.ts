/**
 * Analysis Engine - Core Data Aggregation Logic
 *
 * This module contains the AnalysisEngine class that processes arrays of
 * ScenarioRunResult objects and transforms them into structured ReportData
 * with comprehensive statistics, groupings, and trajectory analysis.
 *
 * Required by ticket #5787 - Data Aggregation Logic section.
 */
import { ScenarioRunResult } from '../../scenario/src/schema';
import { MatrixConfig } from '../../scenario/src/matrix-schema';
import { ReportData } from './report-schema';
export interface FileProcessingStats {
    processed: number;
    skipped: number;
}
/**
 * Core analysis engine that processes raw scenario run data into structured reports
 */
export declare class AnalysisEngine {
    constructor();
    /**
     * Main processing method that transforms raw run results into structured report data
     *
     * @param runs Array of ScenarioRunResult objects to analyze
     * @param matrixConfig The original matrix configuration
     * @param inputDirectory Path to the input directory that was processed
     * @param fileStats Statistics about file processing (processed vs skipped)
     * @returns Complete ReportData object ready for serialization
     */
    processRunResults(runs: ScenarioRunResult[], matrixConfig: MatrixConfig, inputDirectory: string, fileStats: FileProcessingStats): ReportData;
    /**
     * Calculate high-level summary statistics across all runs
     */
    private calculateSummaryStats;
    /**
     * Calculate success rates for each evaluation capability
     */
    private calculateCapabilitySuccessRates;
    /**
     * Group results by each matrix parameter and calculate statistics for each group
     */
    private groupResultsByParameters;
    /**
     * Recursively collect all parameter paths from a parameters object
     */
    private collectAllParameterPaths;
    /**
     * Extract parameter value from nested or flat parameters object
     */
    private getParameterValue;
    /**
     * Convert parameter values to strings for consistent grouping
     */
    private serializeParameterValue;
    /**
     * Analyze trajectory patterns to find most common sequences
     */
    private analyzeTrajectoryPatterns;
    /**
     * Calculate median value from sorted array of numbers
     */
    private calculateMedian;
}
//# sourceMappingURL=analysis-engine.d.ts.map