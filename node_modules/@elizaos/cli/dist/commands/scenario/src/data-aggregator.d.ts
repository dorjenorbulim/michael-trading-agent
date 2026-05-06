/**
 * Run Data Aggregator - Centralized Data Collection for Ticket #5786
 *
 * This utility class is responsible for collecting data from various sources
 * throughout a scenario run's lifecycle and assembling it into a single,
 * validated ScenarioRunResult object for serialization.
 */
import { type IAgentRuntime } from '@elizaos/core';
import { TrajectoryReconstructor, type TrajectoryStep } from './TrajectoryReconstructor';
import { EvaluationEngine } from './EvaluationEngine';
import { type ScenarioRunResult, type ScenarioRunMetrics, type EnhancedEvaluationResult } from './schema';
import { type ExecutionResult } from './providers';
/**
 * Utility class for aggregating all data from a single scenario run
 * and building the final ScenarioRunResult object.
 */
export declare class RunDataAggregator {
    readonly runtime: IAgentRuntime;
    readonly trajectoryReconstructor: TrajectoryReconstructor;
    readonly evaluationEngine: EvaluationEngine;
    runId?: string;
    combinationId?: string;
    parameters?: Record<string, unknown>;
    startTime?: Date;
    finalResponse?: string;
    metrics: Partial<ScenarioRunMetrics>;
    error?: string;
    constructor(runtime: IAgentRuntime, trajectoryReconstructor: TrajectoryReconstructor, evaluationEngine: EvaluationEngine);
    /**
     * Initialize a new run with the specified identifiers and parameters.
     * This should be called at the start of each scenario execution.
     */
    startRun(runId: string, combinationId: string, parameters: Record<string, unknown>): void;
    /**
     * Record the final response from the agent.
     * This should be called after the agent has completed its interaction.
     */
    recordFinalResponse(response: string): void;
    /**
     * Record performance metrics for the run.
     * This can be called multiple times to accumulate different metrics.
     */
    recordMetrics(newMetrics: Partial<ScenarioRunMetrics>): void;
    /**
     * Record an error that occurred during the run.
     * This marks the run as failed.
     */
    recordError(error: Error | string): void;
    /**
     * Build the final ScenarioRunResult object by collecting data from all sources.
     * This should be called at the end of the run, whether successful or failed.
     */
    buildResult(roomId: string, evaluations: EnhancedEvaluationResult[], _executionResult: ExecutionResult): Promise<ScenarioRunResult>;
    /**
     * Reset all collected data. Useful for reusing the aggregator across multiple runs.
     */
    reset(): void;
    /**
     * Get a summary of the current aggregator state for debugging.
     */
    getState(): {
        runId?: string;
        combinationId?: string;
        hasParameters: boolean;
        hasStartTime: boolean;
        hasFinalResponse: boolean;
        metricsCount: number;
        hasError: boolean;
    };
}
export type { ScenarioRunResult, ScenarioRunMetrics, TrajectoryStep };
//# sourceMappingURL=data-aggregator.d.ts.map