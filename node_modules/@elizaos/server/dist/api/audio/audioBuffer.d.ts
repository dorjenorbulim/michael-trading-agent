/**
 * Determines the appropriate MIME type for audio data based on its format.
 * Detects WAV files by checking for the RIFF header signature.
 *
 * @param audioBuffer - The audio data buffer to check
 * @returns The appropriate MIME type string
 */
export declare function getAudioMimeType(audioBuffer: Buffer): string;
/**
 * Result of audio processing containing the buffer and MIME type
 */
export interface AudioProcessingResult {
    buffer: Buffer;
    mimeType: string;
}
export declare function convertToAudioBuffer(speechResponse: any): Promise<Buffer>;
export declare function convertToAudioBuffer(speechResponse: any, detectMimeType: true): Promise<AudioProcessingResult>;
