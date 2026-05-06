import type { ElizaOS, LogEntry } from '@elizaos/core';
import { type UUID } from '@elizaos/core';
import type { Server as SocketIOServer } from 'socket.io';
import type { AgentServer } from '../index';
/**
 * Socket.io socket.data structure for authenticated sockets
 * These properties are set by the authentication middleware
 */
export interface SocketData {
    entityId?: UUID;
    allowedRooms?: Set<UUID>;
    roomsCacheLoaded?: boolean;
}
export declare class SocketIORouter {
    private elizaOS;
    private socketAgent;
    private entitySockets;
    private logStreamConnections;
    private serverInstance;
    constructor(elizaOS: ElizaOS, serverInstance: AgentServer);
    setupListeners(io: SocketIOServer): void;
    /**
     * Authentication middleware - Production-grade WebSocket security
     *
     * Runs on every WebSocket handshake to:
     * 1. Verify API Key (if configured)
     * 2. Extract entityId from client handshake
     * 3. Initialize security context on socket.data
     * 4. Track entity->sockets mapping for cache invalidation
     */
    private setupAuthenticationMiddleware;
    private handleNewConnection;
    private handleGenericMessage;
    /**
     * Verify if socket's entity has permission to access a channel.
     * Returns true if entity is a channel participant or if data isolation is disabled.
     * Includes disconnection guards to prevent operations on stale sockets.
     */
    private verifyChannelAccess;
    /**
     * Handle channel joining with production-grade security
     *
     * Security features:
     * 1. Lazy-loading cache: Load allowed rooms only on first join attempt
     * 2. Hybrid approach: Check cache first, then DB if not found (new room)
     * 3. Permission verification: Block joins to rooms user doesn't have access to
     */
    private handleChannelJoining;
    private handleMessageSubmission;
    private sendErrorResponse;
    private handleLogSubscription;
    private handleLogUnsubscription;
    private handleLogFilterUpdate;
    broadcastLog(io: SocketIOServer, logEntry: LogEntry): void;
    private handleDisconnect;
}
