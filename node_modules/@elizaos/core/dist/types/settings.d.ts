/**
 * Interface representing settings with string key-value pairs.
 */
export interface RuntimeSettings {
    [key: string]: string | undefined;
}
export interface Setting {
    name: string;
    description: string;
    usageDescription: string;
    value: string | boolean | null;
    required: boolean;
    public?: boolean;
    secret?: boolean;
    validation?: (value: string | boolean | null) => boolean;
    dependsOn?: string[];
    onSetAction?: (value: string | boolean | null) => string;
    visibleIf?: (settings: {
        [key: string]: Setting;
    }) => boolean;
}
export interface WorldSettings {
    [key: string]: Setting;
}
export interface OnboardingConfig {
    settings: {
        [key: string]: Omit<Setting, 'value'>;
    };
}
//# sourceMappingURL=settings.d.ts.map