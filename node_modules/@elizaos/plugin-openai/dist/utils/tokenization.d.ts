import type { IAgentRuntime, ModelTypeName } from "@elizaos/core";
/**
 * Asynchronously tokenizes the given text based on the specified model and prompt.
 *
 * @param {ModelTypeName} model - The type of model to use for tokenization.
 * @param {string} prompt - The text prompt to tokenize.
 * @returns {number[]} - An array of tokens representing the encoded prompt.
 */
export declare function tokenizeText(runtime: IAgentRuntime, model: ModelTypeName, prompt: string): Promise<number[]>;
/**
 * Detokenize a sequence of tokens back into text using the specified model.
 *
 * @param {ModelTypeName} model - The type of model to use for detokenization.
 * @param {number[]} tokens - The sequence of tokens to detokenize.
 * @returns {string} The detokenized text.
 */
export declare function detokenizeText(runtime: IAgentRuntime, model: ModelTypeName, tokens: number[]): Promise<string>;
