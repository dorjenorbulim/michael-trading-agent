/**
 * Server configuration utilities
 */
import { type UUID } from '@elizaos/core';
export type { ServerMiddleware, ServerConfig } from '../types/server.js';
/**
 * Default server ID for single-server deployments
 */
export declare const DEFAULT_SERVER_ID: UUID;
/**
 * Expands a file path starting with `~` to the project directory.
 */
export declare function expandTildePath(filepath: string): string;
/**
 * Resolves the PGLite data directory path.
 */
export declare function resolvePgliteDir(dir?: string, fallbackDir?: string): string;
/**
 * Determines if the web UI should be enabled based on environment variables.
 */
export declare function isWebUIEnabled(): boolean;
