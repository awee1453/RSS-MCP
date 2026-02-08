import { z } from 'zod';

/**
 * Feed status enum
 */
export const FeedStatus = {
  ACTIVE: 'active',
  ERROR: 'error',
  PENDING: 'pending'
} as const;

export type FeedStatusType = typeof FeedStatus[keyof typeof FeedStatus];

/**
 * Feed schema for validation
 */
export const FeedSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  title: z.string(),
  description: z.string().nullable(),
  added_date: z.string(),
  last_updated: z.string().nullable(),
  status: z.enum(['active', 'error', 'pending']),
  error_message: z.string().nullable()
});

export type Feed = z.infer<typeof FeedSchema>;

/**
 * Article schema for validation
 */
export const ArticleSchema = z.object({
  id: z.string(),
  feed_id: z.string(),
  title: z.string(),
  link: z.string().url(),
  pub_date: z.string(),
  description: z.string().nullable(),
  content: z.string().nullable(),
  author: z.string().nullable(),
  categories: z.string().nullable(), // JSON array stored as string
  guid: z.string()
});

export type Article = z.infer<typeof ArticleSchema>;

/**
 * Database initialization SQL
 */
export const DB_SCHEMA = `
  CREATE TABLE IF NOT EXISTS feeds (
    id TEXT PRIMARY KEY,
    url TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    added_date TEXT NOT NULL,
    last_updated TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    error_message TEXT,
    priority_level INTEGER DEFAULT 5
  );

  CREATE INDEX IF NOT EXISTS idx_feeds_status ON feeds(status);
  CREATE INDEX IF NOT EXISTS idx_feeds_url ON feeds(url);

  CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    feed_id TEXT NOT NULL,
    title TEXT NOT NULL,
    link TEXT NOT NULL,
    pub_date TEXT NOT NULL,
    description TEXT,
    content TEXT,
    author TEXT,
    categories TEXT,
    guid TEXT NOT NULL,
    language TEXT,
    word_count INTEGER,
    reading_time INTEGER,
    is_breaking BOOLEAN DEFAULT 0,
    breaking_score INTEGER DEFAULT 0,
    FOREIGN KEY (feed_id) REFERENCES feeds(id) ON DELETE CASCADE,
    UNIQUE(feed_id, guid)
  );

  CREATE INDEX IF NOT EXISTS idx_articles_feed_id ON articles(feed_id);
  CREATE INDEX IF NOT EXISTS idx_articles_pub_date ON articles(pub_date DESC);
  CREATE INDEX IF NOT EXISTS idx_articles_title ON articles(title);
  CREATE INDEX IF NOT EXISTS idx_articles_guid ON articles(guid);
  CREATE INDEX IF NOT EXISTS idx_articles_breaking ON articles(is_breaking, breaking_score DESC);

  CREATE TABLE IF NOT EXISTS media_assets (
    id TEXT PRIMARY KEY,
    article_id TEXT NOT NULL,
    media_type TEXT NOT NULL,
    url TEXT NOT NULL,
    width INTEGER,
    height INTEGER,
    caption TEXT,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_media_article_id ON media_assets(article_id);
  CREATE INDEX IF NOT EXISTS idx_media_type ON media_assets(media_type);

  CREATE TABLE IF NOT EXISTS translations (
    id TEXT PRIMARY KEY,
    article_id TEXT NOT NULL,
    source_lang TEXT NOT NULL,
    target_lang TEXT NOT NULL,
    translated_title TEXT NOT NULL,
    translated_content TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    UNIQUE(article_id, target_lang)
  );

  CREATE INDEX IF NOT EXISTS idx_translations_article_id ON translations(article_id);
  CREATE INDEX IF NOT EXISTS idx_translations_target_lang ON translations(target_lang);

  -- Notifications/Webhooks table
  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    feed_id TEXT,
    keywords TEXT,
    webhook_url TEXT NOT NULL,
    frequency TEXT DEFAULT 'immediate',
    enabled BOOLEAN DEFAULT 1,
    created_at TEXT NOT NULL,
    last_triggered TEXT,
    FOREIGN KEY (feed_id) REFERENCES feeds(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_notifications_feed_id ON notifications(feed_id);
  CREATE INDEX IF NOT EXISTS idx_notifications_enabled ON notifications(enabled);

  -- Bookmarks/Reading List table
  CREATE TABLE IF NOT EXISTS bookmarks (
    id TEXT PRIMARY KEY,
    article_id TEXT NOT NULL,
    tags TEXT,
    notes TEXT,
    read_status TEXT DEFAULT 'unread',
    created_at TEXT NOT NULL,
    updated_at TEXT,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_bookmarks_article_id ON bookmarks(article_id);
  CREATE INDEX IF NOT EXISTS idx_bookmarks_read_status ON bookmarks(read_status);

  -- Schedules table for feed updates
  CREATE TABLE IF NOT EXISTS schedules (
    id TEXT PRIMARY KEY,
    feed_id TEXT NOT NULL,
    cron_expression TEXT NOT NULL,
    enabled BOOLEAN DEFAULT 1,
    last_run TEXT,
    next_run TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (feed_id) REFERENCES feeds(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_schedules_feed_id ON schedules(feed_id);
  CREATE INDEX IF NOT EXISTS idx_schedules_enabled ON schedules(enabled);

  -- Credibility scores table
  CREATE TABLE IF NOT EXISTS credibility_scores (
    id TEXT PRIMARY KEY,
    feed_id TEXT NOT NULL,
    score INTEGER DEFAULT 50,
    https_enabled BOOLEAN DEFAULT 0,
    update_frequency INTEGER DEFAULT 0,
    metadata_quality INTEGER DEFAULT 0,
    last_check TEXT NOT NULL,
    FOREIGN KEY (feed_id) REFERENCES feeds(id) ON DELETE CASCADE,
    UNIQUE(feed_id)
  );

  CREATE INDEX IF NOT EXISTS idx_credibility_feed_id ON credibility_scores(feed_id);

  -- Health metrics table
  CREATE TABLE IF NOT EXISTS health_metrics (
    id TEXT PRIMARY KEY,
    feed_id TEXT NOT NULL,
    uptime_percentage REAL DEFAULT 100.0,
    error_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    avg_response_time INTEGER DEFAULT 0,
    last_check TEXT NOT NULL,
    status TEXT DEFAULT 'healthy',
    FOREIGN KEY (feed_id) REFERENCES feeds(id) ON DELETE CASCADE,
    UNIQUE(feed_id)
  );

  CREATE INDEX IF NOT EXISTS idx_health_feed_id ON health_metrics(feed_id);
  CREATE INDEX IF NOT EXISTS idx_health_status ON health_metrics(status);

  -- Sentiment cache table
  CREATE TABLE IF NOT EXISTS sentiment_cache (
    id TEXT PRIMARY KEY,
    article_id TEXT NOT NULL,
    sentiment_score REAL NOT NULL,
    sentiment_label TEXT NOT NULL,
    calculated_at TEXT NOT NULL,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    UNIQUE(article_id)
  );

  CREATE INDEX IF NOT EXISTS idx_sentiment_article_id ON sentiment_cache(article_id);
  CREATE INDEX IF NOT EXISTS idx_sentiment_label ON sentiment_cache(sentiment_label);
`;

