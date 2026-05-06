export interface EnvVarEntry {
    key: string;
    value: string;
    comment?: string;
}
export interface WriteOptions {
    preserveComments?: boolean;
    createBackup?: boolean;
    updateProcessEnv?: boolean;
}
export interface ValidationResult {
    valid: boolean;
    errors: string[];
}
/**
 * Unified service for managing environment files
 */
export declare class EnvFileService {
    private filePath;
    constructor(filePath?: string);
    /**
     * Initialize the service with the appropriate file path
     */
    initialize(): Promise<void>;
    /**
     * Get the current environment file path
     */
    getFilePath(): string;
    /**
     * Read and parse the environment file
     */
    read(): Promise<Record<string, string>>;
    /**
     * Read environment file with comments preserved
     */
    readWithComments(): Promise<EnvVarEntry[]>;
    /**
     * Write environment variables to file
     */
    write(vars: Record<string, string>, options?: WriteOptions): Promise<void>;
    /**
     * Update a single environment variable
     */
    update(key: string, value: string, options?: WriteOptions): Promise<void>;
    /**
     * Update multiple environment variables
     */
    updateMany(updates: Record<string, string>, options?: WriteOptions): Promise<void>;
    /**
     * Delete an environment variable
     */
    delete(key: string): Promise<void>;
    /**
     * Check if a key exists
     */
    exists(key: string): Promise<boolean>;
    /**
     * Get a single environment variable value
     */
    get(key: string): Promise<string | undefined>;
    /**
     * Create a backup of the current environment file
     */
    backup(): Promise<string>;
    /**
     * Validate the environment file
     */
    validate(): Promise<ValidationResult>;
}
/**
 * Get the global EnvFileService instance
 */
export declare function getEnvFileService(): Promise<EnvFileService>;
/**
 * Create a new EnvFileService instance for a specific file
 */
export declare function createEnvFileService(filePath: string): EnvFileService;
//# sourceMappingURL=env-file.service.d.ts.map