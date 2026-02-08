import { z } from 'zod';
import { ArticleRepository } from '../database/repository.js';

/**
 * Input schema for rss_media tool
 */
export const RssMediaInputSchema = z.object({
    article_id: z.string().optional().describe('Specific article ID'),
    feed_id: z.string().optional().describe('Get media from specific feed'),
    media_type: z.enum(['image', 'video', 'all']).default('all').describe('Type of media to extract'),
    limit: z.number().default(20).describe('Number of articles to process')
});

/**
 * Output schema for rss_media tool
 */
export const RssMediaOutputSchema = z.object({
    media_items: z.array(z.object({
        id: z.string(),
        article_id: z.string(),
        article_title: z.string(),
        media_type: z.string(),
        url: z.string(),
        width: z.number().nullable(),
        height: z.number().nullable(),
        caption: z.string().nullable()
    })),
    total: z.number()
});

export type RssMediaInput = z.infer<typeof RssMediaInputSchema>;
export type RssMediaOutput = z.infer<typeof RssMediaOutputSchema>;

/**
 * Extract media (images/videos) from articles
 */
export async function handleRssMedia(
    input: RssMediaInput,
    articleRepository: ArticleRepository
): Promise<RssMediaOutput> {
    const { article_id, feed_id, media_type, limit } = input;

    const db = articleRepository['db'];

    let articles: any[];

    if (article_id) {
        articles = [db.prepare('SELECT * FROM articles WHERE id = ?').get(article_id)];
    } else if (feed_id) {
        articles = db.prepare(`
      SELECT * FROM articles 
      WHERE feed_id = ? 
      ORDER BY pub_date DESC 
      LIMIT ?
    `).all(feed_id, limit) as any[];
    } else {
        articles = db.prepare(`
      SELECT * FROM articles 
      ORDER BY pub_date DESC 
      LIMIT ?
    `).all(limit) as any[];
    }

    const mediaItems: any[] = [];

    for (const article of articles) {
        if (!article) continue;

        const content = article.content || article.description || '';

        // Extract images
        if (media_type === 'image' || media_type === 'all') {
            const imgRegex = /<img[^>]+src="([^">]+)"/g;
            let match;

            while ((match = imgRegex.exec(content)) !== null) {
                const url = match[1];

                // Try to extract dimensions
                const widthMatch = content.match(/width[=:"]\s*(\d+)/i);
                const heightMatch = content.match(/height[=:"]\s*(\d+)/i);

                mediaItems.push({
                    id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    article_id: article.id,
                    article_title: article.title,
                    media_type: 'image',
                    url,
                    width: widthMatch ? parseInt(widthMatch[1]) : null,
                    height: heightMatch ? parseInt(heightMatch[1]) : null,
                    caption: null
                });
            }
        }

        // Extract videos
        if (media_type === 'video' || media_type === 'all') {
            const videoRegex = /<video[^>]+src="([^">]+)"|<source[^>]+src="([^">]+)"/g;
            let match;

            while ((match = videoRegex.exec(content)) !== null) {
                const url = match[1] || match[2];

                mediaItems.push({
                    id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    article_id: article.id,
                    article_title: article.title,
                    media_type: 'video',
                    url,
                    width: null,
                    height: null,
                    caption: null
                });
            }

            // Check for YouTube/Vimeo embeds
            const youtubeRegex = /youtube\.com\/embed\/([a-zA-Z0-9_-]+)|youtu\.be\/([a-zA-Z0-9_-]+)/g;
            while ((match = youtubeRegex.exec(content)) !== null) {
                const videoId = match[1] || match[2];
                mediaItems.push({
                    id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    article_id: article.id,
                    article_title: article.title,
                    media_type: 'video',
                    url: `https://www.youtube.com/watch?v=${videoId}`,
                    width: null,
                    height: null,
                    caption: null
                });
            }
        }
    }

    return {
        media_items: mediaItems,
        total: mediaItems.length
    };
}
