import Formatter from '../formatter.js';
import { ModifierData } from '../../_types/index.js';
/**
 * Formats log messages for stdout lines.
 *
 * **Example:** `[2013-01-04T19:01:18.241Z]  INFO: myapp/40208 on banana.local: hi`
 */
export default class StandardFormatter extends Formatter {
    /**
     * Format the date in the ISO8601 format by default.
     */
    protected timestampFormatFunction: (date: Date) => string;
    /**
     * Format the log message for the browser.
     */
    protected formatBrowser(mods: ModifierData, timestamp: string, args: unknown[]): unknown[];
    /**
     * Format the log message for the server.
     */
    protected formatServer(mods: ModifierData, timestamp: string, args: unknown[]): unknown[];
    /**
     * Format the log message for stdout lines.
     */
    private formatMessage;
    /**
     * Formats the namespaces for the log message.
     */
    private formatNamespace;
}
