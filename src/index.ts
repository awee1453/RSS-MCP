#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import { DatabaseManager, FeedRepository, ArticleRepository, NotificationRepository, BookmarkRepository, ScheduleRepository, CredibilityRepository, HealthRepository } from './database/repository.js';
import { FeedFetcher } from './services/fetcher.js';
import { FeedParser } from './services/parser.js';
import { TranslationService } from './services/translator.js';
import { handleRssAdd, RssAddInputSchema, RssAddOutputSchema } from './tools/rss-add.js';
import { handleRssList, RssListInputSchema, RssListOutputSchema } from './tools/rss-list.js';
import { handleRssUpdate, RssUpdateInputSchema, RssUpdateOutputSchema } from './tools/rss-update.js';
import { handleRssNews, RssNewsInputSchema, RssNewsOutputSchema } from './tools/rss-news.js';
import { handleRssSearch, RssSearchInputSchema, RssSearchOutputSchema } from './tools/rss-search.js';
import { handleRssBreaking, RssBreakingInputSchema, RssBreakingOutputSchema } from './tools/rss-breaking.js';
import { handleRssDuplicates, RssDuplicatesInputSchema, RssDuplicatesOutputSchema } from './tools/rss-duplicates.js';
import { handleRssTranslate, RssTranslateInputSchema, RssTranslateOutputSchema } from './tools/rss-translate.js';
import { handleRssMedia, RssMediaInputSchema, RssMediaOutputSchema } from './tools/rss-media.js';
import { handleRssAnalytics, RssAnalyticsInputSchema, RssAnalyticsOutputSchema } from './tools/rss-analytics.js';
import { handleRssExport, RssExportInputSchema, RssExportOutputSchema } from './tools/rss-export.js';
import { handleRssCompare, RssCompareInputSchema, RssCompareOutputSchema } from './tools/rss-compare.js';
import { handleRssDelete, RssDeleteInputSchema, RssDeleteOutputSchema } from './tools/rss-delete.js';
import { handleRssNotification, RssNotificationInputSchema, RssNotificationOutputSchema } from './tools/rss-notification.js';
import { handleRssTrends, RssTrendsInputSchema, RssTrendsOutputSchema } from './tools/rss-trends.js';
import { handleRssRecommend, RssRecommendInputSchema, RssRecommendOutputSchema } from './tools/rss-recommend.js';
import { handleRssDigest, RssDigestInputSchema, RssDigestOutputSchema } from './tools/rss-digest.js';
import { handleRssCredibility, RssCredibilityInputSchema, RssCredibilityOutputSchema } from './tools/rss-credibility.js';
import { handleRssHealth, RssHealthInputSchema, RssHealthOutputSchema } from './tools/rss-health.js';
import { handleRssSentiment, RssSentimentInputSchema, RssSentimentOutputSchema } from './tools/rss-sentiment.js';
import { handleRssBookmark, RssBookmarkInputSchema, RssBookmarkOutputSchema } from './tools/rss-bookmark.js';
import { handleRssFullContent, RssFullContentInputSchema, RssFullContentOutputSchema } from './tools/rss-fullcontent.js';
import { handleRssCrossVerify, RssCrossVerifyInputSchema, RssCrossVerifyOutputSchema } from './tools/rss-crossverify.js';
import { handleRssSchedule, RssScheduleInputSchema, RssScheduleOutputSchema } from './tools/rss-schedule.js';
import { handleRssAutoCategorize, RssAutoCategorizeInputSchema, RssAutoCategorizeOutputSchema } from './tools/rss-autocategorize.js';
import { handleRssOPML, RssOPMLInputSchema, RssOPMLOutputSchema } from './tools/rss-opml.js';

// Initialize database and services
const dbManager = new DatabaseManager();
const db = dbManager.getDb();
const feedRepository = new FeedRepository(db);
const articleRepository = new ArticleRepository(db);
const notificationRepository = new NotificationRepository(db);
const bookmarkRepository = new BookmarkRepository(db);
const scheduleRepository = new ScheduleRepository(db);
const credibilityRepository = new CredibilityRepository(db);
const healthRepository = new HealthRepository(db);
const fetcher = new FeedFetcher();
const parser = new FeedParser();

// Create MCP server
const server = new McpServer({
    name: 'rss-news-mcp',
    version: '3.0.0'
});

// Initialize translation service with MCP server
TranslationService.initialize(server);

console.log('🚀 Initializing RSS News MCP Server v3.0...');

// Tool 1: rss_add
server.registerTool('rss_add', {
    title: 'RSS Feed Ekle',
    description: 'Sisteme yeni bir RSS/Atom akışı ekler',
    inputSchema: RssAddInputSchema,
    outputSchema: RssAddOutputSchema
}, async (input) => {
    const output = await handleRssAdd(input, feedRepository, fetcher, parser);
    return { content: [{ type: 'text', text: JSON.stringify(output, null, 2) }], structuredContent: output };
});

// Tool 2: rss_list
server.registerTool('rss_list', {
    title: 'RSS Feedlerini Listele',
    description: 'Kayıtlı tüm RSS akışlarını listeler',
    inputSchema: RssListInputSchema,
    outputSchema: RssListOutputSchema
}, async (input) => {
    const output = await handleRssList(input, feedRepository);
    return { content: [{ type: 'text', text: JSON.stringify(output, null, 2) }], structuredContent: output };
});

// Tool 3: rss_update
server.registerTool('rss_update', {
    title: 'RSS Feedlerini Güncelle',
    description: 'Feed\'leri güncelleyerek en yeni haberleri getirir',
    inputSchema: RssUpdateInputSchema,
    outputSchema: RssUpdateOutputSchema
}, async (input) => {
    const output = await handleRssUpdate(input, feedRepository, articleRepository, fetcher, parser);
    return { content: [{ type: 'text', text: JSON.stringify(output, null, 2) }], structuredContent: output };
});

// Tool 4: rss_news
server.registerTool('rss_news', {
    title: 'Haberleri Getir',
    description: 'Belirli bir feed\'den haber makalelerini getirir',
    inputSchema: RssNewsInputSchema,
    outputSchema: RssNewsOutputSchema
}, async (input) => {
    const output = await handleRssNews(input, articleRepository, feedRepository);
    return { content: [{ type: 'text', text: JSON.stringify(output, null, 2) }], structuredContent: output };
});

// Tool 5: rss_search
server.registerTool('rss_search', {
    title: 'Haber Ara',
    description: 'Haber makalelerinde gelişmiş arama yapar',
    inputSchema: RssSearchInputSchema,
    outputSchema: RssSearchOutputSchema
}, async (input) => {
    const output = await handleRssSearch(input, articleRepository);
    return { content: [{ type: 'text', text: JSON.stringify(output, null, 2) }], structuredContent: output };
});

// Tool 6: rss_breaking
server.registerTool('rss_breaking', {
    title: 'Son Dakika Haberleri',
    description: 'Acil/son dakika haberlerini getirir',
    inputSchema: RssBreakingInputSchema,
    outputSchema: RssBreakingOutputSchema
}, async (input) => {
    const output = await handleRssBreaking(input, articleRepository);
    return { content: [{ type: 'text', text: JSON.stringify(output, null, 2) }], structuredContent: output };
});

// Tool 7: rss_duplicates
server.registerTool('rss_duplicates', {
    title: 'Mükerrer Haberleri Bul',
    description: 'Feedler arasında benzer/mükerrer haberleri tespit eder',
    inputSchema: RssDuplicatesInputSchema,
    outputSchema: RssDuplicatesOutputSchema
}, async (input) => {
    const output = await handleRssDuplicates(input, articleRepository);
    return { content: [{ type: 'text', text: JSON.stringify(output, null, 2) }], structuredContent: output };
});

// Tool 8: rss_translate
server.registerTool('rss_translate', {
    title: 'Haber Çevir',
    description: 'Haberleri Türkçe veya başka dillere çevirir (MCP AI kullanarak)',
    inputSchema: RssTranslateInputSchema,
    outputSchema: RssTranslateOutputSchema
}, async (input) => {
    const output = await handleRssTranslate(input, articleRepository);
    return { content: [{ type: 'text', text: JSON.stringify(output, null, 2) }], structuredContent: output };
});

// Tool 9: rss_media
server.registerTool('rss_media', {
    title: 'Medya Çıkar',
    description: 'Haberlerden görselleve videoları çıkarır',
    inputSchema: RssMediaInputSchema,
    outputSchema: RssMediaOutputSchema
}, async (input) => {
    const output = await handleRssMedia(input, articleRepository);
    return { content: [{ type: 'text', text: JSON.stringify(output, null, 2) }], structuredContent: output };
});

// Tool 10: rss_analytics
server.registerTool('rss_analytics', {
    title: 'Analitik & İstatistikler',
    description: 'Feed istatistikleri ve trendleri gösterir',
    inputSchema: RssAnalyticsInputSchema,
    outputSchema: RssAnalyticsOutputSchema
}, async (input) => {
    const output = await handleRssAnalytics(input, articleRepository, feedRepository);
    return { content: [{ type: 'text', text: JSON.stringify(output, null, 2) }], structuredContent: output };
});

// Tool 11: rss_export
server.registerTool('rss_export', {
    title: 'Haberleri Dışa Aktar',
    description: 'Haberleri JSON/CSV/XML formatında dışa aktarır',
    inputSchema: RssExportInputSchema,
    outputSchema: RssExportOutputSchema
}, async (input) => {
    const output = await handleRssExport(input, articleRepository);
    return { content: [{ type: 'text', text: JSON.stringify(output, null, 2) }], structuredContent: output };
});

// Tool 12: rss_compare
server.registerTool('rss_compare', {
    title: 'Feed Karşılaştır',
    description: 'Birden fazla feed arasında haber kapsamını karşılaştırır',
    inputSchema: RssCompareInputSchema,
    outputSchema: RssCompareOutputSchema
}, async (input) => {
    const output = await handleRssCompare(input, articleRepository, feedRepository);
    return { content: [{ type: 'text', text: JSON.stringify(output, null, 2) }], structuredContent: output };
});

// Tool 13: rss_delete
server.registerTool('rss_delete', {
    title: 'Feed Sil',
    description: 'Bir feed\'i ve haberlerini sistemden siler',
    inputSchema: RssDeleteInputSchema,
    outputSchema: RssDeleteOutputSchema
}, async (input) => {
    const output = await handleRssDelete(input, feedRepository, articleRepository);
    return { content: [{ type: 'text', text: JSON.stringify(output, null, 2) }], structuredContent: output };
});

// Tool 14: rss_notification_setup
server.registerTool('rss_notification_setup', {
    title: 'Bildirim Ayarla',
    description: 'Webhook bildirimleri ayarlar',
    inputSchema: RssNotificationInputSchema,
    outputSchema: RssNotificationOutputSchema
}, async (input) => {
    const output = await handleRssNotification(input, notificationRepository);
    return { content: [{ type: 'text', text: JSON.stringify(output, null, 2) }], structuredContent: output };
});

// Tool 15: rss_trends
server.registerTool('rss_trends', {
    title: 'Trend Analizi',
    description: 'Popüler konuları ve trendleri analiz eder',
    inputSchema: RssTrendsInputSchema,
    outputSchema: RssTrendsOutputSchema
}, async (input) => {
    const output = await handleRssTrends(input, articleRepository);
    return { content: [{ type: 'text', text: JSON.stringify(output, null, 2) }], structuredContent: output };
});

// Tool 16: rss_recommend
server.registerTool('rss_recommend', {
    title: 'Feed Öner',
    description: 'Yeni feed önerileri sunar',
    inputSchema: RssRecommendInputSchema,
    outputSchema: RssRecommendOutputSchema
}, async (input) => {
    const output = await handleRssRecommend(input, feedRepository);
    return { content: [{ type: 'text', text: JSON.stringify(output, null, 2) }], structuredContent: output };
});

// Tool 17: rss_daily_digest
server.registerTool('rss_daily_digest', {
    title: 'Günlük Özet',
    description: 'Günlük/haftalık özet raporu oluşturur',
    inputSchema: RssDigestInputSchema,
    outputSchema: RssDigestOutputSchema
}, async (input) => {
    const output = await handleRssDigest(input, articleRepository, feedRepository);
    return { content: [{ type: 'text', text: JSON.stringify(output, null, 2) }], structuredContent: output };
});

// Tool 18: rss_credibility_score
server.registerTool('rss_credibility_score', {
    title: 'Güvenilirlik Skoru',
    description: 'Feed güvenilirlik analizi yapar',
    inputSchema: RssCredibilityInputSchema,
    outputSchema: RssCredibilityOutputSchema
}, async (input) => {
    const output = await handleRssCredibility(input, feedRepository, credibilityRepository);
    return { content: [{ type: 'text', text: JSON.stringify(output, null, 2) }], structuredContent: output };
});

// Tool 19: rss_health_monitor
server.registerTool('rss_health_monitor', {
    title: 'Sağlık İzleme',
    description: 'Feed sağlık durumunu izler',
    inputSchema: RssHealthInputSchema,
    outputSchema: RssHealthOutputSchema
}, async (input) => {
    const output = await handleRssHealth(input, feedRepository, healthRepository);
    return { content: [{ type: 'text', text: JSON.stringify(output, null, 2) }], structuredContent: output };
});

// Tool 20: rss_sentiment_analysis
server.registerTool('rss_sentiment_analysis', {
    title: 'Duygu Analizi',
    description: 'Haberlerin duygusal tonunu analiz eder',
    inputSchema: RssSentimentInputSchema,
    outputSchema: RssSentimentOutputSchema
}, async (input) => {
    const output = await handleRssSentiment(input, articleRepository);
    return { content: [{ type: 'text', text: JSON.stringify(output, null, 2) }], structuredContent: output };
});

// Tool 21: rss_bookmark
server.registerTool('rss_bookmark', {
    title: 'Bookmark Yönetimi',
    description: 'Okuma listesi ve bookmark yönetimi',
    inputSchema: RssBookmarkInputSchema,
    outputSchema: RssBookmarkOutputSchema
}, async (input) => {
    const output = await handleRssBookmark(input, bookmarkRepository, articleRepository);
    return { content: [{ type: 'text', text: JSON.stringify(output, null, 2) }], structuredContent: output };
});

// Tool 22: rss_full_content
server.registerTool('rss_full_content', {
    title: 'Tam İçerik Çıkar',
    description: 'Makalenin tam içeriğini web\'den çeker',
    inputSchema: RssFullContentInputSchema,
    outputSchema: RssFullContentOutputSchema
}, async (input) => {
    const output = await handleRssFullContent(input, articleRepository);
    return { content: [{ type: 'text', text: JSON.stringify(output, null, 2) }], structuredContent: output };
});

// Tool 23: rss_cross_verify
server.registerTool('rss_cross_verify', {
    title: 'Çapraz Doğrulama',
    description: 'Haberi farklı kaynaklarda karşılaştırır',
    inputSchema: RssCrossVerifyInputSchema,
    outputSchema: RssCrossVerifyOutputSchema
}, async (input) => {
    const output = await handleRssCrossVerify(input, articleRepository);
    return { content: [{ type: 'text', text: JSON.stringify(output, null, 2) }], structuredContent: output };
});

// Tool 24: rss_schedule
server.registerTool('rss_schedule', {
    title: 'Güncelleme Planla',
    description: 'Otomatik feed güncelleme zamanlar',
    inputSchema: RssScheduleInputSchema,
    outputSchema: RssScheduleOutputSchema
}, async (input) => {
    const output = await handleRssSchedule(input, feedRepository, scheduleRepository);
    return { content: [{ type: 'text', text: JSON.stringify(output, null, 2) }], structuredContent: output };
});

// Tool 25: rss_auto_categorize
server.registerTool('rss_auto_categorize', {
    title: 'Otomatik Kategorize',
    description: 'Haberleri AI ile otomatik kategorize eder',
    inputSchema: RssAutoCategorizeInputSchema,
    outputSchema: RssAutoCategorizeOutputSchema
}, async (input) => {
    const output = await handleRssAutoCategorize(input, articleRepository);
    return { content: [{ type: 'text', text: JSON.stringify(output, null, 2) }], structuredContent: output };
});

// Tool 26: rss_opml (import/export)
server.registerTool('rss_opml', {
    title: 'OPML Import/Export',
    description: 'Feed listesini OPML formatında içe/dışa aktarır',
    inputSchema: RssOPMLInputSchema,
    outputSchema: RssOPMLOutputSchema
}, async (input) => {
    const output = await handleRssOPML(input, feedRepository, fetcher, parser);
    return { content: [{ type: 'text', text: JSON.stringify(output, null, 2) }], structuredContent: output };
});

// Transport mode: 'stdio' (normal MCP) or 'http' (HTTP server)
const transportMode = process.env.MCP_TRANSPORT || 'stdio';

if (transportMode === 'stdio') {
    // Normal MCP mode - stdio transport (default)
    console.log('📡 MCP Transport: stdio (Normal MCP)');
    const transport = new StdioServerTransport();

    (async () => {
        await server.connect(transport);
        console.log('✅ RSS News MCP Server v3.0 başarıyla başlatıldı!');
        console.log('📋 Kullanılabilir Araçlar (26):');
        console.log('  🔷 Temel Araçlar:');
        console.log('  • rss_add - RSS feed ekle');
        console.log('  • rss_list - Feedleri listele');
        console.log('  • rss_update - Feedleri güncelle');
        console.log('  • rss_news - Haber getir');
        console.log('  • rss_search - Haber ara');
        console.log('  • rss_delete - Feed sil');
        console.log('  🔷 Gelişmiş Analiz:');
        console.log('  • rss_breaking - Son dakika haberleri');
        console.log('  • rss_duplicates - Mükerrer haberleri bul');
        console.log('  • rss_analytics - Analitik & istatistikler');
        console.log('  • rss_trends - Trend analizi');
        console.log('  • rss_sentiment_analysis - Duygu analizi');
        console.log('  🔷 İçerik & Çeviri:');
        console.log('  • rss_translate - Haber çevir (AI destekli)');
        console.log('  • rss_media - Medya çıkar');
        console.log('  • rss_full_content - Tam içerik çıkar');
        console.log('  🔷 Karşılaştırma & Doğrulama:');
        console.log('  • rss_compare - Feed karşılaştır');
        console.log('  • rss_cross_verify - Çapraz doğrulama');
        console.log('  🔷 Dışa Aktarma:');
        console.log('  • rss_export - Dışa aktar (JSON/CSV/XML)');
        console.log('  • rss_daily_digest - Günlük özet');
        console.log('  • rss_opml - OPML import/export');
        console.log('  🔷 Akıllı Özellikler:');
        console.log('  • rss_recommend - Feed önerileri');
        console.log('  • rss_auto_categorize - Otomatik kategorize');
        console.log('  • rss_credibility_score - Güvenilirlik skoru');
        console.log('  🔷 Yönetim & Takip:');
        console.log('  • rss_notification_setup - Webhook bildirimleri');
        console.log('  • rss_bookmark - Bookmark yönetimi');
        console.log('  • rss_schedule - Otomatik güncelleme');
        console.log('  • rss_health_monitor - Feed sağlık izleme');
        console.log('\n💡 Bu sunucu stdio transport ile çalışıyor.');
        console.log('   Claude Desktop veya diğer MCP istemcileri ile kullanılabilir.');
    })().catch((error) => {
        console.error('❌ MCP server başlatma hatası:', error);
        process.exit(1);
    });
} else {
    // HTTP mode - Streamable HTTP transport (optional)
    console.log('📡 MCP Transport: HTTP (Streamable HTTP)');
    const app = express();
    app.use(express.json());

    app.post('/mcp', async (req, res) => {
        try {
            const transport = new StreamableHTTPServerTransport({
                sessionIdGenerator: undefined,
                enableJsonResponse: true
            });
            res.on('close', () => transport.close());
            await server.connect(transport);
            await transport.handleRequest(req, res, req.body);
        } catch (error) {
            console.error('MCP request error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    app.get('/health', (req, res) => {
        res.json({
            status: 'ok',
            server: 'rss-news-mcp',
            version: '3.0.0',
            tools: 26,
            timestamp: new Date().toISOString()
        });
    });

    const port = parseInt(process.env.PORT || '3000');
    app.listen(port, () => {
        console.log('✅ RSS News MCP Server v3.0 başarıyla başlatıldı!');
        console.log(`📡 Server: http://localhost:${port}/mcp`);
        console.log(`🏥 Health: http://localhost:${port}/health`);
        console.log('\n📋 Kullanılabilir Araçlar (26):');
        console.log('  🔷 Temel: rss_add, rss_list, rss_update, rss_news, rss_search, rss_delete');
        console.log('  🔷 Analiz: rss_breaking, rss_duplicates, rss_analytics, rss_trends, rss_sentiment');
        console.log('  🔷 İçerik: rss_translate, rss_media, rss_full_content');
        console.log('  🔷 Karşılaştırma: rss_compare, rss_cross_verify');
        console.log('  🔷 Export: rss_export, rss_daily_digest, rss_opml');
        console.log('  🔷 AI: rss_recommend, rss_auto_categorize, rss_credibility_score');
        console.log('  🔷 Yönetim: rss_notification, rss_bookmark, rss_schedule, rss_health_monitor');
        console.log('\n🔌 MCP İstemci Bağlantısı:');
        console.log(`  npx @modelcontextprotocol/inspector`);
        console.log(`  URL: http://localhost:${port}/mcp`);
    }).on('error', (error: any) => {
        console.error('❌ Server başlatma hatası:', error);
        process.exit(1);
    });
}

process.on('SIGINT', () => {
    console.log('\n⏹️  Server kapatılıyor...');
    dbManager.close();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n⏹️  Server kapatılıyor...');
    dbManager.close();
    process.exit(0);
});
