import type { ElizaOS } from '@elizaos/core';
import express from 'express';
import type { AgentServer } from '../../index';
/**
 * Agent CRUD operations
 */
export declare function createAgentCrudRouter(elizaOS: ElizaOS, serverInstance: AgentServer): express.Router;
