import stringSimilarity from 'string-similarity';

/**
 * Feed Recommendation Engine
 */
export class RecommendationEngine {
    /**
     * Recommend feeds based on content similarity
     */
    static recommendFeeds(
        currentFeeds: any[],
        allPossibleFeeds: any[],
        userPreferences?: { categories?: string[]; language?: string }
    ): any[] {
        const recommendations: any[] = [];

        // Filter by user preferences
        let candidateFeeds = allPossibleFeeds.filter(feed =>
            !currentFeeds.some(cf => cf.url === feed.url)
        );

        if (userPreferences?.categories && userPreferences.categories.length > 0) {
            candidateFeeds = candidateFeeds.filter(feed => {
                const feedCats = (feed.categories || '').toLowerCase();
                return userPreferences.categories!.some(cat =>
                    feedCats.includes(cat.toLowerCase())
                );
            });
        }

        if (userPreferences?.language) {
            candidateFeeds = candidateFeeds.filter(feed =>
                (feed.language || 'en').toLowerCase() === userPreferences.language!.toLowerCase()
            );
        }

        // Score by content similarity
        currentFeeds.forEach(currentFeed => {
            candidateFeeds.forEach(candidate => {
                const similarity = stringSimilarity.compareTwoStrings(
                    currentFeed.title + ' ' + (currentFeed.description || ''),
                    candidate.title + ' ' + (candidate.description || '')
                );

                if (similarity > 0.3) {
                    const existing = recommendations.find(r => r.url === candidate.url);
                    if (existing) {
                        existing.score += similarity;
                    } else {
                        recommendations.push({
                            ...candidate,
                            score: similarity,
                            reason: `Similar to: ${currentFeed.title}`
                        });
                    }
                }
            });
        });

        return recommendations
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
    }

    /**
     * Suggest categories based on reading patterns
     */
    static suggestCategories(articles: any[]): { category: string; count: number }[] {
        const categoryCount = new Map<string, number>();

        articles.forEach(article => {
            if (article.categories) {
                try {
                    const cats = JSON.parse(article.categories);
                    cats.forEach((cat: string) => {
                        categoryCount.set(cat, (categoryCount.get(cat) || 0) + 1);
                    });
                } catch { }
            }
        });

        return Array.from(categoryCount.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([category, count]) => ({ category, count }));
    }
}
