interface OSInfo {
    platform: string;
    release: string;
    arch: string;
    type: string;
    version: string;
    homedir: string;
}
interface CLIInfo {
    version: string;
    name: string;
    path: string;
}
interface PackageManagerInfo {
    name: 'bun';
    version: string | null;
    global: boolean;
    isNpx: boolean;
    isBunx: boolean;
}
interface PathInfo {
    elizaDir: string;
    envFilePath: string;
    configPath: string;
    pluginsDir: string;
    monorepoRoot: string | null;
    packageJsonPath: string;
}
interface EnvInfo {
    GITHUB_USERNAME?: string;
    GITHUB_TOKEN?: string;
    [key: string]: string | undefined;
}
export interface UserEnvironmentInfo {
    os: OSInfo;
    cli: CLIInfo;
    packageManager: PackageManagerInfo;
    timestamp: string;
    paths: PathInfo;
    env: EnvInfo;
}
/**
 * Provides information about the user's environment including OS, CLI, and package manager details.
 * Uses singleton pattern to cache results.
 */
export declare class UserEnvironment {
    static readonly getInstance: () => UserEnvironment;
    static readonly getInstanceInfo: () => Promise<UserEnvironmentInfo>;
    private static readonly instance;
    private cachedInfo;
    private constructor();
    /**
     * Gets operating system information
     */
    private getOSInfo;
    /**
     * Gets CLI version and package information
     */
    private getCLIInfo;
    /**
     * Detects the active package manager - always returns bun for ElizaOS CLI
     */
    private getPackageManagerInfo;
    /**
     * Finds the monorepo root by traversing upwards from a starting directory,
     * looking for a marker directory ('packages/core').
     *
     * @param startDir The directory to start searching from.
     * @returns The path to the monorepo root if found, otherwise null.
     */
    findMonorepoRoot(startDir: string): string | null;
    getPathInfo(): Promise<PathInfo>;
    private getEnvInfo;
    getInfo(directory?: string): Promise<UserEnvironmentInfo>;
    /**
     * Clears the cached information
     */
    clearCache(): void;
    /**
     * Gets the version of a specified package from monorepo, local dependencies, or npm
     */
    getPackageVersion(packageName: string): Promise<string>;
    /**
     * Get local packages available in the monorepo
     */
    getLocalPackages(): Promise<string[]>;
}
export {};
//# sourceMappingURL=user-environment.d.ts.map