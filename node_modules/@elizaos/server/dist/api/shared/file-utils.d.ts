/**
 * Safely constructs and validates upload directory paths to prevent path traversal attacks
 */
export declare function createSecureUploadDir(id: string, type: 'agents' | 'channels'): string;
/**
 * Sanitizes a filename by removing dangerous characters and normalizing it
 */
export declare function sanitizeFilename(filename: string): string;
/**
 * Safely cleans up a file by removing it from the filesystem
 */
export declare const cleanupFile: (filePath: string) => void;
/**
 * Cleans up multiple multer files
 */
export declare const cleanupFiles: (files: Express.Multer.File[]) => void;
/**
 * Cleans up a multer file (no-op for memory storage)
 */
export declare const cleanupUploadedFile: (file: Express.Multer.File) => void;
