export interface ExecResult {
    stdout: string;
    stderr: string;
    exitCode: number | null;
    success: boolean;
}
export interface BunExecOptions {
    cwd?: string;
    env?: Record<string, string>;
    stdio?: 'pipe' | 'inherit' | 'ignore';
    stdout?: 'pipe' | 'inherit';
    stderr?: 'pipe' | 'inherit';
    timeout?: number;
    signal?: AbortSignal;
}
export declare class ProcessExecutionError extends Error {
    readonly exitCode: number | null;
    readonly stderr: string;
    readonly command: string;
    constructor(message: string, exitCode: number | null, stderr: string, command: string);
}
export declare class ProcessTimeoutError extends Error {
    readonly command: string;
    readonly timeout: number;
    constructor(message: string, command: string, timeout: number);
}
/**
 * Execute a command using Bun's shell functionality with enhanced security and error handling
 * This is a drop-in replacement for execa
 *
 * @param command - The command to execute
 * @param args - Array of arguments to pass to the command
 * @param options - Execution options including cwd, env, stdio, timeout, and signal
 * @returns Promise resolving to execution result with stdout, stderr, exitCode, and success
 *
 * @throws {ProcessExecutionError} When the command execution fails
 * @throws {ProcessTimeoutError} When the command times out
 *
 * @example
 * ```typescript
 * // Simple command execution
 * const result = await bunExec('echo', ['hello world']);
 * console.log(result.stdout); // "hello world"
 *
 * // With timeout
 * try {
 *   await bunExec('long-running-command', [], { timeout: 5000 });
 * } catch (error) {
 *   if (error instanceof ProcessTimeoutError) {
 *     console.log('Command timed out');
 *   }
 * }
 *
 * // With custom environment
 * await bunExec('npm', ['install'], {
 *   cwd: '/path/to/project',
 *   env: { NODE_ENV: 'production' }
 * });
 * ```
 */
export declare function bunExec(command: string, args?: string[], options?: BunExecOptions): Promise<ExecResult>;
/**
 * Execute a command and only return stdout (similar to execa's simple usage)
 * Throws an error if the command fails unless stdio is set to 'ignore'
 *
 * @param command - The command to execute
 * @param args - Array of arguments to pass to the command
 * @param options - Execution options
 * @returns Promise resolving to object with stdout property
 *
 * @throws {ProcessExecutionError} When the command fails (exitCode !== 0)
 *
 * @example
 * ```typescript
 * // Get command output
 * const { stdout } = await bunExecSimple('git', ['rev-parse', 'HEAD']);
 * console.log('Current commit:', stdout);
 *
 * // Ignore errors
 * const result = await bunExecSimple('which', ['optional-tool'], { stdio: 'ignore' });
 * ```
 */
export declare function bunExecSimple(command: string, args?: string[], options?: BunExecOptions): Promise<{
    stdout: string;
}>;
/**
 * Execute a command with inherited stdio (for interactive commands)
 * Useful for commands that need user interaction or should display output directly
 *
 * @param command - The command to execute
 * @param args - Array of arguments to pass to the command
 * @param options - Execution options (stdio will be overridden to 'inherit')
 * @returns Promise resolving to execution result
 *
 * @example
 * ```typescript
 * // Run interactive command
 * await bunExecInherit('npm', ['install']);
 *
 * // Run command that needs terminal colors
 * await bunExecInherit('npm', ['run', 'test']);
 * ```
 */
export declare function bunExecInherit(command: string, args?: string[], options?: BunExecOptions): Promise<ExecResult>;
/**
 * Check if a command exists in the system PATH
 * Uses 'which' on Unix-like systems and 'where' on Windows
 *
 * @param command - The command name to check
 * @returns Promise resolving to true if command exists, false otherwise
 *
 * @example
 * ```typescript
 * // Check if git is installed
 * if (await commandExists('git')) {
 *   console.log('Git is available');
 * } else {
 *   console.log('Git is not installed');
 * }
 *
 * // Check for optional tools
 * const hasDocker = await commandExists('docker');
 * const hasNode = await commandExists('node');
 * ```
 */
export declare function commandExists(command: string): Promise<boolean>;
//# sourceMappingURL=bun-exec.d.ts.map