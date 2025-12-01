import { z } from 'zod';
import { ArticleRepository, FeedRepository } from '../database/repository.js';
import { ContentAnalyzer } from '../services/analyzer.js';
import { formatArticleWithRTL } from '../utils/text-utils.js';

/**
 * Input schema for rss_news tool
 */
export const RssNewsInputSchema = z.object({
    feed_id: z.string().describe('Feed ID to get news from'),
    limit: z.number().default(20).describe('Number of articles to return'),
    offset: z.number().default(0).describe('Offset for pagination')
});

/**
 * Output schema for rss_news tool
 */
export const RssNewsOutputSchema = z.object({
    articles: z.array(z.object({
        id: z.string(),
        title: z.string(),
        title_direction: z.enum(['rtl', 'ltr']).describe('Text direction for title'),
        link: z.string(),
        pub_date: z.string(),
        summary: z.string(),
        summary_direction: z.enum(['rtl', 'ltr']).describe('Text direction for summary'),
        author: z.string().nullable(),
        categories: z.array(z.string()),
        language: z.string().describe('Detected language code')
    })),
    total: z.number().describe('Total number of articles available'),
    feed_title: z.string().describe('Title of the feed')
});

export type RssNewsInput = z.infer<typeof RssNewsInputSchema>;
export type RssNewsOutput = z.infer<typeof RssNewsOutputSchema>;

/**
 * RSS News Tool Handler
 */
export async function handleRssNews(
    input: RssNewsInput,
    articleRepository: ArticleRepository,
    feedRepository: FeedRepository
): Promise<RssNewsOutput> {
    const { feed_id, limit, offset } = input;

    // Get feed info
    const feed = feedRepository.findById(feed_id);
    if (!feed) {
        throw new Error('Feed bulunamadı');
    }

    // Get articles
    const articles = articleRepository.findByFeedId(feed_id, limit, offset);
    const total = articleRepository.countByFeedId(feed_id);

    return {
        articles: articles.map(article => {
            // Parse categories
            let categories: string[] = [];
            try {
                categories = article.categories ? JSON.parse(article.categories) : [];
            } catch {
                categories = [];
            }

            // Generate summary
            const summary = ContentAnalyzer.summarize(
                article.description || article.content || article.title,
                2
            );

            // Format with RTL support
            return formatArticleWithRTL({
                id: article.id,
                title: article.title,
                link: article.link,
                pub_date: article.pub_date,
                summary,
                author: article.author,
                categories
            });
        }),
        total,
        feed_title: feed.title
    };
}
