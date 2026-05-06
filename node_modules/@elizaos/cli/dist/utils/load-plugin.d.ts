/**
 * Attempts to load a plugin module using relevant strategies based on plugin type.
 * ElizaOS ecosystem plugins (@elizaos/*) use all strategies,
 * while third-party plugins use only relevant strategies to avoid noise.
 *
 * @param repository - The plugin repository/package name to load.
 * @returns The loaded plugin module or null if loading fails after all attempts.
 */
export declare function loadPluginModule(repository: string): Promise<Record<string, unknown> | null>;
//# sourceMappingURL=load-plugin.d.ts.map