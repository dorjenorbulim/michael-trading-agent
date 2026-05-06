import type { IAgentRuntime, ImageDescriptionParams, ImageGenerationParams } from "@elizaos/core";
/**
 * IMAGE generation model handler
 */
export declare function handleImageGeneration(runtime: IAgentRuntime, params: ImageGenerationParams): Promise<{
    url: string;
}[]>;
/**
 * IMAGE_DESCRIPTION model handler
 */
export declare function handleImageDescription(runtime: IAgentRuntime, params: ImageDescriptionParams | string): Promise<{
    title: string;
    description: string;
}>;
