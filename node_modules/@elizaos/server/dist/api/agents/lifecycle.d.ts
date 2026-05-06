import type { ElizaOS } from '@elizaos/core';
import express from 'express';
import type { AgentServer } from '../../index';
/**
 * Agent lifecycle operations (start, stop, status)
 */
export declare function createAgentLifecycleRouter(elizaOS: ElizaOS, serverInstance: AgentServer): express.Router;
