import { z } from 'zod';
import { FeedRepository } from '../database/repository.js';
import { Feed } from '../database/schema.js';

/**
 * Input schema for rss_list tool
 */
export const RssListInputSchema = z.object({});

/**
 * Output schema for rss_list tool
 */
export const RssListOutputSchema = z.object({
    feeds: z.array(z.object({
        id: z.string(),
        url: z.string(),
        title: z.string(),
        description: z.string().nullable(),
        added_date: z.string(),
        last_updated: z.string().nullable(),
        status: z.string()
    })),
    total: z.number().describe('Total number of feeds')
});

export type RssListInput = z.infer<typeof RssListInputSchema>;
export type RssListOutput = z.infer<typeof RssListOutputSchema>;

/**
 * RSS List Tool Handler
 */
export async function handleRssList(
    input: RssListInput,
    feedRepository: FeedRepository
): Promise<RssListOutput> {
    const feeds = feedRepository.findAll();

    return {
        feeds: feeds.map(feed => ({
            id: feed.id,
            url: feed.url,
            title: feed.title,
            description: feed.description,
            added_date: feed.added_date,
            last_updated: feed.last_updated,
            status: feed.status
        })),
        total: feeds.length
    };
}
