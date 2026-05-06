import multer from 'multer';
export declare function generateSecureFilename(originalName: string): string;
export declare function ensureUploadDir(id: string, type: 'agents' | 'channels'): string;
export declare const agentAudioUpload: () => multer.Multer;
export declare const agentMediaUpload: () => multer.Multer;
export declare const channelUpload: () => multer.Multer;
export declare const genericUpload: () => multer.Multer;
export declare const upload: () => multer.Multer;
export declare function validateAudioFile(file: Express.Multer.File): boolean;
export declare function validateMediaFile(file: Express.Multer.File): boolean;
export declare function processUploadedFile(file: Express.Multer.File, targetId: string, type: 'agents' | 'channels'): Promise<{
    filename: string;
    path: string;
    url: string;
}>;
