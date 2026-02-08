/**
 * Analytics Service - Provides insights and statistics on news feeds
 */

export interface FeedStatistics {
    feedId: string;
    feedTitle: string;
    totalArticles: number;
    articlesLast24h: number;
    articlesLast7d: number;
    averagePerDay: number;
    breakingNewsCount: number;
    topCategories: Array<{ category: string; count: number }>;
    averageWordCount: number;
}

export interface TimeSeriesData {
    date: string;
    count: number;
}

export interface AnalyticsReport {
    totalFeeds: number;
    totalArticles: number;
    totalBreakingNews: number;
    feedStatistics: FeedStatistics[];
    publishingTrend: TimeSeriesData[];
    topKeywords: Array<{ keyword: string; count: number }>;
    categoryDistribution: Array<{ category: string; count: number }>;
    peakPublishingHours: Array<{ hour: number; count: number }>;
}

export class AnalyticsService {
    /**
     * Calculate feed statistics
     */
    static calculateFeedStats(articles: Array<{
        feed_id: string;
        pub_date: string;
        categories: string | null;
        word_count: number | null;
        is_breaking: boolean;
    }>): Map<string, Partial<FeedStatistics>> {
        const stats = new Map<string, Partial<FeedStatistics>>();
        const now = Date.now();
        const day24h = 24 * 60 * 60 * 1000;
        const day7d = 7 * day24h;

        articles.forEach(article => {
            if (!stats.has(article.feed_id)) {
                stats.set(article.feed_id, {
                    feedId: article.feed_id,
                    totalArticles: 0,
                    articlesLast24h: 0,
                    articlesLast7d: 0,
                    breakingNewsCount: 0,
                    topCategories: [],
                    averageWordCount: 0
                });
            }

            const feedStat = stats.get(article.feed_id)!;
            feedStat.totalArticles = (feedStat.totalArticles || 0) + 1;

            const pubTime = new Date(article.pub_date).getTime();
            const ageMs = now - pubTime;

            if (ageMs < day24h) {
                feedStat.articlesLast24h = (feedStat.articlesLast24h || 0) + 1;
            }
            if (ageMs < day7d) {
                feedStat.articlesLast7d = (feedStat.articlesLast7d || 0) + 1;
            }

            if (article.is_breaking) {
                feedStat.breakingNewsCount = (feedStat.breakingNewsCount || 0) + 1;
            }
        });

        // Calculate averages
        stats.forEach((stat) => {
            stat.averagePerDay = (stat.articlesLast7d || 0) / 7;
        });

        return stats;
    }

    /**
     * Generate time series data for publishing trend
     */
    static generateTimeSeriesData(
        articles: Array<{ pub_date: string }>,
        days: number = 30
    ): TimeSeriesData[] {
        const dateCounts = new Map<string, number>();
        const now = new Date();

        // Initialize all dates
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            dateCounts.set(dateStr, 0);
        }

        // Count articles per date
        articles.forEach(article => {
            const date = new Date(article.pub_date).toISOString().split('T')[0];
            if (dateCounts.has(date)) {
                dateCounts.set(date, (dateCounts.get(date) || 0) + 1);
            }
        });

        return Array.from(dateCounts.entries())
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }

    /**
     * Analyze peak publishing hours
     */
    static analyzePeakHours(articles: Array<{ pub_date: string }>): Array<{ hour: number; count: number }> {
        const hourCounts = new Map<number, number>();

        // Initialize hours 0-23
        for (let i = 0; i < 24; i++) {
            hourCounts.set(i, 0);
        }

        articles.forEach(article => {
            const hour = new Date(article.pub_date).getHours();
            hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
        });

        return Array.from(hourCounts.entries())
            .map(([hour, count]) => ({ hour, count }))
            .sort((a, b) => b.count - a.count); // Sort by count descending
    }

    /**
     * Calculate category distribution
     */
    static analyzeCategoryDistribution(
        articles: Array<{ categories: string | null }>
    ): Array<{ category: string; count: number }> {
        const categoryCounts = new Map<string, number>();

        articles.forEach(article => {
            if (article.categories) {
                try {
                    const cats = JSON.parse(article.categories);
                    if (Array.isArray(cats)) {
                        cats.forEach((cat: string) => {
                            categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
                        });
                    }
                } catch (e) {
                    // Invalid JSON, skip
                }
            }
        });

        return Array.from(categoryCounts.entries())
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count);
    }

    /**
     * Extract and count keywords from articles
     */
    static extractTopKeywords(
        articles: Array<{ title: string; description: string | null }>,
        topN: number = 20
    ): Array<{ keyword: string; count: number }> {
        const keywordCounts = new Map<string, number>();
        const stopWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
            'have', 'has', 'had', 'this', 'that', 'these', 'those', 'will', 'would'
        ]);

        articles.forEach(article => {
            const text = `${article.title} ${article.description || ''}`.toLowerCase();
            const words = text.match(/\b\w+\b/g) || [];

            words.forEach(word => {
                if (word.length > 3 && !stopWords.has(word)) {
                    keywordCounts.set(word, (keywordCounts.get(word) || 0) + 1);
                }
            });
        });

        return Array.from(keywordCounts.entries())
            .map(([keyword, count]) => ({ keyword, count }))
            .filter(item => item.count > 1) // Only keywords that appear more than once
            .sort((a, b) => b.count - a.count)
            .slice(0, topN);
    }

    /**
     * Calculate reading time in minutes based on word count
     */
    static calculateReadingTime(wordCount: number): number {
        // Average reading speed: 200-250 words per minute
        const wordsPerMinute = 225;
        return Math.ceil(wordCount / wordsPerMinute);
    }
}
