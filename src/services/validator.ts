import axios from 'axios';

/**
 * URL Validator with security checks
 */
export class URLValidator {
    private static readonly ALLOWED_PROTOCOLS = ['http:', 'https:'];
    private static readonly MAX_REDIRECTS = parseInt(process.env.MAX_REDIRECTS || '3');

    // Basic blacklist patterns (can be extended)
    private static readonly BLACKLIST_PATTERNS = [
        /localhost/i,
        /127\.0\.0\.1/,
        /0\.0\.0\.0/,
        /::1/,
        /192\.168\./,
        /10\./,
        /172\.(1[6-9]|2[0-9]|3[0-1])\./
    ];

    /**
     * Validate URL format
     */
    static isValidFormat(urlString: string): boolean {
        try {
            const url = new URL(urlString);
            return this.ALLOWED_PROTOCOLS.includes(url.protocol);
        } catch {
            return false;
        }
    }

    /**
     * Check if URL is blacklisted (local/private IPs)
     */
    static isBlacklisted(urlString: string): boolean {
        return this.BLACKLIST_PATTERNS.some(pattern => pattern.test(urlString));
    }

    /**
     * Validate URL with security checks
     */
    static async validate(urlString: string): Promise<{ valid: boolean; error?: string }> {
        // Format check
        if (!this.isValidFormat(urlString)) {
            return { valid: false, error: 'Invalid URL format. Only HTTP/HTTPS protocols are allowed.' };
        }

        // Blacklist check
        if (this.isBlacklisted(urlString)) {
            return { valid: false, error: 'URL is blacklisted (local or private network).' };
        }

        try {
            // Check reachability and MIME type
            const response = await axios.head(urlString, {
                maxRedirects: this.MAX_REDIRECTS,
                timeout: 5000,
                validateStatus: (status) => status < 400
            });

            // Validate MIME type
            const contentType = response.headers['content-type'] || '';
            const validMimeTypes = [
                'application/rss+xml',
                'application/atom+xml',
                'application/xml',
                'text/xml',
                'application/x-rss+xml'
            ];

            const isValidMime = validMimeTypes.some(mime => contentType.toLowerCase().includes(mime));

            if (!isValidMime && !contentType.includes('xml')) {
                return {
                    valid: false,
                    error: `Invalid content type: ${contentType}. Expected RSS/Atom XML feed.`
                };
            }

            return { valid: true };
        } catch (error: any) {
            if (error.response) {
                return {
                    valid: false,
                    error: `HTTP ${error.response.status}: ${error.response.statusText}`
                };
            } else if (error.code === 'ETIMEDOUT') {
                return { valid: false, error: 'Request timeout. Feed server did not respond.' };
            } else if (error.code === 'ENOTFOUND') {
                return { valid: false, error: 'DNS lookup failed. Domain not found.' };
            } else {
                return { valid: false, error: `Network error: ${error.message}` };
            }
        }
    }

    /**
     * Quick validation (format only)
     */
    static validateQuick(urlString: string): { valid: boolean; error?: string } {
        if (!this.isValidFormat(urlString)) {
            return { valid: false, error: 'Invalid URL format.' };
        }

        if (this.isBlacklisted(urlString)) {
            return { valid: false, error: 'URL is blacklisted.' };
        }

        return { valid: true };
    }
}
