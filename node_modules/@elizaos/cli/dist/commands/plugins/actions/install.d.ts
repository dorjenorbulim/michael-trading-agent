import { AddPluginOptions } from '../types';
/**
 * Install a plugin from GitHub repository
 */
export declare function installPluginFromGitHub(plugin: string, cwd: string, opts: AddPluginOptions): Promise<void>;
/**
 * Install a plugin from registry
 */
export declare function installPluginFromRegistry(plugin: string, cwd: string, opts: AddPluginOptions): Promise<void>;
/**
 * Main plugin installation function
 */
export declare function addPlugin(pluginArg: string, opts: AddPluginOptions): Promise<void>;
//# sourceMappingURL=install.d.ts.map