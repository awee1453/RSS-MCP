import { z } from 'zod';
import { ArticleRepository } from '../database/repository.js';
import { AutoCategorizer } from '../services/auto-categorizer.js';

/**
 * Input schema for rss_auto_categorize tool
 */
export const RssAutoCategorizeInputSchema = z.object({
    article_id: z.string().optional().describe('Specific article ID (optional)'),
    feed_id: z.string().optional().describe('Categorize all articles from a feed'),
    limit: z.number().default(50).describe('Number of articles to categorize')
});

/**
 * Output schema for rss_auto_categorize tool
 */
export const RssAutoCategorizeOutputSchema = z.object({
    categorized_articles: z.array(z.object({
        id: z.string(),
        title: z.string(),
        suggested_categories: z.array(z.string())
    })),
    category_distribution: z.array(z.object({
        category: z.string(),
        count: z.number(),
        percentage: z.number()
    })),
    suggested_new_categories: z.array(z.string()).optional(),
    message: z.string()
});

export type RssAutoCategorizeInput = z.infer<typeof RssAutoCategorizeInputSchema>;
export type RssAutoCategorizeOutput = z.infer<typeof RssAutoCategorizeOutputSchema>;

/**
 * AI-based automatic article categorization
 */
export async function handleRssAutoCategorize(
    input: RssAutoCategorizeInput,
    articleRepository: ArticleRepository
): Promise<RssAutoCategorizeOutput> {
    const { article_id, feed_id, limit } = input;

    try {
        let articles: any[];

        if (article_id) {
            const article = articleRepository.findById(article_id);
            articles = article ? [article] : [];
        } else if (feed_id) {
            articles = articleRepository.findByFeedId(feed_id, limit);
        } else {
            articles = articleRepository.search({ limit }).articles;
        }

        if (articles.length === 0) {
            return {
                categorized_articles: [],
                category_distribution: [],
                message: 'Kategorize edilecek makale bulunamadı'
            };
        }

        // Batch categorize
        const categorized = AutoCategorizer.batchCategorize(articles);

        const categorizedArticles = categorized.map(article => ({
            id: article.id,
            title: article.title,
            suggested_categories: article.suggested_categories
        }));

        const categoryDistribution = AutoCategorizer.getCategoryDistribution(articles);
        const suggestedNewCategories = AutoCategorizer.suggestCategories(articles, 3);

        return {
            categorized_articles: categorizedArticles,
            category_distribution: categoryDistribution,
            suggested_new_categories: suggestedNewCategories,
            message: `${articles.length} makale başarıyla kategorize edildi`
        };

    } catch (error: any) {
        return {
            categorized_articles: [],
            category_distribution: [],
            message: `Hata: ${error.message}`
        };
    }
}
