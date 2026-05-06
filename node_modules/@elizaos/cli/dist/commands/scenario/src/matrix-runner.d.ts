/**
 * Matrix Runner Implementation
 *
 * This module implements the core logic for matrix test execution,
 * including combination generation, execution planning, and result collection.
 */
import { MatrixConfig } from './matrix-schema';
import { Scenario } from './schema';
import { MatrixCombination, MatrixConfigRuntime, MatrixExecutionContext } from './matrix-types';
/**
 * Generates all parameter combinations from a matrix configuration.
 *
 * This is the main function required by ticket #5779. It takes a validated
 * matrix configuration and generates a Cartesian product of all parameter
 * variations, returning an array of MatrixCombination objects.
 *
 * @param config - The validated matrix configuration
 * @returns Array of MatrixCombination objects, each representing a unique set of parameter overrides
 *
 * @example
 * ```typescript
 * const config = {
 *   name: "Test Matrix",
 *   base_scenario: "test.scenario.yaml",
 *   runs_per_combination: 1,
 *   matrix: [
 *     { parameter: "character.llm.model", values: ["gpt-4", "gpt-3.5"] },
 *     { parameter: "run[0].input", values: ["Hello", "Hi"] }
 *   ]
 * };
 *
 * const combinations = generateMatrixCombinations(config);
 * // Returns 4 combinations: all combinations of 2 models × 2 inputs
 * ```
 */
export declare function generateMatrixCombinations(config: MatrixConfig): MatrixCombination[];
/**
 * Creates a runtime configuration from a basic matrix configuration.
 * Adds computed values and metadata needed for execution.
 *
 * @param config - Basic matrix configuration
 * @returns Runtime configuration with additional metadata
 */
export declare function createRuntimeConfig(config: MatrixConfig): MatrixConfigRuntime;
/**
 * Creates an execution context for a matrix run.
 *
 * @param config - Matrix configuration
 * @param combinations - Generated combinations to execute
 * @param settings - Execution settings
 * @returns Execution context for tracking matrix execution
 */
export declare function createExecutionContext(config: MatrixConfig, combinations: MatrixCombination[], settings: {
    parallelism: number;
    dryRun: boolean;
    filter?: string;
    verbose: boolean;
}): MatrixExecutionContext;
/**
 * Applies filter to combinations based on a pattern.
 *
 * @param combinations - All combinations
 * @param filter - Filter pattern to match against
 * @returns Filtered combinations
 */
export declare function filterCombinations(combinations: MatrixCombination[], filter: string): MatrixCombination[];
/**
 * Validates that all combinations have valid parameter paths.
 * This is a placeholder for integration with the parameter override system.
 *
 * @param combinations - Combinations to validate
 * @param baseScenario - Base scenario object to validate against
 * @returns Validation result with any invalid combinations
 */
export declare function validateCombinations(combinations: MatrixCombination[], _baseScenario: Scenario): {
    valid: boolean;
    invalidCombinations: string[];
    errors: string[];
};
/**
 * Calculates execution statistics for planning purposes.
 *
 * @param combinations - Combinations to execute
 * @param runsPerCombination - Number of runs per combination
 * @returns Execution statistics
 */
export declare function calculateExecutionStats(combinations: MatrixCombination[], runsPerCombination: number): {
    totalCombinations: number;
    totalRuns: number;
    estimatedDuration: {
        optimistic: number;
        realistic: number;
        pessimistic: number;
    };
};
/**
 * Formats execution time in a human-readable format.
 *
 * @param seconds - Time in seconds
 * @returns Formatted time string
 */
export declare function formatDuration(seconds: number): string;
//# sourceMappingURL=matrix-runner.d.ts.map