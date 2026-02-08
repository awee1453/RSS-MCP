import { z } from 'zod';
import { ArticleRepository, FeedRepository } from '../database/repository.js';
import stringSimilarity from 'string-similarity';

/**
 * Input schema for rss_compare tool
 */
export const RssCompareInputSchema = z.object({
    feed_ids: z.array(z.string()).min(2).describe('Feed IDs to compare (minimum 2)'),
    days: z.number().default(7).describe('Number of days to analyze')
});

/**
 * Output schema for rss_compare tool
 */
export const RssCompareOutputSchema = z.object({
    feeds: z.array(z.object({
        feed_id: z.string(),
        feed_title: z.string(),
        article_count: z.number(),
        unique_articles: z.number(),
        shared_articles: z.number()
    })),
    shared_topics: z.array(z.object({
        topic: z.string(),
        feeds: z.array(z.string()),
        similarity: z.number()
    })),
    coverage_overlap: z.number().describe('Percentage of overlapping coverage')
});

export type RssCompareInput = z.infer<typeof RssCompareInputSchema>;
export type RssCompareOutput = z.infer<typeof RssCompareOutputSchema>;

/**
 * Compare coverage across multiple feeds
 */
export async function handleRssCompare(
    input: RssCompareInput,
    articleRepository: ArticleRepository,
    feedRepository: FeedRepository
): Promise<RssCompareOutput> {
    const { feed_ids, days } = input;

    const db = articleRepository['db'];
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const feedStats: any[] = [];
    const allArticlesByFeed = new Map<string, any[]>();

    // Get articles for each feed
    for (const feedId of feed_ids) {
        const feed = feedRepository.findById(feedId);
        if (!feed) continue;

        const articles = db.prepare(`
      SELECT * FROM articles 
      WHERE feed_id = ? AND pub_date >= ?
      ORDER BY pub_date DESC
    `).all(feedId, cutoffDate) as any[];

        allArticlesByFeed.set(feedId, articles);

        feedStats.push({
            feed_id: feedId,
            feed_title: feed.title,
            article_count: articles.length,
            unique_articles: 0, // Will calculate later
            shared_articles: 0  // Will calculate later
        });
    }

    // Find shared topics (similar articles across feeds)
    const sharedTopics: any[] = [];
    const processedPairs = new Set<string>();

    const feedEntries = Array.from(allArticlesByFeed.entries());

    for (let i = 0; i < feedEntries.length; i++) {
        const [feedId1, articles1] = feedEntries[i];

        for (let j = i + 1; j < feedEntries.length; j++) {
            const [feedId2, articles2] = feedEntries[j];

            // Compare articles between feeds
            for (const art1 of articles1) {
                for (const art2 of articles2) {
                    const similarity = stringSimilarity.compareTwoStrings(
                        art1.title.toLowerCase(),
                        art2.title.toLowerCase()
                    );

                    if (similarity >= 0.6) {
                        const pairKey = [art1.id, art2.id].sort().join('-');
                        if (!processedPairs.has(pairKey)) {
                            processedPairs.add(pairKey);

                            sharedTopics.push({
                                topic: art1.title,
                                feeds: [feedId1, feedId2],
                                similarity: Math.round(similarity * 100) / 100
                            });
                        }
                    }
                }
            }
        }
    }

    // Calculate unique vs shared for each feed
    const sharedArticleIds = new Set<string>();
    sharedTopics.forEach(topic => {
        // Mark articles as shared (simplified)
        topic.feeds.forEach((feedId: string) => {
            const articles = allArticlesByFeed.get(feedId) || [];
            articles.forEach(art => {
                if (art.title.toLowerCase().includes(topic.topic.toLowerCase().substring(0, 20))) {
                    sharedArticleIds.add(art.id);
                }
            });
        });
    });

    feedStats.forEach(stat => {
        const articles = allArticlesByFeed.get(stat.feed_id) || [];
        const shared = articles.filter(art => sharedArticleIds.has(art.id)).length;
        stat.shared_articles = shared;
        stat.unique_articles = stat.article_count - shared;
    });

    // Calculate overall coverage overlap
    const totalArticles = feedStats.reduce((sum, f) => sum + f.article_count, 0);
    const totalShared = sharedTopics.length;
    const coverageOverlap = totalArticles > 0
        ? Math.round((totalShared / totalArticles) * 100 * 10) / 10
        : 0;

    return {
        feeds: feedStats,
        shared_topics: sharedTopics.slice(0, 20), // Top 20
        coverage_overlap: coverageOverlap
    };
}
