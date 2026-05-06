import express from 'express';
/**
 * Security middleware to add additional API protection
 * - Adds security headers
 * - Removes potentially sensitive headers
 * - Logs suspicious request patterns
 */
export declare const securityMiddleware: () => (req: express.Request, res: express.Response, next: express.NextFunction) => void;
