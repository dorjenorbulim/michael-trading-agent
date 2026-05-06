import express from 'express';
import type { AgentServer } from '../../index';
/**
 * Core messaging functionality - message submission and ingestion
 */
export declare function createMessagingCoreRouter(serverInstance: AgentServer): express.Router;
