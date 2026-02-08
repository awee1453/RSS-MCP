/**
 * Export Service - Export articles to various formats (JSON, CSV, XML)
 */
import { createObjectCsvWriter } from 'csv-writer';
import * as fs from 'fs';
import * as path from 'path';

export interface ExportOptions {
    format: 'json' | 'csv' | 'xml';
    fields?: string[];
    includeMetadata?: boolean;
}

export interface ExportResult {
    success: boolean;
    filePath?: string;
    data?: string;
    recordCount: number;
    error?: string;
}

export class ExportService {
    private static readonly EXPORT_DIR = './data/exports';

    /**
     * Ensure export directory exists
     */
    private static ensureExportDir(): void {
        if (!fs.existsSync(this.EXPORT_DIR)) {
            fs.mkdirSync(this.EXPORT_DIR, { recursive: true });
        }
    }

    /**
     * Export articles to JSON
     */
    static exportToJSON(
        articles: any[],
        includeMetadata: boolean = true
    ): ExportResult {
        try {
            const data = includeMetadata
                ? {
                    metadata: {
                        exportDate: new Date().toISOString(),
                        totalRecords: articles.length,
                        format: 'json'
                    },
                    articles
                }
                : articles;

            const jsonString = JSON.stringify(data, null, 2);

            this.ensureExportDir();
            const fileName = `export_${Date.now()}.json`;
            const filePath = path.join(this.EXPORT_DIR, fileName);
            fs.writeFileSync(filePath, jsonString, 'utf-8');

            return {
                success: true,
                filePath,
                data: jsonString,
                recordCount: articles.length
            };
        } catch (error: any) {
            return {
                success: false,
                recordCount: 0,
                error: error.message
            };
        }
    }

    /**
     * Export articles to CSV
     */
    static async exportToCSV(
        articles: any[],
        fields?: string[]
    ): Promise<ExportResult> {
        try {
            if (articles.length === 0) {
                return {
                    success: false,
                    recordCount: 0,
                    error: 'No articles to export'
                };
            }

            // Determine fields from first article if not provided
            const exportFields = fields || Object.keys(articles[0]);

            this.ensureExportDir();
            const fileName = `export_${Date.now()}.csv`;
            const filePath = path.join(this.EXPORT_DIR, fileName);

            const csvWriter = createObjectCsvWriter({
                path: filePath,
                header: exportFields.map(field => ({
                    id: field,
                    title: field.toUpperCase()
                }))
            });

            // Flatten nested data
            const flattenedArticles = articles.map(article => {
                const flattened: any = {};
                exportFields.forEach(field => {
                    const value = article[field];
                    flattened[field] = Array.isArray(value)
                        ? value.join(', ')
                        : typeof value === 'object' && value !== null
                            ? JSON.stringify(value)
                            : value;
                });
                return flattened;
            });

            await csvWriter.writeRecords(flattenedArticles);

            return {
                success: true,
                filePath,
                recordCount: articles.length
            };
        } catch (error: any) {
            return {
                success: false,
                recordCount: 0,
                error: error.message
            };
        }
    }

    /**
     * Export articles to XML (simple string generation)
     */
    static exportToXML(
        articles: any[],
        includeMetadata: boolean = true
    ): ExportResult {
        try {
            let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<export>\n';

            if (includeMetadata) {
                xml += '  <metadata>\n';
                xml += `    <exportDate>${new Date().toISOString()}</exportDate>\n`;
                xml += `    <totalRecords>${articles.length}</totalRecords>\n`;
                xml += '    <format>xml</format>\n';
                xml += '  </metadata>\n';
            }

            xml += '  <articles>\n';
            articles.forEach(article => {
                xml += '    <article>\n';
                Object.entries(article).forEach(([key, value]) => {
                    if (value !== null && value !== undefined) {
                        const escapedValue = String(value)
                            .replace(/&/g, '&amp;')
                            .replace(/</g, '&lt;')
                            .replace(/>/g, '&gt;')
                            .replace(/"/g, '&quot;')
                            .replace(/'/g, '&apos;');
                        xml += `      <${key}>${escapedValue}</${key}>\n`;
                    }
                });
                xml += '    </article>\n';
            });
            xml += '  </articles>\n</export>';

            this.ensureExportDir();
            const fileName = `export_${Date.now()}.xml`;
            const filePath = path.join(this.EXPORT_DIR, fileName);
            fs.writeFileSync(filePath, xml, 'utf-8');

            return {
                success: true,
                filePath,
                data: xml,
                recordCount: articles.length
            };
        } catch (error: any) {
            return {
                success: false,
                recordCount: 0,
                error: error.message
            };
        }
    }

    /**
     * Export articles in specified format
     */
    static async export(
        articles: any[],
        options: ExportOptions
    ): Promise<ExportResult> {
        switch (options.format) {
            case 'json':
                return this.exportToJSON(articles, options.includeMetadata);
            case 'csv':
                return await this.exportToCSV(articles, options.fields);
            case 'xml':
                return this.exportToXML(articles, options.includeMetadata);
            default:
                return {
                    success: false,
                    recordCount: 0,
                    error: `Unsupported format: ${options.format}`
                };
        }
    }

    /**
     * List all export files
     */
    static listExports(): string[] {
        try {
            if (!fs.existsSync(this.EXPORT_DIR)) {
                return [];
            }

            return fs.readdirSync(this.EXPORT_DIR)
                .filter(file => /\.(json|csv|xml)$/.test(file))
                .map(file => path.join(this.EXPORT_DIR, file));
        } catch (error) {
            return [];
        }
    }

    /**
     * Delete export file
     */
    static deleteExport(filePath: string): boolean {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    }
}
