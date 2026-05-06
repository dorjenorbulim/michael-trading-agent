import { Service, type Content, type IAgentRuntime, type Plugin, type UUID, ElizaOS } from '@elizaos/core';
import type { AgentServer } from '../index.js';
import type { MessageServiceStructure } from '../types/server';
/**
 * Set the global ElizaOS instance
 * Should be called by AgentServer during initialization
 */
export declare function setGlobalElizaOS(elizaOS: ElizaOS): void;
/**
 * Set the global AgentServer instance
 * Should be called by AgentServer during initialization
 */
export declare function setGlobalAgentServer(agentServer: AgentServer): void;
export type MessageServiceMessage = MessageServiceStructure;
export declare class MessageBusService extends Service {
    static serviceType: string;
    capabilityDescription: string;
    private boundHandleIncomingMessage;
    private boundHandleServerAgentUpdate;
    private boundHandleMessageDeleted;
    private boundHandleChannelCleared;
    private subscribedMessageServers;
    private serverInstance;
    constructor(runtime: IAgentRuntime);
    static start(runtime: IAgentRuntime): Promise<Service>;
    static stop(runtime: IAgentRuntime): Promise<void>;
    private connectToMessageBus;
    private validChannelIds;
    private fetchValidChannelIds;
    private getChannelParticipants;
    private fetchAgentMessageServers;
    private handleServerAgentUpdate;
    private validateMessageServerSubscription;
    private validateNotSelfMessage;
    private ensureWorldAndRoomExist;
    private ensureAuthorEntityExists;
    handleIncomingMessage(data: unknown): Promise<void>;
    private handleMessageDeleted;
    private handleChannelCleared;
    private sendAgentResponseToBus;
    notifyActionStart(agentRoomId: UUID, agentWorldId: UUID, content: Content, messageId: UUID, inReplyToAgentMemoryId?: UUID, originalMessage?: MessageServiceMessage): Promise<Response | undefined>;
    notifyActionUpdate(agentRoomId: UUID, agentWorldId: UUID, content: Content, messageId: UUID, inReplyToAgentMemoryId?: UUID, originalMessage?: MessageServiceMessage): Promise<Response | undefined>;
    private notifyMessageComplete;
    private getAuthHeaders;
    getCentralMessageServerUrl(): string;
    stop(): Promise<void>;
}
export declare const messageBusConnectorPlugin: Plugin;
