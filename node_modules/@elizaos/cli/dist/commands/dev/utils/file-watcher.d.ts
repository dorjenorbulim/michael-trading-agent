import { WatcherConfig } from '../types';
/**
 * Sets up file watching for the given directory
 *
 * Watches for changes to TypeScript and JavaScript files, with debouncing to prevent rapid rebuilds.
 */
export declare function watchDirectory(dir: string, onChange: () => void, config?: Partial<WatcherConfig>): Promise<void>;
/**
 * Create a debounced file change handler
 */
export declare function createDebouncedHandler(handler: () => void, delay?: number): () => void;
//# sourceMappingURL=file-watcher.d.ts.map