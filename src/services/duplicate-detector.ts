/**
 * Duplicate Detector - Identifies similar/duplicate articles using text similarity
 */
import { compareTwoStrings } from 'string-similarity';

export interface SimilarArticle {
    articleId: string;
    title: string;
    similarity: number;
    matchType: 'exact' | 'high' | 'medium';
}

export interface DuplicateGroup {
    mainArticle: {
        id: string;
        title: string;
        feedId: string;
        feedTitle: string;
    };
    duplicates: Array<{
        id: string;
        title: string;
        feedId: string;
        feedTitle: string;
        similarity: number;
        matchType: string;
    }>;
    totalCount: number;
}

export class DuplicateDetector {
    /**
     * Calculate similarity between two text strings
     */
    static calculateSimilarity(text1: string, text2: string): number {
        if (!text1 || !text2) return 0;

        // Clean texts
        const clean1 = this.normalizeText(text1);
        const clean2 = this.normalizeText(text2);

        if (clean1 === clean2) return 1.0;

        return compareTwoStrings(clean1, clean2);
    }

    /**
     * Normalize text for comparison
     */
    private static normalizeText(text: string): string {
        return text
            .toLowerCase()
            .trim()
            // Remove extra whitespace
            .replace(/\s+/g, ' ')
            // Remove punctuation
            .replace(/[^\w\s\u0600-\u06FF]/g, '')
            // Remove common words that don't add meaning
            .replace(/\b(the|a|an|and|or|but|in|on|at|to|for)\b/g, '');
    }

    /**
     * Check if two articles are duplicates based on title and content
     */
    static isDuplicate(
        title1: string,
        content1: string | null,
        title2: string,
        content2: string | null,
        titleThreshold: number = 0.85,
        contentThreshold: number = 0.75
    ): { isDuplicate: boolean; similarity: number; matchType: 'exact' | 'high' | 'medium' | 'low' } {
        // Calculate title similarity
        const titleSimilarity = this.calculateSimilarity(title1, title2);

        // If titles are very similar, it's likely a duplicate
        if (titleSimilarity >= titleThreshold) {
            return {
                isDuplicate: true,
                similarity: titleSimilarity,
                matchType: titleSimilarity >= 0.95 ? 'exact' : 'high'
            };
        }

        // If we have content, check content similarity
        if (content1 && content2) {
            const contentSimilarity = this.calculateSimilarity(
                content1.substring(0, 500), // Compare first 500 chars
                content2.substring(0, 500)
            );

            if (contentSimilarity >= contentThreshold) {
                return {
                    isDuplicate: true,
                    similarity: contentSimilarity,
                    matchType: 'medium'
                };
            }

            // Combined score
            const combinedScore = (titleSimilarity * 0.7) + (contentSimilarity * 0.3);
            if (combinedScore >= 0.70) {
                return {
                    isDuplicate: true,
                    similarity: combinedScore,
                    matchType: 'medium'
                };
            }
        }

        return {
            isDuplicate: false,
            similarity: titleSimilarity,
            matchType: 'low'
        };
    }

    /**
     * Find similar articles from a list
     */
    static findSimilar(
        targetArticle: { title: string; content: string | null },
        articles: Array<{ id: string; title: string; content: string | null }>,
        threshold: number = 0.75
    ): SimilarArticle[] {
        const similar: SimilarArticle[] = [];

        for (const article of articles) {
            const result = this.isDuplicate(
                targetArticle.title,
                targetArticle.content,
                article.title,
                article.content,
                threshold
            );

            if (result.isDuplicate) {
                similar.push({
                    articleId: article.id,
                    title: article.title,
                    similarity: result.similarity,
                    matchType: result.matchType
                });
            }
        }

        // Sort by similarity (highest first)
        return similar.sort((a, b) => b.similarity - a.similarity);
    }

    /**
     * Calculate Levenshtein distance for exact matching
     */
    static levenshteinDistance(str1: string, str2: string): number {
        const m = str1.length;
        const n = str2.length;
        const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

        for (let i = 0; i <= m; i++) dp[i][0] = i;
        for (let j = 0; j <= n; j++) dp[0][j] = j;

        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (str1[i - 1] === str2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1];
                } else {
                    dp[i][j] = Math.min(
                        dp[i - 1][j] + 1,
                        dp[i][j - 1] + 1,
                        dp[i - 1][j - 1] + 1
                    );
                }
            }
        }

        return dp[m][n];
    }
}
