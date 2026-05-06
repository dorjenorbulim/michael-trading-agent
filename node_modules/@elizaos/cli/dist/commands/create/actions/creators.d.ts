/**
 * Creates a new plugin with the specified name and configuration.
 */
export declare function createPlugin(pluginName: string, targetDir: string, pluginType?: string, isNonInteractive?: boolean): Promise<void>;
/**
 * Creates a new agent character file with the specified name.
 */
export declare function createAgent(agentName: string, targetDir: string, isNonInteractive?: boolean): Promise<void>;
/**
 * Creates a new TEE project with the specified name and configuration.
 */
export declare function createTEEProject(projectName: string, targetDir: string, database: string, aiModel: string, embeddingModel?: string, isNonInteractive?: boolean): Promise<void>;
/**
 * Creates a new regular project with the specified name and configuration.
 */
export declare function createProject(projectName: string, targetDir: string, database: string, aiModel: string, embeddingModel?: string, isNonInteractive?: boolean): Promise<void>;
//# sourceMappingURL=creators.d.ts.map