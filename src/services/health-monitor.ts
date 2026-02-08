import axios from 'axios';

/**
 * Feed Health Monitoring Service
 */
export class HealthMonitor {
    /**
     * Check feed health
     */
    static async checkHealth(feedUrl: string): Promise<{
        isHealthy: boolean;
        responseTime: number;
        statusCode: number | null;
        error: string | null;
    }> {
        const startTime = Date.now();

        try {
            const response = await axios.get(feedUrl, {
                timeout: 10000,
                validateStatus: () => true
            });

            const responseTime = Date.now() - startTime;
            const isHealthy = response.status >= 200 && response.status < 300;

            return {
                isHealthy,
                responseTime,
                statusCode: response.status,
                error: null
            };
        } catch (error: any) {
            const responseTime = Date.now() - startTime;

            return {
                isHealthy: false,
                responseTime,
                statusCode: null,
                error: error.message || 'Unknown error'
            };
        }
    }

    /**
     * Calculate uptime percentage
     */
    static calculateUptime(successCount: number, errorCount: number): number {
        const total = successCount + errorCount;
        if (total === 0) return 100;

        return Math.round((successCount / total) * 100 * 10) / 10;
    }

    /**
     * Get health status label
     */
    static getHealthStatus(uptime: number, errorCount: number): string {
        if (uptime >= 99 && errorCount < 5) return 'healthy';
        if (uptime >= 95 && errorCount < 10) return 'warning';
        return 'unhealthy';
    }

    /**
     * Determine if feed needs attention
     */
    static needsAttention(metrics: {
        uptime: number;
        errorCount: number;
        avgResponseTime: number;
        lastCheck: string;
    }): boolean {
        // Check if uptime is low
        if (metrics.uptime < 95) return true;

        // Check if response time is too high (>5 seconds)
        if (metrics.avgResponseTime > 5000) return true;

        // Check if error count is high
        if (metrics.errorCount > 10) return true;

        // Check if not checked recently (>24 hours)
        try {
            const lastCheckTime = new Date(metrics.lastCheck).getTime();
            const now = Date.now();
            const hoursSinceCheck = (now - lastCheckTime) / (1000 * 60 * 60);
            if (hoursSinceCheck > 24) return true;
        } catch { }

        return false;
    }

    /**
     * Get health recommendations
     */
    static getRecommendations(status: string, metrics: any): string[] {
        const recommendations: string[] = [];

        if (status === 'unhealthy') {
            recommendations.push('Feed may be down or unreachable');
            recommendations.push('Consider removing this feed if issue persists');
        }

        if (status === 'warning') {
            recommendations.push('Monitor feed performance closely');
        }

        if (metrics.avgResponseTime > 5000) {
            recommendations.push('Feed has slow response times');
        }

        if (metrics.errorCount > 5) {
            recommendations.push('Multiple errors detected recently');
        }

        return recommendations;
    }
}
