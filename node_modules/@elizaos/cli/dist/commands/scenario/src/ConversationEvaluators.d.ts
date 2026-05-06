import { IAgentRuntime } from '@elizaos/core';
import { ExecutionResult } from './providers';
import { Evaluator, EvaluationResult } from './EvaluationEngine';
import { Evaluation as EvaluationSchema } from './schema';
export declare class ConversationLengthEvaluator implements Evaluator {
    evaluate(params: EvaluationSchema, runResult: ExecutionResult): Promise<EvaluationResult>;
}
export declare class ConversationFlowEvaluator implements Evaluator {
    evaluate(params: EvaluationSchema, runResult: ExecutionResult, runtime: IAgentRuntime): Promise<EvaluationResult>;
    private detectPattern;
}
export declare class UserSatisfactionEvaluator implements Evaluator {
    evaluate(params: EvaluationSchema, runResult: ExecutionResult, runtime: IAgentRuntime): Promise<EvaluationResult>;
    private analyzeKeywords;
    private analyzeSentiment;
    private judgeWithLLM;
}
export declare class ContextRetentionEvaluator implements Evaluator {
    evaluate(params: EvaluationSchema, runResult: ExecutionResult, runtime: IAgentRuntime): Promise<EvaluationResult>;
    private parseConversationTurns;
    private testMemoryRetention;
    private checkMemoryInTurn;
}
//# sourceMappingURL=ConversationEvaluators.d.ts.map