import { Configuration } from './configuration.js';
import { captureTimeNow, formatTime, hrtime, isMethodWithArgs, stacktrace, cleanMessage, isTestEnvironment, SealedLog, getGlobal, } from './functions/index.js';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isCallback(maybeFunction) {
    return typeof maybeFunction === 'function';
}
export default class Log {
    /**
     * The global context object.
     */
    globalStore;
    /**
     * The configuration for the adze log.
     */
    _cfg;
    /**
     * Incomplete log data.
     */
    _modifierData;
    /**
     * The log data object.
     */
    _data;
    /**
     * Queue up modifiers to ensure they are in the correct order when executed.
     */
    modifierQueue = [];
    constructor(cfg, modifierData) {
        this.globalStore = getGlobal(cfg);
        this._modifierData = modifierData ?? {};
        this._cfg = new Configuration(cfg);
        this.doHook((m) => {
            if (m.constructed)
                m.constructed(this);
        });
    }
    ////////////////////////////////////////////////////////
    // Getters and Setters
    ////////////////////////////////////////////////////////
    get data() {
        return this._data;
    }
    get modifierData() {
        return this._modifierData;
    }
    get configuration() {
        return this._cfg;
    }
    alert(...args) {
        this.terminate('alert', args);
    }
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
    static alert(...args) {
        new this().alert(...args);
    }
    error(...args) {
        this.terminate('error', args);
    }
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
    static error(...args) {
        new this().error(...args);
    }
    warn(...args) {
        this.terminate('warn', args);
    }
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
    static warn(...args) {
        new this().warn(...args);
    }
    info(...args) {
        this.terminate('info', args);
    }
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
    static info(...args) {
        new this().info(...args);
    }
    fail(...args) {
        this.terminate('fail', args);
    }
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
    static fail(...args) {
        new this().fail(...args);
    }
    success(...args) {
        this.terminate('success', args);
    }
    /**
     * Terminates the log at the *success* level.
     *
     * **Default Level = "success" or 5**
     *
     * Use this for logging successful network communication.
     *
     * This is a non-standard API.
     */
    static success(...args) {
        new this().success(...args);
    }
    log(...args) {
        this.terminate('log', args);
    }
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
    static log(args_0, ...args) {
        new this().log(...[args_0, ...args]);
    }
    debug(...args) {
        this.terminate('debug', args);
    }
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
    static debug(...args) {
        new this().debug(...args);
    }
    verbose(...args) {
        this.terminate('verbose', args);
    }
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
    static verbose(...args) {
        new this().verbose(...args);
    }
    /**
     * Clears the console.
     *
     * This terminator simply exists as an alias for `console.clear()`.
     */
    clear() {
        console.clear();
    }
    /**
     * Clears the console.
     *
     * This terminator simply exists as an alias for `console.clear()`.
     */
    static clear() {
        console.clear();
    }
    /**
     * Alias for `clear()`. Clears the console.
     *
     * This terminator simply exists as an alias for `console.clear()`.
     */
    clr() {
        console.clear();
    }
    /**
     * Alias for `clear()`. Clears the console.
     *
     * This terminator simply exists as an alias for `console.clear()`.
     */
    static clr() {
        console.clear();
    }
    /**
     * Terminates the log at the provided custom log level. Custom log levels are defined within the
     * Adze configuration object under the levels property.
     */
    custom(levelName, ...args) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!this._cfg.levels[levelName]) {
            console.warn(new Error('Custom log level not found in configuration.'));
            return this;
        }
        this.terminate(levelName, args);
        return this;
    }
    /**
     * Terminates the log at the provided custom log level. Custom log levels are defined within the
     * Adze configuration object under the levels property.
     */
    static custom(levelName, ...args) {
        return new this().custom(levelName, ...args);
    }
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
    seal(_cfg) {
        if (_cfg)
            this._cfg.updateConfiguration(_cfg);
        return SealedLog((Log), this._cfg, this.modifierData, this.modifierQueue);
    }
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
    static seal(cfg) {
        return new this().seal(cfg);
    }
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
    sealTag(method, cfg) {
        this._cfg = new Configuration({ ...this._cfg.exportValues(), ...cfg });
        return (strings, ...values) => {
            const message = String.raw({ raw: strings }, ...values);
            const sealed = SealedLog((Log), this._cfg, this.modifierData, this.modifierQueue);
            const _method = method;
            if (isCallback(sealed[_method])) {
                sealed[_method](message);
            }
        };
    }
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
    static sealTag(method, cfg) {
        return new this().sealTag(method, cfg);
    }
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
    thread(key, value) {
        this.runModifierQueue();
        if (this._modifierData.label) {
            if (!this._modifierData.label.context)
                this._modifierData.label.context = {};
            this._modifierData.label.context = { ...this._modifierData.label.context, [key]: value };
        }
    }
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
    static thread(key, value) {
        new this().thread(key, value);
    }
    ////////////////////////////////////////////////////////
    // Modifiers
    ////////////////////////////////////////////////////////
    /**
     * Generates a log message if the provided expression is falsey.
     */
    assert(expression) {
        this.modifierQueue.push([
            'assert',
            (data) => {
                data.assertion = expression;
                return data;
            },
        ]);
        return this;
    }
    /**
     * Generates a log message if the provided expression is falsey.
     */
    static assert(expression) {
        return new this().assert(expression);
    }
    /**
     * Closes a thread by resetting its context.
     */
    get closeThread() {
        this.modifierQueue.push([
            'closeThread',
            (data) => {
                if (data.label?.context) {
                    data.label.context = undefined;
                }
                return data;
            },
        ]);
        return this;
    }
    /**
     * Closes a thread by resetting its context.
     */
    static get closeThread() {
        return new this().closeThread;
    }
    /**
     * Adds to the log count for log instances that share this log's label.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/count)
     */
    get count() {
        this.modifierQueue.push([
            'count',
            (data) => {
                if (data.label) {
                    data.label.count = data.label.count !== undefined ? data.label.count + 1 : 1;
                }
                return data;
            },
        ]);
        return this;
    }
    /**
     * Adds to the log count for log instances that share this log's label.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/count)
     */
    static get count() {
        return new this().count;
    }
    /**
     * Unsets the count for the log instances that share this log's label.
     *
     * This is a non-standard method.
     */
    get countClear() {
        this.modifierQueue.push([
            'countClear',
            (data) => {
                if (data.label) {
                    delete data.label.count;
                }
                return data;
            },
        ]);
        return this;
    }
    /**
     * Unsets the count for the log instances that share this log's label.
     *
     * This is a non-standard method.
     */
    static get countClear() {
        return new this().countClear;
    }
    /**
     * Resets the count for the log instances that share this log's label back to 0.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/countReset)
     */
    get countReset() {
        this.modifierQueue.push([
            'countReset',
            (data) => {
                if (data.label) {
                    data.label.count = 0;
                }
                return data;
            },
        ]);
        return this;
    }
    /**
     * Resets the count for the log instances that share this log's label.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/countReset)
     */
    static get countReset() {
        return new this().countReset;
    }
    /**
     * Instructs this log to print in the dir format. Typically this is useful
     * for rendering deeply nested objects in the console.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/dir)
     */
    get dir() {
        this.modifierQueue.push([
            'dir',
            (data) => {
                data.method = 'dir';
                return data;
            },
        ]);
        return this;
    }
    /**
     * Instructs this log to print in the dir format. Typically this is useful
     * for rendering deeply nested objects in the console.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/dir)
     */
    static get dir() {
        return new this().dir;
    }
    /**
     * Instructs this log to print in the dirxml format. Typically this is useful
     * for rendering HTML/DOM or XML Elements in the console.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/dirxml)
     */
    get dirxml() {
        this.modifierQueue.push([
            'dirxml',
            (data) => {
                data.method = 'dirxml';
                return data;
            },
        ]);
        return this;
    }
    /**
     * Instructs this log to print in the dirxml format. Typically this is useful
     * for rendering HTML/DOM or XML Elements in the console.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/dirxml)
     */
    static get dirxml() {
        return new this().dirxml;
    }
    /**
     * Instructs the log terminator to add the key/value pairs from the
     * thread context to the console output.
     *
     * This is a non-standard API.
     */
    get dump() {
        this.modifierQueue.push([
            'dump',
            (data, ctxt) => {
                ctxt._cfg.dump = true;
                return data;
            },
        ]);
        return this;
    }
    /**
     * Instructs the log terminator to add the key/value pairs from the
     * thread context to the console output.
     *
     * This is a non-standard API.
     */
    static get dump() {
        return new this().dump;
    }
    /**
     * Instructs the logger to print according to the provided format.
     *
     * This is a non-standard API.
     */
    format(format) {
        this.modifierQueue.push([
            'format',
            (data, ctxt) => {
                if (Object.keys(ctxt._cfg.formatters).includes(format)) {
                    ctxt._cfg.format = format;
                    return data;
                }
                console.warn(new Error(`Adze: Formatter "${format}" not found in configuration.`));
                return data;
            },
        ]);
        return this;
    }
    /**
     * Instructs the logger to print according to the provided format.
     *
     * This is a non-standard API.
     */
    static format(format) {
        return new this().format(format);
    }
    /**
     * Starts a log group.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/group)
     */
    get group() {
        this.modifierQueue.push([
            'group',
            (data) => {
                data.method = 'group';
                return data;
            },
        ]);
        return this;
    }
    /**
     * Starts a log group.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/group)
     */
    static get group() {
        return new this().group;
    }
    /**
     * Starts a log group that is collapsed by default.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/groupCollapsed)
     */
    get groupCollapsed() {
        this.modifierQueue.push([
            'groupCollapsed',
            (data) => {
                data.method = 'groupCollapsed';
                return data;
            },
        ]);
        return this;
    }
    /**
     * Starts a log group that is collapsed by default.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/groupCollapsed)
     */
    static get groupCollapsed() {
        return new this().groupCollapsed;
    }
    /**
     * Ends the most recently opened log group.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/groupEnd)
     */
    get groupEnd() {
        this.modifierQueue.push([
            'groupEnd',
            (data) => {
                data.method = 'groupEnd';
                return data;
            },
        ]);
        return this;
    }
    /**
     * Ends the most recently opened log group.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/groupEnd)
     */
    static get groupEnd() {
        return new this().groupEnd;
    }
    /**
     * Generates a log message if the provided expression is truthy.
     *
     * This is a non-standard API.
     */
    if(expression) {
        this.modifierQueue.push([
            'if',
            (data) => {
                data.if = expression;
                return data;
            },
        ]);
        return this;
    }
    /**
     * Generates a log message if the provided expression is truthy.
     *
     * This is a non-standard API.
     */
    static if(expression) {
        return new this().if(expression);
    }
    /**
     * DEPRECATED: Use the equivalent `if` method instead.
     *
     * @deprecated
     */
    test(expression) {
        return this.if(expression);
    }
    /**
     * DEPRECATED: Use the equivalent `if` method instead.
     *
     * @deprecated
     */
    static test(expression) {
        return new this().if(expression);
    }
    /**
     * Adds a label to the log. Label's can be used for log identification
     * and grouping. Label's also link log instances together.
     *
     * This is a non-standard API, but it replaces the need to provide
     * a label to methods that require a global identifier for tracking purposes.
     */
    label(name) {
        // prepend the modifier queue
        this.modifierQueue.unshift([
            'label',
            (data) => {
                const label = this.globalStore.getLabel(name) ?? { name };
                data.label = label;
                this.globalStore.setLabel(name, label);
                return data;
            },
        ]);
        return this;
    }
    /**
     * Adds a label to the log. Label's can be used for log identification
     * and grouping. Label's also link log instances together.
     *
     * This is a non-standard API, but it replaces the need to provide
     * a label to methods that require a global identifier for tracking purposes.
     */
    static label(name) {
        return new this().label(name);
    }
    /**
     * Assign meta data to this log instance that is meant to be
     * retrievable in a log listener or from a `log.data()` dump.
     *
     * This is a non-standard API.
     */
    meta(meta) {
        this.modifierQueue.push([
            'meta',
            (data, ctxt) => {
                ctxt._cfg.meta = { ...ctxt._cfg.meta, ...meta };
                return data;
            },
        ]);
        return this;
    }
    /**
     * Assign meta data to this log instance that is meant to be
     * retrievable in a log listener or from a `log.data()` dump.
     *
     * This is a non-standard API.
     */
    static meta(meta) {
        return new this().meta(meta);
    }
    /**
     * Adds a namespace to the log. Namespace's are primarily useful
     * for grouping logs together. Multiple calls to namespace are
     * additive in nature.
     *
     * This is a non-standard API.
     */
    namespace(...namespace) {
        this.modifierQueue.push([
            'namespace',
            (data) => {
                const arr = data.namespace ?? [];
                data.namespace = arr.length > 0 ? [...arr, ...namespace] : namespace;
                return data;
            },
        ]);
        return this;
    }
    /**
     * Adds a namespace to the log. Namespace's are primarily useful
     * for grouping logs together. Multiple calls to namespace are
     * additive in nature.
     *
     * This is a non-standard API.
     */
    static namespace(...namespace) {
        return new this().namespace(...namespace);
    }
    /**
     * Alias for the `namespace` modifier.
     *
     * Adds a namespace to the log. Namespace's are primarily useful
     * for grouping logs together. Multiple calls to namespace are
     * additive in nature.
     *
     * This is a non-standard API.
     */
    ns(...namespace) {
        return this.namespace(...namespace);
    }
    /**
     * Alias for the `namespace` modifier.
     *
     * Adds a namespace to the log. Namespace's are primarily useful
     * for grouping logs together. Multiple calls to namespace are
     * additive in nature.
     *
     * This is a non-standard API.
     */
    static ns(...namespace) {
        return new this().namespace(...namespace);
    }
    /**
     * This modifier prevents the log from printing. It can still be picked up by middleware or
     * listeners.
     */
    get silent() {
        this.modifierQueue.push([
            'silent',
            (data, ctxt) => {
                ctxt._cfg.silent = true;
                return data;
            },
        ]);
        return this;
    }
    /**
     * This modifier prevents the log from printing. It can still be picked up by middleware or
     * listeners.
     */
    static get silent() {
        return new this().silent;
    }
    /**
     * Instructs this log to print its argument in a table format.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/table)
     */
    get table() {
        this.modifierQueue.push([
            'table',
            (data) => {
                data.method = 'table';
                return data;
            },
        ]);
        return this;
    }
    /**
     * Instructs this log to print its argument in a table format.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/table)
     */
    static get table() {
        return new this().table;
    }
    /**
     * Starts a timer associated with this log's *label*. This will do nothing if
     * this log has no label.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/time).
     */
    get time() {
        this.modifierQueue.push([
            'time',
            (data) => {
                const timeStart = hrtime();
                if (data.label) {
                    data.label.timeStart = timeStart;
                }
                return data;
            },
        ]);
        return this;
    }
    /**
     * Starts a timer associated with this log's *label*. This will do nothing if
     * this log has no label.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/time).
     */
    static get time() {
        return new this().time;
    }
    /**
     * Stops a timer that was previously started by calling time() on a *labeled* log. Calculates the
     * difference between the start time and when this method was called. This then
     * modifies the log render to show the time difference. This will do nothing if the *label* does
     * not exist.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/timeEnd).
     */
    get timeEnd() {
        this.modifierQueue.push([
            'timeEnd',
            (data) => {
                if (data.label?.timeStart) {
                    data.label.timeElapsed = formatTime(hrtime(data.label.timeStart));
                }
                return data;
            },
        ]);
        return this;
    }
    /**
     * Stops a timer that was previously started by calling time() on a *labeled* log. Calculates the
     * difference between the start time and when this method was called. This then
     * modifies the log render to show the time difference. This will do nothing if the *label* does
     * not exist.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/timeEnd).
     */
    static get timeEnd() {
        return new this().timeEnd;
    }
    /**
     * Modifies the log render to show the current high-resolution real time.
     *
     * This is a non-standard method.
     */
    get timeNow() {
        this.modifierQueue.push([
            'timeNow',
            (data) => {
                data.timeNow = captureTimeNow();
                return data;
            },
        ]);
        return this;
    }
    /**
     * Modifies the log render to show the current high-resolution real time.
     *
     * This is a non-standard method.
     */
    static get timeNow() {
        return new this().timeNow;
    }
    /**
     * This modifier method tells the log to render a timestamp.
     *
     * This is a non-standard API.
     */
    get timestamp() {
        this.modifierQueue.push([
            'timestamp',
            (data, ctxt) => {
                ctxt._cfg.showTimestamp = true;
                return data;
            },
        ]);
        return this;
    }
    /**
     * This modifier method tells the log to render a timestamp.
     *
     * This is a non-standard API.
     */
    static get timestamp() {
        return new this().timestamp;
    }
    /**
     * Prints a stacktrace along with the log. This does not use the standard "trace" method but
     * derives the stacktrace from the current call stack and appends it to your log.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/trace)
     */
    get trace() {
        this.modifierQueue.push([
            'trace',
            (data) => {
                data.stacktrace = stacktrace();
                return data;
            },
        ]);
        return this;
    }
    /**
     * Prints a stacktrace along with the log. This does not use the standard "trace" method but
     * derives the stacktrace from the current call stack and appends it to your log.
     *
     * MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/trace)
     */
    static get trace() {
        return new this().trace;
    }
    /**
     * Allows emoji's to be printed in pretty logs.
     */
    get withEmoji() {
        this.modifierQueue.push([
            'withEmoji',
            (data, ctxt) => {
                ctxt._cfg.withEmoji = true;
                return data;
            },
        ]);
        return this;
    }
    /**
     * Allows emoji's to be printed in pretty logs.
     */
    static get withEmoji() {
        return new this().withEmoji;
    }
    ////////////////////////////////////////////////////////
    // Public Utility Methods
    ////////////////////////////////////////////////////////
    /**
     * Prints the log to the console.
     */
    print(data) {
        // Skip printing if the Adze environment is set to test.
        if (isTestEnvironment())
            return;
        // Don't print if it is configured to be silent.
        if (data.silent)
            return;
        // If no message, skip.
        if (data.message.length < 1)
            return;
        // Only print the message with arguments if it is using a method that allows arguments.
        if (isMethodWithArgs(data.method)) {
            console[data.method](...data.message);
        }
        else {
            console[data.method]();
        }
    }
    ////////////////////////////////////////////////////////
    // Private Methods
    ////////////////////////////////////////////////////////
    terminate(terminator, args) {
        // Run the beforeTerminated middleware hooks
        this.doHook((m) => {
            if (m.beforeTerminated)
                m.beforeTerminated(this, terminator, args);
        });
        // Run the modifier queue to modify the data object.
        this.runModifierQueue();
        // Get the level configuration based on the level name.
        const level = this.getLevelConfig(terminator);
        // Get the log formatter
        const formatterConstructor = this.selectFormatter(this._cfg.format);
        // Instantiate the formatter.
        const formatter = new formatterConstructor(this._cfg, level);
        // Generate the timestamp. Use the user configured formatter if it is set.
        const timestamp = formatter.timestampFormatter(new Date());
        // Create our final log data object
        let message = cleanMessage(formatter.print(this.modifierData, timestamp, args));
        // If dump is enabled, add the context to the message.
        if (this._cfg.dump && this.modifierData.label?.context) {
            message.push(this.modifierData.label.context);
        }
        this.doHook((m) => {
            if (m.beforeFormatApplied) {
                // Update the message
                message = m.beforeFormatApplied(this, this._cfg.format, message);
            }
        });
        const { activeLevel, cache, cacheSize, dump, format, meta, showTimestamp, silent, withEmoji } = this._cfg;
        const data = {
            activeLevel,
            cache,
            cacheSize,
            dump,
            format,
            meta,
            showTimestamp,
            silent,
            withEmoji,
            ...level,
            ...this._modifierData,
            terminator,
            args,
            timestamp,
            message,
        };
        this.doHook((m) => {
            if (m.afterFormatApplied)
                m.afterFormatApplied(this, this._cfg.format, message);
        });
        // save the data to this instance
        this._data = data;
        if (this._cfg.cache) {
            this.globalStore.addLogToCache(this);
        }
        this.doHook((m) => {
            if (m.beforePrint)
                m.beforePrint(this);
        });
        // Print the log to the console.
        this.print(this._data);
        this.doHook((m) => {
            if (m.afterTerminated)
                m.afterTerminated(this, terminator, args);
        });
        // Fire all of the log listeners and pass this log instance to them.
        this.globalStore.getListeners(level.level).forEach((listener) => {
            listener(this);
        });
    }
    /**
     * Returns a formatter constructor based on the provided format.
     */
    selectFormatter(format) {
        return this._cfg.formatters[format];
    }
    /**
     * Returns the level configuration object based on the provided level name.
     */
    getLevelConfig(levelName) {
        return this._cfg.levels[levelName];
    }
    /**
     * Runs the modifier queue against this instance.
     */
    runModifierQueue() {
        this.modifierQueue.forEach(([modName, modFunc]) => {
            const result = modFunc(this.modifierData, this);
            this.doHook((m) => {
                if (m.beforeModifierApplied)
                    m.beforeModifierApplied(this, modName, result);
            });
            this._modifierData = result;
            this.doHook((m) => {
                if (m.afterModifierApplied)
                    m.afterModifierApplied(this, modName, result);
            });
        });
    }
    /**
     * Execute a middleware hook.
     */
    doHook(cb) {
        this._cfg.middleware?.forEach((middleware) => {
            cb(middleware);
        });
    }
}
