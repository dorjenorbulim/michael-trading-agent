import type { IAgentRuntime, ObjectGenerationParams } from "@elizaos/core";
/**
 * OBJECT_SMALL model handler
 */
export declare function handleObjectSmall(runtime: IAgentRuntime, params: ObjectGenerationParams): Promise<Record<string, unknown>>;
/**
 * OBJECT_LARGE model handler
 */
export declare function handleObjectLarge(runtime: IAgentRuntime, params: ObjectGenerationParams): Promise<Record<string, unknown>>;
