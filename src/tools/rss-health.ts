import { z } from 'zod';
import { FeedRepository, HealthRepository } from '../database/repository.js';
import { HealthMonitor } from '../services/health-monitor.js';

/**
 * Input schema for rss_health_monitor tool
 */
export const RssHealthInputSchema = z.object({
    feed_id: z.string().optional().describe('Specific feed ID (optional, leave empty for all feeds)'),
    check_now: z.boolean().default(false).describe('Perform live health check')
});

/**
 * Output schema for rss_health_monitor tool
 */
export const RssHealthOutputSchema = z.object({
    health_status: z.array(z.object({
        feed_id: z.string(),
        feed_title: z.string(),
        status: z.string(),
        uptime_percentage: z.number(),
        avg_response_time: z.number(),
        error_count: z.number(),
        last_check: z.string(),
        needs_attention: z.boolean(),
        recommendations: z.array(z.string())
    }))
});

export type RssHealthInput = z.infer<typeof RssHealthInputSchema>;
export type RssHealthOutput = z.infer<typeof RssHealthOutputSchema>;

/**
 * Monitor feed health and performance
 */
export async function handleRssHealth(
    input: RssHealthInput,
    feedRepository: FeedRepository,
    healthRepository: HealthRepository
): Promise<RssHealthOutput> {
    const { feed_id, check_now } = input;

    const feeds = feed_id
        ? [feedRepository.findById(feed_id)].filter(Boolean)
        : feedRepository.findAll();

    const healthStatus = await Promise.all(feeds.map(async (feed) => {
        let metrics: any;

        if (check_now) {
            // Perform live health check
            const healthCheck = await HealthMonitor.checkHealth(feed!.url);
            const successCount = healthCheck.isHealthy ? 1 : 0;
            const errorCount = healthCheck.isHealthy ? 0 : 1;
            const uptime = HealthMonitor.calculateUptime(successCount, errorCount);
            const status = HealthMonitor.getHealthStatus(uptime, errorCount);

            // Save to database
            healthRepository.upsert(
                feed!.id,
                uptime,
                errorCount,
                successCount,
                healthCheck.responseTime,
                status
            );

            metrics = {
                uptime,
                errorCount,
                avgResponseTime: healthCheck.responseTime,
                status,
                lastCheck: new Date().toISOString()
            };
        } else {
            // Get from database
            const existing = healthRepository.findByFeedId(feed!.id);
            if (existing) {
                metrics = {
                    uptime: existing.uptime_percentage,
                    errorCount: existing.error_count,
                    avgResponseTime: existing.avg_response_time,
                    status: existing.status,
                    lastCheck: existing.last_check
                };
            } else {
                // Default metrics if never checked
                metrics = {
                    uptime: 100,
                    errorCount: 0,
                    avgResponseTime: 0,
                    status: 'unknown',
                    lastCheck: new Date().toISOString()
                };
            }
        }

        const needsAttention = HealthMonitor.needsAttention(metrics);
        const recommendations = HealthMonitor.getRecommendations(metrics.status, metrics);

        return {
            feed_id: feed!.id,
            feed_title: feed!.title,
            status: metrics.status,
            uptime_percentage: metrics.uptime,
            avg_response_time: metrics.avgResponseTime,
            error_count: metrics.errorCount,
            last_check: metrics.lastCheck,
            needs_attention: needsAttention,
            recommendations
        };
    }));

    return { health_status: healthStatus };
}
