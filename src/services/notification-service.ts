import axios from 'axios';

/**
 * Notification Service for webhook delivery
 */
export class NotificationService {
    /**
     * Send webhook notification
     */
    static async sendWebhook(webhookUrl: string, payload: any): Promise<boolean> {
        try {
            await axios.post(webhookUrl, payload, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 5000
            });
            return true;
        } catch (error) {
            console.error('Webhook delivery failed:', error);
            return false;
        }
    }

    /**
     * Check if article matches keywords
     */
    static matchesKeywords(article: any, keywords: string[]): boolean {
        if (!keywords || keywords.length === 0) return true;

        const text = `${article.title} ${article.description || ''}`.toLowerCase();
        return keywords.some(keyword => text.includes(keyword.toLowerCase()));
    }

    /**
     * Create webhook payload
     */
    static createPayload(article: any, feedTitle: string): any {
        return {
            event: 'new_article',
            timestamp: new Date().toISOString(),
            feed: feedTitle,
            article: {
                title: article.title,
                link: article.link,
                pub_date: article.pub_date,
                description: article.description,
                author: article.author
            }
        };
    }
}
