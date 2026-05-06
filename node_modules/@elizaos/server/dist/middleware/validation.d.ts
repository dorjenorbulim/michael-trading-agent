import type { ElizaOS } from '@elizaos/core';
import express from 'express';
/**
 * Middleware to validate that an agent exists
 */
export declare const agentExistsMiddleware: (elizaOS: ElizaOS) => (req: express.Request, res: express.Response, next: express.NextFunction) => void;
/**
 * Middleware to validate UUID parameters
 */
export declare const validateUuidMiddleware: (paramName: string) => (req: express.Request, res: express.Response, next: express.NextFunction) => void;
/**
 * Enhanced channel ID validation middleware with additional security
 */
export declare const validateChannelIdMiddleware: () => (req: express.Request, res: express.Response, next: express.NextFunction) => void;
/**
 * Middleware to validate request content type for POST/PUT/PATCH requests
 */
export declare const validateContentTypeMiddleware: () => (req: express.Request, res: express.Response, next: express.NextFunction) => void;
