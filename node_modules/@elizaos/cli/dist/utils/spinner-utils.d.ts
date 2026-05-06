/**
 * Check if quiet mode is enabled
 */
export declare function isQuietMode(): boolean;
interface SpinnerCommandOptions {
    cwd?: string;
    spinnerText: string;
    successText: string;
    errorText?: string;
    showOutputOnError?: boolean;
}
interface CommandResult {
    success: boolean;
    stdout?: string;
    stderr?: string;
    error?: Error;
}
/**
 * Core function to run any command with a spinner
 */
export declare function runCommandWithSpinner(command: string, args: string[], options: SpinnerCommandOptions): Promise<CommandResult>;
/**
 * Run a bun command with spinner
 */
export declare function runBunWithSpinner(args: string[], cwd: string, options: Partial<SpinnerCommandOptions>): Promise<CommandResult>;
/**
 * Install dependencies with spinner
 */
export declare function installDependenciesWithSpinner(targetDir: string): Promise<void>;
/**
 * Build project with spinner
 */
export declare function buildProjectWithSpinner(targetDir: string, isPlugin?: boolean): Promise<void>;
/**
 * Install plugin with spinner (non-critical, warns on failure)
 */
export declare function installPluginWithSpinner(pluginName: string, targetDir: string, purpose?: string): Promise<void>;
/**
 * Create a task for use with clack.tasks()
 */
export declare function createTask(title: string, fn: () => Promise<void | string>): {
    title: string;
    task: () => Promise<string>;
};
/**
 * Run multiple tasks with clack.tasks()
 */
export declare function runTasks(tasks: Array<{
    title: string;
    task: () => Promise<void> | Promise<string>;
}>): Promise<void>;
export {};
//# sourceMappingURL=spinner-utils.d.ts.map