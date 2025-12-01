import Database from 'better-sqlite3';
import { DB_SCHEMA, Feed, Article, FeedStatus } from './schema.js';
import { randomUUID } from 'crypto';
import path from 'path';
import fs from 'fs';

/**
 * Database connection manager
 */
export class DatabaseManager {
    private db: Database.Database;

    constructor(dbPath: string = process.env.DB_PATH || './data/rss.db') {
        // Ensure data directory exists
        const dir = path.dirname(dbPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        this.db = new Database(dbPath);
        this.db.pragma('journal_mode = WAL');
        this.db.pragma('foreign_keys = ON');

        this.initialize();
    }

    private initialize(): void {
        this.db.exec(DB_SCHEMA);
    }

    getDb(): Database.Database {
        return this.db;
    }

    close(): void {
        this.db.close();
    }
}

/**
 * Feed Repository
 */
export class FeedRepository {
    constructor(private db: Database.Database) { }

    create(url: string, title: string, description: string | null = null): Feed {
        const id = randomUUID();
        const addedDate = new Date().toISOString();

        const stmt = this.db.prepare(`
      INSERT INTO feeds (id, url, title, description, added_date, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

        stmt.run(id, url, title, description, addedDate, FeedStatus.ACTIVE);

        return {
            id,
            url,
            title,
            description,
            added_date: addedDate,
            last_updated: null,
            status: FeedStatus.ACTIVE,
            error_message: null
        };
    }

    findById(id: string): Feed | null {
        const stmt = this.db.prepare('SELECT * FROM feeds WHERE id = ?');
        const row = stmt.get(id) as any;
        return row || null;
    }

    findByUrl(url: string): Feed | null {
        const stmt = this.db.prepare('SELECT * FROM feeds WHERE url = ?');
        const row = stmt.get(url) as any;
        return row || null;
    }

    findAll(): Feed[] {
        const stmt = this.db.prepare('SELECT * FROM feeds ORDER BY added_date DESC');
        return stmt.all() as Feed[];
    }

    updateLastFetched(id: string, status: string = FeedStatus.ACTIVE, errorMessage: string | null = null): void {
        const lastUpdated = new Date().toISOString();
        const stmt = this.db.prepare(`
      UPDATE feeds 
      SET last_updated = ?, status = ?, error_message = ?
      WHERE id = ?
    `);
        stmt.run(lastUpdated, status, errorMessage, id);
    }

    updateStatus(id: string, status: string, errorMessage: string | null = null): void {
        const stmt = this.db.prepare(`
      UPDATE feeds 
      SET status = ?, error_message = ?
      WHERE id = ?
    `);
        stmt.run(status, errorMessage, id);
    }

    delete(id: string): void {
        const stmt = this.db.prepare('DELETE FROM feeds WHERE id = ?');
        stmt.run(id);
    }

    // Convenience methods
    getAll(): Feed[] {
        return this.findAll();
    }

    getById(id: string): Feed | null {
        return this.findById(id);
    }
}

/**
 * Article Repository
 */
export class ArticleRepository {
    constructor(private db: Database.Database) { }

    create(article: Omit<Article, 'id'>): Article {
        const id = randomUUID();

        const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO articles 
      (id, feed_id, title, link, pub_date, description, content, author, categories, guid)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        stmt.run(
            id,
            article.feed_id,
            article.title,
            article.link,
            article.pub_date,
            article.description,
            article.content,
            article.author,
            article.categories,
            article.guid
        );

        return { id, ...article };
    }

    findById(id: string): Article | null {
        const stmt = this.db.prepare('SELECT * FROM articles WHERE id = ?');
        const row = stmt.get(id) as any;
        return row || null;
    }

    findByFeedId(feedId: string, limit: number = 20, offset: number = 0): Article[] {
        const stmt = this.db.prepare(`
      SELECT * FROM articles 
      WHERE feed_id = ? 
      ORDER BY pub_date DESC 
      LIMIT ? OFFSET ?
    `);
        return stmt.all(feedId, limit, offset) as Article[];
    }

    countByFeedId(feedId: string): number {
        const stmt = this.db.prepare('SELECT COUNT(*) as count FROM articles WHERE feed_id = ?');
        const result = stmt.get(feedId) as any;
        return result.count;
    }

    search(params: {
        keyword?: string;
        feedId?: string;
        category?: string;
        dateFrom?: string;
        dateTo?: string;
        limit?: number;
        offset?: number;
    }): { articles: Article[]; total: number } {
        let whereClauses: string[] = [];
        let queryParams: any[] = [];

        if (params.keyword) {
            whereClauses.push('(title LIKE ? OR description LIKE ? OR content LIKE ?)');
            const keywordPattern = `%${params.keyword}%`;
            queryParams.push(keywordPattern, keywordPattern, keywordPattern);
        }

        if (params.feedId) {
            whereClauses.push('feed_id = ?');
            queryParams.push(params.feedId);
        }

        if (params.category) {
            whereClauses.push('categories LIKE ?');
            queryParams.push(`%${params.category}%`);
        }

        if (params.dateFrom) {
            whereClauses.push('pub_date >= ?');
            queryParams.push(params.dateFrom);
        }

        if (params.dateTo) {
            whereClauses.push('pub_date <= ?');
            queryParams.push(params.dateTo);
        }

        const whereClause = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

        // Get total count
        const countStmt = this.db.prepare(`SELECT COUNT(*) as count FROM articles ${whereClause}`);
        const countResult = countStmt.get(...queryParams) as any;
        const total = countResult.count;

        // Get articles
        const limit = params.limit || 20;
        const offset = params.offset || 0;
        const articlesStmt = this.db.prepare(`
      SELECT * FROM articles 
      ${whereClause}
      ORDER BY pub_date DESC 
      LIMIT ? OFFSET ?
    `);
        const articles = articlesStmt.all(...queryParams, limit, offset) as Article[];

        return { articles, total };
    }

    deleteByFeedId(feedId: string): void {
        const stmt = this.db.prepare('DELETE FROM articles WHERE feed_id = ?');
        stmt.run(feedId);
    }

    existsByGuid(feedId: string, guid: string): boolean {
        const stmt = this.db.prepare('SELECT 1 FROM articles WHERE feed_id = ? AND guid = ?');
        return stmt.get(feedId, guid) !== undefined;
    }
}

/**
 * Notification Repository
 */
export class NotificationRepository {
    constructor(private db: Database.Database) { }

    create(feedId: string | null, keywords: string[] | null, webhookUrl: string, frequency: string = 'immediate'): any {
        const id = randomUUID();
        const createdAt = new Date().toISOString();
        const keywordsStr = keywords ? JSON.stringify(keywords) : null;

        const stmt = this.db.prepare(`
      INSERT INTO notifications (id, feed_id, keywords, webhook_url, frequency, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
        stmt.run(id, feedId, keywordsStr, webhookUrl, frequency, createdAt);

        return { id, feed_id: feedId, keywords: keywordsStr, webhook_url: webhookUrl, frequency, enabled: 1, created_at: createdAt };
    }

    findAll(): any[] {
        const stmt = this.db.prepare('SELECT * FROM notifications WHERE enabled = 1');
        return stmt.all();
    }

    findById(id: string): any | null {
        const stmt = this.db.prepare('SELECT * FROM notifications WHERE id = ?');
        return stmt.get(id) as any || null;
    }

    delete(id: string): void {
        const stmt = this.db.prepare('DELETE FROM notifications WHERE id = ?');
        stmt.run(id);
    }

    updateLastTriggered(id: string): void {
        const stmt = this.db.prepare('UPDATE notifications SET last_triggered = ? WHERE id = ?');
        stmt.run(new Date().toISOString(), id);
    }
}

/**
 * Bookmark Repository
 */
export class BookmarkRepository {
    constructor(private db: Database.Database) { }

    create(articleId: string, tags: string[] | null = null, notes: string | null = null): any {
        const id = randomUUID();
        const createdAt = new Date().toISOString();
        const tagsStr = tags ? JSON.stringify(tags) : null;

        const stmt = this.db.prepare(`
      INSERT INTO bookmarks (id, article_id, tags, notes, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
        stmt.run(id, articleId, tagsStr, notes, createdAt);

        return { id, article_id: articleId, tags: tagsStr, notes, read_status: 'unread', created_at: createdAt };
    }

    findAll(): any[] {
        const stmt = this.db.prepare('SELECT * FROM bookmarks ORDER BY created_at DESC');
        return stmt.all();
    }

    findByArticleId(articleId: string): any | null {
        const stmt = this.db.prepare('SELECT * FROM bookmarks WHERE article_id = ?');
        return stmt.get(articleId) as any || null;
    }

    updateReadStatus(id: string, status: string): void {
        const updatedAt = new Date().toISOString();
        const stmt = this.db.prepare('UPDATE bookmarks SET read_status = ?, updated_at = ? WHERE id = ?');
        stmt.run(status, updatedAt, id);
    }

    delete(id: string): void {
        const stmt = this.db.prepare('DELETE FROM bookmarks WHERE id = ?');
        stmt.run(id);
    }
}

/**
 * Schedule Repository
 */
export class ScheduleRepository {
    constructor(private db: Database.Database) { }

    create(feedId: string, cronExpression: string): any {
        const id = randomUUID();
        const createdAt = new Date().toISOString();

        const stmt = this.db.prepare(`
      INSERT INTO schedules (id, feed_id, cron_expression, created_at)
      VALUES (?, ?, ?, ?)
    `);
        stmt.run(id, feedId, cronExpression, createdAt);

        return { id, feed_id: feedId, cron_expression: cronExpression, enabled: 1, created_at: createdAt };
    }

    findAll(): any[] {
        const stmt = this.db.prepare('SELECT * FROM schedules WHERE enabled = 1');
        return stmt.all();
    }

    findByFeedId(feedId: string): any | null {
        const stmt = this.db.prepare('SELECT * FROM schedules WHERE feed_id = ?');
        return stmt.get(feedId) as any || null;
    }

    updateLastRun(id: string, nextRun: string | null = null): void {
        const lastRun = new Date().toISOString();
        const stmt = this.db.prepare('UPDATE schedules SET last_run = ?, next_run = ? WHERE id = ?');
        stmt.run(lastRun, nextRun, id);
    }

    delete(id: string): void {
        const stmt = this.db.prepare('DELETE FROM schedules WHERE id = ?');
        stmt.run(id);
    }
}

/**
 * Credibility Repository
 */
export class CredibilityRepository {
    constructor(private db: Database.Database) { }

    upsert(feedId: string, score: number, httpsEnabled: boolean, updateFreq: number, metadataQuality: number): any {
        const id = randomUUID();
        const lastCheck = new Date().toISOString();

        const stmt = this.db.prepare(`
      INSERT INTO credibility_scores (id, feed_id, score, https_enabled, update_frequency, metadata_quality, last_check)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(feed_id) DO UPDATE SET
        score = excluded.score,
        https_enabled = excluded.https_enabled,
        update_frequency = excluded.update_frequency,
        metadata_quality = excluded.metadata_quality,
        last_check = excluded.last_check
    `);
        stmt.run(id, feedId, score, httpsEnabled ? 1 : 0, updateFreq, metadataQuality, lastCheck);

        return { id, feed_id: feedId, score, https_enabled: httpsEnabled, update_frequency: updateFreq, metadata_quality: metadataQuality, last_check: lastCheck };
    }

    findByFeedId(feedId: string): any | null {
        const stmt = this.db.prepare('SELECT * FROM credibility_scores WHERE feed_id = ?');
        return stmt.get(feedId) as any || null;
    }

    findAll(): any[] {
        const stmt = this.db.prepare('SELECT * FROM credibility_scores ORDER BY score DESC');
        return stmt.all();
    }
}

/**
 * Health Repository
 */
export class HealthRepository {
    constructor(private db: Database.Database) { }

    upsert(feedId: string, uptime: number, errorCount: number, successCount: number, avgResponseTime: number, status: string): any {
        const id = randomUUID();
        const lastCheck = new Date().toISOString();

        const stmt = this.db.prepare(`
      INSERT INTO health_metrics (id, feed_id, uptime_percentage, error_count, success_count, avg_response_time, last_check, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(feed_id) DO UPDATE SET
        uptime_percentage = excluded.uptime_percentage,
        error_count = excluded.error_count,
        success_count = excluded.success_count,
        avg_response_time = excluded.avg_response_time,
        last_check = excluded.last_check,
        status = excluded.status
    `);
        stmt.run(id, feedId, uptime, errorCount, successCount, avgResponseTime, lastCheck, status);

        return { id, feed_id: feedId, uptime_percentage: uptime, error_count: errorCount, success_count: successCount, avg_response_time: avgResponseTime, last_check: lastCheck, status };
    }

    findByFeedId(feedId: string): any | null {
        const stmt = this.db.prepare('SELECT * FROM health_metrics WHERE feed_id = ?');
        return stmt.get(feedId) as any || null;
    }

    findAll(): any[] {
        const stmt = this.db.prepare('SELECT * FROM health_metrics ORDER BY uptime_percentage DESC');
        return stmt.all();
    }
}

