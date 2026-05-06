import { EnvVarConfig } from '../commands/plugins/types';
export interface PluginEnvVarInfo {
    name: string;
    config: EnvVarConfig;
    plugin: string;
}
export interface PluginEnvScanResult {
    allowedVars: Set<string>;
    varInfo: Map<string, PluginEnvVarInfo>;
    pluginsWithDeclarations: string[];
    pluginsWithoutDeclarations: string[];
}
export declare function scanPluginsForEnvDeclarations(cwd: string, options?: {
    includeCoreVars?: boolean;
    maxDepth?: number;
}): PluginEnvScanResult;
export declare function filterEnvVarsByPluginDeclarations(envVars: Record<string, string | undefined>, allowedVars: Set<string>): Record<string, string>;
export declare function detectShellOnlyVars(envFilePath: string, processEnv: Record<string, string | undefined>): Set<string>;
export declare function warnAboutMissingDeclarations(pluginsWithoutDeclarations: string[], options?: {
    logLevel?: 'warn' | 'debug';
}): boolean;
//# sourceMappingURL=plugin-env-filter.d.ts.map