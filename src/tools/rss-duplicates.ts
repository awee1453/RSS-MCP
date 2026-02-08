import { z } from 'zod';
import { ArticleRepository } from '../database/repository.js';
import stringSimilarity from 'string-similarity';

/**
 * Input schema for rss_duplicates tool
 */
export const RssDuplicatesInputSchema = z.object({
    threshold: z.number().default(0.7).describe('Similarity threshold (0-1)'),
    limit: z.number().default(50).describe('Number of recent articles to check')
});

/**
 * Output schema for rss_duplicates tool
 */
export const RssDuplicatesOutputSchema = z.object({
    duplicate_groups: z.array(z.object({
        similarity: z.number(),
        articles: z.array(z.object({
            id: z.string(),
            feed_id: z.string(),
            title: z.string(),
            link: z.string(),
            pub_date: z.string()
        }))
    })),
    total_duplicates: z.number()
});

export type RssDuplicatesInput = z.infer<typeof RssDuplicatesInputSchema>;
export type RssDuplicatesOutput = z.infer<typeof RssDuplicatesOutputSchema>;

/**
 * Find duplicate/similar articles across feeds
 */
export async function handleRssDuplicates(
    input: RssDuplicatesInput,
    articleRepository: ArticleRepository
): Promise<RssDuplicatesOutput> {
    const { threshold, limit } = input;

    const db = articleRepository['db'];

    // Get recent articles
    const articles = db.prepare(`
    SELECT id, feed_id, title, link, pub_date 
    FROM articles 
    ORDER BY pub_date DESC 
    LIMIT ?
  `).all(limit) as any[];

    const duplicateGroups: any[] = [];
    const processed = new Set<string>();

    // Compare each article with others
    for (let i = 0; i < articles.length; i++) {
        if (processed.has(articles[i].id)) continue;

        const group: any[] = [articles[i]];
        processed.add(articles[i].id);

        for (let j = i + 1; j < articles.length; j++) {
            if (processed.has(articles[j].id)) continue;

            // Calculate similarity
            const similarity = stringSimilarity.compareTwoStrings(
                articles[i].title.toLowerCase(),
                articles[j].title.toLowerCase()
            );

            if (similarity >= threshold) {
                group.push(articles[j]);
                processed.add(articles[j].id);
            }
        }

        // Only add groups with 2+ articles
        if (group.length > 1) {
            const avgSimilarity = group.length > 2
                ? group.slice(1).reduce((sum, art) => {
                    return sum + stringSimilarity.compareTwoStrings(
                        group[0].title.toLowerCase(),
                        art.title.toLowerCase()
                    );
                }, 0) / (group.length - 1)
                : stringSimilarity.compareTwoStrings(
                    group[0].title.toLowerCase(),
                    group[1].title.toLowerCase()
                );

            duplicateGroups.push({
                similarity: Math.round(avgSimilarity * 100) / 100,
                articles: group
            });
        }
    }

    // Sort by similarity
    duplicateGroups.sort((a, b) => b.similarity - a.similarity);

    return {
        duplicate_groups: duplicateGroups,
        total_duplicates: duplicateGroups.reduce((sum, g) => sum + g.articles.length, 0)
    };
}
