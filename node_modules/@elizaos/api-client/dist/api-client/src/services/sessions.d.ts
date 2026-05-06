import { BaseApiClient } from '../lib/base-client';
import type { CreateSessionParams, CreateSessionResponse, SendMessageParams, GetMessagesParams, GetMessagesResponse, SessionInfoResponse, SessionsHealthResponse, ListSessionsResponse, MessageResponse } from '../types/sessions';
/**
 * Service for managing messaging sessions between users and agents
 */
export declare class SessionsService extends BaseApiClient {
    /**
     * Get health status of the sessions service
     * @returns Health check response
     */
    checkHealth(): Promise<SessionsHealthResponse>;
    /**
     * Create a new messaging session
     * @param params Session creation parameters
     * @returns Created session response
     */
    createSession(params: CreateSessionParams): Promise<CreateSessionResponse>;
    /**
     * Get session details
     * @param sessionId Session ID
     * @returns Session information
     */
    getSession(sessionId: string): Promise<SessionInfoResponse>;
    /**
     * Send a message in a session
     * @param sessionId Session ID
     * @param params Message parameters (includes optional transport: 'http' | 'sse' | 'websocket')
     * @returns Message response with userMessage and optional agentResponse (in http mode)
     *
     * @example
     * // Default websocket transport - returns immediately
     * const response = await sessions.sendMessage(sessionId, { content: 'Hello' });
     * console.log(response.userMessage.id);
     *
     * @example
     * // HTTP transport - waits for agent response
     * const response = await sessions.sendMessage(sessionId, {
     *   content: 'Hello',
     *   transport: 'http'
     * });
     * console.log(response.agentResponse?.text);
     */
    sendMessage(sessionId: string, params: SendMessageParams): Promise<MessageResponse>;
    /**
     * Send a message and wait for the agent's response (HTTP transport)
     * Convenience method that sets transport to 'http'
     * @param sessionId Session ID
     * @param params Message parameters
     * @returns Message response with agentResponse included
     */
    sendMessageSync(sessionId: string, params: Omit<SendMessageParams, 'transport'>): Promise<MessageResponse>;
    /**
     * Get messages from a session
     * @param sessionId Session ID
     * @param params Query parameters for pagination and filtering
     * @returns Messages response
     */
    getMessages(sessionId: string, params?: GetMessagesParams): Promise<GetMessagesResponse>;
    /**
     * Delete a session
     * @param sessionId Session ID
     * @returns Success response
     */
    deleteSession(sessionId: string): Promise<{
        success: boolean;
    }>;
    /**
     * List all active sessions (admin endpoint)
     * @returns List of active sessions
     */
    listSessions(): Promise<ListSessionsResponse>;
}
//# sourceMappingURL=sessions.d.ts.map