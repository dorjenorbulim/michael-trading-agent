import type { ElizaOS } from '@elizaos/core';
import express from 'express';
import type { AgentServer } from '../../index';
/**
 * Creates the memory router for memory and knowledge management
 */
export declare function memoryRouter(elizaOS: ElizaOS, serverInstance: AgentServer): express.Router;
