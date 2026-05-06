import type { ElizaOS } from '@elizaos/core';
import express from 'express';
import type { AgentServer } from '../../index';
/**
 * Health monitoring and status endpoints
 */
export declare function createHealthRouter(elizaOS: ElizaOS, serverInstance: AgentServer): express.Router;
