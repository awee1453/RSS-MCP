import { z } from 'zod';
import { ArticleRepository } from '../database/repository.js';
import { createObjectCsvWriter } from 'csv-writer';
import { create } from 'xmlbuilder2';
import fs from 'fs';
import path from 'path';

/**
 * Input schema for rss_export tool
 */
export const RssExportInputSchema = z.object({
    format: z.enum(['json', 'csv', 'xml']).describe('Export format'),
    feed_id: z.string().optional().describe('Specific feed to export'),
    limit: z.number().default(100).describe('Number of articles to export'),
    filename: z.string().optional().describe('Output filename (without extension)')
});

/**
 * Output schema for rss_export tool
 */
export const RssExportOutputSchema = z.object({
    success: z.boolean(),
    format: z.string(),
    filepath: z.string(),
    articles_exported: z.number(),
    message: z.string()
});

export type RssExportInput = z.infer<typeof RssExportInputSchema>;
export type RssExportOutput = z.infer<typeof RssExportOutputSchema>;

/**
 * Export articles to JSON/CSV/XML
 */
export async function handleRssExport(
    input: RssExportInput,
    articleRepository: ArticleRepository
): Promise<RssExportOutput> {
    const { format, feed_id, limit, filename } = input;

    const db = articleRepository['db'];

    // Get articles
    let articles: any[];
    if (feed_id) {
        articles = db.prepare(`
      SELECT * FROM articles 
      WHERE feed_id = ? 
      ORDER BY pub_date DESC 
      LIMIT ?
    `).all(feed_id, limit) as any[];
    } else {
        articles = db.prepare(`
      SELECT * FROM articles 
      ORDER BY pub_date DESC 
      LIMIT ?
    `).all(limit) as any[];
    }

    if (articles.length === 0) {
        return {
            success: false,
            format,
            filepath: '',
            articles_exported: 0,
            message: 'No articles found to export'
        };
    }

    // Ensure exports directory exists
    const exportsDir = path.join(process.cwd(), 'exports');
    if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir, { recursive: true });
    }

    const baseFilename = filename || `rss_export_${Date.now()}`;
    let filepath: string;

    try {
        switch (format) {
            case 'json':
                filepath = path.join(exportsDir, `${baseFilename}.json`);
                fs.writeFileSync(filepath, JSON.stringify(articles, null, 2), 'utf-8');
                break;

            case 'csv':
                filepath = path.join(exportsDir, `${baseFilename}.csv`);
                const csvWriter = createObjectCsvWriter({
                    path: filepath,
                    header: [
                        { id: 'id', title: 'ID' },
                        { id: 'feed_id', title: 'Feed ID' },
                        { id: 'title', title: 'Title' },
                        { id: 'link', title: 'Link' },
                        { id: 'pub_date', title: 'Publication Date' },
                        { id: 'author', title: 'Author' },
                        { id: 'language', title: 'Language' },
                        { id: 'word_count', title: 'Word Count' },
                        { id: 'description', title: 'Description' }
                    ]
                });
                await csvWriter.writeRecords(articles);
                break;

            case 'xml':
                filepath = path.join(exportsDir, `${baseFilename}.xml`);
                const root = create({ version: '1.0', encoding: 'UTF-8' })
                    .ele('rss_export')
                    .att('generated', new Date().toISOString())
                    .att('count', articles.length);

                articles.forEach(article => {
                    const articleEle = root.ele('article');
                    Object.keys(article).forEach(key => {
                        if (article[key] !== null && article[key] !== undefined) {
                            articleEle.ele(key).txt(String(article[key]));
                        }
                    });
                });

                const xml = root.end({ prettyPrint: true });
                fs.writeFileSync(filepath, xml, 'utf-8');
                break;

            default:
                throw new Error(`Unsupported format: ${format}`);
        }

        return {
            success: true,
            format,
            filepath,
            articles_exported: articles.length,
            message: `Successfully exported ${articles.length} articles to ${format.toUpperCase()}`
        };
    } catch (error: any) {
        return {
            success: false,
            format,
            filepath: '',
            articles_exported: 0,
            message: `Export failed: ${error.message}`
        };
    }
}
