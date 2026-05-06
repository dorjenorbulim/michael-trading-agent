import express from 'express';
/**
 * Sends a standardized error response
 */
export declare const sendError: (res: express.Response, status: number, code: string, message: string, details?: string) => void;
/**
 * Sends a standardized success response
 */
export declare const sendSuccess: (res: express.Response, data: any, status?: number) => void;
