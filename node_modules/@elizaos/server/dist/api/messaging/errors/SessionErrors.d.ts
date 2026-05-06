/**
 * Session-specific error types for better error handling and debugging
 */
/**
 * Base class for all session-related errors
 */
export declare abstract class SessionError extends Error {
    readonly code: string;
    readonly statusCode: number;
    readonly details?: any;
    readonly timestamp: Date;
    constructor(code: string, message: string, statusCode?: number, details?: any);
    /**
     * Convert error to JSON for API responses
     */
    toJSON(): {
        error: {
            details?: any;
            stack?: string | undefined;
            code: string;
            message: string;
            timestamp: string;
        };
    };
}
/**
 * Error thrown when a session is not found
 */
export declare class SessionNotFoundError extends SessionError {
    constructor(sessionId: string, details?: any);
}
/**
 * Error thrown when a session has expired
 */
export declare class SessionExpiredError extends SessionError {
    constructor(sessionId: string, expiredAt?: Date, details?: any);
}
/**
 * Error thrown when session creation fails
 */
export declare class SessionCreationError extends SessionError {
    constructor(reason: string, details?: any);
}
/**
 * Error thrown when an agent is not found
 */
export declare class AgentNotFoundError extends SessionError {
    constructor(agentId: string, details?: any);
}
/**
 * Error thrown when input validation fails
 */
export declare class ValidationError extends SessionError {
    readonly field?: string;
    readonly value?: any;
    constructor(message: string, field?: string, value?: any, details?: any);
}
/**
 * Error thrown when a UUID is invalid
 */
export declare class InvalidUuidError extends ValidationError {
    constructor(field: string, value: string);
}
/**
 * Error thrown when required fields are missing
 */
export declare class MissingFieldsError extends ValidationError {
    constructor(fields: string[]);
}
/**
 * Error thrown when content validation fails
 */
export declare class InvalidContentError extends ValidationError {
    constructor(reason: string, content?: any);
}
/**
 * Error thrown when metadata validation fails
 */
export declare class InvalidMetadataError extends ValidationError {
    constructor(reason: string, metadata?: any);
}
/**
 * Error thrown when pagination parameters are invalid
 */
export declare class InvalidPaginationError extends ValidationError {
    constructor(parameter: string, value: any, reason: string);
}
/**
 * Error thrown when timeout configuration is invalid
 */
export declare class InvalidTimeoutConfigError extends ValidationError {
    constructor(reason: string, config?: any);
}
/**
 * Error thrown when a session cannot be renewed
 */
export declare class SessionRenewalError extends SessionError {
    constructor(sessionId: string, reason: string, details?: any);
}
/**
 * Error thrown when session deletion fails
 */
export declare class SessionDeletionError extends SessionError {
    constructor(sessionId: string, reason: string, details?: any);
}
/**
 * Error thrown when message sending fails
 */
export declare class MessageSendError extends SessionError {
    constructor(sessionId: string, reason: string, details?: any);
}
/**
 * Error thrown when message retrieval fails
 */
export declare class MessageRetrievalError extends SessionError {
    constructor(sessionId: string, reason: string, details?: any);
}
/**
 * Error thrown when database operations fail
 */
export declare class DatabaseError extends SessionError {
    constructor(operation: string, reason: string, details?: any);
}
/**
 * Error thrown when session limit is exceeded
 */
export declare class SessionLimitExceededError extends SessionError {
    constructor(limit: number, current: number, details?: any);
}
/**
 * Error thrown when rate limit is exceeded
 */
export declare class RateLimitError extends SessionError {
    readonly retryAfter?: number;
    constructor(message: string, retryAfter?: number, details?: any);
}
/**
 * Error handler utility for Express middleware
 */
export declare function createErrorHandler(): (err: Error, _req: any, res: any, next: any) => any;
/**
 * Type guard to check if an error is a SessionError
 */
export declare function isSessionError(error: unknown): error is SessionError;
/**
 * Type guard to check if an error is a validation error
 */
export declare function isValidationError(error: unknown): error is ValidationError;
