import type { Character, IAgentRuntime, IElizaOS, UUID, Memory, Plugin, RuntimeSettings, Content, HandleMessageOptions, HandleMessageResult, IDatabaseAdapter, HealthStatus, ReadonlyRuntime } from './types';
/**
 * ElizaOS - Multi-agent orchestration framework
 */
export declare class ElizaOS extends EventTarget implements IElizaOS {
    private runtimes;
    private initFunctions;
    private editableMode;
    addAgents(agents: Array<{
        character: Character;
        plugins?: (Plugin | string)[];
        settings?: RuntimeSettings;
        init?: (runtime: IAgentRuntime) => Promise<void>;
        databaseAdapter?: IDatabaseAdapter;
    }>, options?: {
        isTestMode?: boolean;
        ephemeral?: boolean;
        skipMigrations?: boolean;
        autoStart?: boolean;
        returnRuntimes?: false;
    }): Promise<UUID[]>;
    addAgents(agents: Array<{
        character: Character;
        plugins?: (Plugin | string)[];
        settings?: RuntimeSettings;
        init?: (runtime: IAgentRuntime) => Promise<void>;
        databaseAdapter?: IDatabaseAdapter;
    }>, options: {
        isTestMode?: boolean;
        ephemeral?: boolean;
        skipMigrations?: boolean;
        autoStart?: boolean;
        returnRuntimes: true;
    }): Promise<IAgentRuntime[]>;
    /**
     * Register an existing runtime
     */
    registerAgent(runtime: IAgentRuntime): void;
    /**
     * Update an agent's character
     */
    updateAgent(agentId: UUID, updates: Partial<Character>): Promise<void>;
    /**
     * Delete agents
     */
    deleteAgents(agentIds: UUID[]): Promise<void>;
    /**
     * Start multiple agents
     */
    startAgents(agentIds?: UUID[]): Promise<void>;
    /**
     * Stop agents
     */
    stopAgents(agentIds?: UUID[]): Promise<void>;
    /**
     * Get a single agent
     */
    getAgent(id: UUID): IAgentRuntime | undefined;
    /**
     * Get all agents
     */
    getAgents(): IAgentRuntime[];
    /**
     * Get agents by IDs
     */
    getAgentsByIds(ids: UUID[]): IAgentRuntime[];
    /**
     * Get agents by names
     */
    getAgentsByNames(names: string[]): IAgentRuntime[];
    /**
     * Get agent by ID (alias for getAgent for consistency)
     */
    getAgentById(id: UUID): IAgentRuntime | undefined;
    /**
     * Get agent by name
     */
    getAgentByName(name: string): IAgentRuntime | undefined;
    /**
     * Get agent by character name (alias for getAgentByName)
     */
    getAgentByCharacterName(name: string): IAgentRuntime | undefined;
    /**
     * Get agent by character ID
     */
    getAgentByCharacterId(characterId: UUID): IAgentRuntime | undefined;
    /**
     * Send a message to a specific agent
     *
     * @param target - The agent ID (UUID) or runtime instance to send the message to
     * @param message - Partial Memory object (missing fields auto-filled)
     * @param options - Optional callbacks and processing options
     * @returns Promise with message ID and result
     *
     * @example
     * // SYNC mode with agent ID (HTTP API)
     * const result = await elizaOS.handleMessage(agentId, {
     *   entityId: user.id,
     *   roomId: room.id,
     *   content: { text: "Hello", source: 'web' }
     * });
     *
     * @example
     * // Serverless mode with runtime directly (no registry lookup)
     * const [runtime] = await elizaOS.addAgents([config], { ephemeral: true, autoStart: true, returnRuntimes: true });
     * const result = await elizaOS.handleMessage(runtime, {
     *   entityId: user.id,
     *   roomId: room.id,
     *   content: { text: "Hello", source: 'web' }
     * });
     *
     * @example
     * // ASYNC mode (WebSocket, MessageBus)
     * await elizaOS.handleMessage(agentId, {
     *   entityId: user.id,
     *   roomId: room.id,
     *   content: { text: "Hello", source: 'websocket' }
     * }, {
     *   onResponse: async (response) => {
     *     await socket.emit('message', response.text);
     *   }
     * });
     */
    handleMessage(target: UUID | IAgentRuntime, message: Partial<Memory> & {
        entityId: UUID;
        roomId: UUID;
        content: Content;
        worldId?: UUID;
    }, options?: HandleMessageOptions): Promise<HandleMessageResult>;
    /**
     * Handle messages to multiple agents in parallel
     *
     * Useful for batch operations where you need to send messages to multiple agents at once.
     * All messages are handled in parallel for maximum performance.
     *
     * @param messages - Array of messages to handle, each with agentId and message data
     * @returns Promise with array of results, one per message
     *
     * @example
     * const results = await elizaOS.handleMessages([
     *   {
     *     agentId: agent1Id,
     *     message: {
     *       entityId: user.id,
     *       roomId: room.id,
     *       content: { text: "Hello Agent 1", source: "web" }
     *     }
     *   },
     *   {
     *     agentId: agent2Id,
     *     message: {
     *       entityId: user.id,
     *       roomId: room.id,
     *       content: { text: "Hello Agent 2", source: "web" }
     *     },
     *     options: {
     *       onResponse: async (response) => {
     *         console.log("Agent 2 responded:", response.text);
     *       }
     *     }
     *   }
     * ]);
     */
    handleMessages(messages: Array<{
        agentId: UUID;
        message: Partial<Memory> & {
            entityId: UUID;
            roomId: UUID;
            content: Content;
            worldId?: UUID;
        };
        options?: HandleMessageOptions;
    }>): Promise<Array<{
        agentId: UUID;
        result: HandleMessageResult;
        error?: Error;
    }>>;
    /**
     * Validate API keys for agents
     */
    validateApiKeys(agents?: UUID[]): Promise<Map<UUID, boolean>>;
    /**
     * Health check for agents
     */
    healthCheck(agents?: UUID[]): Promise<Map<UUID, HealthStatus>>;
    /**
     * Get a read-only runtime accessor
     */
    getRuntimeAccessor(): ReadonlyRuntime;
    /**
     * Enable editable mode for post-initialization updates
     */
    enableEditableMode(): void;
}
//# sourceMappingURL=elizaos.d.ts.map