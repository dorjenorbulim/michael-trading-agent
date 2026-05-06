import { z } from 'zod';
/**
 * Schema for defining a single axis of variation in a scenario matrix.
 * Each axis specifies a parameter path and the values to test for that parameter.
 */
declare const MatrixAxisSchema: z.ZodObject<{
    parameter: z.ZodString;
    values: z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodRecord<z.ZodString, z.ZodUnknown>, z.ZodArray<z.ZodUnknown>]>>;
}, z.core.$strip>;
/**
 * Schema for the complete scenario matrix configuration.
 * This defines how to run a base scenario across multiple parameter combinations.
 */
export declare const MatrixConfigSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    base_scenario: z.ZodString;
    runs_per_combination: z.ZodDefault<z.ZodNumber>;
    matrix: z.ZodArray<z.ZodObject<{
        parameter: z.ZodString;
        values: z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodRecord<z.ZodString, z.ZodUnknown>, z.ZodArray<z.ZodUnknown>]>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
/**
 * TypeScript interface for a matrix axis, inferred from the Zod schema.
 */
export type MatrixAxis = z.infer<typeof MatrixAxisSchema>;
/**
 * TypeScript interface for the complete matrix configuration, inferred from the Zod schema.
 */
export type MatrixConfig = z.infer<typeof MatrixConfigSchema>;
/**
 * Validation result type for successful validation.
 */
interface ValidationSuccess {
    success: true;
    data: MatrixConfig;
}
/**
 * Validation result type for failed validation.
 */
interface ValidationError {
    success: false;
    error: z.ZodError<MatrixConfig>;
}
/**
 * Union type for validation results.
 */
export type ValidationResult = ValidationSuccess | ValidationError;
/**
 * Validates a matrix configuration object against the schema.
 *
 * @param config - The configuration object to validate (typically parsed from YAML)
 * @returns ValidationResult - Contains either the validated data or detailed error information
 *
 * @example
 * ```typescript
 * const config = {
 *   name: "Test Matrix",
 *   base_scenario: "test.scenario.yaml",
 *   matrix: [
 *     {
 *       parameter: "character.llm.model",
 *       values: ["gpt-4", "claude-3"]
 *     }
 *   ]
 * };
 *
 * const result = validateMatrixConfig(config);
 * if (result.success) {
 *   console.log("Valid configuration:", result.data);
 * } else {
 *   console.error("Validation errors:", result.error.format());
 * }
 * ```
 */
export declare function validateMatrixConfig(config: unknown): ValidationResult;
/**
 * Calculates the total number of parameter combinations in a matrix configuration.
 * This is the Cartesian product of all axis values.
 *
 * @param config - A validated matrix configuration
 * @returns The total number of combinations that will be generated
 *
 * @example
 * ```typescript
 * const config = {
 *   name: "Test",
 *   base_scenario: "test.yaml",
 *   matrix: [
 *     { parameter: "model", values: ["gpt-4", "claude-3"] },      // 2 values
 *     { parameter: "temperature", values: [0.1, 0.5, 0.9] }      // 3 values
 *   ]
 * };
 *
 * const total = calculateTotalCombinations(config); // Returns 6 (2 * 3)
 * ```
 */
export declare function calculateTotalCombinations(config: MatrixConfig): number;
/**
 * Calculates the total number of test runs that will be executed.
 * This is the total combinations multiplied by runs_per_combination.
 *
 * @param config - A validated matrix configuration
 * @returns The total number of test runs that will be executed
 */
export declare function calculateTotalRuns(config: MatrixConfig): number;
/**
 * Generates all possible parameter combinations from a matrix configuration.
 * Each combination is represented as a map of parameter paths to values.
 *
 * @param config - A validated matrix configuration
 * @returns An array of parameter combination objects
 *
 * @example
 * ```typescript
 * const config = {
 *   name: "Test",
 *   base_scenario: "test.yaml",
 *   matrix: [
 *     { parameter: "model", values: ["gpt-4", "claude-3"] },
 *     { parameter: "temp", values: [0.1, 0.5] }
 *   ]
 * };
 *
 * const combinations = generateParameterCombinations(config);
 * // Returns:
 * // [
 * //   { "model": "gpt-4", "temp": 0.1 },
 * //   { "model": "gpt-4", "temp": 0.5 },
 * //   { "model": "claude-3", "temp": 0.1 },
 * //   { "model": "claude-3", "temp": 0.5 }
 * // ]
 * ```
 */
export declare function generateParameterCombinations(config: MatrixConfig): Record<string, string | number | boolean | null | Record<string, unknown> | unknown[]>[];
/**
 * Validates that a parameter path is well-formed.
 * This is a basic validation that checks for obvious syntax errors.
 *
 * @param parameterPath - The parameter path to validate
 * @returns True if the path appears to be well-formed
 *
 * @example
 * ```typescript
 * isValidParameterPath("character.llm.model")        // true
 * isValidParameterPath("run[0].input")               // true
 * isValidParameterPath("setup.mocks[0].response")    // true
 * isValidParameterPath("")                           // false
 * isValidParameterPath("invalid..path")              // false
 * ```
 */
export declare function isValidParameterPath(parameterPath: string): boolean;
export {};
//# sourceMappingURL=matrix-schema.d.ts.map