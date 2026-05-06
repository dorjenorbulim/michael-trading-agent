export interface RegistrySettings {
    defaultRegistry: string;
    publishConfig?: {
        registry: string;
        username?: string;
        useNpm?: boolean;
        platform?: 'node' | 'browser' | 'universal';
    };
}
export interface DataDirStatus {
    exists: boolean;
    env: {
        exists: boolean;
        missingKeys: string[];
        hasAllKeys: boolean;
    };
    settings: {
        exists: boolean;
        missingKeys: string[];
        hasAllKeys: boolean;
    };
}
export declare function ensureElizaDir(): Promise<void>;
export declare function getRegistrySettings(): Promise<RegistrySettings>;
export declare function saveRegistrySettings(settings: RegistrySettings): Promise<void>;
export declare function getEnvVar(key: string): Promise<string | undefined>;
export declare function setEnvVar(key: string, value: string): Promise<void>;
export declare function getGitHubToken(): Promise<string | undefined>;
export declare function setGitHubToken(token: string): Promise<void>;
interface PluginMetadata {
    name: string;
    description: string;
    author: string;
    repository: string;
    versions: string[];
    latestVersion: string;
    runtimeVersion: string;
    maintainer: string;
    tags?: string[];
    categories?: string[];
}
/**
 * Saves the registry index to the cache file
 */
export declare function saveRegistryCache(registry: Record<string, string>): Promise<void>;
/**
 * Gets a local copy of the registry index without requiring GitHub authentication.
 * This is useful for offline mode or when GitHub is unavailable.
 *
 * @returns {Promise<Record<string, string>>} The local registry index
 */
export declare function getLocalRegistryIndex(): Promise<Record<string, string>>;
/**
 * Fetches the registry index asynchronously.
 *
 * @returns {Promise<Registry>} The registry index
 * @throws {Error} If the response from the registry is not valid JSON or if there is an error fetching the plugins
 */
export declare function getRegistryIndex(): Promise<Record<string, string>>;
/**
 * Normalizes a plugin name to the expected format in the registry
 *
 * @param {string} pluginName - The name of the plugin to normalize
 * @returns {string[]} An array of possible normalized plugin names to try
 */
export declare function normalizePluginName(pluginName: string): string[];
/**
 * Retrieves the repository URL for a given plugin from the registry.
 *
 * @param {string} pluginName - The name of the plugin to fetch the repository URL for.
 * @returns {Promise<string | null>} The repository URL for the plugin, or null if not found.
 * @throws {Error} If an error occurs while retrieving the repository URL.
 */
export declare function getPluginRepository(pluginName: string): Promise<string | null>;
/**
 * Check if a GitHub repository has a specific branch
 */
/**
 * Check if a repository has a specific branch.
 *
 * @param {string} repoUrl - The URL of the repository to check.
 * @param {string} branchName - The name of the branch to check for.
 * @returns {Promise<boolean>} A Promise that resolves to a boolean indicating whether the branch exists in the repository.
 */
export declare function repoHasBranch(repoUrl: string, branchName: string): Promise<boolean>;
export declare function getBestBranch(repoUrl: string): Promise<string>;
export declare function listPluginsByType(type?: string): Promise<string[]>;
export declare function getPluginMetadata(pluginName: string): Promise<PluginMetadata | null>;
export declare function getPluginVersion(pluginName: string, version?: string): Promise<string | null>;
export declare function getPluginTags(pluginName: string): Promise<string[]>;
export declare function getPluginCategories(pluginName: string): Promise<string[]>;
export declare function getAvailableDatabases(): Promise<string[]>;
/**
 * Attempts to get package details from the registry
 */
export declare function getPackageDetails(packageName: string): Promise<{
    name: string;
    description: string;
    author: string;
    repository: string;
    versions: string[];
    latestVersion: string;
    runtimeVersion: string;
    maintainer: string;
} | null>;
/**
 * Gets the best matching version of a plugin based on runtime version
 */
export declare function getBestPluginVersion(packageName: string, runtimeVersion: string): Promise<string | null>;
export declare function checkDataDir(): Promise<DataDirStatus>;
export declare function initializeDataDir(): Promise<void>;
export declare function validateDataDir(): Promise<boolean>;
export {};
//# sourceMappingURL=index.d.ts.map