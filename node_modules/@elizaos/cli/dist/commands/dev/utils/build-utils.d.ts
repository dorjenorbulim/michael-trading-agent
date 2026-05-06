import { DevContext } from '../types';
/**
 * Perform a full rebuild based on the development context
 *
 * Handles building in different contexts: monorepo, project, or plugin.
 */
export declare function performRebuild(context: DevContext): Promise<void>;
/**
 * Perform initial build setup
 */
export declare function performInitialBuild(context: DevContext): Promise<void>;
/**
 * Create development context from current working directory
 */
export declare function createDevContext(cwd: string): DevContext;
//# sourceMappingURL=build-utils.d.ts.map