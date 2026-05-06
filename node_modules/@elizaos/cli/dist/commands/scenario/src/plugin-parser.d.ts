import { PluginReference } from './schema';
import { Plugin } from '@elizaos/core';
export interface ParsedPlugin {
    name: string;
    version?: string;
    config?: Record<string, unknown>;
    enabled: boolean;
    originalReference: PluginReference;
    loadedPlugin?: Plugin;
}
export interface PluginValidationResult {
    valid: boolean;
    plugins: ParsedPlugin[];
    errors: string[];
    warnings: string[];
}
/**
 * Parse and validate plugins from scenario configuration
 */
export declare function parseAndValidate(pluginReferences: PluginReference[] | undefined): Promise<PluginValidationResult>;
/**
 * Generate plugin loading summary
 */
export declare function generateSummary(result: PluginValidationResult): string;
//# sourceMappingURL=plugin-parser.d.ts.map