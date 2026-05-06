/**
 * General API rate limiting middleware
 */
export declare const createApiRateLimit: () => import("express-rate-limit").RateLimitRequestHandler;
/**
 * Strict rate limiting for file system operations
 */
export declare const createFileSystemRateLimit: () => import("express-rate-limit").RateLimitRequestHandler;
/**
 * Very strict rate limiting for upload operations
 */
export declare const createUploadRateLimit: () => import("express-rate-limit").RateLimitRequestHandler;
/**
 * Rate limiting specifically for channel validation attempts
 * Prevents brute force attacks on channel IDs
 */
export declare const createChannelValidationRateLimit: () => import("express-rate-limit").RateLimitRequestHandler;
