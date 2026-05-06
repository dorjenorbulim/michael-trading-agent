import type { ElizaOS } from '@elizaos/core';
import express from 'express';
import http from 'node:http';
import type { AgentServer } from '../index';
import { Server as SocketIOServer } from 'socket.io';
/**
 * Sets up Socket.io server for real-time messaging
 * @param server HTTP Server instance
 * @param elizaOS ElizaOS instance
 * @param serverInstance AgentServer instance
 */
export declare function setupSocketIO(server: http.Server, elizaOS: ElizaOS, serverInstance: AgentServer): SocketIOServer;
export declare function createPluginRouteHandler(elizaOS: ElizaOS): express.RequestHandler;
/**
 * Creates an API router with various endpoints and middleware.
 * @param {ElizaOS} elizaOS - ElizaOS instance containing all agents and their runtimes.
 * @param {AgentServer} [server] - Optional AgentServer instance.
 * @returns {express.Router} The configured API router.
 */
export declare function createApiRouter(elizaOS: ElizaOS, serverInstance: AgentServer): express.Router;
