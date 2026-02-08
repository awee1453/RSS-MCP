/**
 * Media Extractor - Extracts images and videos from article content
 */

export interface MediaAsset {
    id: string;
    article_id: string;
    media_type: 'image' | 'video';
    url: string;
    width?: number;
    height?: number;
    caption?: string;
}

export interface ExtractedMedia {
    images: MediaAsset[];
    videos: MediaAsset[];
    totalCount: number;
}

export class MediaExtractor {
    /**
     * Extract all media (images and videos) from HTML content
     */
    static extractAll(articleId: string, htmlContent: string): ExtractedMedia {
        if (!htmlContent) {
            return { images: [], videos: [], totalCount: 0 };
        }

        const images = this.extractImages(articleId, htmlContent);
        const videos = this.extractVideos(articleId, htmlContent);

        return {
            images,
            videos,
            totalCount: images.length + videos.length
        };
    }

    /**
     * Extract images from HTML content
     */
    static extractImages(articleId: string, htmlContent: string): MediaAsset[] {
        const images: MediaAsset[] = [];

        // Match img tags with src attribute
        const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
        let match;

        while ((match = imgRegex.exec(htmlContent)) !== null) {
            const fullTag = match[0];
            const url = match[1];

            // Skip tiny images (likely tracking pixels)
            if (this.isTinyImage(fullTag)) continue;

            // Skip data URIs
            if (url.startsWith('data:')) continue;

            // Extract dimensions
            const width = this.extractDimension(fullTag, 'width');
            const height = this.extractDimension(fullTag, 'height');

            // Extract alt text as caption
            const altMatch = fullTag.match(/alt=["']([^"']+)["']/i);
            const caption = altMatch ? altMatch[1] : undefined;

            images.push({
                id: this.generateId(),
                article_id: articleId,
                media_type: 'image',
                url: this.normalizeUrl(url),
                width,
                height,
                caption
            });
        }

        // Also check for Open Graph images
        const ogImageRegex = /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/gi;
        while ((match = ogImageRegex.exec(htmlContent)) !== null) {
            const url = match[1];
            if (!images.some(img => img.url === url)) {
                images.push({
                    id: this.generateId(),
                    article_id: articleId,
                    media_type: 'image',
                    url: this.normalizeUrl(url),
                    caption: 'Open Graph Image'
                });
            }
        }

        return images;
    }

    /**
     * Extract videos from HTML content
     */
    static extractVideos(articleId: string, htmlContent: string): MediaAsset[] {
        const videos: MediaAsset[] = [];

        // Match video tags
        const videoRegex = /<video[^>]*>[\s\S]*?<\/video>/gi;
        let match;

        while ((match = videoRegex.exec(htmlContent)) !== null) {
            const videoTag = match[0];

            // Extract source URL
            const srcMatch = videoTag.match(/src=["']([^"']+)["']/i) ||
                videoTag.match(/<source[^>]+src=["']([^"']+)["']/i);

            if (srcMatch) {
                const url = srcMatch[1];
                const width = this.extractDimension(videoTag, 'width');
                const height = this.extractDimension(videoTag, 'height');

                videos.push({
                    id: this.generateId(),
                    article_id: articleId,
                    media_type: 'video',
                    url: this.normalizeUrl(url),
                    width,
                    height
                });
            }
        }

        // Extract YouTube embeds
        const youtubeRegex = /(?:youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]+)/gi;
        while ((match = youtubeRegex.exec(htmlContent)) !== null) {
            const videoId = match[1];
            videos.push({
                id: this.generateId(),
                article_id: articleId,
                media_type: 'video',
                url: `https://www.youtube.com/watch?v=${videoId}`,
                caption: 'YouTube Video'
            });
        }

        // Extract Vimeo embeds
        const vimeoRegex = /vimeo\.com\/(?:video\/)?(\d+)/gi;
        while ((match = vimeoRegex.exec(htmlContent)) !== null) {
            const videoId = match[1];
            videos.push({
                id: this.generateId(),
                article_id: articleId,
                media_type: 'video',
                url: `https://vimeo.com/${videoId}`,
                caption: 'Vimeo Video'
            });
        }

        return videos;
    }

    /**
     * Check if image is too small (likely a tracking pixel)
     */
    private static isTinyImage(imgTag: string): boolean {
        const width = this.extractDimension(imgTag, 'width');
        const height = this.extractDimension(imgTag, 'height');

        if (width && height && (width < 10 || height < 10)) {
            return true;
        }

        return false;
    }

    /**
     * Extract dimension from image/video tag
     */
    private static extractDimension(tag: string, dimension: 'width' | 'height'): number | undefined {
        const regex = new RegExp(`${dimension}=["']?(\\d+)["']?`, 'i');
        const match = tag.match(regex);
        return match ? parseInt(match[1]) : undefined;
    }

    /**
     * Normalize URL (convert relative to absolute if possible)
     */
    private static normalizeUrl(url: string): string {
        // Remove leading/trailing whitespace
        url = url.trim();

        // If it's already absolute, return as is
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }

        // For protocol-relative URLs
        if (url.startsWith('//')) {
            return 'https:' + url;
        }

        return url;
    }

    /**
     * Generate unique ID for media asset
     */
    private static generateId(): string {
        return `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
