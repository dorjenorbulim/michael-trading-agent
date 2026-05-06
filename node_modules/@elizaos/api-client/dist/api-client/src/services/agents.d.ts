import { UUID } from '@elizaos/core';
import { BaseApiClient } from '../lib/base-client';
import { Agent, AgentCreateParams, AgentLog, AgentLogsParams, AgentPanel, AgentUpdateParams, AgentWorld, AgentWorldSettings } from '../types/agents';
export declare class AgentsService extends BaseApiClient {
    /**
     * List all agents with minimal details
     */
    listAgents(): Promise<{
        agents: Agent[];
    }>;
    /**
     * Get specific agent details
     */
    getAgent(agentId: UUID): Promise<Agent>;
    /**
     * Create a new agent
     */
    createAgent(params: AgentCreateParams): Promise<Agent>;
    /**
     * Update an existing agent
     */
    updateAgent(agentId: UUID, params: AgentUpdateParams): Promise<Agent>;
    /**
     * Delete an agent
     */
    deleteAgent(agentId: UUID): Promise<{
        success: boolean;
    }>;
    /**
     * Start an existing agent
     */
    startAgent(agentId: UUID): Promise<{
        status: string;
    }>;
    /**
     * Stop a running agent
     */
    stopAgent(agentId: UUID): Promise<{
        status: string;
    }>;
    /**
     * Get all available worlds
     */
    getWorlds(): Promise<{
        worlds: AgentWorld[];
    }>;
    /**
     * Add agent to a world
     */
    addAgentToWorld(agentId: UUID, worldId: UUID): Promise<{
        success: boolean;
    }>;
    /**
     * Update agent's world settings
     */
    updateAgentWorldSettings(agentId: UUID, worldId: UUID, settings: Record<string, any>): Promise<AgentWorldSettings>;
    /**
     * Get agent's plugin panels
     */
    getAgentPanels(agentId: UUID): Promise<{
        panels: AgentPanel[];
    }>;
    /**
     * Get agent logs
     */
    getAgentLogs(agentId: UUID, params?: AgentLogsParams): Promise<AgentLog[]>;
    /**
     * Delete a specific log entry
     */
    deleteAgentLog(agentId: UUID, logId: UUID): Promise<{
        success: boolean;
    }>;
    /**
     * Get agents associated with a server
     */
    getAgentsForMessageServer(messageServerId: UUID): Promise<{
        success: boolean;
        data: {
            messageServerId: UUID;
            agents: UUID[];
        };
    }>;
    addAgentToMessageServer(messageServerId: UUID, agentId: UUID): Promise<{
        success: boolean;
        data: {
            messageServerId: UUID;
            agentId: UUID;
            message: string;
        };
    }>;
    removeAgentFromMessageServer(messageServerId: UUID, agentId: UUID): Promise<{
        success: boolean;
        data: {
            messageServerId: UUID;
            agentId: UUID;
            message: string;
        };
    }>;
    getMessageServersForAgent(agentId: UUID): Promise<{
        success: boolean;
        data: {
            agentId: UUID;
            messageServers: UUID[];
        };
    }>;
}
//# sourceMappingURL=agents.d.ts.map