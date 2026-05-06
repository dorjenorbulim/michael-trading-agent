import type { StreamingContext, IStreamingContextManager } from './streaming-context';
/**
 * AsyncLocalStorage-based context manager for Node.js.
 * Provides proper async context isolation across parallel async operations.
 */
export declare class AsyncLocalStorageContextManager implements IStreamingContextManager {
    private storage;
    run<T>(context: StreamingContext | undefined, fn: () => T): T;
    active(): StreamingContext | undefined;
}
/**
 * Create and return a configured AsyncLocalStorage context manager.
 * Called by index.node.ts during initialization.
 */
export declare function createNodeStreamingContextManager(): IStreamingContextManager;
//# sourceMappingURL=streaming-context.node.d.ts.map