import stringSimilarity from 'string-similarity';

/**
 * Cross-Source Verification Service
 */
export class CrossVerifier {
    /**
     * Find similar articles across feeds
     */
    static findSimilarArticles(
        targetArticle: any,
        allArticles: any[],
        similarityThreshold: number = 0.6
    ): any[] {
        const similar: any[] = [];

        allArticles.forEach(article => {
            // Skip same article
            if (article.id === targetArticle.id) return;

            // Calculate title similarity
            const titleSimilarity = stringSimilarity.compareTwoStrings(
                targetArticle.title.toLowerCase(),
                article.title.toLowerCase()
            );

            // Calculate description similarity
            let descSimilarity = 0;
            if (targetArticle.description && article.description) {
                descSimilarity = stringSimilarity.compareTwoStrings(
                    targetArticle.description.toLowerCase(),
                    article.description.toLowerCase()
                );
            }

            // Combined similarity score
            const similarity = (titleSimilarity * 0.7) + (descSimilarity * 0.3);

            if (similarity >= similarityThreshold) {
                similar.push({
                    ...article,
                    similarity_score: Math.round(similarity * 100)
                });
            }
        });

        return similar.sort((a, b) => b.similarity_score - a.similarity_score);
    }

    /**
     * Compare coverage across multiple feeds
     */
    static compareCoverage(articles: any[], feedIds: string[]): any {
        const coverageMap = new Map<string, Set<string>>();

        // Group articles by similar content
        articles.forEach(article => {
            let foundGroup = false;

            for (const [groupTitle, feedSet] of coverageMap.entries()) {
                const similarity = stringSimilarity.compareTwoStrings(
                    article.title.toLowerCase(),
                    groupTitle.toLowerCase()
                );

                if (similarity > 0.7) {
                    feedSet.add(article.feed_id);
                    foundGroup = true;
                    break;
                }
            }

            if (!foundGroup) {
                coverageMap.set(article.title, new Set([article.feed_id]));
            }
        });

        // Calculate coverage statistics
        const coverage: any[] = [];

        for (const [title, feedSet] of coverageMap.entries()) {
            coverage.push({
                title,
                covered_by: Array.from(feedSet),
                coverage_count: feedSet.size,
                coverage_percentage: Math.round((feedSet.size / feedIds.length) * 100)
            });
        }

        return {
            total_stories: coverageMap.size,
            coverage_details: coverage.sort((a, b) => b.coverage_count - a.coverage_count)
        };
    }

    /**
     * Detect perspective differences
     */
    static detectPerspectives(similarArticles: any[]): {
        common_keywords: string[];
        unique_perspectives: any[];
    } {
        const allWords = new Set<string>();
        const wordsByArticle: Map<string, Set<string>> = new Map();

        similarArticles.forEach(article => {
            const text = `${article.title} ${article.description || ''}`.toLowerCase();
            const words = text.split(/\s+/).filter(w => w.length > 4);

            words.forEach(w => allWords.add(w));
            wordsByArticle.set(article.id, new Set(words));
        });

        // Find common keywords
        const commonKeywords: string[] = [];
        for (const word of allWords) {
            let count = 0;
            wordsByArticle.forEach(wordSet => {
                if (wordSet.has(word)) count++;
            });

            if (count >= similarArticles.length * 0.5) {
                commonKeywords.push(word);
            }
        }

        // Find unique perspectives
        const uniquePerspectives: any[] = [];
        similarArticles.forEach(article => {
            const words = wordsByArticle.get(article.id) || new Set();
            const uniqueWords = Array.from(words).filter(w => !commonKeywords.includes(w));

            uniquePerspectives.push({
                feed_id: article.feed_id,
                title: article.title,
                unique_keywords: uniqueWords.slice(0, 5),
                perspective_score: uniqueWords.length
            });
        });

        return {
            common_keywords: commonKeywords.slice(0, 10),
            unique_perspectives
        };
    }
}
