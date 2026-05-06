import { IAgentRuntime, UUID } from '@elizaos/core';
import { AgentServer } from '@elizaos/server';
import { ConversationConfig, ConversationResult } from './conversation-types';
import { TrajectoryReconstructor } from './TrajectoryReconstructor';
/**
 * ConversationManager orchestrates multi-turn conversations between agents and simulated users
 * Handles turn execution, termination conditions, and evaluation
 */
export declare class ConversationManager {
    private runtime;
    private server;
    private agentId;
    private serverPort;
    private conversationChannelId;
    private userSimulator;
    private evaluationEngine;
    private trajectoryReconstructor;
    constructor(runtime: IAgentRuntime, server: AgentServer, agentId: UUID, serverPort: number, trajectoryReconstructor: TrajectoryReconstructor);
    /**
     * Create a conversation channel for multi-turn conversation
     * @private
     */
    private createConversationChannel;
    /**
     * Create a channel directly without sending messages
     * @private
     */
    private createChannelDirectly;
    /**
     * Cleanup conversation channel at end of conversation
     * @private
     */
    private cleanupConversationChannel;
    /**
     * Execute a complete conversation scenario
     * @param initialInput - The first user message to start the conversation
     * @param config - Complete conversation configuration
     * @returns Detailed conversation result with all turns and evaluations
     */
    executeConversation(initialInput: string, config: ConversationConfig): Promise<ConversationResult>;
    /**
     * Execute a single conversation turn
     * @private
     */
    private executeTurn;
    /**
     * Check if any termination conditions are met
     * @private
     */
    private checkTerminationConditions;
    /**
     * Check for user satisfaction keywords
     * @private
     */
    private checkSatisfactionKeywords;
    /**
     * Check for agent solution keywords
     * @private
     */
    private checkSolutionKeywords;
    /**
     * Check if conversation appears stuck (repetitive responses)
     * @private
     */
    private checkConversationStuck;
    /**
     * Check for escalation keywords
     * @private
     */
    private checkEscalationKeywords;
    /**
     * Check if user's goal appears to be achieved
     * @private
     */
    private checkGoalAchieved;
    /**
     * Use LLM to judge termination condition
     * @private
     */
    private checkLLMJudgeCondition;
    /**
     * Calculate string similarity using Jaccard similarity
     * @private
     */
    private calculateStringSimilarity;
    /**
     * Create combined execution result for final evaluations
     * @private
     */
    private createCombinedExecutionResult;
    /**
     * Determine which termination condition was met
     * @private
     */
    private getTerminationReason;
    /**
     * Generate a readable transcript of the conversation
     * @private
     */
    private generateTranscript;
    /**
     * Determine overall conversation success
     * @private
     */
    private determineOverallSuccess;
}
//# sourceMappingURL=ConversationManager.d.ts.map