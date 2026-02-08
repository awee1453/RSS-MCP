import cronParser from 'cron-parser';

/**
 * Feed Scheduling Service
 */
export class Scheduler {
    /**
     * Validate cron expression
     */
    static validateCron(expression: string): { valid: boolean; error: string | null } {
        try {
            cronParser.parseExpression(expression);
            return { valid: true, error: null };
        } catch (error: any) {
            return { valid: false, error: error.message };
        }
    }

    /**
     * Calculate next run time
     */
    static getNextRun(cronExpression: string): string | null {
        try {
            const interval = cronParser.parseExpression(cronExpression);
            return interval.next().toISOString();
        } catch (error) {
            return null;
        }
    }

    /**
     * Get human-readable schedule description
     */
    static getScheduleDescription(cronExpression: string): string {
        try {
            // Basic patterns
            const patterns: { [key: string]: string } = {
                '* * * * *': 'Every minute',
                '0 * * * *': 'Every hour',
                '0 */2 * * *': 'Every 2 hours',
                '0 */6 * * *': 'Every 6 hours',
                '0 0 * * *': 'Daily at midnight',
                '0 9 * * *': 'Daily at 9:00 AM',
                '0 0 * * 0': 'Weekly on Sunday',
                '0 0 1 * *': 'Monthly on the 1st'
            };

            if (patterns[cronExpression]) {
                return patterns[cronExpression];
            }

            const parts = cronExpression.split(' ');
            if (parts.length === 5) {
                const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

                if (hour !== '*' && minute !== '*') {
                    return `Daily at ${hour}:${minute.padStart(2, '0')}`;
                }

                if (hour.startsWith('*/')) {
                    const hours = hour.substring(2);
                    return `Every ${hours} hours`;
                }
            }

            return `Custom schedule: ${cronExpression}`;
        } catch (error) {
            return 'Invalid schedule';
        }
    }

    /**
     * Check if schedule should run now
     */
    static shouldRunNow(lastRun: string | null, cronExpression: string): boolean {
        try {
            if (!lastRun) return true;

            const lastRunTime = new Date(lastRun);
            const interval = cronParser.parseExpression(cronExpression, {
                currentDate: lastRunTime
            });

            const nextRun = interval.next().toDate();
            const now = new Date();

            return now >= nextRun;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get common schedule presets
     */
    static getPresets(): { name: string; cron: string; description: string }[] {
        return [
            { name: 'Every hour', cron: '0 * * * *', description: 'Updates every hour on the hour' },
            { name: 'Every 2 hours', cron: '0 */2 * * *', description: 'Updates every 2 hours' },
            { name: 'Every 6 hours', cron: '0 */6 * * *', description: 'Updates 4 times daily' },
            { name: 'Every 12 hours', cron: '0 */12 * * *', description: 'Updates twice daily' },
            { name: 'Daily at 9 AM', cron: '0 9 * * *', description: 'Updates once daily at 9:00 AM' },
            { name: 'Daily at midnight', cron: '0 0 * * *', description: 'Updates once daily at midnight' },
            { name: 'Weekly (Monday 9 AM)', cron: '0 9 * * 1', description: 'Updates every Monday at 9:00 AM' }
        ];
    }
}
