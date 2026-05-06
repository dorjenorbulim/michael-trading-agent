/**
 * Path Parser Utilities for Parameter Override System
 *
 * This module provides utilities for parsing and manipulating dot-notation paths
 * with array indexing support. Required by ticket #5780.
 */
/**
 * Represents a parsed parameter path with segments and metadata.
 */
export interface ParameterPath {
    /** Array of path segments, where numbers represent array indices */
    segments: (string | number)[];
    /** Whether the path contains array access notation */
    hasArrayAccess: boolean;
    /** Original path string */
    originalPath: string;
}
/**
 * Parses a dot-notation parameter path into segments.
 *
 * Supports:
 * - Simple paths: "character.name"
 * - Nested paths: "character.llm.model"
 * - Array access: "run[0].input"
 * - Mixed access: "plugins[1].config.apiKey"
 *
 * @param path - The dot-notation path to parse
 * @returns Parsed path object with segments
 * @throws Error if the path is malformed
 *
 * @example
 * ```typescript
 * parseParameterPath("character.llm.model")
 * // Returns: { segments: ["character", "llm", "model"], hasArrayAccess: false }
 *
 * parseParameterPath("run[0].input")
 * // Returns: { segments: ["run", 0, "input"], hasArrayAccess: true }
 * ```
 */
export declare function parseParameterPath(path: string): ParameterPath;
/**
 * Validates a parameter path string without fully parsing it.
 * Useful for quick validation checks.
 *
 * @param path - The path string to validate
 * @returns True if the path has valid syntax
 */
export declare function isValidPathSyntax(path: string): boolean;
/**
 * Normalizes a parameter path by removing extra dots and spaces.
 * Useful for cleaning user input.
 *
 * @param path - The path to normalize
 * @returns Normalized path string
 */
export declare function normalizeParameterPath(path: string): string;
/**
 * Suggests corrections for common path mistakes.
 *
 * @param invalidPath - The invalid path that failed validation
 * @returns Array of suggested corrections
 */
export declare function suggestPathCorrections(invalidPath: string): string[];
/**
 * Gets the parent path of a given parameter path.
 *
 * @param path - The parameter path
 * @returns Parent path string, or null if path has no parent
 *
 * @example
 * ```typescript
 * getParentPath("character.llm.model") // "character.llm"
 * getParentPath("run[0].input") // "run[0]"
 * getParentPath("name") // null
 * ```
 */
export declare function getParentPath(path: string): string | null;
/**
 * Reconstructs a path string from parsed segments.
 *
 * @param segments - Array of path segments
 * @returns Reconstructed path string
 */
export declare function reconstructPath(segments: (string | number)[]): string;
/**
 * Clears the path parsing cache.
 * Useful for testing or memory management.
 */
export declare function clearPathCache(): void;
/**
 * Gets cache statistics for debugging and performance monitoring.
 */
export declare function getPathCacheStats(): {
    size: number;
    hitRate?: number;
};
//# sourceMappingURL=path-parser.d.ts.map