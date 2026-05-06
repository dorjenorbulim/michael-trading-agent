import type { IAgentRuntime } from "@elizaos/core";
import type { OpenAITranscriptionParams, OpenAITextToSpeechParams } from "../types";
/**
 * TRANSCRIPTION model handler
 */
export declare function handleTranscription(runtime: IAgentRuntime, input: Blob | File | Buffer | OpenAITranscriptionParams): Promise<string>;
/**
 * TEXT_TO_SPEECH model handler
 */
export declare function handleTextToSpeech(runtime: IAgentRuntime, input: string | OpenAITextToSpeechParams): Promise<ArrayBuffer>;
