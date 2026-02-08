/**
 * Daily Digest Generator Service
 */
export class DigestGenerator {
    /**
     * Generate daily digest in Markdown format
     */
    static generateMarkdown(articles: any[], feedsInfo: any[]): string {
        const date = new Date().toISOString().split('T')[0];

        let markdown = `# RSS Daily Digest - ${date}\n\n`;
        markdown += `## Summary\n\n`;
        markdown += `- **Total Articles**: ${articles.length}\n`;
        markdown += `- **Feeds**: ${feedsInfo.length}\n\n`;

        markdown += `## Top Stories\n\n`;

        articles.slice(0, 10).forEach((article, idx) => {
            markdown += `### ${idx + 1}. ${article.title}\n\n`;
            markdown += `**Source**: ${article.feed_title || 'Unknown'}\n\n`;
            markdown += `**Published**: ${new Date(article.pub_date).toLocaleString()}\n\n`;
            if (article.description) {
                markdown += `${article.description.substring(0, 200)}...\n\n`;
            }
            markdown += `[Read more](${article.link})\n\n`;
            markdown += `---\n\n`;
        });

        return markdown;
    }

    /**
     * Generate HTML email format
     */
    static generateHTML(articles: any[], feedsInfo: any[]): string {
        const date = new Date().toISOString().split('T')[0];

        let html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #333; border-bottom: 3px solid #4CAF50; padding-bottom: 10px; }
        .article { background: #f9f9f9; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50; }
        .article h3 { margin-top: 0; color: #2196F3; }
        .meta { color: #666; font-size: 0.9em; }
        a { color: #2196F3; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <h1>📰 RSS Daily Digest - ${date}</h1>
    <p><strong>Total Articles:</strong> ${articles.length} | <strong>Feeds:</strong> ${feedsInfo.length}</p>
    <h2>Top Stories</h2>
`;

        articles.slice(0, 10).forEach((article, idx) => {
            html += `
    <div class="article">
        <h3>${idx + 1}. ${article.title}</h3>
        <p class="meta">
            <strong>Source:</strong> ${article.feed_title || 'Unknown'} | 
            <strong>Published:</strong> ${new Date(article.pub_date).toLocaleString()}
        </p>
        <p>${article.description ? article.description.substring(0, 300) + '...' : ''}</p>
        <p><a href="${article.link}" target="_blank">Read full article →</a></p>
    </div>
`;
        });

        html += `
</body>
</html>`;

        return html;
    }

    /**
     * Generate summary statistics
     */
    static generateStats(articles: any[], feedsInfo: any[]): any {
        const categoryCount = new Map<string, number>();

        articles.forEach(article => {
            if (article.categories) {
                try {
                    const cats = JSON.parse(article.categories);
                    cats.forEach((cat: string) => {
                        categoryCount.set(cat, (categoryCount.get(cat) || 0) + 1);
                    });
                } catch { }
            }
        });

        const topCategories = Array.from(categoryCount.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([category, count]) => ({ category, count }));

        return {
            total_articles: articles.length,
            total_feeds: feedsInfo.length,
            top_categories: topCategories,
            date_range: {
                from: articles[articles.length - 1]?.pub_date || null,
                to: articles[0]?.pub_date || null
            }
        };
    }
}
