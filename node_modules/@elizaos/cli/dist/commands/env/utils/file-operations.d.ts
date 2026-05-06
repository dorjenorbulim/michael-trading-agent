import { EnvVars } from '../types';
/**
 * Get the path to the project's .env file.
 * @returns The path to the .env file
 */
export declare function getGlobalEnvPath(): Promise<string>;
/**
 * Get the path to the local .env file in the current directory
 * @returns The path to the local .env file or null if not found
 */
export declare function getLocalEnvPath(): Promise<string | null>;
/**
 * Parse an .env file and return the key-value pairs
 * @param filePath Path to the .env file
 * @returns Object containing the key-value pairs
 */
export declare function parseEnvFile(filePath: string): Promise<EnvVars>;
/**
 * Write key-value pairs to an .env file
 * @param filePath Path to the .env file
 * @param envVars Object containing the key-value pairs
 */
export declare function writeEnvFile(filePath: string, envVars: EnvVars): Promise<void>;
/**
 * Helper function to reset an environment file by keeping keys but clearing values
 * @param filePath Path to the environment file
 * @returns A boolean indicating success/failure
 */
export declare function resetEnvFile(filePath: string): Promise<boolean>;
//# sourceMappingURL=file-operations.d.ts.map