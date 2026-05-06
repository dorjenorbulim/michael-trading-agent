/**
 * Transform local file paths to API URLs for web clients
 */
import type { AttachmentInput, MessageWithAttachments } from '../types/server';
/**
 * Transform a local file path to an API URL
 */
export declare function transformPathToApiUrl(filePath: string): string;
/**
 * Convert local file paths to API URLs for attachments
 */
export declare function attachmentsToApiUrls(attachments: AttachmentInput): AttachmentInput;
/**
 * Transform attachments in message content and metadata to API URLs
 */
export declare function transformMessageAttachments(message: MessageWithAttachments): MessageWithAttachments;
