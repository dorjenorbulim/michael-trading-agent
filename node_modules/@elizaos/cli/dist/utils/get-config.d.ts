import { z } from 'zod';
/**
 * Validates a Postgres URL format
 * @param url The URL to validate
 * @returns True if the URL appears valid
 */
export declare function isValidPostgresUrl(url: string): boolean;
/**
 * Retrieves the standard directory paths used by Eliza for configuration and database storage.
 *
 * @returns An object containing the Eliza configuration directory, the Eliza database directory for the current project, and the path to the Eliza `.env` file.
 */
export declare function getElizaDirectories(targetProjectDir?: string): Promise<{
    elizaDir: string;
    elizaDbDir: string;
    envFilePath: string;
}>;
/**
 * Sets up the .env file by creating it if it doesn't exist or populating it with a hybrid
 * merge of process.env variables and example variables if it's empty
 * @param envFilePath Path to the .env file
 */
export declare function setupEnvFile(envFilePath: string): Promise<void>;
/**
 * Ensures the Eliza configuration directory exists and returns standard Eliza directory paths.
 *
 * @returns An object containing paths for the Eliza configuration directory, the Eliza database directory, and the `.env` file.
 */
export declare function ensureElizaDir(targetProjectDir?: string): Promise<{
    elizaDir: string;
    elizaDbDir: string;
    envFilePath: string;
}>;
/**
 * Sets up and configures PGLite database
 * @param elizaDbDir The directory for PGLite database
 * @param envFilePath Path to the .env file
 */
export declare function setupPgLite(dbDir: string | undefined, envPath: string | undefined, targetProjectDir?: string): Promise<void>;
/**
 * Stores the provided Postgres connection URL in the specified `.env` file, replacing any existing entry.
 *
 * Updates the `POSTGRES_URL` environment variable in both the file and the current process.
 *
 * @param url - The Postgres connection URL to store.
 * @param envFilePath - Path to the `.env` file where the URL should be saved.
 *
 * @throws {Error} If reading from or writing to the `.env` file fails.
 */
export declare function storePostgresUrl(url: string, envFilePath: string): Promise<void>;
/**
 * Stores the provided PGLite data directory in the specified `.env` file, replacing any existing entry.
 *
 * Updates the `PGLITE_DATA_DIR` environment variable in both the file and the current process.
 *
 * @param dataDir - The PGLite data directory path to store.
 * @param envFilePath - Path to the `.env` file where the directory should be saved.
 *
 * @throws {Error} If reading from or writing to the `.env` file fails.
 */
export declare function storePgliteDataDir(dataDir: string, envFilePath: string): Promise<void>;
/**
 * Prompts the user for a Postgres URL, validates it, and stores it
 * @returns The configured Postgres URL or null if user cancels
 */
export declare function promptAndStorePostgresUrl(envFilePath: string): Promise<string | null>;
/**
 * Validates an OpenAI API key format
 * @param key The API key to validate
 * @returns True if the key appears valid
 */
export declare function isValidOpenAIKey(key: string): boolean;
/**
 * Validates an Anthropic API key format
 * @param key The API key to validate
 * @returns True if the key appears valid
 */
export declare function isValidAnthropicKey(key: string): boolean;
/**
 * Validates a Google Generative AI API key format
 * @param key The API key to validate
 * @returns True if the key appears valid
 */
export declare function isValidGoogleKey(key: string): boolean;
/**
 * Stores OpenAI API key in the .env file
 * @param key The OpenAI API key to store
 * @param envFilePath Path to the .env file
 */
export declare function storeOpenAIKey(key: string, envFilePath: string): Promise<void>;
/**
 * Stores Google Generative AI API key in the .env file
 * @param key The Google API key to store
 * @param envFilePath Path to the .env file
 */
export declare function storeGoogleKey(key: string, envFilePath: string): Promise<void>;
/**
 * Stores Anthropic API key in the .env file
 * @param key The Anthropic API key to store
 * @param envFilePath Path to the .env file
 */
export declare function storeAnthropicKey(key: string, envFilePath: string): Promise<void>;
/**
 * Prompts the user for an OpenAI API key, validates it, and stores it
 * @param envFilePath Path to the .env file
 * @returns The configured OpenAI API key or null if user cancels
 */
export declare function promptAndStoreOpenAIKey(envFilePath: string): Promise<string | null>;
/**
 * Prompts the user for an Anthropic API key, validates it, and stores it
 * @param envFilePath Path to the .env file
 * @returns The configured Anthropic API key or null if user cancels
 */
export declare function promptAndStoreAnthropicKey(envFilePath: string): Promise<string | null>;
/**
 * Validates an Ollama API endpoint format
 * @param endpoint The endpoint URL to validate
 * @returns True if the endpoint appears valid
 */
export declare function isValidOllamaEndpoint(endpoint: string): boolean;
/**
 * Stores Ollama configuration in the .env file
 * @param config The Ollama configuration to store
 * @param envFilePath Path to the .env file
 */
export declare function storeOllamaConfig(config: {
    endpoint: string;
    model: string;
}, envFilePath: string): Promise<void>;
/**
 * Prompts the user for Ollama embedding model selection
 * @param envFilePath Path to the .env file
 * @returns The configured Ollama embedding settings or null if user cancels
 */
export declare function promptAndStoreOllamaEmbeddingConfig(envFilePath: string): Promise<{
    endpoint: string;
    embeddingModel: string;
} | null>;
/**
 * Prompts the user for Ollama configuration, validates it, and stores it
 * @param envFilePath Path to the .env file
 * @returns The configured Ollama settings or null if user cancels
 */
export declare function promptAndStoreOllamaConfig(envFilePath: string): Promise<{
    endpoint: string;
    model: string;
} | null>;
/**
 * Prompts the user for a Google Generative AI API key, validates it, and stores it
 * @param envFilePath Path to the .env file
 * @returns The configured Google API key or null if user cancels
 */
export declare function promptAndStoreGoogleKey(envFilePath: string): Promise<string | null>;
/**
 * Validates an OpenRouter API key format
 * @param key The API key to validate
 * @returns True if the key appears to be in valid format
 */
export declare function isValidOpenRouterKey(key: string): boolean;
/**
 * Stores OpenRouter API key in the .env file
 * @param key The API key to store
 * @param envFilePath Path to the .env file
 */
export declare function storeOpenRouterKey(key: string, envFilePath: string): Promise<void>;
/**
 * Prompts the user for an OpenRouter API key, validates it, and stores it
 * @param envFilePath Path to the .env file
 * @returns The configured OpenRouter API key or null if user cancels
 */
export declare function promptAndStoreOpenRouterKey(envFilePath: string): Promise<string | null>;
/**
 * Validates an elizaOS Cloud API key format
 * @param key The API key to validate
 * @returns True if the key appears valid
 */
export declare function isValidElizaCloudKey(key: string): boolean;
/**
 * Stores elizaOS Cloud API key in the .env file
 * @param key The elizaOS Cloud API key to store
 * @param envFilePath Path to the .env file
 */
export declare function storeElizaCloudKey(key: string, envFilePath: string): Promise<void>;
/**
 * Checks if the user already has a valid elizaOS Cloud API key
 * @param envFilePath Path to the .env file
 * @returns True if a valid API key exists
 */
export declare function hasExistingElizaCloudKey(envFilePath: string): Promise<boolean>;
/**
 * Prompts the user for an elizaOS Cloud API key or to login, validates it, and stores it
 * @param envFilePath Path to the .env file
 * @returns The configured elizaOS Cloud API key or null if user cancels
 */
export declare function promptAndStoreElizaCloudKey(envFilePath: string): Promise<string | null>;
/**
 * Configures the database to use, either PGLite or PostgreSQL
 * @param reconfigure If true, force reconfiguration even if already configured
 * @returns The postgres URL if using Postgres, otherwise null
 */
export declare function configureDatabaseSettings(reconfigure?: boolean): Promise<string | null>;
/**
 * Schema definition for the raw configuration object.
 *
 * @type {z.ZodType<RawConfig>}
 */
export declare const rawConfigSchema: z.ZodObject<{
    $schema: z.ZodOptional<z.ZodString>;
    database: z.ZodDiscriminatedUnion<[z.ZodObject<{
        type: z.ZodLiteral<"postgres">;
        config: z.ZodObject<{
            url: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"pglite">;
        config: z.ZodObject<{
            dataDir: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>], "type">;
    plugins: z.ZodObject<{
        registry: z.ZodString;
        installed: z.ZodArray<z.ZodString>;
    }, z.core.$strip>;
    paths: z.ZodObject<{
        knowledge: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strict>;
/**
 * Type definition for the inferred type of the raw config schema.
 */
export type RawConfig = z.infer<typeof rawConfigSchema>;
export declare const configSchema: z.ZodObject<{
    $schema: z.ZodOptional<z.ZodString>;
    database: z.ZodDiscriminatedUnion<[z.ZodObject<{
        type: z.ZodLiteral<"postgres">;
        config: z.ZodObject<{
            url: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"pglite">;
        config: z.ZodObject<{
            dataDir: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>], "type">;
    plugins: z.ZodObject<{
        registry: z.ZodString;
        installed: z.ZodArray<z.ZodString>;
    }, z.core.$strip>;
    paths: z.ZodObject<{
        knowledge: z.ZodString;
    }, z.core.$strip>;
    resolvedPaths: z.ZodObject<{
        knowledge: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strict>;
/**
 * Define the type `Config` as the inferred type from the `configSchema`.
 */
export type Config = z.infer<typeof configSchema>;
/**
 * Resolves the paths in the given configuration based on the provided current working directory (cwd).
 * @param {string} cwd - The current working directory.
 * @param {RawConfig} config - The raw configuration object.
 * @returns {Promise<Config>} The resolved configuration object with updated paths.
 */
export declare function resolveConfigPaths(cwd: string, config: RawConfig): Promise<{
    database: {
        type: "postgres";
        config: {
            url?: string | undefined;
        };
    } | {
        type: "pglite";
        config: {
            dataDir: string;
        };
    };
    plugins: {
        registry: string;
        installed: string[];
    };
    paths: {
        knowledge: string;
    };
    resolvedPaths: {
        knowledge: string;
    };
    $schema?: string | undefined;
}>;
/**
 * Load environment variables from the project `.env` file if it exists.
 *
 * @param projectDir - Directory containing the `.env` file. Defaults to the current working directory.
 */
export declare function loadEnvironment(projectDir?: string): Promise<void>;
//# sourceMappingURL=get-config.d.ts.map