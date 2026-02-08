/**
 * RSS Translate Tool - Translate articles to Turkish or other languages
 */
import { z } from 'zod';
import { ArticleRepository } from '../database/repository.js';
import { TranslationService } from '../services/translator.js';

export const RssTranslateInputSchema = z.object({
    article_id: z.string().describe('Article ID to translate'),
    target_lang: z.string().optional().default('tr').describe('Target language (default: tr for Turkish)'),
    source_lang: z.string().optional().describe('Source language (auto-detect if not provided)'),
    translate_content: z.boolean().optional().default(true).describe('Translate full content or just title')
});

export const RssTranslateOutputSchema = z.object({
    success: z.boolean(),
    article_id: z.string(),
    original: z.object({
        title: z.string(),
        content: z.string().nullable(),
        detected_lang: z.string()
    }),
    translated: z.object({
        title: z.string(),
        content: z.string().nullable(),
        target_lang: z.string()
    }),
    cached: z.boolean().optional(),
    error: z.string().optional()
});

export type RssTranslateInput = z.infer<typeof RssTranslateInputSchema>;
export type RssTranslateOutput = z.infer<typeof RssTranslateOutputSchema>;

export async function handleRssTranslate(
    input: RssTranslateInput,
    articleRepository: ArticleRepository
): Promise<RssTranslateOutput> {
    const { article_id, target_lang, source_lang, translate_content } = input;

    // Get article
    const db = articleRepository['db'];
    const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(article_id) as any;

    if (!article) {
        return {
            success: false,
            article_id,
            original: { title: '', content: null, detected_lang: 'unknown' },
            translated: { title: '', content: null, target_lang: target_lang || 'tr' },
            error: 'Article not found'
        };
    }

    // Check if translation already exists in DB
    const existingTranslation = db.prepare(`
        SELECT * FROM translations 
        WHERE article_id = ? AND target_lang = ?
    `).get(article_id, target_lang || 'tr') as any;

    if (existingTranslation) {
        return {
            success: true,
            article_id,
            original: {
                title: article.title,
                content: article.content,
                detected_lang: existingTranslation.source_lang
            },
            translated: {
                title: existingTranslation.translated_title,
                content: existingTranslation.translated_content,
                target_lang: target_lang || 'tr'
            },
            cached: true
        };
    }

    // Translate title
    const titleResult = await TranslationService.translate(
        article.title,
        target_lang || 'tr',
        source_lang
    );

    if (!titleResult.success) {
        return {
            success: false,
            article_id,
            original: { title: article.title, content: article.content, detected_lang: 'unknown' },
            translated: { title: '', content: null, target_lang: target_lang || 'tr' },
            error: titleResult.error
        };
    }

    let translatedContent: string | null = null;

    // Translate content if requested and available
    if (translate_content && article.content) {
        const contentResult = await TranslationService.translate(
            article.content,
            target_lang || 'tr',
            titleResult.sourceLang
        );

        if (contentResult.success) {
            translatedContent = contentResult.translatedText;
        }
    }

    // Save translation to database
    try {
        const translationId = `trans_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        db.prepare(`
            INSERT INTO translations (id, article_id, source_lang, target_lang, translated_title, translated_content, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
            translationId,
            article_id,
            titleResult.sourceLang,
            target_lang || 'tr',
            titleResult.translatedText,
            translatedContent,
            new Date().toISOString()
        );
    } catch (e) {
        // Ignore DB errors, translation still succeeded
    }

    return {
        success: true,
        article_id,
        original: {
            title: article.title,
            content: article.content,
            detected_lang: titleResult.sourceLang
        },
        translated: {
            title: titleResult.translatedText,
            content: translatedContent,
            target_lang: target_lang || 'tr'
        }
    };
}
