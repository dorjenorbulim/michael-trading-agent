import Formatter from '../formatter.js';
import { dateFormatCommon } from '../../functions/index.js';
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
    timestampFormatFunction = (date) => dateFormatCommon(date);
    /**
     * Format the log message for the browser.
     */
    formatBrowser(mods, timestamp, args) {
        return this.formatMessage(mods, timestamp, args);
    }
    /**
     * Format the log message for the server environment.
     */
    formatServer(mods, timestamp, args) {
        return this.formatMessage(mods, timestamp, args);
    }
    /**
     * Format the log message according to the common log format.
     *
     * **Example:** 127.0.0.1 user-identifier frank [10/Oct/2000:13:55:36 -0700] "GET /apache_pb.gif HTTP/1.0" 200 2326
     */
    formatMessage(_, timestamp, args) {
        if (this.cfg.meta.hostname === undefined) {
            console.warn(new Error("Adze: 'hostname' is required for the common log format. Please provide this value in your log's meta data."));
        }
        const hostname = this.cfg.meta.hostname;
        const ident = this.cfg.meta.ident ?? '-';
        const user = this.cfg.meta.user ?? '-';
        const firstArg = args[0];
        return [`${hostname} ${ident} ${user} [${timestamp}] ${firstArg}`];
    }
}
