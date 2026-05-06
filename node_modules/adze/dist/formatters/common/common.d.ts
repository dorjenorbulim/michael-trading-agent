import Formatter from '../formatter.js';
import { ModifierData } from '../../_types/index.js';
/**
 * Formats log messages according to the common log standard.
 *
 * https://en.wikipedia.org/wiki/Common_Log_Format
 */
export default class CommonFormatter extends Formatter {
    /**
     * Format the date in the strftime format.
     *
     * - strftime pattern: `%d/%b/%Y:%H:%M:%S %z`
     * - date-fns pattern: `dd/MMM/yyyy:HH:mm:ss xx`
     */
    protected timestampFormatFunction: (date: Date) => string;
    /**
     * Format the log message for the browser.
     */
    protected formatBrowser(mods: ModifierData, timestamp: string, args: unknown[]): unknown[];
    /**
     * Format the log message for the server environment.
     */
    protected formatServer(mods: ModifierData, timestamp: string, args: unknown[]): unknown[];
    /**
     * Format the log message according to the common log format.
     *
     * **Example:** 127.0.0.1 user-identifier frank [10/Oct/2000:13:55:36 -0700] "GET /apache_pb.gif HTTP/1.0" 200 2326
     */
    private formatMessage;
}
