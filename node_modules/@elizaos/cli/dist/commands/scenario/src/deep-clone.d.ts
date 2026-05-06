/**
 * Deep Clone Utilities for Parameter Override System
 *
 * This module provides safe deep cloning functionality with support for
 * complex JavaScript objects, arrays, and edge cases. Required by ticket #5780.
 */
/**
 * Creates a deep clone of an object, preserving data types and handling edge cases.
 *
 * This function provides safe deep cloning that:
 * - Preserves data types (Date, RegExp, etc.)
 * - Handles circular references
 * - Maintains array ordering and object key ordering
 * - Supports nested structures of arbitrary depth
 *
 * @param obj - The object to clone
 * @returns A deep clone of the input object
 * @throws Error if circular references are detected without proper handling
 *
 * @example
 * ```typescript
 * const original = {
 *   name: "test",
 *   nested: { value: 42 },
 *   array: [1, 2, { inner: "data" }],
 *   date: new Date()
 * };
 * const cloned = deepClone(original);
 * // cloned is completely independent of original
 * ```
 */
export declare function deepClone<T>(obj: T): T;
/**
 * Creates a shallow clone of an object.
 * Useful for performance when deep cloning is not necessary.
 *
 * @param obj - The object to clone
 * @returns A shallow clone of the input object
 */
export declare function shallowClone<T>(obj: T): T;
/**
 * Checks if an object contains circular references.
 * Useful for validation before cloning operations.
 *
 * @param obj - The object to check
 * @returns True if circular references are detected
 */
export declare function hasCircularReference(obj: unknown): boolean;
/**
 * Creates a deep clone with a maximum depth limit.
 * Useful for preventing stack overflow with very deep objects.
 *
 * @param obj - The object to clone
 * @param maxDepth - Maximum depth to clone (default: 50)
 * @returns A deep clone limited to the specified depth
 */
export declare function deepCloneWithLimit<T>(obj: T, maxDepth?: number): T;
/**
 * Performs a structural clone using JSON serialization.
 * Fast but limited to JSON-serializable objects.
 *
 * @param obj - The object to clone
 * @returns A deep clone via JSON serialization
 * @throws Error if object is not JSON-serializable
 */
export declare function jsonClone<T>(obj: T): T;
/**
 * Clears any internal caching used by the cloning functions.
 * Useful for testing and memory management.
 */
export declare function clearCloneCache(): void;
/**
 * Options for advanced cloning behavior.
 */
export interface CloneOptions {
    /** Maximum depth to clone (prevents stack overflow) */
    maxDepth?: number;
    /** Whether to handle circular references (default: true) */
    handleCircular?: boolean;
    /** Whether to preserve special object types like Date, RegExp (default: true) */
    preserveTypes?: boolean;
    /** Custom cloning function for specific object types */
    customCloners?: Map<new (...args: unknown[]) => unknown, (obj: unknown) => unknown>;
}
/**
 * Advanced deep clone with configurable options.
 *
 * @param obj - The object to clone
 * @param options - Cloning options
 * @returns A deep clone with the specified behavior
 */
export declare function advancedDeepClone<T>(obj: T, options?: CloneOptions): T;
//# sourceMappingURL=deep-clone.d.ts.map