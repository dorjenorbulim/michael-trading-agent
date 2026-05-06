import { DefaultTerminatorMethod, LogData, ModifierData, UserConfiguration, TableData } from './_types/index.js';
import { Configuration } from './configuration.js';
export declare function isCallback(maybeFunction: unknown): maybeFunction is (...args: any[]) => void;
export default class Log<N extends string = string, Msg = unknown> {
    /**
     * The global context object.
     */
    private globalStore;
    /**
     * The configuration for the adze log.
     */
    private _cfg;
    /**
     * Incomplete log data.
     */
    private _modifierData;
    /**
     * The log data object.
     */
    private _data?;
    /**
     * Queue up modifiers to ensure they are in the correct order when executed.
     */
    private modifierQueue;
    constructor(cfg?: UserConfiguration, modifierData?: ModifierData);
    get data(): LogData | undefined;
    get modifierData(): ModifierData;
    get configuration(): Configuration;
    /**
     * Terminates the log at the *alert* level.
     *
     * **Default Level = "alert" or 0**
     *
     * This level is useful for calling alert to
     * important information and lives at the lowest level.
     *
     * You should use this sparingly since it's level is lower
     * than error.
     *
     * This is a non-standard API.
     */
    alert(...args: []): void;
    alert(...args: [Msg, ...unknown[]]): void;
    /**
     * Terminates the log at the *alert* level.
     *
     * **Default Level = "alert" or 0**
     *
     * This level is useful for calling alert to
     * important information and lives at the lowest level.
     *
     * You should use this sparingly since it's level is lower
     * than error.
     *
     * This is a non-standard API.
     */
    static alert<M extends string>(...args: [M, ...unknown[]]): void;
    /**
     * Terminates the log at the *error* level.
     *
     * **Default Level = "error" or 1**
     *
     * Use this for logging fatal errors or errors that
     * impact functionality of your application.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/error)
     */
    error(...args: []): void;
    error(...args: [Msg, ...unknown[]]): void;
    /**
     * Terminates the log at the *error* level.
     *
     * **Default Level = "error" or 1**
     *
     * Use this for logging fatal errors or errors that
     * impact functionality of your application.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/error)
     */
    static error<M extends string>(...args: [M, ...unknown[]]): void;
    /**
     * Terminates the log at the *warning* level.
     *
     * **Default Level = "warn" or 2**
     *
     * Use this for logging issues that may impact
     * app performance in a less impactful way than
     * an error.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/warn)
     */
    warn(...args: []): void;
    warn(...args: [Msg, ...unknown[]]): void;
    /**
     * Terminates the log at the *warning* level.
     *
     * **Default Level = "warn" or 2**
     *
     * Use this for logging issues that may impact
     * app performance in a less impactful way than
     * an error.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/warn)
     */
    static warn<M extends string>(...args: [M, ...unknown[]]): void;
    /**
     * Terminates the log at the *info* level.
     *
     * **Default Level = "info" or 3**
     *
     * Use this for logging general insights into your
     * application. This level does not indicate any
     * problems.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/info)
     */
    info(...args: []): void;
    info(...args: [Msg, ...unknown[]]): void;
    /**
     * Terminates the log at the *info* level.
     *
     * **Default Level = "info" or 3**
     *
     * Use this for logging general insights into your
     * application. This level does not indicate any
     * problems.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/info)
     */
    static info<M extends string>(...args: [M, ...unknown[]]): void;
    /**
     * Terminates the log at the *fail* level.
     *
     * **Default Level = "fail" or 4**
     *
     * Use this for logging network communication errors
     * that do not break your application.
     *
     * This is a non-standard API.
     */
    fail(...args: []): void;
    fail(...args: [Msg, ...unknown[]]): void;
    /**
     * Terminates the log at the *fail* level.
     *
     * **Default Level = "fail" or 4**
     *
     * Use this for logging network communication errors
     * that do not break your application.
     *
     * This is a non-standard API.
     */
    static fail<M extends string>(...args: [M, ...unknown[]]): void;
    /**
     * Terminates the log at the *success* level.
     *
     * **Default Level = "success" or 5**
     *
     * Use this for logging successful network communication.
     *
     * This is a non-standard API.
     */
    success(...args: []): void;
    success(...args: [Msg, ...unknown[]]): void;
    /**
     * Terminates the log at the *success* level.
     *
     * **Default Level = "success" or 5**
     *
     * Use this for logging successful network communication.
     *
     * This is a non-standard API.
     */
    static success<M>(...args: [M, ...unknown[]]): void;
    /**
     * Terminates the log at the *log* level.
     *
     * **Default Level = "log" or 6**
     *
     * Use this for general logging that doesn't apply
     * to any of the lower levels.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/log)
     */
    log(...args: []): void;
    log(...args: [Msg, ...unknown[]]): void;
    /**
     * Terminates the log at the *log* level.
     *
     * **Default Level = "log" or 6**
     *
     * Use this for general logging that doesn't apply
     * to any of the lower levels.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/log)
     */
    static log<M>(args_0: M, ...args: unknown[]): void;
    /**
     * Terminates the log at the *log* level.
     *
     * **Default Level = "debug" or 7**
     *
     * Use this for general logging that doesn't apply
     * to any of the lower levels.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/log)
     */
    debug(...args: []): void;
    debug(...args: [Msg, ...unknown[]]): void;
    /**
     * Terminates the log at the *log* level.
     *
     * **Default Level = "debug" or 7**
     *
     * Use this for general logging that doesn't apply
     * to any of the lower levels.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/log)
     */
    static debug<M extends string>(...args: [M, ...unknown[]]): void;
    /**
     * Terminates the log at the *verbose* level.
     *
     * **Default Level = "verbose" or 8**
     *
     * Use this for logging extremely detailed debugging
     * information. Use this level when the values you are
     * logging are granular enough that they are no longer
     * easily human readable.
     *
     * This is a non-standard API.
     */
    verbose(...args: []): void;
    verbose(...args: [Msg, ...unknown[]]): void;
    /**
     * Terminates the log at the *verbose* level.
     *
     * **Default Level = "verbose" or 8**
     *
     * Use this for logging extremely detailed debugging
     * information. Use this level when the values you are
     * logging are granular enough that they are no longer
     * easily human readable.
     *
     * This is a non-standard API.
     */
    static verbose<M extends string>(...args: [M, ...unknown[]]): void;
    /**
     * Clears the console.
     *
     * This terminator simply exists as an alias for `console.clear()`.
     */
    clear(): void;
    /**
     * Clears the console.
     *
     * This terminator simply exists as an alias for `console.clear()`.
     */
    static clear(): void;
    /**
     * Alias for `clear()`. Clears the console.
     *
     * This terminator simply exists as an alias for `console.clear()`.
     */
    clr(): void;
    /**
     * Alias for `clear()`. Clears the console.
     *
     * This terminator simply exists as an alias for `console.clear()`.
     */
    static clr(): void;
    /**
     * Terminates the log at the provided custom log level. Custom log levels are defined within the
     * Adze configuration object under the levels property.
     */
    custom<M extends string>(levelName: string, ...args: [M, ...unknown[]]): this;
    /**
     * Terminates the log at the provided custom log level. Custom log levels are defined within the
     * Adze configuration object under the levels property.
     */
    static custom<M extends string>(levelName: string, ...args: [M, ...unknown[]]): Log;
    /**
     * Seals the configuration of a log and returns a function that
     * constructs a new log with the same configuration.
     *
     * **Example:**
     * ```javascript
     * const sealed = adze.withEmoji.ns('sealed').label('sealed-label').seal();
     * sealed.success('Success!'); // -> prints "#sealed [sealed-label] Success!"
     * sealed.log('Another log.'); // -> prints "#sealed [sealed-label] Another log."
     * ```
     */
    seal<N extends string = string, M = unknown>(_cfg?: UserConfiguration): Log<N, M>;
    /**
     * Seals the configuration of a log and returns a function that
     * constructs a new log with the same configuration.
     *
     * **Example:**
     * ```javascript
     * const sealed = adze.withEmoji.ns('sealed').label('sealed-label').seal();
     * sealed.success('Success!'); // -> prints "#sealed [sealed-label] Success!"
     * sealed.log('Another log.'); // -> prints "#sealed [sealed-label] Another log."
     * ```
     */
    static seal<N extends string = string>(cfg?: UserConfiguration): Log<N, unknown>;
    /**
     * Seals the configuration of a log and returns a template string tag function.
     *
     * Example:
     *
     * ```typescript
     * const ERR = adze.ns('foo').sealTag('error');
     * ERR`This is an error message.`; // => prints "Error #foo This is an error message."
     * ```
     */
    sealTag<T extends DefaultTerminatorMethod = DefaultTerminatorMethod>(method: T, cfg?: UserConfiguration): (strings: TemplateStringsArray, ...values: unknown[]) => void;
    /**
     * Seals the configuration of a log and returns a template string tag function.
     *
     * Example:
     *
     * ```typescript
     * const ERR = adze.ns('foo').sealTag('error');
     * ERR`This is an error message.`; // => prints "Error #foo This is an error message."
     * ```
     */
    static sealTag<T extends DefaultTerminatorMethod = DefaultTerminatorMethod>(method: T, cfg?: UserConfiguration): (strings: TemplateStringsArray, ...values: unknown[]) => void;
    /**
     * Following the MDC (Mapped Diagnostic Context) pattern, this method enables you to create a
     * thread for adding context from different scopes before finally terminating the log.
     *
     * In order to create a thread, this log must specify a label. The label identifies the shared
     * context that other logs in your thread can contribute to.
     *
     * Example:
     *
     * ```typescript
     * function add(a: number, b: number) {
     *   const answer = a + b;
     *   adze.label('maths').thread('added', { a, b, answer });
     *   return answer;
     * }
     *
     * function subtract(x: number, y: number) {
     *   const answer = x - y;
     *   adze.label('maths').thread('subtracted', { x, y, answer });
     *   return answer;
     * }
     *
     * add(1, 2);
     * subtract(4, 3);
     *
     * adze.label('maths').dump.info('Results from our thread');
     * // => prints the log with the context values from both thread logs applied.
     * ```
     */
    thread<T>(key: string, value: T): void;
    /**
     * Following the MDC (Mapped Diagnostic Context) pattern, this method enables you to create a
     * thread for adding context from different scopes before finally terminating the log.
     *
     * In order to create a thread, this log must specify a label. The label identifies the shared
     * context that other logs in your thread can contribute to.
     *
     * Example:
     *
     * ```typescript
     * function add(a, b) {
     *   const answer = a + b;
     *   adze.label('foo').thread('added', { a, b, answer });
     *   return answer;
     * }
     *
     * function subtract(x, y) {
     *   const answer = x - y;
     *   adze.label('foo').thread('subtracted', { x, y, answer });
     *   return answer;
     * }
     *
     * add(1, 2);
     * subtract(4, 3);
     *
     * adze.label('foo').dump.info('Results from our thread');
     * // => prints the log with the context values from both thread logs applied.
     * ```
     */
    static thread<T>(key: string, value: T): void;
    /**
     * Generates a log message if the provided expression is falsey.
     */
    assert(expression: boolean): this;
    /**
     * Generates a log message if the provided expression is falsey.
     */
    static assert(expression: boolean): Log;
    /**
     * Closes a thread by resetting its context.
     */
    get closeThread(): this;
    /**
     * Closes a thread by resetting its context.
     */
    static get closeThread(): Log;
    /**
     * Adds to the log count for log instances that share this log's label.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/count)
     */
    get count(): this;
    /**
     * Adds to the log count for log instances that share this log's label.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/count)
     */
    static get count(): Log<string, unknown>;
    /**
     * Unsets the count for the log instances that share this log's label.
     *
     * This is a non-standard method.
     */
    get countClear(): this;
    /**
     * Unsets the count for the log instances that share this log's label.
     *
     * This is a non-standard method.
     */
    static get countClear(): Log;
    /**
     * Resets the count for the log instances that share this log's label back to 0.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/countReset)
     */
    get countReset(): this;
    /**
     * Resets the count for the log instances that share this log's label.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/countReset)
     */
    static get countReset(): Log;
    /**
     * Instructs this log to print in the dir format. Typically this is useful
     * for rendering deeply nested objects in the console.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/dir)
     */
    get dir(): Log<string, Record<string | symbol | number, unknown>>;
    /**
     * Instructs this log to print in the dir format. Typically this is useful
     * for rendering deeply nested objects in the console.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/dir)
     */
    static get dir(): Log<string, Record<string | symbol | number, unknown>>;
    /**
     * Instructs this log to print in the dirxml format. Typically this is useful
     * for rendering HTML/DOM or XML Elements in the console.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/dirxml)
     */
    get dirxml(): Log<string, Element | XMLDocument | Node | ChildNode>;
    /**
     * Instructs this log to print in the dirxml format. Typically this is useful
     * for rendering HTML/DOM or XML Elements in the console.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/dirxml)
     */
    static get dirxml(): Log<string, Element | XMLDocument | Node | ChildNode>;
    /**
     * Instructs the log terminator to add the key/value pairs from the
     * thread context to the console output.
     *
     * This is a non-standard API.
     */
    get dump(): this;
    /**
     * Instructs the log terminator to add the key/value pairs from the
     * thread context to the console output.
     *
     * This is a non-standard API.
     */
    static get dump(): Log;
    /**
     * Instructs the logger to print according to the provided format.
     *
     * This is a non-standard API.
     */
    format(format: string): this;
    /**
     * Instructs the logger to print according to the provided format.
     *
     * This is a non-standard API.
     */
    static format(format: string): Log;
    /**
     * Starts a log group.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/group)
     */
    get group(): this;
    /**
     * Starts a log group.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/group)
     */
    static get group(): Log;
    /**
     * Starts a log group that is collapsed by default.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/groupCollapsed)
     */
    get groupCollapsed(): this;
    /**
     * Starts a log group that is collapsed by default.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/groupCollapsed)
     */
    static get groupCollapsed(): Log;
    /**
     * Ends the most recently opened log group.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/groupEnd)
     */
    get groupEnd(): Log<string, never>;
    /**
     * Ends the most recently opened log group.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/groupEnd)
     */
    static get groupEnd(): Log<string, never>;
    /**
     * Generates a log message if the provided expression is truthy.
     *
     * This is a non-standard API.
     */
    if(expression: boolean): this;
    /**
     * Generates a log message if the provided expression is truthy.
     *
     * This is a non-standard API.
     */
    static if(expression: boolean): Log;
    /**
     * DEPRECATED: Use the equivalent `if` method instead.
     *
     * @deprecated
     */
    test(expression: boolean): this;
    /**
     * DEPRECATED: Use the equivalent `if` method instead.
     *
     * @deprecated
     */
    static test(expression: boolean): Log;
    /**
     * Adds a label to the log. Label's can be used for log identification
     * and grouping. Label's also link log instances together.
     *
     * This is a non-standard API, but it replaces the need to provide
     * a label to methods that require a global identifier for tracking purposes.
     */
    label(name: string): this;
    /**
     * Adds a label to the log. Label's can be used for log identification
     * and grouping. Label's also link log instances together.
     *
     * This is a non-standard API, but it replaces the need to provide
     * a label to methods that require a global identifier for tracking purposes.
     */
    static label(name: string): Log;
    /**
     * Assign meta data to this log instance that is meant to be
     * retrievable in a log listener or from a `log.data()` dump.
     *
     * This is a non-standard API.
     */
    meta<T extends Record<string, unknown> = Record<string, unknown>>(meta: T): this;
    /**
     * Assign meta data to this log instance that is meant to be
     * retrievable in a log listener or from a `log.data()` dump.
     *
     * This is a non-standard API.
     */
    static meta<T extends Record<string, unknown> = Record<string, unknown>>(meta: T): Log;
    /**
     * Adds a namespace to the log. Namespace's are primarily useful
     * for grouping logs together. Multiple calls to namespace are
     * additive in nature.
     *
     * This is a non-standard API.
     */
    namespace(...namespace: string[]): this;
    /**
     * Adds a namespace to the log. Namespace's are primarily useful
     * for grouping logs together. Multiple calls to namespace are
     * additive in nature.
     *
     * This is a non-standard API.
     */
    static namespace(...namespace: string[]): Log;
    /**
     * Alias for the `namespace` modifier.
     *
     * Adds a namespace to the log. Namespace's are primarily useful
     * for grouping logs together. Multiple calls to namespace are
     * additive in nature.
     *
     * This is a non-standard API.
     */
    ns(...namespace: N[]): this;
    /**
     * Alias for the `namespace` modifier.
     *
     * Adds a namespace to the log. Namespace's are primarily useful
     * for grouping logs together. Multiple calls to namespace are
     * additive in nature.
     *
     * This is a non-standard API.
     */
    static ns(...namespace: string[]): Log;
    /**
     * This modifier prevents the log from printing. It can still be picked up by middleware or
     * listeners.
     */
    get silent(): this;
    /**
     * This modifier prevents the log from printing. It can still be picked up by middleware or
     * listeners.
     */
    static get silent(): Log;
    /**
     * Instructs this log to print its argument in a table format.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/table)
     */
    get table(): Log<N, TableData>;
    /**
     * Instructs this log to print its argument in a table format.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/table)
     */
    static get table(): Log<never, TableData>;
    /**
     * Starts a timer associated with this log's *label*. This will do nothing if
     * this log has no label.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/time).
     */
    get time(): this;
    /**
     * Starts a timer associated with this log's *label*. This will do nothing if
     * this log has no label.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/time).
     */
    static get time(): Log;
    /**
     * Stops a timer that was previously started by calling time() on a *labeled* log. Calculates the
     * difference between the start time and when this method was called. This then
     * modifies the log render to show the time difference. This will do nothing if the *label* does
     * not exist.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/timeEnd).
     */
    get timeEnd(): this;
    /**
     * Stops a timer that was previously started by calling time() on a *labeled* log. Calculates the
     * difference between the start time and when this method was called. This then
     * modifies the log render to show the time difference. This will do nothing if the *label* does
     * not exist.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/timeEnd).
     */
    static get timeEnd(): Log;
    /**
     * Modifies the log render to show the current high-resolution real time.
     *
     * This is a non-standard method.
     */
    get timeNow(): this;
    /**
     * Modifies the log render to show the current high-resolution real time.
     *
     * This is a non-standard method.
     */
    static get timeNow(): Log;
    /**
     * This modifier method tells the log to render a timestamp.
     *
     * This is a non-standard API.
     */
    get timestamp(): this;
    /**
     * This modifier method tells the log to render a timestamp.
     *
     * This is a non-standard API.
     */
    static get timestamp(): Log;
    /**
     * Prints a stacktrace along with the log. This does not use the standard "trace" method but
     * derives the stacktrace from the current call stack and appends it to your log.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/trace)
     */
    get trace(): this;
    /**
     * Prints a stacktrace along with the log. This does not use the standard "trace" method but
     * derives the stacktrace from the current call stack and appends it to your log.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/trace)
     */
    static get trace(): Log;
    /**
     * Allows emoji's to be printed in pretty logs.
     */
    get withEmoji(): this;
    /**
     * Allows emoji's to be printed in pretty logs.
     */
    static get withEmoji(): Log<string, unknown>;
    /**
     * Prints the log to the console.
     */
    print(data: LogData): void;
    private terminate;
    /**
     * Returns a formatter constructor based on the provided format.
     */
    private selectFormatter;
    /**
     * Returns the level configuration object based on the provided level name.
     */
    private getLevelConfig;
    /**
     * Runs the modifier queue against this instance.
     */
    private runModifierQueue;
    /**
     * Execute a middleware hook.
     */
    private doHook;
}
