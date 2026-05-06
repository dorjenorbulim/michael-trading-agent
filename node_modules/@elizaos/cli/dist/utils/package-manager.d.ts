/**
 * Always returns 'bun' as the package manager for ElizaOS CLI.
 *
 * @returns A promise that resolves to 'bun'.
 */
export declare function getPackageManager(): Promise<string>;
/**
 * Check if the CLI is running from a global installation
 * @returns {boolean} - Whether the CLI is globally installed
 */
export declare function isGlobalInstallation(): Promise<boolean>;
/**
 * Check if we're running via npx
 * @returns {boolean} - Whether we're running through npx
 */
export declare function isRunningViaNpx(): Promise<boolean>;
/**
 * Check if we're running via bunx
 * @returns {boolean} - Whether we're running through bunx
 */
export declare function isRunningViaBunx(): Promise<boolean>;
/**
 * Get the install command for bun
 * @param {boolean} isGlobal - Whether to install globally
 * @returns {string[]} - The bun install command array
 */
export declare function getInstallCommand(isGlobal: boolean): string[];
/**
 * Removes a package from bun.lock file to prevent circular dependency issues
 * @param packageName - The package name to remove from lockfile
 * @param directory - The directory containing the bun.lock file
 */
export declare function removeFromBunLock(packageName: string, directory: string): Promise<void>;
/**
 * Installs a package using the appropriate package manager, attempting multiple strategies if necessary.
 *
 * Tries to install the specified package from the npm registry, GitHub repositories, or a monorepo, based on the provided options and available sources. Handles normalization of plugin package names and supports version or tag specification.
 *
 * @param packageName - The name of the package to install. Can be a scoped package, organization/repo, or plugin name.
 * @param versionOrTag - Optional version or tag to install. If omitted, installs the latest version.
 * @param directory - The directory in which to run the installation.
 * @param options - Optional settings to control which installation strategies to attempt and monorepo details.
 * @returns A promise resolving to an object indicating whether installation succeeded and the installed package identifier, or null if all methods failed.
 */
export declare function executeInstallation(packageName: string, versionOrTag?: string, directory?: string): Promise<{
    success: boolean;
    installedIdentifier: string | null;
}>;
/**
 * Builds a GitHub specifier string for package installation.
 *
 * @param githubSpec - The GitHub specifier (e.g., "github:owner/repo")
 * @param versionOrTag - Optional version or tag to append
 * @returns The complete GitHub specifier string
 */
export declare function buildGitHubSpecifier(githubSpec: string, versionOrTag?: string): string;
/**
 * Enhanced installation function that supports GitHub fallback with lockfile cleanup.
 *
 * @param packageName - The name of the package to install
 * @param versionOrTag - Optional version or tag to install
 * @param directory - The directory in which to run the installation
 * @param githubFallback - Optional GitHub repository path for fallback (e.g., "owner/repo")
 * @returns A promise resolving to an object indicating success and installed identifier
 */
export declare function executeInstallationWithFallback(packageName: string, versionOrTag?: string, directory?: string, githubFallback?: string): Promise<{
    success: boolean;
    installedIdentifier: string | null;
}>;
//# sourceMappingURL=package-manager.d.ts.map