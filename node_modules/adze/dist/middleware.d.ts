import { ModifierName } from './index.js';
import { ModifierData } from './index.js';
import Log from './log.js';
export type TargetEnvironment = 'server' | 'browser' | 'both';
export interface Middleware {
    /**
     * Hook that is called during construction of a log instance.
     */
    constructed?(log: Log): void;
    /**
     * Hook that is called just before a modifier is applied to a log instance.
     */
    beforeModifierApplied?(log: Log, name: ModifierName, data: ModifierData): void;
    /**
     * Hook that is called just after a modifier is applied to a log instance.
     */
    afterModifierApplied?(log: Log, name: ModifierName, data: ModifierData): void;
    /**
     * Hook that is called just before a formatter is applied to a log instance to format a message.
     */
    beforeFormatApplied?(log: Log, format: string, message: unknown[]): unknown[];
    /**
     * Hook that is called just after a formatter is applied to a log instance to format a message.
     */
    afterFormatApplied?(log: Log, format: string, message: unknown[]): void;
    /**
     * Hook that is called just before a log instance message is printed to the browser or console.
     */
    beforePrint?(log: Log): void;
    /**
     * Hook that is called just before a log is terminated.
     */
    beforeTerminated?(log: Log, terminator: string, args: unknown[]): void;
    /**
     * Hook that is called just when a log instance has completed termination.
     */
    afterTerminated?(log: Log, terminator: string, args: unknown[]): void;
}
/**
 * Middleware abstract class that can be extended to create custom middleware.
 */
export declare abstract class Middleware {
    /**
     * The target environment for this middleware.
     *
     * This instructs the middleware to only load dependencies for the specified environment.
     */
    protected targetEnvironment: TargetEnvironment;
    /**
     * The environment that the middleware is running in.
     */
    protected readonly environment: string;
    /**
     * Array of asynchronous dependency loaders.
     */
    private dependencyLoaders;
    constructor(targetEnvironment?: TargetEnvironment);
    /**
     * Load the dependencies for this middleware.
     */
    load(): Promise<void>;
    /**
     * Load dependencies for the server environment.
     */
    protected loadServerDependencies(): Promise<void>;
    /**
     * Load dependencies for the browser environment.
     */
    protected loadBrowserDependencies(): Promise<void>;
}
