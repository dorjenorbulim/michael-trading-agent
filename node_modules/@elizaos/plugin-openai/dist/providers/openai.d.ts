import type { IAgentRuntime } from "@elizaos/core";
/**
 * Create an OpenAI client with proper configuration
 *
 * @param runtime The runtime context
 * @returns Configured OpenAI client
 */
export declare function createOpenAIClient(runtime: IAgentRuntime): import("@ai-sdk/openai").OpenAIProvider;
