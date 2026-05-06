import { UUID, IAgentRuntime } from '@elizaos/core';
import { AgentServer } from '@elizaos/server';
/**
 * Creates and initializes a properly configured AgentServer for scenario testing
 * @param existingServer - Optional existing server to reuse
 * @param desiredPort - Port to run on (0 for auto-find)
 * @returns Configured and started AgentServer with port info
 */
export declare function createScenarioServer(existingServer?: AgentServer | null, desiredPort?: number): Promise<{
    server: AgentServer;
    port: number;
    createdServer: boolean;
}>;
/**
 * Creates and starts an agent on an existing AgentServer
 * @param server - The AgentServer to create agent on
 * @param agentName - Unique name for the agent (defaults to 'scenario-agent')
 * @param pluginNames - Plugins to load for the agent
 * @returns Started agent runtime and ID
 */
export declare function createScenarioAgent(server: AgentServer, agentName?: string, pluginNames?: string[]): Promise<{
    runtime: IAgentRuntime;
    agentId: UUID;
}>;
/**
 * Creates a configured AgentServer and starts an agent (backward compatible wrapper)
 * @deprecated Consider using createScenarioServer() + createScenarioAgent() for better flexibility
 */
export declare function createScenarioServerAndAgent(existingServer?: AgentServer | null, desiredPort?: number, pluginNames?: string[], agentName?: string): Promise<{
    server: AgentServer;
    runtime: IAgentRuntime;
    agentId: UUID;
    port: number;
    createdServer: boolean;
}>;
/**
 * Properly shutdown an AgentServer instance
 */
export declare function shutdownScenarioServer(server: AgentServer, port: number): Promise<void>;
/**
 * Ask an already running agent to respond to input.
 * @param server - The AgentServer instance
 * @param agentId - UUID of the agent
 * @param input - User input message
 * @param timeoutMs - Timeout in milliseconds (default: 60000)
 * @param serverPort - Server port (optional)
 * @param existingChannelId - Optional channel ID to reuse for multi-turn conversations
 * @returns Promise with agent response and channel/room ID
 */
export declare function askAgentViaApi(_server: AgentServer, agentId: UUID, input: string, timeoutMs?: number, serverPort?: number | null, existingChannelId?: UUID): Promise<{
    response: string;
    roomId: UUID;
}>;
//# sourceMappingURL=runtime-factory.d.ts.map