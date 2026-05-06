/**
 * Detects audio MIME type from buffer by checking magic bytes (file signature)
 * @param buffer The audio buffer to analyze
 * @returns The detected MIME type or 'application/octet-stream' if unknown
 */
export declare function detectAudioMimeType(buffer: Buffer): string;
/**
 * Converts a Web ReadableStream to a Node.js Readable stream
 * Handles both browser and Node.js environments
 * Uses dynamic import to avoid bundling node:stream in browser builds
 */
export declare function webStreamToNodeStream(webStream: ReadableStream<Uint8Array>): Promise<import("stream").Readable>;
