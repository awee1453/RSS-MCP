import { z } from 'zod';
import { ArticleRepository, FeedRepository } from '../database/repository.js';
import { ContentAnalyzer } from '../services/analyzer.js';

/**
 * Input schema for rss_analytics tool
 */
export const RssAnalyticsInputSchema = z.object({
    feed_id: z.string().optional().describe('Specific feed to analyze'),
    days: z.number().default(7).describe('Number of days to analyze')
});

/**
 * Output schema for rss_analytics tool
 */
export const RssAnalyticsOutputSchema = z.object({
    summary: z.object({
        total_feeds: z.number(),
        total_articles: z.number(),
        articles_per_day: z.number(),
        active_feeds: z.number(),
        error_feeds: z.number()
    }),
    top_keywords: z.array(z.object({
        keyword: z.string(),
        count: z.number()
    })),
    top_categories: z.array(z.object({
        category: z.string(),
        count: z.number()
    })),
    language_distribution: z.array(z.object({
        language: z.string(),
        count: z.number(),
        percentage: z.number()
    })),
    publishing_pattern: z.array(z.object({
        hour: z.number(),
        count: z.number()
    }))
});

export type RssAnalyticsInput = z.infer<typeof RssAnalyticsInputSchema>;
export type RssAnalyticsOutput = z.infer<typeof RssAnalyticsOutputSchema>;

/**
 * Get analytics and insights about feeds and articles
 */
export async function handleRssAnalytics(
    input: RssAnalyticsInput,
    articleRepository: ArticleRepository,
    feedRepository: FeedRepository
): Promise<RssAnalyticsOutput> {
    const { feed_id, days } = input;

    const db = articleRepository['db'];
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    // Get all feeds
    const allFeeds = feedRepository.findAll();
    const activeFeeds = allFeeds.filter(f => f.status === 'active').length;
    const errorFeeds = allFeeds.filter(f => f.status === 'error').length;

    // Get articles
    let articles: any[];
    if (feed_id) {
        articles = db.prepare(`
      SELECT * FROM articles 
      WHERE feed_id = ? AND pub_date >= ?
    `).all(feed_id, cutoffDate) as any[];
    } else {
        articles = db.prepare(`
      SELECT * FROM articles 
      WHERE pub_date >= ?
    `).all(cutoffDate) as any[];
    }

    // Calculate articles per day
    const articlesPerDay = Math.round((articles.length / days) * 10) / 10;

    // Extract all keywords and categories
    const allKeywords: string[] = [];
    const categoryCount = new Map<string, number>();
    const languageCount = new Map<string, number>();
    const hourCount = new Map<number, number>();

    articles.forEach(article => {
        // Keywords
        const text = `${article.title} ${article.description || ''}`;
        const keywords = ContentAnalyzer.extractKeywords(text, 5);
        allKeywords.push(...keywords);

        // Categories
        if (article.categories) {
            try {
                const cats = JSON.parse(article.categories);
                cats.forEach((cat: string) => {
                    categoryCount.set(cat, (categoryCount.get(cat) || 0) + 1);
                });
            } catch { }
        }

        // Language
        const lang = article.language || 'unknown';
        languageCount.set(lang, (languageCount.get(lang) || 0) + 1);

        // Publishing hour
        try {
            const hour = new Date(article.pub_date).getHours();
            hourCount.set(hour, (hourCount.get(hour) || 0) + 1);
        } catch { }
    });

    // Count keyword frequency
    const keywordFreq = new Map<string, number>();
    allKeywords.forEach(kw => {
        keywordFreq.set(kw, (keywordFreq.get(kw) || 0) + 1);
    });

    // Top keywords
    const topKeywords = Array.from(keywordFreq.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([keyword, count]) => ({ keyword, count }));

    // Top categories
    const topCategories = Array.from(categoryCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([category, count]) => ({ category, count }));

    // Language distribution
    const totalArticles = articles.length || 1;
    const languageDistribution = Array.from(languageCount.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([language, count]) => ({
            language,
            count,
            percentage: Math.round((count / totalArticles) * 100 * 10) / 10
        }));

    // Publishing pattern (by hour)
    const publishingPattern = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        count: hourCount.get(hour) || 0
    }));

    return {
        summary: {
            total_feeds: allFeeds.length,
            total_articles: articles.length,
            articles_per_day: articlesPerDay,
            active_feeds: activeFeeds,
            error_feeds: errorFeeds
        },
        top_keywords: topKeywords,
        top_categories: topCategories,
        language_distribution: languageDistribution,
        publishing_pattern: publishingPattern
    };
}
