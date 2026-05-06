/**
 * Enhanced Evaluation Engine for Ticket #5783
 *
 * This module provides structured JSON output from evaluators while maintaining
 * 100% backward compatibility with existing scenario files.
 *
 * CRITICAL: This is an ADDITIVE enhancement that does NOT break existing functionality.
 */
import { IAgentRuntime } from '@elizaos/core';
import { ExecutionResult } from './providers';
import { Evaluation as EvaluationSchema, EnhancedEvaluationResult } from './schema';
import { Evaluator } from './EvaluationEngine';
/**
 * Enhanced evaluator interface that returns structured results
 */
export interface EnhancedEvaluator {
    evaluateEnhanced(params: EvaluationSchema, runResult: ExecutionResult, runtime: IAgentRuntime): Promise<EnhancedEvaluationResult>;
}
/**
 * Adapter that can work with both legacy and enhanced evaluators
 */
export interface DualEvaluator extends Evaluator, EnhancedEvaluator {
}
/**
 * Enhanced Evaluation Engine that provides structured JSON output
 * while maintaining backward compatibility with existing scenarios.
 */
export declare class EnhancedEvaluationEngine {
    private runtime;
    private enhancedEvaluators;
    constructor(runtime: IAgentRuntime);
    private register;
    /**
     * NEW: Run evaluations with structured JSON output
     */
    runEnhancedEvaluations(evaluations: EvaluationSchema[], runResult: ExecutionResult): Promise<EnhancedEvaluationResult[]>;
}
//# sourceMappingURL=EnhancedEvaluationEngine.d.ts.map