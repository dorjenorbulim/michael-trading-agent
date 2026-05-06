import Formatter from '../formatter.js';
import { ModifierData } from '../../_types/index.js';
/**
 * Formats log messages in a pretty, human-readable manner.
 */
export default class PrettyFormatter extends Formatter {
    /**
     * Format the log message for the browser.
     */
    protected formatBrowser(mods: ModifierData, timestamp: string, args: unknown[]): unknown[];
    /**
     * Format the log message for the server environment.
     */
    protected formatServer(mods: ModifierData, timestamp: string, args: unknown[]): unknown[];
    /**
     * Returns a formatted leader string.
     */
    private formatLeader;
    /**
     * Formats the emoji if it is enabled.
     */
    private formatEmoji;
    /**
     * Returns a formatted log meta data string. This is not data defined by the meta modifier.
     */
    private formatMeta;
    /**
     * Formats the time elapsed string.
     */
    private formatTime;
}
