import { z } from 'zod';
import { FeedRepository } from '../database/repository.js';
import { RecommendationEngine } from '../services/recommendation-engine.js';

/**
 * Input schema for rss_recommend tool
 */
export const RssRecommendInputSchema = z.object({
    categories: z.array(z.string()).optional().describe('Preferred categories'),
    language: z.string().optional().describe('Preferred language (e.g., "tr", "en")'),
    limit: z.number().default(10).describe('Number of recommendations')
});

/**
 * Output schema for rss_recommend tool
 */
export const RssRecommendOutputSchema = z.object({
    recommendations: z.array(z.object({
        title: z.string(),
        url: z.string(),
        score: z.number(),
        reason: z.string()
    })),
    message: z.string()
});

export type RssRecommendInput = z.infer<typeof RssRecommendInputSchema>;
export type RssRecommendOutput = z.infer<typeof RssRecommendOutputSchema>;

/**
 * Recommend new RSS feeds based on existing feeds and preferences
 */
export async function handleRssRecommend(
    input: RssRecommendInput,
    feedRepository: FeedRepository
): Promise<RssRecommendOutput> {
    const { categories, language, limit } = input;

    // Get current feeds
    const currentFeeds = feedRepository.findAll();

    // For demo purposes, create some sample candidate feeds
    // In production, this would query an external feed directory
    const candidateFeeds: any[] = [
        { title: 'TechCrunch', url: 'https://techcrunch.com/feed/', description: 'Technology news', categories: 'technology' },
        { title: 'BBC News', url: 'https://feeds.bbci.co.uk/news/rss.xml', description: 'World news', categories: 'world' },
        { title: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', description: 'Tech and science', categories: 'technology' },
        { title: 'Hacker News', url: 'https://news.ycombinator.com/rss', description: 'Tech community news', categories: 'technology' },
        { title: 'Reuters', url: 'https://www.reutersagency.com/feed/', description: 'Global news', categories: 'world,business' }
    ];

    const userPreferences = {
        categories,
        language
    };

    const recommendations = RecommendationEngine.recommendFeeds(
        currentFeeds,
        candidateFeeds,
        userPreferences
    ).slice(0, limit);

    return {
        recommendations,
        message: `${recommendations.length} feed önerisi bulundu`
    };
}
