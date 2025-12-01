import { z } from 'zod';
import { FeedRepository, ArticleRepository } from '../database/repository.js';
import { FeedFetcher } from '../services/fetcher.js';
import { FeedParser } from '../services/parser.js';
import { ContentAnalyzer } from '../services/analyzer.js';
import { FeedStatus } from '../database/schema.js';

/**
 * Input schema for rss_update tool
 */
export const RssUpdateInputSchema = z.object({
    feed_id: z.string().optional().describe('Specific feed ID to update. If omitted, updates all feeds.')
});

/**
 * Output schema for rss_update tool
 */
export const RssUpdateOutputSchema = z.object({
    updated_feeds: z.number().describe('Number of feeds updated'),
    new_articles: z.number().describe('Number of new articles fetched'),
    errors: z.array(z.object({
        feed_id: z.string(),
        feed_title: z.string(),
        error: z.string()
    })).describe('Errors encountered during update')
});

export type RssUpdateInput = z.infer<typeof RssUpdateInputSchema>;
export type RssUpdateOutput = z.infer<typeof RssUpdateOutputSchema>;

/**
 * RSS Update Tool Handler
 */
export async function handleRssUpdate(
    input: RssUpdateInput,
    feedRepository: FeedRepository,
    articleRepository: ArticleRepository,
    fetcher: FeedFetcher,
    parser: FeedParser
): Promise<RssUpdateOutput> {
    const { feed_id } = input;

    let feedsToUpdate = feed_id
        ? [feedRepository.findById(feed_id)].filter(Boolean)
        : feedRepository.findAll();

    if (feedsToUpdate.length === 0) {
        return {
            updated_feeds: 0,
            new_articles: 0,
            errors: feed_id ? [{
                feed_id,
                feed_title: 'Unknown',
                error: 'Feed bulunamadı'
            }] : []
        };
    }

    let updatedCount = 0;
    let newArticlesCount = 0;
    const errors: Array<{ feed_id: string; feed_title: string; error: string }> = [];

    for (const feed of feedsToUpdate) {
        try {
            // Fetch feed content
            const xmlContent = await fetcher.fetch(feed.url);

            // Parse feed
            const parsedFeed = await parser.parse(xmlContent);

            // Process articles
            for (const item of parsedFeed.items) {
                // Check if article already exists
                if (!articleRepository.existsByGuid(feed.id, item.guid)) {
                    // Auto-categorize
                    const category = ContentAnalyzer.categorize(
                        `${item.title} ${item.description || ''}`,
                        item.categories
                    );

                    // Add category if not present
                    if (!item.categories.includes(category)) {
                        item.categories.push(category);
                    }

                    // Detect language
                    const language = ContentAnalyzer.detectLanguage(item.title);

                    // Calculate word count and reading time
                    const fullText = `${item.title} ${item.content || item.description || ''}`;
                    const wordCount = ContentAnalyzer.countWords(fullText);
                    const readingTime = ContentAnalyzer.calculateReadingTime(wordCount);

                    // Store article with extended metadata
                    const db = articleRepository['db'];
                    const articleId = `article_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

                    db.prepare(`
                        INSERT OR IGNORE INTO articles 
                        (id, feed_id, title, link, pub_date, description, content, author, categories, guid, language, word_count, reading_time, is_breaking, breaking_score)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
                    `).run(
                        articleId,
                        feed.id,
                        item.title,
                        item.link,
                        item.pubDate,
                        item.description,
                        item.content,
                        item.author,
                        JSON.stringify(item.categories),
                        item.guid,
                        language,
                        wordCount,
                        readingTime
                    );

                    newArticlesCount++;
                }
            }

            // Update feed status
            feedRepository.updateLastFetched(feed.id, FeedStatus.ACTIVE);
            updatedCount++;

        } catch (error: any) {
            // Log error
            feedRepository.updateStatus(feed.id, FeedStatus.ERROR, error.message);
            errors.push({
                feed_id: feed.id,
                feed_title: feed.title,
                error: error.message
            });
        }
    }

    return {
        updated_feeds: updatedCount,
        new_articles: newArticlesCount,
        errors
    };
}
