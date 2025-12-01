# 🚀 RSS-MCP v3.0

**Professional RSS Feed Management System with AI-Powered Analytics**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-blue)](https://modelcontextprotocol.io/)

Modern RSS/Atom feed aggregation and analysis tool built for Model Context Protocol (MCP), enabling AI assistants like Claude to manage and analyze news feeds with advanced features.

## ✨ Features

### 🎯 Core Features
- **RSS Feed Management** - Add, list, update, and delete RSS/Atom feeds
- **Smart Search** - Advanced filtering by keyword, category, date range
- **Auto Updates** - Automatic feed refresh with configurable scheduling
- **SQLite Database** - Persistent storage with optimized indexing

### 🤖 AI-Powered Analytics
- **Sentiment Analysis** - Detect positive/negative/neutral tone in articles
- **Trend Detection** - NLP-based topic clustering and trending keywords
- **Auto-Categorization** - Intelligent AI-based article classification
- **Cross-Verification** - Compare article coverage across multiple sources

### 🔔 Automation & Monitoring
- **Webhook Notifications** - Real-time alerts with keyword filtering
- **Feed Scheduling** - Cron-based automated updates
- **Health Monitoring** - Track feed uptime and performance
- **Credibility Scoring** - Assess feed reliability and quality

### 📊 Content & Export
- **Daily Digest** - Generate HTML/Markdown summary reports
- **OPML Support** - Import/export feed lists for easy migration
- **Full Content Extraction** - Web scraping for complete articles
- **Multiple Export Formats** - JSON, CSV, XML support

## 🚀 Quick Start

### Automatic Setup (Recommended)

**Windows:**
```bash
FIRST_TIME_SETUP.bat
START_SERVER.bat
```

**Linux/Mac:**
```bash
npm run setup
chmod +x start_server.sh
./start_server.sh
```

### Manual Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Start server (with auto-update):**
```bash
npm run auto-start
```

3. **Or start without updates:**
```bash
npm start
```

Server will be available at:
- **MCP Endpoint**: `http://localhost:3000/mcp`
- **Health Check**: `http://localhost:3000/health`

## 📋 Available Tools (26)

<details>
<summary><b>🔷 Basic Tools (6)</b></summary>

- `rss_add` - Add new RSS/Atom feed
- `rss_list` - List all feeds
- `rss_update` - Update feeds (fetch new articles)
- `rss_news` - Get articles from specific feed
- `rss_search` - Advanced article search
- `rss_delete` - Remove feed

</details>

<details>
<summary><b>🔷 Advanced Analytics (5)</b></summary>

- `rss_breaking` - Breaking news detection
- `rss_duplicates` - Find duplicate articles
- `rss_analytics` - Feed statistics and metrics
- `rss_trends` - Trending topics analysis (NLP)
- `rss_sentiment_analysis` - Emotional tone detection

</details>

<details>
<summary><b>🔷 Content & Translation (3)</b></summary>

- `rss_translate` - AI-powered translation
- `rss_media` - Extract images and videos
- `rss_full_content` - Scrape full article content

</details>

<details>
<summary><b>🔷 Comparison & Verification (2)</b></summary>

- `rss_compare` - Compare feed coverage
- `rss_cross_verify` - Cross-source verification

</details>

<details>
<summary><b>🔷 Export & Reporting (3)</b></summary>

- `rss_export` - Export to JSON/CSV/XML
- `rss_daily_digest` - Generate daily/weekly reports
- `rss_opml` - OPML import/export

</details>

<details>
<summary><b>🔷 AI Features (3)</b></summary>

- `rss_recommend` - Feed recommendations
- `rss_auto_categorize` - Auto categorization
- `rss_credibility_score` - Reliability scoring

</details>

<details>
<summary><b>🔷 Management & Monitoring (4)</b></summary>

- `rss_notification_setup` - Webhook alerts
- `rss_bookmark` - Reading list management
- `rss_schedule` - Automated scheduling
- `rss_health_monitor` - Feed health tracking

</details>

## 🔌 MCP Client Integration

### Claude Desktop

Add to your Claude Desktop config:

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`  
**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Linux:** `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "rss-mcp": {
      "command": "node",
      "args": [
        "node_modules/tsx/dist/cli.mjs",
        "src/index.ts"
      ],
      "cwd": "/path/to/RSS-MCP"
    }
  }
}
```

### MCP Inspector (Testing)

```bash
npx @modelcontextprotocol/inspector
# Connect to: http://localhost:3000/mcp
```

## 💡 Usage Examples

### With Claude

**Add a feed:**
> "Add BBC News RSS feed: https://feeds.bbci.co.uk/news/rss.xml"

**Analyze trends:**
> "Show me trending topics from the last 7 days"

**Sentiment analysis:**
> "Analyze the sentiment of today's news"

**Generate digest:**
> "Create a daily digest of top 10 articles in HTML format"

**Schedule updates:**
> "Schedule BBC News to update every 6 hours"

## 🛠️ Development

```bash
npm run dev              # Development mode (watch)
npm run dev:http         # HTTP transport development
npm run build            # TypeScript compilation
npm run clean            # Clean build artifacts
npm run update-deps      # Update dependencies
```

## 📦 Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Database**: SQLite (better-sqlite3)
- **MCP SDK**: @modelcontextprotocol/sdk
- **NLP**: natural, sentiment
- **Web Scraping**: cheerio
- **Scheduling**: cron-parser, node-cron
- **Validation**: Zod

## 🏗️ Project Structure

```
RSS-MCP/
├── src/
│   ├── database/          # Database schema & repositories
│   ├── services/          # Business logic (22 services)
│   ├── tools/             # MCP tools (26 tools)
│   ├── utils/             # Utilities
│   └── index.ts           # MCP server
├── data/                  # SQLite database (auto-created)
├── START_SERVER.bat       # Auto-update launcher (Windows)
├── start_server.sh        # Auto-update launcher (Linux/Mac)
├── FIRST_TIME_SETUP.bat   # Initial setup script
└── package.json
```

## 🔒 Security

- ✅ URL validation (HTTP/HTTPS only)
- ✅ Private IP blacklist
- ✅ MIME type validation
- ✅ Request timeout protection
- ✅ Domain-based rate limiting
- ✅ SQL injection protection (prepared statements)

## 📚 Documentation

- [AUTO_UPDATE_GUIDE.md](AUTO_UPDATE_GUIDE.md) - Auto-update system guide
- [MCP_CLIENT_GUIDE.md](MCP_CLIENT_GUIDE.md) - MCP client setup
- [CHANGELOG.md](CHANGELOG.md) - Version history
- [KURULUM_REHBERI.md](KURULUM_REHBERI.md) - Installation guide (Turkish)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Model Context Protocol SDK](https://github.com/modelcontextprotocol/sdk)
- Powered by [Natural](https://github.com/NaturalNode/natural) for NLP features
- Uses [Cheerio](https://cheerio.js.org/) for web scraping

## 📞 Support

- 🐛 [Report Bug](https://github.com/awee1453/RSS-MCP/issues)
- 💡 [Request Feature](https://github.com/awee1453/RSS-MCP/issues)
- 📖 [Documentation](https://github.com/awee1453/RSS-MCP/wiki)

## ⭐ Star History

If you find this project useful, please consider giving it a star!

---

**Made with ❤️ for the MCP community**
