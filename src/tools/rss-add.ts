import { z } from 'zod';
import { FeedRepository } from '../database/repository.js';
import { URLValidator } from '../services/validator.js';
import { FeedFetcher } from '../services/fetcher.js';
import { FeedParser } from '../services/parser.js';

/**
 * Input schema for rss_add tool
 */
export const RssAddInputSchema = z.object({
    url: z.string().url().describe('RSS/Atom feed URL to add')
});

/**
 * Output schema for rss_add tool
 */
export const RssAddOutputSchema = z.object({
    success: z.boolean().describe('Whether the feed was successfully added'),
    feed_id: z.string().optional().describe('Unique ID of the added feed'),
    message: z.string().describe('Status message'),
    feed_title: z.string().optional().describe('Title of the feed')
});

export type RssAddInput = z.infer<typeof RssAddInputSchema>;
export type RssAddOutput = z.infer<typeof RssAddOutputSchema>;

/**
 * RSS Add Tool Handler
 */
export async function handleRssAdd(
    input: RssAddInput,
    feedRepository: FeedRepository,
    fetcher: FeedFetcher,
    parser: FeedParser
): Promise<RssAddOutput> {
    const { url } = input;

    try {
        // Step 1: Quick format validation
        const quickValidation = URLValidator.validateQuick(url);
        if (!quickValidation.valid) {
            return {
                success: false,
                message: `URL doğrulanamadı: ${quickValidation.error}`
            };
        }

        // Step 2: Check if feed already exists
        const existing = feedRepository.findByUrl(url);
        if (existing) {
            return {
                success: false,
                message: 'Bu feed zaten kayıtlı.',
                feed_id: existing.id,
                feed_title: existing.title
            };
        }

        // Step 3: Validate URL with security checks (reachability, MIME type)
        const validation = await URLValidator.validate(url);
        if (!validation.valid) {
            return {
                success: false,
                message: `Güvenlik doğrulaması başarısız: ${validation.error}`
            };
        }

        // Step 4: Fetch feed content
        const xmlContent = await fetcher.fetch(url);

        // Step 5: Parse and validate feed
        const feedValidation = await parser.validate(xmlContent);
        if (!feedValidation.valid) {
            return {
                success: false,
                message: `Feed ayrıştırma hatası: ${feedValidation.error}`
            };
        }

        const parsedFeed = await parser.parse(xmlContent);

        // Step 6: Save to database
        const feed = feedRepository.create(url, parsedFeed.title, parsedFeed.description);

        return {
            success: true,
            feed_id: feed.id,
            message: 'Feed başarıyla kaydedildi.',
            feed_title: parsedFeed.title
        };
    } catch (error: any) {
        return {
            success: false,
            message: `Hata: ${error.message}`
        };
    }
}
