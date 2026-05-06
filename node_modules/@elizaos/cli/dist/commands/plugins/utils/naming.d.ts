import { Dependencies } from '../types';
/**
 * Normalizes a plugin input string to a standard format, typically 'plugin-name'.
 * Used primarily for display and generating commands in bunx instructions.
 */
export declare const normalizePluginNameForDisplay: (pluginInput: string) => string;
/**
 * Finds the actual package name in dependencies based on various input formats.
 */
export declare const findPluginPackageName: (pluginInput: string, allDependencies: Dependencies) => string | null;
/**
 * Extracts the actual npm package name from various input formats.
 * This function handles GitHub URLs, package names, and repository names
 * but preserves the exact package name for installation.
 */
export declare const extractPackageName: (pluginInput: string) => string;
//# sourceMappingURL=naming.d.ts.map