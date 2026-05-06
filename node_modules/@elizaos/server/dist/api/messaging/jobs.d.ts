/**
 * Jobs API Router
 -
 * Provides one-off messaging capabilities for agents with comprehensive security controls:
 *
 * Security Features:
 * - API key authentication required for all job operations
 * - Request size validation (content max 50KB, metadata max 10KB)
 * - Timeout bounds validation (1s min, 5min max for jobs; absolute 5min for cleanup)
 * - Resource exhaustion protection via absolute timeout caps
 * - Memory leak prevention via per-instance state scoping
 * - Rate limiting applied at API router level
 * - Input validation for all UUIDs and content
 * - Global error boundary for unhandled rejections
 *
 * All state (jobs, metrics, timeouts) is scoped per-router instance to prevent
 * memory leaks and cross-instance contamination.
 */
import { type ElizaOS } from '@elizaos/core';
import express from 'express';
import type { AgentServer } from '../../index';
/**
 * Extended Router interface with cleanup method
 */
export interface JobsRouter extends express.Router {
    cleanup: () => void;
}
/**
 * Creates the jobs router for one-off messaging
 */
export declare function createJobsRouter(elizaOS: ElizaOS, serverInstance: AgentServer): JobsRouter;
