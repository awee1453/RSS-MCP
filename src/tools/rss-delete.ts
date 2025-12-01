import { z } from 'zod';
import { FeedRepository, ArticleRepository } from '../database/repository.js';

/**
 * Input schema for rss_delete tool
 */
export const RssDeleteInputSchema = z.object({
    feed_id: z.string().describe('Feed ID to delete'),
    confirm: z.boolean().default(false).describe('Confirmation flag (must be true)')
});

/**
 * Output schema for rss_delete tool
 */
export const RssDeleteOutputSchema = z.object({
    success: z.boolean(),
    feed_id: z.string(),
    feed_title: z.string().optional(),
    articles_deleted: z.number(),
    message: z.string()
});

export type RssDeleteInput = z.infer<typeof RssDeleteInputSchema>;
export type RssDeleteOutput = z.infer<typeof RssDeleteOutputSchema>;

/**
 * Delete a feed and all its articles
 */
export async function handleRssDelete(
    input: RssDeleteInput,
    feedRepository: FeedRepository,
    articleRepository: ArticleRepository
): Promise<RssDeleteOutput> {
    const { feed_id, confirm } = input;

    // Safety check
    if (!confirm) {
        return {
            success: false,
            feed_id,
            articles_deleted: 0,
            message: 'Deletion not confirmed. Set confirm=true to proceed.'
        };
    }

    // Get feed
    const feed = feedRepository.findById(feed_id);
    if (!feed) {
        return {
            success: false,
            feed_id,
            articles_deleted: 0,
            message: 'Feed not found'
        };
    }

    // Count articles before deletion
    const articleCount = articleRepository.countByFeedId(feed_id);

    try {
        // Delete articles (CASCADE will handle this, but we do it explicitly for count)
        articleRepository.deleteByFeedId(feed_id);

        // Delete feed
        feedRepository.delete(feed_id);

        return {
            success: true,
            feed_id,
            feed_title: feed.title,
            articles_deleted: articleCount,
            message: `Successfully deleted feed "${feed.title}" and ${articleCount} articles`
        };
    } catch (error: any) {
        return {
            success: false,
            feed_id,
            feed_title: feed.title,
            articles_deleted: 0,
            message: `Deletion failed: ${error.message}`
        };
    }
}
