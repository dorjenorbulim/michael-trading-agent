import { IAgentRuntime } from '@elizaos/core';
import { ExecutionResult } from './providers';
import { Evaluation as EvaluationSchema } from './schema';
export interface EvaluationResult {
    success: boolean;
    message: string;
}
export interface Evaluator {
    evaluate(params: EvaluationSchema, runResult: ExecutionResult, runtime: IAgentRuntime): Promise<EvaluationResult>;
}
export declare class EvaluationEngine {
    private runtime;
    private evaluators;
    constructor(runtime: IAgentRuntime);
    private register;
    runEvaluations(evaluations: EvaluationSchema[], runResult: ExecutionResult): Promise<EvaluationResult[]>;
    /**
     * NEW: Enhanced evaluation method for ticket #5783
     * Returns structured JSON output using the enhanced evaluation engine
     */
    runEnhancedEvaluations(evaluations: EvaluationSchema[], runResult: ExecutionResult): Promise<import('./schema').EnhancedEvaluationResult[]>;
}
export declare class TrajectoryContainsActionEvaluator implements Evaluator {
    evaluate(params: EvaluationSchema, _runResult: ExecutionResult, runtime: IAgentRuntime): Promise<EvaluationResult>;
}
//# sourceMappingURL=EvaluationEngine.d.ts.map