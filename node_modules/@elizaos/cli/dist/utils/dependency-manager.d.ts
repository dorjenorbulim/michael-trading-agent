/**
 * Check if @elizaos/cli is present in package.json dependencies or devDependencies
 */
export declare function hasElizaOSCli(packageJsonPath: string): boolean;
/**
 * Check if we should auto-install @elizaos/cli
 * Returns true if:
 * - Not in a monorepo
 * - Has package.json
 * - @elizaos/cli is not already present
 * - Auto-install is not disabled
 */
export declare function shouldAutoInstallCli(cwd?: string): boolean;
/**
 * Install @elizaos/cli as a dev dependency using bun
 */
export declare function installElizaOSCli(cwd?: string): Promise<boolean>;
/**
 * Auto-install @elizaos/cli if conditions are met
 * This is the main function that should be called from start/dev commands
 * Uses bun as the package manager (ElizaOS standard)
 */
export declare function ensureElizaOSCli(cwd?: string): Promise<void>;
/**
 * Get the version of @elizaos/cli that would be installed
 * This is useful for showing the user what version will be added
 */
export declare function getLatestElizaOSCliVersion(): Promise<string | null>;
/**
 * Check if the current directory already has ElizaOS dependencies
 * This helps determine if auto-installing the CLI makes sense
 */
export declare function hasElizaOSDependencies(cwd?: string): boolean;
/**
 * Create a package.json if it doesn't exist (for standalone usage)
 * This is a fallback for cases where someone wants to use elizaos in a new directory
 * Uses bun as the package manager
 */
export declare function ensurePackageJson(cwd?: string): Promise<boolean>;
//# sourceMappingURL=dependency-manager.d.ts.map