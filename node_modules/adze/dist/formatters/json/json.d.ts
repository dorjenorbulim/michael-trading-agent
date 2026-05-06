import { ModifierData } from '../../_types/index.js';
import Formatter from '../formatter.js';
/**
 * Formats log messages in machine-readable JSON format.
 */
export default class JsonFormatter extends Formatter {
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
     * Format the log message for NDJSON lines.
     */
    private formatMessage;
}
