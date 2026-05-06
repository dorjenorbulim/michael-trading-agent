/**
 * PDF Generator Utility
 *
 * Uses Puppeteer to convert HTML reports to PDF format with optimized settings
 * for performance reports including charts and data tables.
 *
 * Required by ticket #5790 - PDF Export Implementation
 */
/**
 * Configuration options for PDF generation
 */
export interface PdfGenerationOptions {
    /** PDF format (default: A4) */
    format?: 'A4' | 'A3' | 'Letter' | 'Legal';
    /** Include background graphics (default: true) */
    printBackground?: boolean;
    /** Page margins */
    margin?: {
        top?: string;
        right?: string;
        bottom?: string;
        left?: string;
    };
    /** Wait time for charts to render (default: 3000ms) */
    chartRenderingWaitTime?: number;
    /** Display header/footer (default: false) */
    displayHeaderFooter?: boolean;
    /** Custom header template */
    headerTemplate?: string;
    /** Custom footer template */
    footerTemplate?: string;
}
/**
 * Generate a PDF from HTML content using Puppeteer
 *
 * @param htmlContent - The complete HTML content to convert
 * @param outputPath - Path where the PDF file should be saved
 * @param options - PDF generation options
 */
export declare function generatePdfFromHtml(htmlContent: string, outputPath: string, options?: PdfGenerationOptions): Promise<void>;
/**
 * Generate PDF with default settings optimized for ElizaOS performance reports
 *
 * @param htmlContent - The HTML content to convert
 * @param outputPath - Where to save the PDF
 */
export declare function generatePerformanceReportPdf(htmlContent: string, outputPath: string): Promise<void>;
/**
 * Validate that Puppeteer can be launched (useful for health checks)
 */
export declare function validatePuppeteerInstallation(): Promise<boolean>;
/**
 * Get information about the Puppeteer installation
 */
export declare function getPuppeteerInfo(): Promise<{
    version: string;
    executablePath: string;
    isValid: boolean;
}>;
//# sourceMappingURL=pdf-generator.d.ts.map