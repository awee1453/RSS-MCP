import axios, { AxiosInstance } from 'axios';

/**
 * Rate limiter for domain-based throttling
 */
class RateLimiter {
    private lastRequestTime: Map<string, number> = new Map();
    private requestsPerSecond: number;

    constructor(requestsPerSecond: number = 1) {
        this.requestsPerSecond = requestsPerSecond;
    }

    async throttle(domain: string): Promise<void> {
        const now = Date.now();
        const lastRequest = this.lastRequestTime.get(domain) || 0;
        const timeSinceLastRequest = now - lastRequest;
        const minInterval = 1000 / this.requestsPerSecond;

        if (timeSinceLastRequest < minInterval) {
            const waitTime = minInterval - timeSinceLastRequest;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        this.lastRequestTime.set(domain, Date.now());
    }

    clearDomain(domain: string): void {
        this.lastRequestTime.delete(domain);
    }
}

/**
 * Feed fetcher with rate limiting and retry logic
 */
export class FeedFetcher {
    private axiosInstance: AxiosInstance;
    private rateLimiter: RateLimiter;
    private maxRetries: number = 3;

    constructor() {
        const timeout = parseInt(process.env.REQUEST_TIMEOUT || '10000');
        const maxRedirects = parseInt(process.env.MAX_REDIRECTS || '3');
        const rateLimitPerDomain = parseInt(process.env.RATE_LIMIT_PER_DOMAIN || '1');

        this.axiosInstance = axios.create({
            timeout,
            maxRedirects,
            headers: {
                'User-Agent': 'RSS-News-MCP/1.0 (Feed Aggregator)'
            }
        });

        this.rateLimiter = new RateLimiter(rateLimitPerDomain);
    }

    /**
     * Extract domain from URL
     */
    private getDomain(url: string): string {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname;
        } catch {
            return url;
        }
    }

    /**
     * Fetch feed with rate limiting and retries
     */
    async fetch(url: string, retryCount: number = 0): Promise<string> {
        const domain = this.getDomain(url);

        try {
            // Rate limit
            await this.rateLimiter.throttle(domain);

            // Fetch
            const response = await this.axiosInstance.get(url, {
                responseType: 'text'
            });

            return response.data;
        } catch (error: any) {
            // Retry logic
            if (retryCount < this.maxRetries && this.shouldRetry(error)) {
                const backoffTime = Math.pow(2, retryCount) * 1000; // Exponential backoff
                await new Promise(resolve => setTimeout(resolve, backoffTime));
                return this.fetch(url, retryCount + 1);
            }

            // Throw error if all retries exhausted
            if (error.response) {
                throw new Error(`HTTP ${error.response.status}: ${error.response.statusText}`);
            } else if (error.code === 'ETIMEDOUT') {
                throw new Error('Request timeout');
            } else if (error.code === 'ENOTFOUND') {
                throw new Error('Domain not found');
            } else {
                throw new Error(`Network error: ${error.message}`);
            }
        }
    }

    /**
     * Determine if error is retryable
     */
    private shouldRetry(error: any): boolean {
        // Retry on network errors or 5xx server errors
        if (!error.response) return true;

        const status = error.response.status;
        return status >= 500 && status < 600;
    }

    /**
     * Fetch multiple feeds concurrently with limit
     */
    async fetchMultiple(urls: string[], concurrency: number = 3): Promise<Map<string, { data?: string; error?: string }>> {
        const results = new Map<string, { data?: string; error?: string }>();

        // Process in batches
        for (let i = 0; i < urls.length; i += concurrency) {
            const batch = urls.slice(i, i + concurrency);

            const batchResults = await Promise.all(
                batch.map(async (url) => {
                    try {
                        const data = await this.fetch(url);
                        return { url, data };
                    } catch (error: any) {
                        return { url, error: error.message };
                    }
                })
            );

            batchResults.forEach(({ url, data, error }) => {
                results.set(url, { data, error });
            });
        }

        return results;
    }
}
