import { Scenario } from './schema';
import { ExecutionResult } from './providers';
import { EvaluationResult } from './EvaluationEngine';
export declare class Reporter {
    reportStart(scenario: Scenario): void;
    reportExecutionResult(result: ExecutionResult): void;
    reportEvaluationResults(results: EvaluationResult[]): void;
    reportFinalResult(finalSuccess: boolean): void;
}
//# sourceMappingURL=Reporter.d.ts.map