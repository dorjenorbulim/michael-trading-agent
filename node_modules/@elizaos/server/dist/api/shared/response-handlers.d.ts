/**
 * Shared response handlers for messaging API endpoints
 * Handles http (sync), sse (streaming), and websocket response modes
 */
import type { Response } from 'express';
import type { ElizaOS, Memory } from '@elizaos/core';
import type { UUID, Content } from '@elizaos/core';
import { type TransportType } from './constants';
/**
 * Message memory type for elizaOS.handleMessage
 * Re-export from core for convenience
 */
export type { Memory };
/**
 * Options for handling transport types
 */
export interface HandleTransportOptions {
    res: Response;
    transport: TransportType;
    elizaOS: ElizaOS;
    agentId: UUID;
    messageMemory: Partial<Memory> & {
        entityId: UUID;
        roomId: UUID;
        content: Content;
    };
    userMessage: unknown;
    /** Additional data to include in http/websocket JSON responses */
    additionalResponseData?: Record<string, unknown>;
    /** Callback for websocket transport - called before returning response */
    onWebSocketTransport?: () => void | Promise<void>;
}
/**
 * @deprecated Use HandleTransportOptions instead
 */
export interface HandleResponseModeOptions {
    res: Response;
    mode: TransportType;
    elizaOS: ElizaOS;
    agentId: UUID;
    messageMemory: Partial<Memory> & {
        entityId: UUID;
        roomId: UUID;
        content: Content;
    };
    userMessage: unknown;
    additionalResponseData?: Record<string, unknown>;
    onWebSocketMode?: () => void | Promise<void>;
}
/**
 * SSE event names
 */
export declare const SSE_EVENTS: {
    readonly USER_MESSAGE: "user_message";
    readonly CHUNK: "chunk";
    readonly DONE: "done";
    readonly ERROR: "error";
};
/**
 * Main handler for different transport types
 * Routes to appropriate handler based on transport parameter
 */
export declare function handleTransport(options: HandleTransportOptions): Promise<void>;
/**
 * @deprecated Use handleTransport instead
 */
export declare function handleResponseMode(options: HandleResponseModeOptions): Promise<void>;
