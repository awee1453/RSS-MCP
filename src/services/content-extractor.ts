import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Full Content Extraction Service
 */
export class ContentExtractor {
    /**
     * Extract full article content from URL
     */
    static async extractFullContent(url: string): Promise<{
        success: boolean;
        content: string | null;
        images: string[];
        error: string | null;
    }> {
        try {
            const response = await axios.get(url, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            const $ = cheerio.load(response.data);

            // Remove unwanted elements
            $('script, style, nav, header, footer, aside, .ad, .advertisement, .social-share').remove();

            // Try to find main content
            let content = '';
            const selectors = [
                'article',
                '[role="main"]',
                '.article-content',
                '.post-content',
                '.entry-content',
                'main',
                '.content'
            ];

            for (const selector of selectors) {
                const element = $(selector);
                if (element.length > 0) {
                    content = element.text().trim();
                    if (content.length > 200) break;
                }
            }

            // Fallback to body if no content found
            if (!content || content.length < 200) {
                content = $('body').text().trim();
            }

            // Clean up content
            content = content.replace(/\s+/g, ' ').trim();

            // Extract images
            const images: string[] = [];
            $('img').each((_, elem) => {
                const src = $(elem).attr('src');
                if (src && (src.startsWith('http') || src.startsWith('//'))) {
                    images.push(src.startsWith('//') ? 'https:' + src : src);
                }
            });

            return {
                success: true,
                content: content.length > 100 ? content : null,
                images: images.slice(0, 5),
                error: null
            };

        } catch (error: any) {
            return {
                success: false,
                content: null,
                images: [],
                error: error.message || 'Failed to extract content'
            };
        }
    }

    /**
     * Estimate reading time
     */
    static estimateReadingTime(content: string): number {
        const wordsPerMinute = 200;
        const wordCount = content.split(/\s+/).length;
        return Math.ceil(wordCount / wordsPerMinute);
    }

    /**
     * Extract summary from full content
     */
    static extractSummary(content: string, maxLength: number = 300): string {
        if (content.length <= maxLength) return content;

        // Try to cut at sentence boundary
        const sentences = content.split(/[.!?]+/);
        let summary = '';

        for (const sentence of sentences) {
            if (summary.length + sentence.length <= maxLength) {
                summary += sentence + '. ';
            } else {
                break;
            }
        }

        return summary.trim() || content.substring(0, maxLength) + '...';
    }
}
