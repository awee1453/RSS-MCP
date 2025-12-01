import { z } from 'zod';
import { BookmarkRepository, ArticleRepository } from '../database/repository.js';

/**
 * Input schema for rss_bookmark tool
 */
export const RssBookmarkInputSchema = z.object({
    action: z.enum(['add', 'list', 'update', 'delete']).describe('Bookmark action'),
    article_id: z.string().optional().describe('Article ID (required for add/update/delete)'),
    tags: z.array(z.string()).optional().describe('Tags for the bookmark'),
    notes: z.string().optional().describe('Personal notes'),
    read_status: z.enum(['unread', 'reading', 'read']).optional().describe('Reading status'),
    bookmark_id: z.string().optional().describe('Bookmark ID (for update/delete)')
});

/**
 * Output schema for rss_bookmark tool
 */
export const RssBookmarkOutputSchema = z.object({
    success: z.boolean(),
    bookmarks: z.array(z.object({
        id: z.string(),
        article_id: z.string(),
        article_title: z.string().optional(),
        tags: z.array(z.string()).optional(),
        notes: z.string().optional(),
        read_status: z.string(),
        created_at: z.string()
    })).optional(),
    message: z.string()
});

export type RssBookmarkInput = z.infer<typeof RssBookmarkInputSchema>;
export type RssBookmarkOutput = z.infer<typeof RssBookmarkOutputSchema>;

/**
 * Manage article bookmarks and reading list
 */
export async function handleRssBookmark(
    input: RssBookmarkInput,
    bookmarkRepository: BookmarkRepository,
    articleRepository: ArticleRepository
): Promise<RssBookmarkOutput> {
    const { action, article_id, tags, notes, read_status, bookmark_id } = input;

    try {
        switch (action) {
            case 'add': {
                if (!article_id) {
                    return { success: false, message: 'article_id gerekli' };
                }

                const bookmark = bookmarkRepository.create(article_id, tags || null, notes || null);
                return {
                    success: true,
                    message: 'Bookmark başarıyla eklendi',
                    bookmarks: [{ ...bookmark, tags: tags || [] }]
                };
            }

            case 'list': {
                const bookmarks = bookmarkRepository.findAll();
                const bookmarksWithArticles = bookmarks.map(bm => {
                    const article = articleRepository.findById(bm.article_id);
                    return {
                        ...bm,
                        article_title: article?.title,
                        tags: bm.tags ? JSON.parse(bm.tags) : []
                    };
                });

                return {
                    success: true,
                    bookmarks: bookmarksWithArticles,
                    message: `${bookmarks.length} bookmark bulundu`
                };
            }

            case 'update': {
                if (!bookmark_id) {
                    return { success: false, message: 'bookmark_id gerekli' };
                }

                if (read_status) {
                    bookmarkRepository.updateReadStatus(bookmark_id, read_status);
                }

                return {
                    success: true,
                    message: 'Bookmark güncellendi'
                };
            }

            case 'delete': {
                if (!bookmark_id) {
                    return { success: false, message: 'bookmark_id gerekli' };
                }

                bookmarkRepository.delete(bookmark_id);
                return {
                    success: true,
                    message: 'Bookmark silindi'
                };
            }
        }

    } catch (error: any) {
        return {
            success: false,
            message: `Hata: ${error.message}`
        };
    }
}
