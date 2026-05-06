import type { ElizaOS, UUID } from '@elizaos/core';
import { type TransportType } from './constants';
/**
 * Validates and retrieves an agent runtime from the agents map
 */
export declare const getRuntime: (elizaOS: ElizaOS, agentId: UUID) => import("@elizaos/core").IAgentRuntime;
/**
 * Validates a UUID parameter and returns it as UUID type or null if invalid
 */
export declare const validateAgentId: (agentId: string) => UUID | null;
/**
 * Validates a room ID parameter
 */
export declare const validateRoomId: (roomId: string) => UUID | null;
/**
 * Enhanced channel ID validation with security logging
 * Validates a channel ID parameter with additional security checks
 */
export declare const validateChannelId: (channelId: string, clientIp?: string) => UUID | null;
/**
 * Validates a memory ID parameter
 */
export declare const validateMemoryId: (memoryId: string) => UUID | null;
/**
 * Validates a world ID parameter
 */
export declare const validateWorldId: (worldId: string) => UUID | null;
/**
 * Validates and normalizes a transport type parameter
 * Supports both new transport types (http, sse, websocket) and legacy mode names (sync, stream)
 *
 * @param value - The transport/mode parameter from the request (can be any type)
 * @returns Object with validated transport and whether it was valid
 */
export declare const validateTransport: (value: unknown) => {
    transport: TransportType;
    isValid: boolean;
    error?: string;
};
/**
 * @deprecated Use validateTransport instead
 * Validates and normalizes a response mode parameter (legacy API)
 */
export declare const validateResponseMode: (mode: unknown) => {
    mode: TransportType;
    isValid: boolean;
    error?: string;
};
