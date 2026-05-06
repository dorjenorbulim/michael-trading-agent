import type { GenerateTextParams, IAgentRuntime, TextStreamResult } from "@elizaos/core";
/**
 * TEXT_SMALL model handler
 */
export declare function handleTextSmall(runtime: IAgentRuntime, params: GenerateTextParams): Promise<string | TextStreamResult>;
/**
 * TEXT_LARGE model handler
 */
export declare function handleTextLarge(runtime: IAgentRuntime, params: GenerateTextParams): Promise<string | TextStreamResult>;
