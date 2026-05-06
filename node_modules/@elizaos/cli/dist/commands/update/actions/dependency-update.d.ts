import { UpdateOptions } from '../types';
/**
 * Main dependency update function
 *
 * Updates ElizaOS dependencies in a project or plugin, with support for dry-run mode, major version confirmation, and optional build step.
 */
export declare function updateDependencies(cwd: string, isPlugin: boolean, options?: UpdateOptions): Promise<void>;
//# sourceMappingURL=dependency-update.d.ts.map