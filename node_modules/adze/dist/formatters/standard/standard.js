import Formatter from '../formatter.js';
import { dateFormatISO, isNumber, isObject, isString } from '../../functions/index.js';
/**
 * Formats log messages for stdout lines.
 *
 * **Example:** `[2013-01-04T19:01:18.241Z]  INFO: myapp/40208 on banana.local: hi`
 */
export default class StandardFormatter extends Formatter {
    /**
     * Format the date in the ISO8601 format by default.
     */
    timestampFormatFunction = (date) => dateFormatISO(date);
    /**
     * Format the log message for the browser.
     */
    formatBrowser(mods, timestamp, args) {
        return this.formatMessage(timestamp, mods, args);
    }
    /**
     * Format the log message for the server.
     */
    formatServer(mods, timestamp, args) {
        return this.formatMessage(timestamp, mods, args);
    }
    /**
     * Format the log message for stdout lines.
     */
    formatMessage(timestamp, mods, args) {
        let leader = '';
        const { appname, hostname, port } = this.cfg.meta;
        const _port = isNumber(port) ? `/${port}` : '';
        const appPort = isString(appname) ? `${appname}${_port}` : '';
        const _host = isString(hostname) ? ` on ${hostname}: ` : '';
        const namespace = this.formatNamespace(mods.namespace);
        const label = mods.label ? `[${mods.label.name}] ` : '';
        leader = `${appPort}${_host}${namespace}${label}`;
        return [
            `[${timestamp}] ${this.level.levelName.toUpperCase()}: ${leader}${args[0]} `,
            args
                .map((arg) => (isObject(arg) ? JSON.stringify(arg) : arg))
                .slice(1)
                .join(' '),
        ];
    }
    /**
     * Formats the namespaces for the log message.
     */
    formatNamespace(namespace) {
        if (namespace && namespace.length > 0) {
            const str = namespace.reduce((acc, mod, index) => {
                return index === namespace.length - 1 ? `${acc}${mod}` : `${acc}${mod}/`;
            }, '');
            return `${str} `;
        }
        return '';
    }
}
