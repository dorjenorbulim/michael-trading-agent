import { type Request, type Response, type NextFunction } from 'express';
export interface ApiKeyAuthRequest extends Request {
    isServerAuthenticated?: boolean;
}
/**
 * API Key authentication middleware.
 *
 * Authenticates frontend→server connection (Layer 1).
 * Only active if ELIZA_SERVER_AUTH_TOKEN is configured.
 *
 * Use case: Prevent unauthorized clients from accessing the API.
 */
export declare function apiKeyAuthMiddleware(req: ApiKeyAuthRequest, res: Response, next: NextFunction): void | Response;
