import { UUID } from '@elizaos/core';
import { BaseApiClient } from '../lib/base-client';
import { MediaUploadParams, MediaUploadResponse, ChannelUploadResponse } from '../types/media';
export declare class MediaService extends BaseApiClient {
    /**
     * Upload media for an agent
     */
    uploadAgentMedia(agentId: UUID, params: MediaUploadParams): Promise<MediaUploadResponse>;
    /**
     * Upload file to a channel
     */
    uploadChannelMedia(channelId: UUID, file: File): Promise<ChannelUploadResponse>;
}
//# sourceMappingURL=media.d.ts.map