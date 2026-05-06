import type { IAgentRuntime, TokenizeTextParams, DetokenizeTextParams } from "@elizaos/core";
/**
 * TEXT_TOKENIZER_ENCODE model handler
 */
export declare function handleTokenizerEncode(runtime: IAgentRuntime, { prompt, modelType }: TokenizeTextParams): Promise<number[]>;
/**
 * TEXT_TOKENIZER_DECODE model handler
 */
export declare function handleTokenizerDecode(runtime: IAgentRuntime, { tokens, modelType }: DetokenizeTextParams): Promise<string>;
