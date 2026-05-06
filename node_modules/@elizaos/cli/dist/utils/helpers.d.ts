import type { Agent } from '@elizaos/core';
/**
 * Gets a user-friendly display name for a directory path
 *
 * converts paths like "." to "Desktop" or "/Users/me/Desktop" to "Desktop"
 * so the create command shows nice prompts like "Create plugin 'my-plugin' in Desktop?"
 *
 * @param targetDir The directory path to display
 * @returns A user-friendly directory name
 */
export declare function getDisplayDirectory(targetDir: string): string;
/**
 * Display character
 */
export declare function displayAgent(data: Partial<Agent>, title?: string): void;
/**
 * Logs a header inside a rectangular frame with extra padding.
 * @param {string} title - The header text to display.
 */
export declare function logHeader(title: string): void;
//# sourceMappingURL=helpers.d.ts.map