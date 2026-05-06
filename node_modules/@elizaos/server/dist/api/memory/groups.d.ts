import type { ElizaOS } from '@elizaos/core';
import express from 'express';
import type { AgentServer } from '../../index';
/**
 * Group and world memory management functionality
 */
export declare function createGroupMemoryRouter(elizaOS: ElizaOS, serverInstance: AgentServer): express.Router;
