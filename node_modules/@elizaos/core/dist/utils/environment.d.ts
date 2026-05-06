export type RuntimeEnvironment = 'node' | 'browser' | 'unknown';
export interface EnvironmentConfig {
    [key: string]: string | boolean | number | undefined;
}
export declare function detectEnvironment(): RuntimeEnvironment;
/**
 * Resets the cached environment detection result.
 * This is primarily for testing purposes when mocking different environments.
 */
export declare function resetEnvironmentCache(): void;
declare class Environment {
    private runtime;
    private browserStore?;
    private cache;
    constructor();
    getRuntime(): RuntimeEnvironment;
    isNode(): boolean;
    isBrowser(): boolean;
    get(key: string, defaultValue?: string): string | undefined;
    set(key: string, value: string | boolean | number): void;
    has(key: string): boolean;
    getAll(): EnvironmentConfig;
    private static readonly TRUTHY_VALUES;
    getBoolean(key: string, defaultValue?: boolean): boolean;
    getNumber(key: string, defaultValue?: number): number | undefined;
    clearCache(): void;
}
export declare function getEnvironment(): Environment;
export declare function getEnv(key: string, defaultValue?: string): string | undefined;
export declare function setEnv(key: string, value: string | boolean | number): void;
export declare function hasEnv(key: string): boolean;
export declare function getBooleanEnv(key: string, defaultValue?: boolean): boolean;
export declare function getNumberEnv(key: string, defaultValue?: number): number | undefined;
export declare function initBrowserEnvironment(config: EnvironmentConfig): void;
export declare const currentRuntime: RuntimeEnvironment;
export { Environment };
export declare function findEnvFile(startDir?: string, filenames?: string[]): string | null;
export interface LoadEnvOptions {
    override?: boolean;
}
export declare function loadEnvFile(envPath?: string, options?: LoadEnvOptions): boolean;
export declare function findAllEnvFiles(startDir: string, boundaryDir?: string): string[];
/**
 * Loads .env files with proper precedence (closest file wins).
 */
export declare function loadEnvFilesWithPrecedence(startDir: string, options?: {
    boundaryDir?: string;
    clearBeforeLoad?: boolean;
    varsToClear?: string[];
}): string[];
//# sourceMappingURL=environment.d.ts.map