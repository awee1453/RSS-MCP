import { z } from 'zod';
import { ArticleRepository } from '../database/repository.js';
import { ContentAnalyzer } from '../services/analyzer.js';
import { formatArticleWithRTL } from '../utils/text-utils.js';

/**
 * Input schema for rss_search tool
 */
export const RssSearchInputSchema = z.object({
    keyword: z.string().optional().describe('Search keyword in title, description, or content'),
    feed_id: z.string().optional().describe('Filter by specific feed ID'),
    category: z.string().optional().describe('Filter by category'),
    date_from: z.string().optional().describe('Filter articles from this date (ISO 8601)'),
    date_to: z.string().optional().describe('Filter articles until this date (ISO 8601)'),
    limit: z.number().default(20).describe('Number of results to return'),
    offset: z.number().default(0).describe('Offset for pagination')
});

/**
 * Output schema for rss_search tool
 */
export const RssSearchOutputSchema = z.object({
    articles: z.array(z.object({
        id: z.string(),
        feed_id: z.string(),
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
    total: z.number().describe('Total number of matching articles'),
    filters_applied: z.object({
        keyword: z.string().optional(),
        feed_id: z.string().optional(),
        category: z.string().optional(),
        date_from: z.string().optional(),
        date_to: z.string().optional()
    }).describe('Filters that were applied to the search')
});

export type RssSearchInput = z.infer<typeof RssSearchInputSchema>;
export type RssSearchOutput = z.infer<typeof RssSearchOutputSchema>;

/**
 * RSS Search Tool Handler
 */
export async function handleRssSearch(
    input: RssSearchInput,
    articleRepository: ArticleRepository
): Promise<RssSearchOutput> {
    const { keyword, feed_id, category, date_from, date_to, limit, offset } = input;

    // Search with filters
    const { articles, total } = articleRepository.search({
        keyword,
        feedId: feed_id,
        category,
        dateFrom: date_from,
        dateTo: date_to,
        limit,
        offset
    });

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
            const formatted = formatArticleWithRTL({
                id: article.id,
                title: article.title,
                link: article.link,
                pub_date: article.pub_date,
                summary,
                author: article.author,
                categories
            });

            // Add feed_id
            return {
                ...formatted,
                feed_id: article.feed_id
            };
        }),
        total,
        filters_applied: {
            keyword,
            feed_id,
            category,
            date_from,
            date_to
        }
    };
}
