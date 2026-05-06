/**
 * Retrieves the absolute path to the `.env` environment file.
 *
 * @returns A promise that resolves to the full path of the environment file.
 */
export declare function getEnvFilePath(): Promise<string>;
/**
 * Asynchronously reads environment variables from the `.env` file and returns them as key-value pairs.
 *
 * Ignores comments and empty lines. If the file does not exist or cannot be read, returns an empty object.
 *
 * @returns A record containing environment variable names and their corresponding values.
 */
export declare function readEnvFile(): Promise<Record<string, string>>;
/**
 * Asynchronously writes the provided environment variables to the `.env` file, creating the directory if it does not exist.
 *
 * @param envVars - A record of environment variable key-value pairs to write.
 */
export declare function writeEnvFile(envVars: Record<string, string>): Promise<void>;
//# sourceMappingURL=env-prompt.d.ts.map