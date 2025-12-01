/**
 * Content analyzer for summarization, keyword extraction, and categorization
 */
export class ContentAnalyzer {
    /**
     * Create a simple extractive summary
     */
    static summarize(text: string, maxSentences: number = 2): string {
        if (!text) return '';

        // Clean HTML tags
        const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

        // Split into sentences
        const sentences = cleanText
            .split(/[.!?]+/)
            .map(s => s.trim())
            .filter(s => s.length > 20); // Filter out very short sentences

        if (sentences.length === 0) return cleanText.substring(0, 200) + '...';

        // Return first N sentences
        return sentences.slice(0, maxSentences).join('. ') + '.';
    }

    /**
     * Extract keywords using simple TF-IDF approach
     */
    static extractKeywords(text: string, maxKeywords: number = 5): string[] {
        if (!text) return [];

        // Clean and tokenize
        const cleanText = text.replace(/<[^>]*>/g, ' ').toLowerCase();
        const words = cleanText.split(/\W+/).filter(word => word.length > 3);

        // Remove common stop words
        const stopWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
            'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
            'should', 'may', 'might', 'must', 'can', 'about', 'into', 'through',
            'during', 'before', 'after', 'above', 'below', 'between', 'under',
            'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where',
            'why', 'how', 'all', 'both', 'each', 'few', 'more', 'most', 'other',
            'some', 'such', 'only', 'own', 'same', 'than', 'too', 'very', 'just'
        ]);

        const filteredWords = words.filter(word => !stopWords.has(word));

        // Count frequency
        const frequency = new Map<string, number>();
        filteredWords.forEach(word => {
            frequency.set(word, (frequency.get(word) || 0) + 1);
        });

        // Sort by frequency and return top keywords
        return Array.from(frequency.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, maxKeywords)
            .map(([word]) => word);
    }

    /**
     * Basic category classification based on keywords
     */
    static categorize(text: string, existingCategories?: string[]): string {
        if (existingCategories && existingCategories.length > 0) {
            return existingCategories[0];
        }

        const lowerText = text.toLowerCase();

        const categoryKeywords = {
            'technology': ['tech', 'software', 'hardware', 'computer', 'digital', 'ai', 'artificial intelligence', 'programming', 'code', 'app', 'internet', 'cyber'],
            'business': ['business', 'economy', 'market', 'stock', 'finance', 'company', 'corporate', 'trade', 'commerce', 'investment'],
            'sports': ['sport', 'game', 'player', 'team', 'match', 'tournament', 'championship', 'football', 'basketball', 'tennis', 'olympic'],
            'politics': ['politic', 'government', 'election', 'president', 'minister', 'parliament', 'senate', 'democrat', 'republican', 'vote'],
            'health': ['health', 'medical', 'hospital', 'doctor', 'disease', 'treatment', 'medicine', 'patient', 'virus', 'vaccine'],
            'science': ['science', 'research', 'study', 'scientist', 'discovery', 'experiment', 'academic', 'university', 'laboratory'],
            'entertainment': ['entertainment', 'movie', 'film', 'music', 'celebrity', 'actor', 'artist', 'show', 'concert', 'entertainment'],
            'world': ['world', 'international', 'global', 'country', 'nation', 'foreign', 'diplomacy']
        };

        let maxScore = 0;
        let bestCategory = 'general';

        for (const [category, keywords] of Object.entries(categoryKeywords)) {
            const score = keywords.filter(keyword => lowerText.includes(keyword)).length;
            if (score > maxScore) {
                maxScore = score;
                bestCategory = category;
            }
        }

        return bestCategory;
    }

    /**
     * Analyze trends from multiple articles
     */
    static analyzeTrends(articles: Array<{ title: string; description: string; categories: string[] }>): {
        topKeywords: Array<{ keyword: string; count: number }>;
        topCategories: Array<{ category: string; count: number }>;
    } {
        const allKeywords: string[] = [];
        const categoryCount = new Map<string, number>();

        articles.forEach(article => {
            // Extract keywords from title and description
            const text = `${article.title} ${article.description || ''}`;
            const keywords = this.extractKeywords(text, 10);
            allKeywords.push(...keywords);

            // Count categories
            article.categories.forEach(cat => {
                categoryCount.set(cat, (categoryCount.get(cat) || 0) + 1);
            });
        });

        // Count keyword frequency
        const keywordCount = new Map<string, number>();
        allKeywords.forEach(keyword => {
            keywordCount.set(keyword, (keywordCount.get(keyword) || 0) + 1);
        });

        // Sort and get top keywords
        const topKeywords = Array.from(keywordCount.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([keyword, count]) => ({ keyword, count }));

        // Sort and get top categories
        const topCategories = Array.from(categoryCount.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([category, count]) => ({ category, count }));

        return { topKeywords, topCategories };
    }

    /**
     * Detect language of text
     */
    static detectLanguage(text: string): string {
        const arabicRegex = /[\u0600-\u06FF]/;
        const turkishRegex = /[şğıİöüÖÜçÇ]/;
        const kurdishRegex = /[êîûçşĥ]/;

        if (arabicRegex.test(text)) return 'ar';
        if (turkishRegex.test(text)) return 'tr';
        if (kurdishRegex.test(text)) return 'ku';

        return 'en'; // Default to English
    }

    /**
     * Count words in text
     */
    static countWords(text: string): number {
        if (!text) return 0;

        const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        const words = cleanText.split(/\s+/);

        return words.filter(word => word.length > 0).length;
    }

    /**
     * Calculate reading time in minutes
     */
    static calculateReadingTime(wordCount: number): number {
        // Average reading speed: 200-250 words per minute
        const wordsPerMinute = 225;
        return Math.ceil(wordCount / wordsPerMinute);
    }
}

