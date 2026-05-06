import type { UUID } from '@elizaos/core';
import type { AgentServer } from '../index';
/**
 * Validates message_server_id for RLS (Row Level Security) isolation
 *
 * When ENABLE_DATA_ISOLATION is enabled, only allows access to data
 * belonging to the current server instance's message server.
 *
 * When ENABLE_DATA_ISOLATION is disabled, allows access to all data
 * (backward compatibility mode).
 *
 * Note: This validates the PUBLIC message_server_id (from message_servers table),
 * NOT the internal RLS server_id. The database RLS layer handles server_id filtering automatically.
 *
 * @param message_server_id - The message server ID from the request (message_servers.id)
 * @param serverInstance - The current AgentServer instance
 * @returns true if the message_server_id is valid for this request, false otherwise
 *
 * @example
 * const isValid = validateServerIdForRls(req.body.message_server_id, serverInstance);
 * if (!isValid) {
 *   return res.status(403).json({ error: 'Forbidden: message_server_id does not match' });
 * }
 */
export declare function validateServerIdForRls(message_server_id: UUID | string | undefined, serverInstance: AgentServer): boolean;
/**
 * Checks if Data Isolation (RLS - Row Level Security) is enabled
 *
 * @returns true if ENABLE_DATA_ISOLATION=true, false otherwise
 */
export declare function isRlsEnabled(): boolean;
