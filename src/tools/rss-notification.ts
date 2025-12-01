import { z } from 'zod';
import { NotificationRepository } from '../database/repository.js';

/**
 * Input schema for rss_notification_setup tool
 */
export const RssNotificationInputSchema = z.object({
    feed_id: z.string().optional().describe('Specific feed ID (optional, leave empty for all feeds)'),
    keywords: z.array(z.string()).optional().describe('Keywords to match (optional)'),
    webhook_url: z.string().url().describe('Webhook URL to send notifications'),
    frequency: z.enum(['immediate', 'hourly', 'daily']).default('immediate').describe('Notification frequency')
});

/**
 * Output schema for rss_notification_setup tool
 */
export const RssNotificationOutputSchema = z.object({
    success: z.boolean(),
    notification_id: z.string().optional(),
    message: z.string()
});

export type RssNotificationInput = z.infer<typeof RssNotificationInputSchema>;
export type RssNotificationOutput = z.infer<typeof RssNotificationOutputSchema>;

/**
 * Setup webhook notification for RSS feeds
 */
export async function handleRssNotification(
    input: RssNotificationInput,
    notificationRepo: NotificationRepository
): Promise<RssNotificationOutput> {
    try {
        const { feed_id, keywords, webhook_url, frequency } = input;

        // Create notification configuration
        const notification = notificationRepo.create(
            feed_id || null,
            keywords || null,
            webhook_url,
            frequency
        );

        return {
            success: true,
            notification_id: notification.id,
            message: `Webhook notification başarıyla ayarlandı. ${feed_id ? 'Feed-specific' : 'All feeds'} ${keywords ? `Keywords: ${keywords.join(', ')}` : ''}`
        };

    } catch (error: any) {
        return {
            success: false,
            message: `Hata: ${error.message}`
        };
    }
}
