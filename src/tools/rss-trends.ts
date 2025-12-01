import { z } from 'zod';
import { ArticleRepository } from '../database/repository.js';
import { TrendAnalyzer } from '../services/trend-analyzer.js';

/**
 * Input schema for rss_trends tool
 */
export const RssTrendsInputSchema = z.object({
    days: z.number().default(7).describe('Number of days to analyze for trends'),
    limit: z.number().default(20).describe('Number of trending topics to return')
});

/**
 * Output schema for rss_trends tool
 */
export const RssTrendsOutputSchema = z.object({
    trending_topics: z.array(z.object({
        keyword: z.string(),
        count: z.number(),
        trend: z.string()
    })),
    time_distribution: z.array(z.object({
        hour: z.number(),
        count: z.number()
    })),
    total_articles_analyzed: z.number()
});

export type RssTrendsInput = z.infer<typeof RssTrendsInputSchema>;
export type RssTrendsOutput = z.infer<typeof RssTrendsOutputSchema>;

/**
 * Analyze trending topics across all feeds
 */
export async function handleRssTrends(
    input: RssTrendsInput,
    articleRepository: ArticleRepository
): Promise<RssTrendsOutput> {
    const { days, limit } = input;

    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    // Get recent articles
    const result = articleRepository.search({
        dateFrom: cutoffDate,
        limit: 1000
    });

    // Analyze trends
    const trendingTopics = TrendAnalyzer.analyzeTrends(result.articles).slice(0, limit);
    const timeDistribution = TrendAnalyzer.analyzeTimeTrends(result.articles);

    return {
        trending_topics: trendingTopics,
        time_distribution: timeDistribution,
        total_articles_analyzed: result.articles.length
    };
}
