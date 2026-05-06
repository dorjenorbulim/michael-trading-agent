interface PackageInfo {
    name: string;
    main?: string;
    scripts?: Record<string, string>;
    version?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    [key: string]: string | Record<string, string> | undefined;
}
interface PluginContext {
    isLocalDevelopment: boolean;
    localPath?: string;
    packageInfo?: PackageInfo;
    needsBuild?: boolean;
}
/**
 * Detects if the current directory is the same plugin being requested
 * and provides context about local development status
 */
export declare function detectPluginContext(pluginName: string): PluginContext;
/**
 * Ensures a local plugin is built before attempting to load it
 */
export declare function ensurePluginBuilt(context: PluginContext): Promise<boolean>;
/**
 * Provides helpful guidance when local plugin loading fails
 */
export declare function provideLocalPluginGuidance(pluginName: string, context: PluginContext): void;
export {};
//# sourceMappingURL=plugin-context.d.ts.map