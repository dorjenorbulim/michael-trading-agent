import type { ElizaOS } from '@elizaos/core';
import express from 'express';
import type { AgentServer } from '../../index';
/**
 * Creates the agents router for agent lifecycle and management operations
 */
export declare function agentsRouter(elizaOS: ElizaOS, serverInstance: AgentServer): express.Router;
