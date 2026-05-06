import type { AIModelOption, DatabaseOption } from '../types';
/**
 * Returns a list of available databases for project initialization without requiring external API calls.
 */
export declare function getLocalAvailableDatabases(): Promise<string[]>;
/**
 * Gets available AI models for selection during project creation.
 */
export declare function getAvailableAIModels(): AIModelOption[];
/**
 * Checks if an AI model has built-in embedding support.
 * Models with embeddings don't need a separate embedding provider.
 */
export declare function hasEmbeddingSupport(aiModel: string): boolean;
/**
 * Gets available database options for selection during project creation.
 */
export declare function getAvailableDatabases(): DatabaseOption[];
/**
 * Prompts user to select a database type with interactive UI.
 */
export declare function selectDatabase(): Promise<string>;
/**
 * Prompts user to select an AI model with interactive UI.
 */
export declare function selectAIModel(): Promise<string>;
/**
 * Gets available embedding models for selection when primary AI model doesn't support embeddings.
 */
export declare function getAvailableEmbeddingModels(): AIModelOption[];
/**
 * Prompts user to select an embedding model when the primary AI model doesn't support embeddings.
 */
export declare function selectEmbeddingModel(): Promise<string>;
//# sourceMappingURL=selection.d.ts.map