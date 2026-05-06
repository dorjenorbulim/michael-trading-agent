import Formatter from '../formatter.js';
import { addPadding, applyStyles, formatAssert, formatCount, formatIf, formatLabel, formatNamespace, initialCaps, } from '../../functions/index.js';
/**
 * Formats log messages in a pretty, human-readable manner.
 */
export default class PrettyFormatter extends Formatter {
    /**
     * Format the log message for the browser.
     */
    formatBrowser(mods, timestamp, args) {
        const leader = this.formatLeader();
        const meta = this.formatMeta(mods, timestamp);
        if (this.cfg.withEmoji) {
            return [leader, 'font-size: 12px;', this.level.style, meta, ...args];
        }
        return [leader, this.level.style, meta, ...args];
    }
    /**
     * Format the log message for the server environment.
     */
    formatServer(mods, timestamp, args) {
        const message = [];
        const leaderRaw = addPadding(this.formatLeader(false), this.cfg.withEmoji, this.level.emoji);
        const leader = `${leaderRaw} `;
        const meta = this.formatMeta(mods, timestamp);
        const styledLeader = applyStyles(leader, this.level.terminalStyle);
        message.push(styledLeader);
        meta !== '' ? message.push(meta) : null;
        return [styledLeader, meta, ...args];
    }
    /**
     * Returns a formatted leader string.
     */
    formatLeader(isBrowser = true) {
        const tag = isBrowser ? '%c' : '';
        const name = ' ' + initialCaps(this.level.levelName);
        if (this.cfg.withEmoji) {
            return `${tag}${this.formatEmoji(isBrowser)}${tag}${name}`;
        }
        return `${tag}${name}`;
    }
    /**
     * Formats the emoji if it is enabled.
     */
    formatEmoji(isBrowser) {
        const space = isBrowser ? ' ' : '';
        return this.level.emoji ? `${this.level.emoji}${space}` : '';
    }
    /**
     * Returns a formatted log meta data string. This is not data defined by the meta modifier.
     */
    formatMeta(mods, timestamp) {
        const ts = this.cfg.showTimestamp ? `${timestamp} ` : '';
        const ns = formatNamespace(mods.namespace);
        const lbl = formatLabel(mods.label);
        const time = this.formatTime(mods);
        const cnt = formatCount(mods.label?.count);
        const asrt = formatAssert(mods.assertion, this.cfg.withEmoji);
        const _if = formatIf(mods.if, this.cfg.withEmoji);
        const tst = asrt !== '' ? asrt : _if !== '' ? _if : '';
        return ts + ns + lbl + time + cnt + tst;
    }
    /**
     * Formats the time elapsed string.
     */
    formatTime(mods) {
        const timeLeader = this.cfg.withEmoji ? '⏱ ' : 'Time elapsed: ';
        if (mods.timeNow) {
            return `(${timeLeader}${mods.timeNow})`;
        }
        return mods.label?.timeElapsed ? `(${timeLeader}${mods.label.timeElapsed})` : '';
    }
}
