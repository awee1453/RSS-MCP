/**
 * Post-process articles to detect breaking news
 */
import { z } from 'zod';
import { ArticleRepository } from '../database/repository.js';
import { BreakingNewsDetector } from '../services/breaking-news-detector.js';

export const RssDetectBreakingInputSchema = z.object({
    hours: z.number().optional().default(24).describe('Process articles from last N hours')
});

export async function detectBreakingNews(
    articleRepository: ArticleRepository,
    hours: number = 24
): Promise<{ processed: number; breaking_found: number }> {
    const db = articleRepository['db'];

    // Get recent articles that haven't been processed for breaking news
    const since = new Date();
    since.setHours(since.getHours() - hours);

    const articles = db.prepare(`
        SELECT * FROM articles
        WHERE pub_date >= ?
        AND breaking_score = 0
        ORDER BY pub_date DESC
    `).all(since.toISOString()) as any[];

    let breakingCount = 0;

    for (const article of articles) {
        const result = BreakingNewsDetector.analyze(
            article.title,
            article.content || article.description || '',
            new Date(article.pub_date)
        );

        // Update article with breaking news info
        db.prepare(`
            UPDATE articles
            SET is_breaking = ?, breaking_score = ?
            WHERE id = ?
        `).run(
            result.isBreaking ? 1 : 0,
            result.score,
            article.id
        );

        if (result.isBreaking) {
            breakingCount++;
        }
    }

    return {
        processed: articles.length,
        breaking_found: breakingCount
    };
}
