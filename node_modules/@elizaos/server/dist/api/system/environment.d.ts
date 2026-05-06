import express from 'express';
export type EnvVars = Record<string, string>;
/**
 * Parse an .env file and return the key-value pairs
 * @param filePath Path to the .env file
 * @returns Object containing the key-value pairs
 */
export declare function parseEnvFile(filePath: string): Promise<EnvVars>;
/**
 * Resolves the path to the nearest `.env` file.
 *
 * If no `.env` file is found when traversing up from the starting directory,
 * a path to `.env` in the starting directory is returned.
 *
 * @param startDir - The directory to start searching from. Defaults to the
 *   current working directory.
 * @returns The resolved path to the `.env` file.
 */
export declare function resolveEnvFile(startDir?: string): string;
/**
 * Environment configuration management
 */
export declare function createEnvironmentRouter(): express.Router;
