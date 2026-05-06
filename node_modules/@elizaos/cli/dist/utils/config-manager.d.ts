/**
 * Interface for the agent's configuration
 */
interface AgentConfig {
    lastUpdated: string;
    isDefault?: boolean;
}
/**
 * Retrieves the file path to the agent's configuration file.
 *
 * @returns A promise that resolves to the absolute path of the configuration file.
 */
export declare function getConfigFilePath(): Promise<string>;
/**
 * Loads the agent configuration from disk, returning a default configuration if the file does not exist or cannot be read.
 *
 * @returns The loaded {@link AgentConfig} object, or a default configuration if loading fails.
 */
export declare function loadConfig(): Promise<AgentConfig>;
/**
 * Saves the agent configuration object to disk, updating its last updated timestamp.
 *
 * @param config - The agent configuration to save.
 *
 * @remark
 * If the target directory does not exist, it is created. Errors during saving are logged and rethrown.
 */
export declare function saveConfig(config: AgentConfig): Promise<void>;
export {};
//# sourceMappingURL=config-manager.d.ts.map