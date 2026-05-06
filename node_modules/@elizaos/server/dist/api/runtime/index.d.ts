import type { ElizaOS } from '@elizaos/core';
import express from 'express';
import type { AgentServer } from '../../index';
/**
 * Creates the runtime router for system operations and health monitoring
 */
export declare function runtimeRouter(elizaOS: ElizaOS, serverInstance: AgentServer): express.Router;
