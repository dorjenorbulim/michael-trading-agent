/**
 * Expands a file path starting with `~` to the project directory.
 *
 * @param filepath - The path to expand.
 * @returns The expanded path.
 */
export declare function expandTildePath(filepath: string, projectRootForTilde?: string): string;
/**
 * Resolves the path to the `.env` file, searching only within the start directory or
 * optionally up to a boundary directory (e.g., a monorepo root).
 *
 * @param startDir - Directory to begin the lookup (default: current working directory).
 * @param boundaryDir - Optional directory at which to stop searching upward.
 * @returns The path to the found `.env` file, or a path to `.env` in startDir if none found.
 */
export declare function resolveEnvFile(startDir?: string, boundaryDir?: string): string;
/**
 * Resolves the directory used for PGlite database storage.
 *
 * Resolution order:
 * 1. The `dir` argument if provided.
 * 2. The `PGLITE_DATA_DIR` environment variable.
 * 3. The `fallbackDir` argument if provided.
 * 4. `./.eliza/.elizadb` relative to the current working directory.
 *
 * @param dir - Optional directory preference.
 * @param fallbackDir - Optional fallback directory when env var is not set.
 * @returns The resolved data directory with any tilde expanded.
 */
export declare function resolvePgliteDir(dir?: string, fallbackDir?: string, targetProjectDir?: string): Promise<string>;
//# sourceMappingURL=resolve-utils.d.ts.map