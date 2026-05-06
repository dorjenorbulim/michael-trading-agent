/**
 * Parameter Override System for Scenario Matrix Testing
 *
 * This module provides functionality to dynamically override parameters in scenario
 * configurations using dot-notation paths and array indexing.
 *
 * Core implementation for ticket #5780.
 */
export { parseParameterPath, isValidPathSyntax, normalizeParameterPath, ParameterPath, } from './path-parser';
export { deepClone, hasCircularReference, deepCloneWithLimit } from './deep-clone';
/**
 * Represents a single parameter override.
 */
export interface ParameterOverride {
    /** Dot-notation path to the parameter (e.g., "character.llm.model" or "run[0].input") */
    path: string;
    /** The value to set at the specified path */
    value: unknown;
}
/**
 * Result of parameter path validation with detailed feedback.
 * Required by ticket #5780.
 */
export interface ValidationResult {
    /** Whether the path is valid and can be used for overrides */
    isValid: boolean;
    /** Error message if validation failed */
    error?: string;
    /** Suggested correction for common mistakes */
    suggestion?: string;
    /** Whether the path exists in the target object */
    pathExists: boolean;
    /** Type of the value at the target path */
    targetType?: string;
}
/**
 * Details about a single parameter override operation.
 * Used for tracking and debugging override applications.
 */
export interface OverrideOperation {
    /** The dot-notation path that was modified */
    path: string;
    /** The new value that was set */
    value: unknown;
    /** The original value that was replaced (if any) */
    originalValue?: unknown;
    /** Whether this operation created new intermediate objects */
    wasCreated: boolean;
}
/**
 * Complete result of applying parameter overrides.
 * Includes the modified scenario and metadata about operations.
 */
export interface OverrideResult {
    /** The scenario object with overrides applied */
    scenario: Record<string, unknown>;
    /** Details about each override operation performed */
    operations: OverrideOperation[];
    /** Any warnings generated during override application */
    warnings: string[];
}
/**
 * Validates that a parameter path exists in the given object with detailed feedback.
 * This enhanced version returns ValidationResult as required by ticket #5780.
 *
 * @param obj - The object to validate against
 * @param path - The dot-notation path to validate
 * @returns ValidationResult with detailed information about the path
 *
 * @example
 * ```typescript
 * const scenario = { character: { llm: { model: "gpt-4" } } };
 * const result = validateParameterPath(scenario, "character.llm.model");
 * // result.isValid === true, result.targetType === "string"
 *
 * const invalid = validateParameterPath(scenario, "character.nonexistent");
 * // invalid.isValid === false, invalid.suggestion === "Available properties: llm"
 * ```
 */
export declare function validateParameterPath(obj: unknown, path: string): ValidationResult;
/**
 * Legacy function for backward compatibility.
 * Returns boolean like the original function.
 */
export declare function validateParameterPathLegacy(obj: unknown, path: string): boolean;
/**
 * Gets the value at a specific parameter path in an object.
 *
 * @param obj - The object to read from
 * @param path - The dot-notation path
 * @returns The value at the path
 * @throws Error if the path doesn't exist
 */
export declare function getValueAtPath(obj: unknown, path: string): unknown;
/**
 * Sets a value at a specific parameter path in an object.
 * This function modifies the object in place.
 *
 * @param obj - The object to modify
 * @param path - The dot-notation path
 * @param value - The value to set
 * @throws Error if the path doesn't exist or is invalid
 */
export declare function setValueAtPath(obj: Record<string, unknown>, path: string, value: unknown): void;
/**
 * Applies a single parameter override to a scenario object.
 * This is the core function required by ticket #5780.
 *
 * @param scenario - The scenario object to modify
 * @param path - Dot-notation path to the parameter (e.g., "character.llm.model")
 * @param value - The value to set at the specified path
 * @returns A deep clone of the scenario with the override applied
 * @throws Error if the path is invalid or cannot be applied
 *
 * @example
 * ```typescript
 * const scenario = { character: { llm: { model: "gpt-4" } } };
 * const result = applyParameterOverride(scenario, "character.llm.model", "gpt-3.5-turbo");
 * // result.character.llm.model === "gpt-3.5-turbo"
 * // original scenario is unchanged
 * ```
 */
export declare function applyParameterOverride(scenario: Record<string, unknown>, path: string, value: unknown): Record<string, unknown>;
/**
 * Applies a set of parameter overrides from a Record<string, unknown> format.
 * This is the batch function required by ticket #5780.
 *
 * @param baseScenario - The base scenario object to modify
 * @param overrides - Record mapping parameter paths to values
 * @returns A deep clone of the scenario with all overrides applied
 * @throws Error if any path is invalid or cannot be applied
 *
 * @example
 * ```typescript
 * const overrides = {
 *   "character.llm.model": "gpt-3.5-turbo",
 *   "run[0].input": "Hello world"
 * };
 * const result = applyMatrixOverrides(baseScenario, overrides);
 * ```
 */
export declare function applyMatrixOverrides(baseScenario: Record<string, unknown>, overrides: Record<string, unknown>): Record<string, unknown>;
/**
 * Applies parameter overrides to a base scenario object.
 *
 * This is the main function for the parameter override system. It takes a base
 * scenario object and an array of parameter overrides, and returns a new scenario
 * object with the overrides applied.
 *
 * The function:
 * 1. Creates a deep copy of the base scenario to ensure immutability
 * 2. Validates each override path exists in the scenario
 * 3. Applies each override in order
 * 4. Returns the modified scenario
 *
 * @param baseScenario - The base scenario object to modify
 * @param overrides - Array of parameter overrides to apply
 * @returns A new scenario object with overrides applied
 * @throws Error if any override path is invalid
 *
 * @example
 * ```typescript
 * const baseScenario = {
 *   character: { llm: { model: "gpt-4" } },
 *   run: [{ input: "original" }]
 * };
 *
 * const overrides = [
 *   { path: "character.llm.model", value: "gpt-3.5-turbo" },
 *   { path: "run[0].input", value: "modified" }
 * ];
 *
 * const result = applyParameterOverrides(baseScenario, overrides);
 * // result.character.llm.model === "gpt-3.5-turbo"
 * // result.run[0].input === "modified"
 * // baseScenario is unchanged
 * ```
 */
export declare function applyParameterOverrides(baseScenario: Record<string, unknown>, overrides: ParameterOverride[]): Record<string, unknown>;
/**
 * Converts a parameter combinations object to ParameterOverride array.
 * This is a utility function for integrating with the matrix system.
 *
 * @param combination - Object mapping parameter paths to values
 * @returns Array of ParameterOverride objects
 *
 * @example
 * ```typescript
 * const combination = {
 *   "character.llm.model": "gpt-4",
 *   "run[0].input": "test input"
 * };
 *
 * const overrides = combinationToOverrides(combination);
 * // Returns: [
 * //   { path: "character.llm.model", value: "gpt-4" },
 * //   { path: "run[0].input", value: "test input" }
 * // ]
 * ```
 */
export declare function combinationToOverrides(combination: Record<string, unknown>): ParameterOverride[];
/**
 * Validates that all parameter paths in a matrix configuration are valid
 * for a given base scenario.
 *
 * @param baseScenario - The base scenario to validate against
 * @param matrixAxes - Array of matrix axes with parameter paths
 * @returns Validation result with any invalid paths
 */
export declare function validateMatrixParameterPaths(baseScenario: Record<string, unknown>, matrixAxes: Array<{
    parameter: string;
    values: unknown[];
}>): {
    valid: boolean;
    invalidPaths: string[];
};
//# sourceMappingURL=parameter-override.d.ts.map