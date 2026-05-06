/**
 * Shared constants for the API server
 */
/**
 * Maximum file size allowed for uploads (50MB)
 * Used across various endpoints including audio processing,
 * media uploads, and multer configurations
 */
export declare const MAX_FILE_SIZE: number;
/**
 * Maximum file size in human-readable format
 */
export declare const MAX_FILE_SIZE_DISPLAY = "50MB";
/**
 * Valid MIME types for audio files
 */
export declare const ALLOWED_AUDIO_MIME_TYPES: readonly ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/webm", "audio/mp4", "audio/aac", "audio/flac", "audio/x-wav", "audio/wave"];
/**
 * Valid MIME types for media files (includes audio, images, documents)
 */
export declare const ALLOWED_MEDIA_MIME_TYPES: readonly ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/webm", "audio/mp4", "audio/aac", "audio/flac", "audio/x-wav", "audio/wave", "image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/webm", "application/pdf", "text/plain"];
/**
 * Valid transport types for messaging API endpoints
 * - "http": Wait for complete agent response (sync)
 * - "sse": SSE streaming response
 * - "websocket": Return immediately, agent response via WebSocket (default)
 */
export declare const TRANSPORT_TYPES: readonly ["http", "sse", "websocket"];
/**
 * Type for transport parameter
 */
export type TransportType = (typeof TRANSPORT_TYPES)[number];
/**
 * Default transport type for backward compatibility
 */
export declare const DEFAULT_TRANSPORT: TransportType;
/**
 * Legacy response mode aliases for backward compatibility
 * Maps old mode names to new transport types
 */
export declare const LEGACY_MODE_MAP: Record<string, TransportType>;
/**
 * @deprecated Use TRANSPORT_TYPES instead
 */
export declare const RESPONSE_MODES: readonly ["http", "sse", "websocket"];
/**
 * @deprecated Use TransportType instead
 */
export type ResponseMode = TransportType;
/**
 * @deprecated Use DEFAULT_TRANSPORT instead
 */
export declare const DEFAULT_RESPONSE_MODE: "websocket";
