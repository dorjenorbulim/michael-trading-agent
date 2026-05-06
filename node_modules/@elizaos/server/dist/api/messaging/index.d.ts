import type { ElizaOS } from '@elizaos/core';
import express from 'express';
import type { AgentServer } from '../../index';
/**
 * Creates the messaging router for all communication functionality
 */
export declare function messagingRouter(elizaOS: ElizaOS, serverInstance: AgentServer): express.Router;
