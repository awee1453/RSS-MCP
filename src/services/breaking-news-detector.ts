/**
 * Breaking News Detector - Identifies urgent and breaking news articles
 */

export interface BreakingNewsResult {
    isBreaking: boolean;
    score: number;
    reasons: string[];
}

export class BreakingNewsDetector {
    // Breaking news keywords in multiple languages
    private static readonly BREAKING_KEYWORDS = {
        english: ['breaking', 'urgent', 'alert', 'just in', 'developing', 'live', 'emergency', 'critical'],
        turkish: ['son dakika', 'acil', 'flaş', 'haber', 'şimdi', 'canlı', 'kritik'],
        arabic: ['عاجل', 'خبر عاجل', 'الآن', 'طارئ', 'مباشر', 'هام', 'ضروري', 'عاجل جداً'],
        kurdish: ['nûçeyeke lezgîn', 'pêwîst', 'girîng']
    };

    /**
     * Analyze article to detect if it's breaking news
     */
    static analyze(title: string, content: string, pubDate: Date): BreakingNewsResult {
        const reasons: string[] = [];
        let score = 0;

        const combinedText = `${title} ${content || ''}`.toLowerCase();

        // Check for breaking news keywords in title (higher weight)
        const titleLower = title.toLowerCase();
        for (const [lang, keywords] of Object.entries(this.BREAKING_KEYWORDS)) {
            for (const keyword of keywords) {
                if (titleLower.includes(keyword.toLowerCase())) {
                    score += 10;
                    reasons.push(`Breaking keyword in title: "${keyword}" (${lang})`);
                    break; // Only count once per language
                }
            }
        }

        // Check for breaking news keywords in content (lower weight)
        if (content) {
            for (const [lang, keywords] of Object.entries(this.BREAKING_KEYWORDS)) {
                for (const keyword of keywords) {
                    if (combinedText.includes(keyword.toLowerCase()) && !titleLower.includes(keyword.toLowerCase())) {
                        score += 3;
                        reasons.push(`Breaking keyword in content: "${keyword}" (${lang})`);
                        break;
                    }
                }
            }
        }

        // Check for urgency indicators
        const urgencyPatterns = [
            /\b(just|now|minutes? ago|hours? ago)\b/i,
            /\b\d+\s*(minute|hour)s?\s*ago\b/i,
            /\b(immediate|instantly|right now)\b/i
        ];

        for (const pattern of urgencyPatterns) {
            if (pattern.test(combinedText)) {
                score += 5;
                reasons.push('Urgency indicator found');
                break;
            }
        }

        // Recency bonus - articles published within last hour get higher score
        const hoursSincePublish = (Date.now() - pubDate.getTime()) / (1000 * 60 * 60);
        if (hoursSincePublish < 1) {
            score += 8;
            reasons.push('Published within last hour');
        } else if (hoursSincePublish < 6) {
            score += 4;
            reasons.push('Published within last 6 hours');
        }

        // Exclamation marks (multiple indicates urgency)
        const exclamationCount = (title.match(/!/g) || []).length;
        if (exclamationCount >= 2) {
            score += 3;
            reasons.push('Multiple exclamation marks');
        }

        // ALL CAPS words in title (indicates urgency)
        const upperCaseWords = title.match(/\b[A-Z]{2,}\b/g) || [];
        if (upperCaseWords.length >= 2) {
            score += 4;
            reasons.push('Multiple uppercase words in title');
        }

        // Determine if breaking based on score threshold
        const isBreaking = score >= 10;

        return {
            isBreaking,
            score,
            reasons: reasons.slice(0, 5) // Limit to top 5 reasons
        };
    }

    /**
     * Get priority level based on breaking score
     */
    static getPriorityLevel(score: number): 'critical' | 'high' | 'medium' | 'low' {
        if (score >= 25) return 'critical';
        if (score >= 15) return 'high';
        if (score >= 10) return 'medium';
        return 'low';
    }
}
