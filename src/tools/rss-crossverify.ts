import { z } from 'zod';
import { ArticleRepository } from '../database/repository.js';
import { CrossVerifier } from '../services/cross-verifier.js';

/**
 * Input schema for rss_cross_verify tool
 */
export const RssCrossVerifyInputSchema = z.object({
    article_id: z.string().describe('Article ID to compare across sources'),
    similarity_threshold: z.number().default(0.6).describe('Similarity threshold (0.0-1.0)')
});

/**
 * Output schema for rss_cross_verify tool
 */
export const RssCrossVerifyOutputSchema = z.object({
    original_article: z.object({
        id: z.string(),
        title: z.string(),
        feed_id: z.string()
    }),
    similar_articles: z.array(z.object({
        id: z.string(),
        title: z.string(),
        feed_id: z.string(),
        similarity_score: z.number(),
        link: z.string()
    })),
    perspectives: z.object({
        common_keywords: z.array(z.string()),
        unique_perspectives: z.array(z.object({
            feed_id: z.string(),
            title: z.string(),
            unique_keywords: z.array(z.string())
        }))
    }).optional(),
    message: z.string()
});

export type RssCrossVerifyInput = z.infer<typeof RssCrossVerifyInputSchema>;
export type RssCrossVerifyOutput = z.infer<typeof RssCrossVerifyOutputSchema>;

/**
 * Cross-verify article across multiple sources
 */
export async function handleRssCrossVerify(
    input: RssCrossVerifyInput,
    articleRepository: ArticleRepository
): Promise<RssCrossVerifyOutput> {
    const { article_id, similarity_threshold } = input;

    try {
        const targetArticle = articleRepository.findById(article_id);
        if (!targetArticle) {
            return {
                original_article: { id: '', title: '', feed_id: '' },
                similar_articles: [],
                message: 'Makale bulunamadı'
            };
        }

        // Get all articles from last 7 days
        const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const allArticles = articleRepository.search({
            dateFrom: cutoffDate,
            limit: 500
        }).articles;

        // Find similar articles
        const similarArticles = CrossVerifier.findSimilarArticles(
            targetArticle,
            allArticles,
            similarity_threshold
        );

        // Analyze perspectives if similar articles found
        let perspectives;
        if (similarArticles.length > 0) {
            perspectives = CrossVerifier.detectPerspectives([targetArticle, ...similarArticles]);
        }

        return {
            original_article: {
                id: targetArticle.id,
                title: targetArticle.title,
                feed_id: targetArticle.feed_id
            },
            similar_articles: similarArticles.map(a => ({
                id: a.id,
                title: a.title,
                feed_id: a.feed_id,
                similarity_score: a.similarity_score,
                link: a.link
            })),
            perspectives,
            message: `${similarArticles.length} benzer makale bulundu`
        };

    } catch (error: any) {
        return {
            original_article: { id: '', title: '', feed_id: '' },
            similar_articles: [],
            message: `Hata: ${error.message}`
        };
    }
}
