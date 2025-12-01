import natural from 'natural';

const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;

/**
 * Trend Analysis Service
 */
export class TrendAnalyzer {
    /**
     * Extract trending topics from articles
     */
    static analyzeTrends(articles: any[]): { keyword: string; count: number; trend: string }[] {
        const wordCounts = new Map<string, number>();
        const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'can', 'this', 'that', 'these', 'those']);

        articles.forEach(article => {
            const text = `${article.title} ${article.description || ''}`;
            const tokens = tokenizer.tokenize(text.toLowerCase()) || [];

            tokens.forEach(token => {
                if (token.length > 3 && !stopWords.has(token)) {
                    wordCounts.set(token, (wordCounts.get(token) || 0) + 1);
                }
            });
        });

        const trends = Array.from(wordCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
            .map(([keyword, count]) => ({
                keyword,
                count,
                trend: count > 5 ? 'rising' : 'stable'
            }));

        return trends;
    }

    /**
     * Cluster articles by topic using TF-IDF
     */
    static clusterTopics(articles: any[], numClusters: number = 5): { [key: string]: any[] } {
        if (articles.length === 0) return {};

        const tfidf = new TfIdf();
        articles.forEach(article => {
            tfidf.addDocument(`${article.title} ${article.description || ''}`);
        });

        const clusters: { [key: string]: any[] } = {};

        articles.forEach((article, idx) => {
            const topTerms = tfidf.listTerms(idx).slice(0, 3);
            if (topTerms.length > 0) {
                const clusterKey = topTerms[0].term;
                if (!clusters[clusterKey]) {
                    clusters[clusterKey] = [];
                }
                clusters[clusterKey].push(article);
            }
        });

        return clusters;
    }

    /**
     * Analyze time-based trends
     */
    static analyzeTimeTrends(articles: any[]): { hour: number; count: number }[] {
        const hourCounts = new Map<number, number>();

        articles.forEach(article => {
            try {
                const hour = new Date(article.pub_date).getHours();
                hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
            } catch { }
        });

        return Array.from({ length: 24 }, (_, hour) => ({
            hour,
            count: hourCounts.get(hour) || 0
        }));
    }
}
