/**
 * Creates necessary project directories.
 */
export declare function createProjectDirectories(targetDir: string): Promise<void>;
/**
 * Sets up AI model configuration in the project's .env file based on user selection.
 */
export declare function setupAIModelConfig(aiModel: string, envFilePath: string, isNonInteractive?: boolean): Promise<void>;
/**
 * Checks if an environment variable has a real value (not a placeholder) in the content
 */
export declare function hasValidApiKey(content: string, keyName: string): boolean;
/**
 * Sets up embedding model configuration when the primary AI model doesn't support embeddings.
 */
export declare function setupEmbeddingModelConfig(embeddingModel: string, envFilePath: string, isNonInteractive?: boolean): Promise<void>;
/**
 * Sets up the project environment including database and AI model configuration.
 */
export declare function setupProjectEnvironment(targetDir: string, database: string, aiModel: string, embeddingModel?: string, isNonInteractive?: boolean): Promise<void>;
//# sourceMappingURL=setup.d.ts.map