import { IAgentRuntime } from '@elizaos/core';
import { ConversationTurn, SimulationContext, UserSimulatorConfig } from './conversation-types';
/**
 * UserSimulator generates realistic user responses based on persona and objectives
 * Uses LLM to simulate believable user behavior in conversations
 */
export declare class UserSimulator {
    private runtime;
    private config;
    constructor(runtime: IAgentRuntime, config: UserSimulatorConfig);
    /**
     * Generate a user response based on conversation history and agent's latest response
     * @param conversationHistory - Previous turns in the conversation
     * @param latestAgentResponse - The agent's most recent response
     * @param context - Current simulation context (turn number, debug options, etc.)
     * @returns Simulated user response
     */
    generateResponse(conversationHistory: ConversationTurn[], latestAgentResponse: string, context: SimulationContext): Promise<string>;
    /**
     * Build the LLM prompt for user simulation
     * @private
     */
    private buildSimulationPrompt;
    /**
     * Clean up the LLM response to remove any meta-commentary or formatting
     * @private
     */
    private cleanResponse;
    /**
     * Generate a fallback response when LLM fails
     * @private
     */
    private generateFallbackResponse;
    /**
     * Update the user simulator configuration during conversation
     * Useful for dynamic persona changes
     */
    updateConfig(newConfig: Partial<UserSimulatorConfig>): void;
    /**
     * Get current configuration (useful for debugging)
     */
    getConfig(): UserSimulatorConfig;
}
//# sourceMappingURL=UserSimulator.d.ts.map