import { type DirectoryInfo } from '@/src/utils/directory-detection';
import { type Plugin } from '@elizaos/core';
/**
 * Loads the plugin modules for a plugin's dependencies.
 * Assumes dependencies have already been installed by `installPluginDependencies`.
 * @param projectInfo Information about the current directory
 * @returns An array of loaded plugin modules.
 */
export declare function loadPluginDependencies(projectInfo: DirectoryInfo): Promise<Plugin[]>;
//# sourceMappingURL=plugin-utils.d.ts.map