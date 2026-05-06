/**
 * Cross-platform emoji handler that provides fallbacks for terminals that don't support emojis
 */
export interface EmojiConfig {
    /** Use emojis when supported */
    enabled: boolean;
    /** Force disable emojis (for testing or user preference) */
    forceDisable: boolean;
}
/**
 * Emoji definitions with fallbacks
 */
declare const EMOJIS: {
    readonly success: {
        readonly emoji: "✅";
        readonly fallback: "[OK]";
    };
    readonly error: {
        readonly emoji: "❌";
        readonly fallback: "[ERROR]";
    };
    readonly warning: {
        readonly emoji: "⚠️";
        readonly fallback: "[WARNING]";
    };
    readonly info: {
        readonly emoji: "ℹ️";
        readonly fallback: "[INFO]";
    };
    readonly rocket: {
        readonly emoji: "🚀";
        readonly fallback: ">>";
    };
    readonly sparkles: {
        readonly emoji: "✨";
        readonly fallback: "*";
    };
    readonly party: {
        readonly emoji: "🎉";
        readonly fallback: "[DONE]";
    };
    readonly package: {
        readonly emoji: "📦";
        readonly fallback: "[PKG]";
    };
    readonly link: {
        readonly emoji: "🔗";
        readonly fallback: "[LINK]";
    };
    readonly lightbulb: {
        readonly emoji: "💡";
        readonly fallback: "[TIP]";
    };
    readonly clipboard: {
        readonly emoji: "📋";
        readonly fallback: "[LIST]";
    };
    readonly penguin: {
        readonly emoji: "🐧";
        readonly fallback: "[LINUX]";
    };
    readonly globe: {
        readonly emoji: "🌐";
        readonly fallback: "[WEB]";
    };
    readonly rightArrow: {
        readonly emoji: "→";
        readonly fallback: "->";
    };
    readonly bullet: {
        readonly emoji: "•";
        readonly fallback: "*";
    };
};
export type EmojiKey = keyof typeof EMOJIS;
/**
 * Get an emoji with appropriate fallback
 */
export declare function getEmoji(key: EmojiKey): string;
/**
 * Configure emoji behavior
 */
export declare function configureEmojis(newConfig: Partial<EmojiConfig>): void;
/**
 * Get current emoji configuration
 */
export declare function getEmojiConfig(): EmojiConfig;
/**
 * Check if emojis are currently enabled and supported
 */
export declare function areEmojisEnabled(): boolean;
/**
 * Format a message with an emoji prefix
 */
export declare function withEmoji(key: EmojiKey, message: string, spacing?: boolean): string;
/**
 * Utility functions for common patterns
 */
export declare const emoji: {
    success: (msg: string) => string;
    error: (msg: string) => string;
    warning: (msg: string) => string;
    info: (msg: string) => string;
    rocket: (msg: string) => string;
    package: (msg: string) => string;
    link: (msg: string) => string;
    tip: (msg: string) => string;
    list: (msg: string) => string;
    penguin: (msg: string) => string;
    bullet: (msg: string) => string;
};
/**
 * Auto-detect and initialize emoji support on module load
 */
export declare function initializeEmojiSupport(): void;
export {};
//# sourceMappingURL=emoji-handler.d.ts.map