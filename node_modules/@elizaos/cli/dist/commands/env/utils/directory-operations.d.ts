import { ResetActionRecord } from '../types';
/**
 * Delete a directory with error handling
 * @param dir Directory path to delete
 * @param actions Action log collection to update
 * @param label Description label for this operation
 * @returns Success or failure
 */
export declare function safeDeleteDirectory(dir: string, actions: ResetActionRecord, label: string): Promise<boolean>;
//# sourceMappingURL=directory-operations.d.ts.map