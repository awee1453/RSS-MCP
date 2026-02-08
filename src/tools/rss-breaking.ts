import { z } from 'zod';
import { ArticleRepository } from '../database/repository.js';
import { formatArticleWithRTL } from '../utils/text-utils.js';
import { ContentAnalyzer } from '../services/analyzer.js';

/**
 * Input schema for rss_breaking tool
 */
export const RssBreakingInputSchema = z.object({
    limit: z.number().default(10).describe('Number of breaking news to return'),
    hours: z.number().default(24).describe('Look back N hours for breaking news')
});

/**
 * Output schema for rss_breaking tool
 */
export const RssBreakingOutputSchema = z.object({
    breaking_news: z.array(z.object({
        id: z.string(),
        feed_id: z.string(),
        title: z.string(),
        title_direction: z.enum(['rtl', 'ltr']),
        link: z.string(),
        pub_date: z.string(),
        summary: z.string(),
        summary_direction: z.enum(['rtl', 'ltr']),
        breaking_score: z.number(),
        language: z.string(),
        age_hours: z.number()
    })),
    total: z.number()
});

export type RssBreakingInput = z.infer<typeof RssBreakingInputSchema>;
export type RssBreakingOutput = z.infer<typeof RssBreakingOutputSchema>;

/**
 * Get breaking/urgent news based on recency and keywords
 */
export async function handleRssBreaking(
    input: RssBreakingInput,
    articleRepository: ArticleRepository
): Promise<RssBreakingOutput> {
    const { limit, hours } = input;

    const db = articleRepository['db'];
    const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

    // Get recent articles
    const articles = db.prepare(`
    SELECT * FROM articles 
    WHERE pub_date >= ?
    ORDER BY pub_date DESC, breaking_score DESC
    LIMIT ?
  `).all(cutoffDate, limit * 2) as any[];

    // Calculate breaking score for each article
    const scoredArticles = articles.map(article => {
        let score = 0;

        // Keywords that indicate breaking news
        const breakingKeywords = [
            'breaking', 'urgent', 'son dakika', 'acil', 'şimdi', 'canlı',
            'عاجل', 'الآن', 'urgent', 'flash', 'alert', 'developing'
        ];

        const titleLower = article.title.toLowerCase();
        breakingKeywords.forEach(keyword => {
            if (titleLower.includes(keyword)) score += 10;
        });

        // Recency bonus (newer = higher score)
        const ageMs = Date.now() - new Date(article.pub_date).getTime();
        const ageHours = ageMs / (1000 * 60 * 60);
        const recencyScore = Math.max(0, 20 - ageHours);
        score += recencyScore;

        return {
            ...article,
            breaking_score: Math.round(score),
            age_hours: Math.round(ageHours * 10) / 10
        };
    });

    // Sort by breaking score
    scoredArticles.sort((a, b) => b.breaking_score - a.breaking_score);

    // Take top N
    const topBreaking = scoredArticles.slice(0, limit);

    // Format with RTL support
    const formattedArticles = topBreaking.map(article => {
        const summary = ContentAnalyzer.summarize(
            article.description || article.content || article.title,
            2
        );

        const formatted = formatArticleWithRTL({
            id: article.id,
            title: article.title,
            link: article.link,
            pub_date: article.pub_date,
            summary,
            author: article.author,
            categories: article.categories ? JSON.parse(article.categories) : []
        });

        return {
            ...formatted,
            feed_id: article.feed_id,
            breaking_score: article.breaking_score,
            age_hours: article.age_hours
        };
    });

    return {
        breaking_news: formattedArticles,
        total: formattedArticles.length
    };
}
