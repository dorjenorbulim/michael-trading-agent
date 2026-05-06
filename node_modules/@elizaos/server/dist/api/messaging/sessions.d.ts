import { type ElizaOS } from '@elizaos/core';
import express from 'express';
import type { AgentServer } from '../../index';
/**
 * Extended Router interface with cleanup method
 */
export interface SessionRouter extends express.Router {
    /**
     * Cleanup function to properly dispose of resources
     * Should be called when the router is being destroyed or replaced
     */
    cleanup: () => void;
}
/**
 * Creates a unified sessions router for simplified messaging
 * This abstracts away the complexity of servers/channels for simple use cases
 *
 * @param agents - Map of agent IDs to runtime instances
 * @param serverInstance - The message server instance for message handling
 * @returns Router with cleanup method to prevent memory leaks
 */
export declare function createSessionsRouter(elizaOS: ElizaOS, serverInstance: AgentServer): SessionRouter;
