import Sentiment from 'sentiment';

const sentiment = new Sentiment();

/**
 * Sentiment Analysis Service
 */
export class SentimentAnalyzer {
    /**
     * Analyze sentiment of text
     */
    static analyze(text: string): { score: number; label: string; comparative: number } {
        const result = sentiment.analyze(text);

        let label = 'neutral';
        if (result.score > 2) label = 'positive';
        else if (result.score < -2) label = 'negative';

        return {
            score: result.score,
            label,
            comparative: result.comparative
        };
    }

    /**
     * Batch analyze articles
     */
    static batchAnalyze(articles: any[]): any[] {
        return articles.map(article => {
            const text = `${article.title} ${article.description || ''}`;
            const analysis = this.analyze(text);

            return {
                ...article,
                sentiment: analysis
            };
        });
    }

    /**
     * Get sentiment distribution
     */
    static getDistribution(articles: any[]): { positive: number; neutral: number; negative: number } {
        const analyzed = this.batchAnalyze(articles);

        const distribution = {
            positive: 0,
            neutral: 0,
            negative: 0
        };

        analyzed.forEach(article => {
            distribution[article.sentiment.label as keyof typeof distribution]++;
        });

        return distribution;
    }

    /**
     * Get sentiment trend over time
     */
    static getTrend(articles: any[], days: number = 7): { date: string; avg_sentiment: number }[] {
        const analyzed = this.batchAnalyze(articles);
        const dateGroups = new Map<string, number[]>();

        analyzed.forEach(article => {
            try {
                const date = article.pub_date.split('T')[0];
                if (!dateGroups.has(date)) {
                    dateGroups.set(date, []);
                }
                dateGroups.get(date)!.push(article.sentiment.score);
            } catch { }
        });

        return Array.from(dateGroups.entries())
            .map(([date, scores]) => ({
                date,
                avg_sentiment: scores.reduce((a, b) => a + b, 0) / scores.length
            }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }
}
