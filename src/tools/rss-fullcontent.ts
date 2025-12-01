import { z } from 'zod';
import { ArticleRepository } from '../database/repository.js';
import { ContentExtractor } from '../services/content-extractor.js';

/**
 * Input schema for rss_full_content tool
 */
export const RssFullContentInputSchema = z.object({
    article_id: z.string().describe('Article ID to extract full content for')
});

/**
 * Output schema for rss_full_content tool
 */
export const RssFullContentOutputSchema = z.object({
    success: z.boolean(),
    article: z.object({
        id: z.string(),
        title: z.string(),
        link: z.string(),
        full_content: z.string().optional(),
        summary: z.string().optional(),
        images: z.array(z.string()).optional(),
        reading_time: z.number().optional()
    }).optional(),
    message: z.string()
});

export type RssFullContentInput = z.infer<typeof RssFullContentInputSchema>;
export type RssFullContentOutput = z.infer<typeof RssFullContentOutputSchema>;

/**
 * Extract full article content from web page
 */
export async function handleRssFullContent(
    input: RssFullContentInput,
    articleRepository: ArticleRepository
): Promise<RssFullContentOutput> {
    const { article_id } = input;

    try {
        const article = articleRepository.findById(article_id);
        if (!article) {
            return {
                success: false,
                message: 'Makale bulunamadı'
            };
        }

        // Extract full content from URL
        const extraction = await ContentExtractor.extractFullContent(article.link);

        if (!extraction.success || !extraction.content) {
            return {
                success: false,
                message: extraction.error || 'İçerik çıkarılamadı'
            };
        }

        const readingTime = ContentExtractor.estimateReadingTime(extraction.content);
        const summary = ContentExtractor.extractSummary(extraction.content);

        return {
            success: true,
            article: {
                id: article.id,
                title: article.title,
                link: article.link,
                full_content: extraction.content,
                summary,
                images: extraction.images,
                reading_time: readingTime
            },
            message: 'Tam içerik başarıyla çıkarıldı'
        };

    } catch (error: any) {
        return {
            success: false,
            message: `Hata: ${error.message}`
        };
    }
}
