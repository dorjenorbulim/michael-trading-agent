/**
 * Streaming utilities for filtering and extracting streamable content.
 *
 * This module provides implementations of {@link IStreamExtractor}:
 * - PassthroughExtractor - Simple passthrough (no filtering)
 * - XmlTagExtractor - Extract content from a specific XML tag
 * - ResponseStreamExtractor - Action-aware XML (for DefaultMessageService)
 * - ActionStreamFilter - Content-type aware filter (for action handlers)
 *
 * For the interface definition, see types/streaming.ts.
 * Implementations can use these or create their own extractors.
 */
import type { IStreamExtractor, IStreamingRetryState } from '../types/streaming';
import type { StreamingContext } from '../streaming-context';
import type { UUID } from '../types';
export type { IStreamExtractor, IStreamingRetryState } from '../types/streaming';
/** Error codes for streaming operations */
export type StreamErrorCode = 'CHUNK_TOO_LARGE' | 'BUFFER_OVERFLOW' | 'PARSE_ERROR' | 'TIMEOUT' | 'ABORTED';
/**
 * Standardized error class for streaming operations.
 * Provides structured error codes for easier handling.
 */
export declare class StreamError extends Error {
    readonly code: StreamErrorCode;
    readonly details?: Record<string, unknown>;
    constructor(code: StreamErrorCode, message: string, details?: Record<string, unknown>);
    /** Check if an error is a StreamError */
    static isStreamError(error: unknown): error is StreamError;
}
/**
 * Creates a streaming retry state from an extractor.
 * Use this to track streaming state for intelligent retry logic.
 *
 * @example
 * ```ts
 * const extractor = new ResponseStreamExtractor();
 * const retryState = createStreamingRetryState(extractor);
 *
 * // After streaming fails...
 * if (retryState.isComplete()) {
 *   // Text extraction finished - use streamedText, no retry needed
 *   return retryState.getStreamedText();
 * } else {
 *   // Text was cut - retry with continuation prompt
 *   retryState.reset();
 *   // ... retry with: "You started: '${streamedText}', continue..."
 * }
 * ```
 */
export declare function createStreamingRetryState(extractor: IStreamExtractor): IStreamingRetryState & {
    _appendText: (text: string) => void;
};
/**
 * Creates a complete streaming context with retry state management.
 * Use this to avoid duplicating streaming context creation logic.
 *
 * @param extractor - The stream extractor to use (e.g., ResponseStreamExtractor, XmlTagExtractor)
 * @param onStreamChunk - Callback to send chunks to the client
 * @param messageId - Optional message ID for the streaming context
 * @returns A complete StreamingContext with retry state methods
 *
 * @example
 * ```ts
 * const ctx = createStreamingContext(
 *   new ResponseStreamExtractor(),
 *   async (chunk) => res.write(chunk),
 *   responseId
 * );
 *
 * await runWithStreamingContext(ctx, () => runtime.useModel(...));
 *
 * // After streaming, check retry state
 * if (ctx.isComplete()) {
 *   return ctx.getStreamedText();
 * }
 * ```
 */
export declare function createStreamingContext(extractor: IStreamExtractor, onStreamChunk: (chunk: string, messageId?: UUID) => Promise<void>, messageId?: UUID): StreamingContext;
/**
 * Streams all content as-is without any filtering.
 * Use when LLM output is already in the desired format (e.g., plain text responses).
 */
export declare class PassthroughExtractor implements IStreamExtractor {
    get done(): boolean;
    push(chunk: string): string;
    reset(): void;
}
/**
 * Extracts content from a specific XML tag, streaming it progressively.
 * Use when you have a simple XML format like `<response><text>content</text></response>`.
 *
 * @example
 * ```ts
 * const extractor = new XmlTagExtractor('text');
 * extractor.push('<response><text>Hello'); // Returns 'Hel' (keeps margin for split tags)
 * extractor.push(' world!</text></response>'); // Returns 'lo world!'
 * ```
 */
export declare class XmlTagExtractor implements IStreamExtractor {
    private readonly openTag;
    private readonly closeTag;
    private buffer;
    private insideTag;
    private finished;
    constructor(tagName: string);
    get done(): boolean;
    push(chunk: string): string;
    reset(): void;
    /**
     * Flush remaining buffered content when stream ends unexpectedly.
     */
    flush(): string;
}
/**
 * Extracts streamable text from XML-structured LLM responses with action-based routing.
 *
 * This is the default implementation used by DefaultMessageService.
 * It understands the `<actions>` tag to determine whether to stream `<text>` content.
 *
 * Strategy:
 * - Parse <actions> to determine if response is direct (REPLY) or delegated (other actions)
 * - If direct: stream <text> content immediately
 * - If delegated: skip <text> (action handler will generate its own response via ActionStreamFilter)
 *
 * For simpler use cases without action routing, use {@link XmlTagExtractor} instead.
 */
export declare class ResponseStreamExtractor implements IStreamExtractor {
    private static readonly STREAM_TAGS;
    private buffer;
    private insideTag;
    private currentTag;
    private finished;
    private responseStrategy;
    get done(): boolean;
    reset(): void;
    /**
     * Flush remaining buffered content when stream ends unexpectedly.
     * Returns content that was held back due to SAFE_MARGIN.
     */
    flush(): string;
    push(chunk: string): string;
    /** Detect response strategy from <actions> tag using indexOf (ReDoS-safe) */
    private detectResponseStrategy;
    /** Parse comma-separated actions */
    private parseActions;
    /** Check if actions represent a direct reply */
    private isDirectReply;
    /** Determine if a tag should be streamed based on strategy */
    private shouldStreamTag;
}
/**
 * Filters action handler output for streaming.
 * Used by runtime.ts processActions() for each action's useModel calls.
 *
 * Auto-detects content type from first non-whitespace character:
 * - JSON (starts with { or [) → Don't stream (structured data for parsing)
 * - XML (starts with <) → Look for <text> tag and stream its content
 * - Plain text → Stream immediately
 */
export declare class ActionStreamFilter implements IStreamExtractor {
    private buffer;
    private decided;
    private contentType;
    private insideTextTag;
    private finished;
    get done(): boolean;
    reset(): void;
    /**
     * Flush remaining buffered content when stream ends unexpectedly.
     */
    flush(): string;
    push(chunk: string): string;
    /** Detect content type from first non-whitespace character */
    private detectContentType;
    /** Handle plain text - stream everything */
    private handlePlainText;
    /** Handle XML content - extract and stream <text> tag content */
    private handleXml;
}
//# sourceMappingURL=streaming.d.ts.map