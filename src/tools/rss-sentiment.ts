import { z } from 'zod';
import { ArticleRepository } from '../database/repository.js';
import { SentimentAnalyzer } from '../services/sentiment-analyzer.js';

/**
 * Input schema for rss_sentiment_analysis tool
 */
export const RssSentimentInputSchema = z.object({
    feed_id: z.string().optional().describe('Specific feed ID (optional)'),
    days: z.number().default(7).describe('Number of days to analyze'),
    limit: z.number().default(50).describe('Number of articles to analyze')
});

/**
 * Output schema for rss_sentiment_analysis tool
 */
export const RssSentimentOutputSchema = z.object({
    distribution: z.object({
        positive: z.number(),
        neutral: z.number(),
        negative: z.number()
    }),
    articles: z.array(z.object({
        title: z.string(),
        sentiment_score: z.number(),
        sentiment_label: z.string()
    })),
    trend: z.array(z.object({
        date: z.string(),
        avg_sentiment: z.number()
    })).optional()
});

export type RssSentimentInput = z.infer<typeof RssSentimentInputSchema>;
export type RssSentimentOutput = z.infer<typeof RssSentimentOutputSchema>;

/**
 * Analyze sentiment of news articles
 */
export async function handleRssSentiment(
    input: RssSentimentInput,
    articleRepository: ArticleRepository
): Promise<RssSentimentOutput> {
    const { feed_id, days, limit } = input;

    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    // Get articles
    const result = articleRepository.search({
        feedId: feed_id,
        dateFrom: cutoffDate,
        limit
    });

    // Analyze sentiment
    const distribution = SentimentAnalyzer.getDistribution(result.articles);
    const analyzed = SentimentAnalyzer.batchAnalyze(result.articles);

    const articles = analyzed.map(article => ({
        title: article.title,
        sentiment_score: article.sentiment.score,
        sentiment_label: article.sentiment.label
    }));

    const trend = SentimentAnalyzer.getTrend(result.articles, days);

    return {
        distribution,
        articles,
        trend
    };
}
