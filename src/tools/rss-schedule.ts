import { z } from 'zod';
import { FeedRepository, ScheduleRepository } from '../database/repository.js';
import { Scheduler } from '../services/scheduler.js';

/**
 * Input schema for rss_schedule tool
 */
export const RssScheduleInputSchema = z.object({
    action: z.enum(['create', 'list', 'delete']).describe('Schedule action'),
    feed_id: z.string().optional().describe('Feed ID (required for create/delete)'),
    cron_expression: z.string().optional().describe('Cron expression (required for create)'),
    schedule_id: z.string().optional().describe('Schedule ID (for delete)'),
    preset: z.string().optional().describe('Use preset schedule name instead of cron')
});

/**
 * Output schema for rss_schedule tool
 */
export const RssScheduleOutputSchema = z.object({
    success: z.boolean(),
    schedules: z.array(z.object({
        id: z.string(),
        feed_id: z.string(),
        feed_title: z.string().optional(),
        cron_expression: z.string(),
        description: z.string(),
        next_run: z.string().optional()
    })).optional(),
    presets: z.array(z.object({
        name: z.string(),
        cron: z.string(),
        description: z.string()
    })).optional(),
    message: z.string()
});

export type RssScheduleInput = z.infer<typeof RssScheduleInputSchema>;
export type RssScheduleOutput = z.infer<typeof RssScheduleOutputSchema>;

/**
 * Schedule automated feed updates
 */
export async function handleRssSchedule(
    input: RssScheduleInput,
    feedRepository: FeedRepository,
    scheduleRepository: ScheduleRepository
): Promise<RssScheduleOutput> {
    const { action, feed_id, cron_expression, schedule_id, preset } = input;

    try {
        switch (action) {
            case 'create': {
                if (!feed_id) {
                    return { success: false, message: 'feed_id gerekli' };
                }

                let cronExpr = cron_expression;

                // Use preset if specified
                if (preset) {
                    const presets = Scheduler.getPresets();
                    const presetMatch = presets.find(p => p.name === preset);
                    if (presetMatch) {
                        cronExpr = presetMatch.cron;
                    } else {
                        return { success: false, message: 'Geçersiz preset adı' };
                    }
                }

                if (!cronExpr) {
                    return { success: false, message: 'cron_expression veya preset gerekli' };
                }

                // Validate cron expression
                const validation = Scheduler.validateCron(cronExpr);
                if (!validation.valid) {
                    return {
                        success: false,
                        message: `Geçersiz cron expression: ${validation.error}`,
                        presets: Scheduler.getPresets()
                    };
                }

                const schedule = scheduleRepository.create(feed_id, cronExpr);
                const nextRun = Scheduler.getNextRun(cronExpr);
                const description = Scheduler.getScheduleDescription(cronExpr);

                return {
                    success: true,
                    schedules: [{
                        id: schedule.id,
                        feed_id: schedule.feed_id,
                        cron_expression: cronExpr,
                        description,
                        next_run: nextRun || undefined
                    }],
                    message: 'Schedule başarıyla oluşturuldu'
                };
            }

            case 'list': {
                const schedules = scheduleRepository.findAll();
                const schedulesWithInfo = schedules.map(s => {
                    const feed = feedRepository.findById(s.feed_id);
                    const description = Scheduler.getScheduleDescription(s.cron_expression);
                    const nextRun = s.next_run || Scheduler.getNextRun(s.cron_expression);

                    return {
                        id: s.id,
                        feed_id: s.feed_id,
                        feed_title: feed?.title,
                        cron_expression: s.cron_expression,
                        description,
                        next_run: nextRun || undefined
                    };
                });

                return {
                    success: true,
                    schedules: schedulesWithInfo,
                    presets: Scheduler.getPresets(),
                    message: `${schedules.length} schedule bulundu`
                };
            }

            case 'delete': {
                if (!schedule_id) {
                    return { success: false, message: 'schedule_id gerekli' };
                }

                scheduleRepository.delete(schedule_id);
                return {
                    success: true,
                    message: 'Schedule silindi'
                };
            }
        }

    } catch (error: any) {
        return {
            success: false,
            message: `Hata: ${error.message}`
        };
    }
}
