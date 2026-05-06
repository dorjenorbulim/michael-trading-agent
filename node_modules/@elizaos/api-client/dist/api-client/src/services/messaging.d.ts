import { UUID } from '@elizaos/core';
import { BaseApiClient } from '../lib/base-client';
import { Message, MessageServer, MessageChannel, MessageSubmitParams, MessageCompleteParams, ExternalMessageParams, ChannelCreateParams, GroupChannelCreateParams, DmChannelParams, ChannelParticipant, MessageSearchParams, MessageServerCreateParams, MessageServerSyncParams, ChannelUpdateParams, MessageMetadata } from '../types/messaging';
import { PaginationParams } from '../types/base';
export declare class MessagingService extends BaseApiClient {
    /**
     * Submit agent replies or system messages
     */
    submitMessage(params: MessageSubmitParams): Promise<Message>;
    /**
     * Notify message completion
     */
    completeMessage(params: MessageCompleteParams): Promise<{
        success: boolean;
    }>;
    /**
     * Ingest messages from external platforms
     */
    ingestExternalMessages(params: ExternalMessageParams): Promise<{
        processed: number;
    }>;
    /**
     * Create a new channel
     */
    createChannel(params: ChannelCreateParams): Promise<MessageChannel>;
    /**
     * Create a group channel
     */
    createGroupChannel(params: GroupChannelCreateParams): Promise<MessageChannel>;
    /**
     * Find or create a DM channel
     */
    getOrCreateDmChannel(params: DmChannelParams): Promise<MessageChannel>;
    /**
     * Get channel details
     */
    getChannelDetails(channelId: UUID): Promise<MessageChannel>;
    /**
     * Get channel participants
     */
    getChannelParticipants(channelId: UUID): Promise<{
        participants: ChannelParticipant[];
    }>;
    /**
     * Add agent to channel
     */
    addAgentToChannel(channelId: UUID, agentId: UUID): Promise<{
        success: boolean;
    }>;
    /**
     * Remove agent from channel
     */
    removeAgentFromChannel(channelId: UUID, agentId: UUID): Promise<{
        success: boolean;
    }>;
    /**
     * Delete a channel
     */
    deleteChannel(channelId: UUID): Promise<{
        success: boolean;
    }>;
    /**
     * Clear channel history
     */
    clearChannelHistory(channelId: UUID): Promise<{
        deleted: number;
    }>;
    /**
     * Post a new message to a channel
     */
    postMessage(channelId: UUID, content: string, metadata?: MessageMetadata): Promise<Message>;
    /**
     * Get channel messages
     */
    getChannelMessages(channelId: UUID, params?: PaginationParams & {
        before?: Date | string;
        after?: Date | string;
    }): Promise<{
        messages: Message[];
    }>;
    /**
     * Get a specific message
     */
    getMessage(messageId: UUID): Promise<Message>;
    /**
     * Delete a message from a channel
     */
    deleteMessage(channelId: UUID, messageId: UUID): Promise<{
        success: boolean;
    }>;
    /**
     * Update a message
     */
    updateMessage(messageId: UUID, content: string): Promise<Message>;
    /**
     * Search messages
     */
    searchMessages(params: MessageSearchParams): Promise<{
        messages: Message[];
    }>;
    /**
     * Get current Message Server's ID
     * This returns the messageServerId of the currently running message server instance.
     * Clients should use this messageServerId when creating channels and messages.
     */
    getCurrentMessageServer(): Promise<{
        messageServerId: UUID;
    }>;
    /**
     * List all message servers
     */
    listMessageServers(): Promise<{
        messageServers: MessageServer[];
    }>;
    /**
     * Get message server channels
     */
    getMessageServerChannels(messageServerId: UUID): Promise<{
        channels: MessageChannel[];
    }>;
    /**
     * Create a new message server
     */
    createMessageServer(params: MessageServerCreateParams): Promise<MessageServer>;
    /**
     * Sync message server channels
     */
    syncMessageServerChannels(messageServerId: UUID, params: MessageServerSyncParams): Promise<{
        synced: number;
    }>;
    /**
     * Delete a Message server
     */
    deleteMessageServer(messageServerId: UUID): Promise<{
        success: boolean;
    }>;
    /**
     * Update a channel
     */
    updateChannel(channelId: UUID, params: ChannelUpdateParams): Promise<{
        success: boolean;
        data: MessageChannel;
    }>;
    /**
     * Generate channel title
     */
    generateChannelTitle(channelId: UUID, agentId: UUID): Promise<{
        title: string;
    }>;
    /**
     * Add user to channel participants (implemented via updateChannel)
     */
    addUserToChannel(channelId: UUID, userId: UUID): Promise<{
        success: boolean;
        data: MessageChannel;
    }>;
    /**
     * Add multiple users to channel participants (implemented via updateChannel)
     */
    addUsersToChannel(channelId: UUID, userIds: UUID[]): Promise<{
        success: boolean;
        data: MessageChannel;
    }>;
    /**
     * Remove user from channel participants (implemented via updateChannel)
     */
    removeUserFromChannel(channelId: UUID, userId: UUID): Promise<{
        success: boolean;
        data: MessageChannel;
    }>;
}
//# sourceMappingURL=messaging.d.ts.map