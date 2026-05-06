import type { UUID, ChannelType, Character, IAgentRuntime, Plugin, MessageStreamChunkPayload, MessageStreamErrorPayload } from '@elizaos/core';
import type { MessageServerMetadata, ChannelMetadata, MessageMetadata } from '@elizaos/api-client';
import type express from 'express';
/**
 * Represents a function that acts as a server middleware.
 */
export type ServerMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => void;
/**
 * Interface for defining server configuration.
 * Used for unified server initialization and startup.
 */
export interface ServerConfig {
    middlewares?: ServerMiddleware[];
    dataDir?: string;
    postgresUrl?: string;
    clientPath?: string;
    port?: number;
    agents?: Array<{
        character: Character;
        plugins?: (Plugin | string)[];
        init?: (runtime: IAgentRuntime) => Promise<void>;
    }>;
    isTestMode?: boolean;
}
export interface MessageServer {
    id: UUID;
    name: string;
    sourceType: string;
    sourceId?: string;
    metadata?: MessageServerMetadata;
    createdAt: Date;
    updatedAt: Date;
}
export interface MessageChannel {
    id: UUID;
    messageServerId: UUID;
    name: string;
    type: ChannelType;
    sourceType?: string;
    sourceId?: string;
    topic?: string;
    metadata?: ChannelMetadata;
    createdAt: Date;
    updatedAt: Date;
}
export interface CentralRootMessage {
    id: UUID;
    channelId: UUID;
    authorId: UUID;
    content: string;
    rawMessage?: Record<string, unknown>;
    inReplyToRootMessageId?: UUID;
    sourceType?: string;
    sourceId?: string;
    createdAt: Date;
    updatedAt: Date;
    metadata?: MessageMetadata;
}
export interface MessageServiceStructure {
    id: UUID;
    channel_id: UUID;
    message_server_id: UUID;
    author_id: UUID;
    author_display_name?: string;
    content: string;
    raw_message?: Record<string, unknown>;
    source_id?: string;
    source_type?: string;
    in_reply_to_message_id?: UUID;
    created_at: number;
    metadata?: MessageMetadata;
}
export interface Attachment {
    url?: string;
    [key: string]: unknown;
}
export type AttachmentInput = string | Attachment | (string | Attachment)[];
export interface MessageContentWithAttachments {
    attachments?: AttachmentInput;
    [key: string]: unknown;
}
export interface MessageMetadataWithAttachments {
    attachments?: AttachmentInput;
    [key: string]: unknown;
}
export interface MessageWithAttachments {
    content?: MessageContentWithAttachments | unknown;
    metadata?: MessageMetadataWithAttachments;
    [key: string]: unknown;
}
export interface ServerAgentUpdatePayload {
    agentId: UUID;
    type: 'agent_added_to_server' | 'agent_removed_from_server';
    messageServerId: UUID;
}
export interface MessageDeletedPayload {
    messageId: UUID;
}
export interface ChannelClearedPayload {
    channelId: UUID;
}
export interface MessageBusEventMap {
    new_message: MessageServiceStructure;
    server_agent_update: ServerAgentUpdatePayload;
    message_deleted: MessageDeletedPayload;
    channel_cleared: ChannelClearedPayload;
    message_stream_chunk: MessageStreamChunkPayload;
    message_stream_error: MessageStreamErrorPayload;
}
export * from './sessions';
