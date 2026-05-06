import { EnvVarConfig } from '../types';
/**
 * Attempts to find the package.json of an installed plugin and extract environment variable requirements
 * from its agentConfig.pluginParameters
 */
export declare const extractPluginEnvRequirements: (packageName: string, cwd: string) => Promise<Record<string, EnvVarConfig>>;
/**
 * Reads the current .env file content
 */
export declare const readEnvFile: (cwd: string) => Promise<Record<string, string>>;
/**
 * Writes content to the .env file
 */
export declare const writeEnvFile: (cwd: string, vars: Record<string, string>) => Promise<void>;
/**
 * Prompts user for an environment variable value
 */
export declare const promptForEnvVar: (varName: string, config: EnvVarConfig) => Promise<string>;
/**
 * Updates the .env file with a new environment variable
 */
export declare const updateEnvFile: (cwd: string, varName: string, value: string) => Promise<void>;
/**
 * Prompts for environment variables based on the plugin's agentConfig.pluginParameters
 * and writes them to the .env file
 */
export declare const promptForPluginEnvVars: (packageName: string, cwd: string) => Promise<void>;
//# sourceMappingURL=env-vars.d.ts.map