/**
 * Consolidated middleware for the ElizaOS server
 * All middleware is organized into logical modules for better maintainability
 */
export { apiKeyAuthMiddleware, type ApiKeyAuthRequest } from './api-key';
export { securityMiddleware } from './security';
export { createApiRateLimit, createFileSystemRateLimit, createUploadRateLimit, createChannelValidationRateLimit, } from './rate-limit';
export { agentExistsMiddleware, validateUuidMiddleware, validateChannelIdMiddleware, validateContentTypeMiddleware, } from './validation';
