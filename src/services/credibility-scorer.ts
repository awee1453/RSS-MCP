/**
 * Feed Credibility Scoring Service
 */
export class CredibilityScorer {
    /**
     * Calculate overall credibility score for a feed
     */
    static calculateScore(feed: any, metrics: {
        httpsEnabled: boolean;
        updateFrequency: number; // articles per day
        metadataQuality: number; // 0-100
        hasDescription: boolean;
        hasImage: boolean;
    }): number {
        let score = 0;

        // HTTPS adds 20 points
        if (metrics.httpsEnabled) {
            score += 20;
        }

        // Update frequency (max 30 points)
        if (metrics.updateFrequency >= 10) {
            score += 30;
        } else if (metrics.updateFrequency >= 5) {
            score += 20;
        } else if (metrics.updateFrequency >= 1) {
            score += 10;
        }

        // Metadata quality (max 30 points)
        score += Math.min(30, metrics.metadataQuality * 0.3);

        // Feed has description (10 points)
        if (metrics.hasDescription) {
            score += 10;
        }

        // Feed has image/logo (10 points)
        if (metrics.hasImage) {
            score += 10;
        }

        return Math.min(100, Math.round(score));
    }

    /**
     * Assess metadata quality
     */
    static assessMetadataQuality(feed: any): number {
        let quality = 0;

        if (feed.title && feed.title.length > 5) quality += 25;
        if (feed.description && feed.description.length > 20) quality += 25;
        if (feed.url) quality += 25;
        if (feed.last_updated) quality += 25;

        return quality;
    }

    /**
     * Get credibility label
     */
    static getLabel(score: number): string {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        if (score >= 20) return 'Poor';
        return 'Very Poor';
    }

    /**
     * Get recommendations for improving credibility
     */
    static getRecommendations(score: number, metrics: any): string[] {
        const recommendations: string[] = [];

        if (!metrics.httpsEnabled) {
            recommendations.push('Enable HTTPS for secure connection');
        }

        if (metrics.updateFrequency < 1) {
            recommendations.push('Increase update frequency');
        }

        if (metrics.metadataQuality < 75) {
            recommendations.push('Improve feed metadata (title, description)');
        }

        if (!metrics.hasDescription) {
            recommendations.push('Add feed description');
        }

        if (score < 50) {
            recommendations.push('Consider verifying feed source authenticity');
        }

        return recommendations;
    }
}
