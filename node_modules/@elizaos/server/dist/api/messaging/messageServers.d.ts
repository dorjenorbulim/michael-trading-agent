import express from 'express';
import type { AgentServer } from '../../index';
/**
 * Server management functionality
 */
export declare function createMessageServersRouter(serverInstance: AgentServer): express.Router;
