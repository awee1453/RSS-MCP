import { z } from 'zod';
import { ArticleRepository, FeedRepository } from '../database/repository.js';
import { DigestGenerator } from '../services/digest-generator.js';

/**
 * Input schema for rss_daily_digest tool
 */
export const RssDigestInputSchema = z.object({
    format: z.enum(['markdown', 'html']).default('markdown').describe('Output format'),
    days: z.number().default(1).describe('Number of days to include (1=daily, 7=weekly)'),
    limit: z.number().default(10).describe('Number of top articles to include')
});

/**
 * Output schema for rss_daily_digest tool
 */
export const RssDigestOutputSchema = z.object({
    digest: z.string(),
    format: z.string(),
    stats: z.object({
        total_articles: z.number(),
        total_feeds: z.number(),
        top_categories: z.array(z.object({
            category: z.string(),
            count: z.number()
        }))
    })
});

export type RssDigestInput = z.infer<typeof RssDigestInputSchema>;
export type RssDigestOutput = z.infer<typeof RssDigestOutputSchema>;

/**
 * Generate daily/weekly digest report
 */
export async function handleRssDigest(
    input: RssDigestInput,
    articleRepository: ArticleRepository,
    feedRepository: FeedRepository
): Promise<RssDigestOutput> {
    const { format, days, limit } = input;

    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    // Get recent articles
    const result = articleRepository.search({
        dateFrom: cutoffDate,
        limit: limit * 5 // Get more to filter top ones
    });

    // Get feed info for articles
    const feedsInfo = feedRepository.findAll();

    // Add feed titles to articles
    const articlesWithFeeds = result.articles.slice(0, limit).map(article => {
        const feed = feedsInfo.find(f => f.id === article.feed_id);
        return {
            ...article,
            feed_title: feed?.title || 'Unknown'
        };
    });

    // Generate digest
    const digest = format === 'html'
        ? DigestGenerator.generateHTML(articlesWithFeeds, feedsInfo)
        : DigestGenerator.generateMarkdown(articlesWithFeeds, feedsInfo);

    const stats = DigestGenerator.generateStats(result.articles, feedsInfo);

    return {
        digest,
        format,
        stats
    };
}
