import { z } from 'zod';
import { FeedRepository, CredibilityRepository } from '../database/repository.js';
import { CredibilityScorer } from '../services/credibility-scorer.js';

/**
 * Input schema for rss_credibility_score tool
 */
export const RssCredibilityInputSchema = z.object({
    feed_id: z.string().optional().describe('Specific feed ID (optional, leave empty for all feeds)')
});

/**
 * Output schema for rss_credibility_score tool
 */
export const RssCredibilityOutputSchema = z.object({
    scores: z.array(z.object({
        feed_id: z.string(),
        feed_title: z.string(),
        score: z.number(),
        label: z.string(),
        metrics: z.object({
            https_enabled: z.boolean(),
            update_frequency: z.number(),
            metadata_quality: z.number()
        }),
        recommendations: z.array(z.string())
    }))
});

export type RssCredibilityInput = z.infer<typeof RssCredibilityInputSchema>;
export type RssCredibilityOutput = z.infer<typeof RssCredibilityOutputSchema>;

/**
 * Calculate credibility scores for feeds
 */
export async function handleRssCredibility(
    input: RssCredibilityInput,
    feedRepository: FeedRepository,
    credibilityRepository: CredibilityRepository
): Promise<RssCredibilityOutput> {
    const { feed_id } = input;

    const feeds = feed_id
        ? [feedRepository.findById(feed_id)].filter(Boolean)
        : feedRepository.findAll();

    const scores = feeds.map(feed => {
        const httpsEnabled = feed!.url.startsWith('https://');
        const metadataQuality = CredibilityScorer.assessMetadataQuality(feed);
        const updateFreq = 5; // Simplified - in production, calculate from article history

        const metrics = {
            httpsEnabled,
            updateFrequency: updateFreq,
            metadataQuality,
            hasDescription: !!feed!.description,
            hasImage: false
        };

        const score = CredibilityScorer.calculateScore(feed, metrics);
        const label = CredibilityScorer.getLabel(score);
        const recommendations = CredibilityScorer.getRecommendations(score, metrics);

        // Save to database
        credibilityRepository.upsert(
            feed!.id,
            score,
            httpsEnabled,
            updateFreq,
            metadataQuality
        );

        return {
            feed_id: feed!.id,
            feed_title: feed!.title,
            score,
            label,
            metrics: {
                https_enabled: httpsEnabled,
                update_frequency: updateFreq,
                metadata_quality: metadataQuality
            },
            recommendations
        };
    });

    return { scores };
}
