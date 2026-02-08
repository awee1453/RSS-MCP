import natural from 'natural';

const tokenizer = new natural.WordTokenizer();

/**
 * AI-based Auto-Categorization Service
 */
export class AutoCategorizer {
    /**
     * Predefined category keywords
     */
    private static categoryKeywords: { [key: string]: string[] } = {
        'technology': ['tech', 'software', 'hardware', 'ai', 'computer', 'digital', 'cyber', 'app', 'programming', 'code'],
        'business': ['business', 'economy', 'market', 'finance', 'stock', 'trade', 'investment', 'company', 'startup'],
        'sports': ['sports', 'football', 'basketball', 'soccer', 'tennis', 'game', 'player', 'team', 'match', 'championship'],
        'politics': ['politics', 'government', 'election', 'president', 'congress', 'law', 'policy', 'minister', 'parliament'],
        'entertainment': ['entertainment', 'movie', 'music', 'celebrity', 'film', 'actor', 'album', 'concert', 'show'],
        'health': ['health', 'medical', 'doctor', 'hospital', 'disease', 'treatment', 'medicine', 'patient', 'wellness'],
        'science': ['science', 'research', 'study', 'scientist', 'discovery', 'experiment', 'theory', 'lab', 'physics'],
        'world': ['world', 'international', 'global', 'country', 'nation', 'foreign', 'diplomatic', 'war', 'peace'],
        'local': ['local', 'city', 'town', 'community', 'regional', 'mayor', 'council', 'neighborhood'],
        'education': ['education', 'school', 'university', 'student', 'teacher', 'learning', 'academic', 'college']
    };

    /**
     * Categorize single article
     */
    static categorize(article: any): string[] {
        const text = `${article.title} ${article.description || ''}`.toLowerCase();
        const tokens = tokenizer.tokenize(text) || [];
        const categories: Map<string, number> = new Map();

        // Score each category
        for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
            let score = 0;

            keywords.forEach(keyword => {
                if (tokens.includes(keyword) || text.includes(keyword)) {
                    score += 1;
                }
            });

            if (score > 0) {
                categories.set(category, score);
            }
        }

        // Return categories sorted by score
        const sortedCategories = Array.from(categories.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([cat, _]) => cat);

        // Return top 3 categories or 'general' if none match
        return sortedCategories.length > 0
            ? sortedCategories.slice(0, 3)
            : ['general'];
    }

    /**
     * Batch categorize articles
     */
    static batchCategorize(articles: any[]): any[] {
        return articles.map(article => ({
            ...article,
            suggested_categories: this.categorize(article)
        }));
    }

    /**
     * Suggest new categories based on content
     */
    static suggestCategories(articles: any[], minFrequency: number = 5): string[] {
        const wordFrequency = new Map<string, number>();
        const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']);

        articles.forEach(article => {
            const text = `${article.title} ${article.description || ''}`.toLowerCase();
            const tokens = tokenizer.tokenize(text) || [];

            tokens.forEach(token => {
                if (token.length > 4 && !stopWords.has(token)) {
                    wordFrequency.set(token, (wordFrequency.get(token) || 0) + 1);
                }
            });
        });

        // Find potential new categories
        const suggestions = Array.from(wordFrequency.entries())
            .filter(([_, count]) => count >= minFrequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([word, _]) => word);

        return suggestions;
    }

    /**
     * Get category distribution
     */
    static getCategoryDistribution(articles: any[]): { category: string; count: number; percentage: number }[] {
        const categoryCount = new Map<string, number>();

        articles.forEach(article => {
            const categories = this.categorize(article);
            categories.forEach(cat => {
                categoryCount.set(cat, (categoryCount.get(cat) || 0) + 1);
            });
        });

        const total = articles.length;

        return Array.from(categoryCount.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([category, count]) => ({
                category,
                count,
                percentage: Math.round((count / total) * 100)
            }));
    }
}
