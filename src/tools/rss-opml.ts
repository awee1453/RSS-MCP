import { z } from 'zod';
import { FeedRepository } from '../database/repository.js';
import { FeedFetcher } from '../services/fetcher.js';
import { FeedParser } from '../services/parser.js';
import { OPMLHandler } from '../services/opml-handler.js';

/**
 * Input schema for rss_opml tool
 */
export const RssOPMLInputSchema = z.object({
    action: z.enum(['import', 'export']).describe('OPML action'),
    opml_content: z.string().optional().describe('OPML content (required for import)'),
    title: z.string().default('RSS Feeds').describe('Title for exported OPML'),
    categorized: z.boolean().default(false).describe('Export with categories')
});

/**
 * Output schema for rss_opml tool
 */
export const RssOPMLOutputSchema = z.object({
    success: z.boolean(),
    opml_content: z.string().optional(),
    imported_feeds: z.array(z.object({
        title: z.string(),
        url: z.string(),
        status: z.string()
    })).optional(),
    exported_count: z.number().optional(),
    message: z.string()
});

export type RssOPMLInput = z.infer<typeof RssOPMLInputSchema>;
export type RssOPMLOutput = z.infer<typeof RssOPMLOutputSchema>;

/**
 * Import/Export feeds in OPML format
 */
export async function handleRssOPML(
    input: RssOPMLInput,
    feedRepository: FeedRepository,
    fetcher: FeedFetcher,
    parser: FeedParser
): Promise<RssOPMLOutput> {
    const { action, opml_content, title, categorized } = input;

    try {
        if (action === 'import') {
            if (!opml_content) {
                return { success: false, message: 'opml_content gerekli' };
            }

            // Parse OPML
            const parseResult = OPMLHandler.parseOPML(opml_content);
            if (parseResult.error) {
                return { success: false, message: parseResult.error };
            }

            // Import feeds
            const importResults: any[] = [];

            for (const feedData of parseResult.feeds) {
                try {
                    // Check if already exists
                    const existing = feedRepository.findByUrl(feedData.url);
                    if (existing) {
                        importResults.push({
                            title: feedData.title,
                            url: feedData.url,
                            status: 'already_exists'
                        });
                        continue;
                    }

                    // Validate and add feed
                    const xmlContent = await fetcher.fetch(feedData.url);
                    const validation = await parser.validate(xmlContent);

                    if (!validation.valid) {
                        importResults.push({
                            title: feedData.title,
                            url: feedData.url,
                            status: `error: ${validation.error}`
                        });
                        continue;
                    }

                    const parsedFeed = await parser.parse(xmlContent);
                    feedRepository.create(feedData.url, parsedFeed.title, parsedFeed.description);

                    importResults.push({
                        title: feedData.title,
                        url: feedData.url,
                        status: 'imported'
                    });

                } catch (error: any) {
                    importResults.push({
                        title: feedData.title,
                        url: feedData.url,
                        status: `error: ${error.message}`
                    });
                }
            }

            const successCount = importResults.filter(r => r.status === 'imported').length;

            return {
                success: true,
                imported_feeds: importResults,
                message: `${successCount}/${parseResult.feeds.length} feed başarıyla import edildi`
            };

        } else { // export
            const feeds = feedRepository.findAll();

            let opmlContent: string;

            if (categorized) {
                // Group by categories (simplified - just group by status)
                const feedsByCategory: { [key: string]: any[] } = {
                    'Active': feeds.filter(f => f.status === 'active'),
                    'Error': feeds.filter(f => f.status === 'error'),
                    'Pending': feeds.filter(f => f.status === 'pending')
                };

                opmlContent = OPMLHandler.generateCategorizedOPML(feedsByCategory, title);
            } else {
                opmlContent = OPMLHandler.generateOPML(feeds, title);
            }

            return {
                success: true,
                opml_content: opmlContent,
                exported_count: feeds.length,
                message: `${feeds.length} feed başarıyla export edildi`
            };
        }

    } catch (error: any) {
        return {
            success: false,
            message: `Hata: ${error.message}`
        };
    }
}
