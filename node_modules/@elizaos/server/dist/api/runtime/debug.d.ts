import express from 'express';
import type { AgentServer } from '../../index';
/**
 * Debug and diagnostic endpoints
 */
export declare function createDebugRouter(serverInstance: AgentServer): express.Router;
