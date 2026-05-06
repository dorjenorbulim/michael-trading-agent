import { JsonLogHttpRequest, JsonLogHttpResponse, JsonLogError } from './types.js';
/**
 * Serializes a Request object into a JSON Log HTTP Request object.
 *
 * If `true` is passed as the second parameter, it will attempt to extract the username from the
 * request headers for base64 encoded basic authorization only. All other forms of authorization
 * will return `undefined`.
 *
 * NOTICE: The "Authorization" header will always be excluded.
 */
export declare function serializeRequest(request: Request, includeUsername?: boolean): Promise<JsonLogHttpRequest>;
/**
 * Serializes a Response object into a JSON Log HTTP Response object.
 */
export declare function serializeResponse(response: Response): JsonLogHttpResponse;
/**
 * Serializes an Error object into a JSON Log Error object that is compatible with JsonLogFormatMeta.
 */
export declare function serializeError(error: Error): JsonLogError;
