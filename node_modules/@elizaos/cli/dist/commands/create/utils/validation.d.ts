import { z } from 'zod';
import type { CreateOptions } from '../types';
/**
 * Project name validation schema
 */
export declare const ProjectNameSchema: z.ZodString;
/**
 * Plugin name validation schema
 */
export declare const PluginNameSchema: z.ZodString;
/**
 * Validates create command options using Zod schema
 */
export declare function validateCreateOptions(options: unknown): CreateOptions;
/**
 * Validates a project name according to npm package naming rules.
 * Special case: "." is allowed for current directory projects.
 */
export declare function validateProjectName(name: string): {
    isValid: boolean;
    error?: string;
};
/**
 * Processes and validates a plugin name.
 */
export declare function processPluginName(name: string): {
    isValid: boolean;
    processedName?: string;
    error?: string;
};
/**
 * Validates that the target directory is empty or doesn't exist.
 */
export declare function validateTargetDirectory(targetDir: string): Promise<{
    isValid: boolean;
    error?: string;
}>;
//# sourceMappingURL=validation.d.ts.map