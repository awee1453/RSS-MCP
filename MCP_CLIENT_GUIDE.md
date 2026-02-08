# MCP Client Integration Guide

Comprehensive guide for connecting RSS News MCP tool to various AI assistants and code editors.

## 🔌 Connection Methods

The RSS MCP server supports **two transport modes**:

1. **stdio (Normal MCP)** - Default, recommended for Claude Desktop
2. **HTTP (Streamable HTTP)** - Optional, for web-based clients

**Default Mode**: stdio (Normal MCP)
**HTTP Server URL** (when using HTTP mode): `http://localhost:3000/mcp`

---

## 1️⃣ Claude Desktop

### Configuration File Locations

**Windows**:
    ```json
    {
       "mcp.servers": {
          "rss-news": {
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

### Steps

1. **Open Configuration File**:
   - Windows: Press `Win + R`, type `%APPDATA%\Claude`, press Enter
   - Find or create `claude_desktop_config.json`

2. **Add RSS MCP Configuration**:

    **Normal MCP (stdio) - Recommended:**
    ```json
    {
       "mcpServers": {
          "rss-news": {
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
   
   **Important**: Update the `cwd` path to your project directory.

   **Alternative: HTTP Mode** (requires `MCP_TRANSPORT=http` environment variable):
   ```json
   {
     "mcpServers": {
       "rss-news": {
         "type": "http",
         "url": "http://localhost:3000/mcp"
       }
     }
   }
   ```

3. **Restart Claude Desktop**: Completely close and reopen the application

4. **Verify Connection**:
   - Look for MCP indicator in Claude's interface
   - Try: "Add BBC News feed: https://feeds.bbci.co.uk/news/rss.xml"
   
   **Note**: With stdio mode, you don't need to manually start the server - Claude Desktop will start it automatically.

### Example Prompts for Claude

```
"RSS feed ekle: https://feeds.bbci.co.uk/news/rss.xml"
"Kayıtlı tüm feedleri göster"
"Feedleri güncelle ve yeni haberleri getir"
"Son 10 haberi göster"
"Teknoloji kategorisindeki haberleri ara"
```

---

## 2️⃣ MCP Inspector (Testing Tool)

Perfect for testing and debugging MCP tools.

### Steps

**Option A: stdio Transport (Normal MCP)**

1. **Launch Inspector**:
   ```bash
   npx @modelcontextprotocol/inspector
   ```

2. **Configure Connection**:
   - Transport: Select **stdio**
   - Command: `node`
   - Args: `["node_modules/tsx/dist/cli.mjs", "src/index.ts"]`
   - Working Directory: Your project path
   - Click **Connect**

**Option B: HTTP Transport**

1. **Start Server** (in HTTP mode):
   ```bash
   cd /path/to/RSS-MCP
   MCP_TRANSPORT=http npm run dev
   ```

2. **Launch Inspector**:
   ```bash
   npx @modelcontextprotocol/inspector
   ```

3. **Configure Connection**:
   - Transport: Select **Streamable HTTP**
   - URL: Enter `http://localhost:3000/mcp`
   - Click **Connect**

4. **Test Tools**:
   - Browse available tools in left sidebar
   - Select `rss_add`, `rss_list`, `rss_update`, `rss_news`, or `rss_search`
   - Fill in parameters
   - Click Execute

### Example Test Scenario

1. **Add Feed**:
   ```json
   Tool: rss_add
   {
     "url": "https://feeds.bbci.co.uk/news/rss.xml"
   }
   ```

2. **List Feeds**:
   ```json
   Tool: rss_list
   {} 
   ```

3. **Update**:
   ```json
   Tool: rss_update
   {}
   ```

4. **Get News**:
   ```json
   Tool: rss_news
   {
     "feed_id": "your-feed-id-from-list",
     "limit": 5
   }
   ```

---

## 3️⃣ VS Code with GitHub Copilot

### Method 1: Command Line

```bash
code --add-mcp "{\"name\":\"rss-news\",\"type\":\"http\",\"url\":\"http://localhost:3000/mcp\"}"
```

### Method 2: Settings UI

1. Open VS Code Settings (`Ctrl/Cmd + ,`)
2. Search for "MCP"
3. Click "Edit in settings.json"
4. Add:
   ```json
   {
     "github.copilot.mcp.servers": {
       "rss-news": {
         "type": "http",
         "url": "http://localhost:3000/mcp"
       }
     }
   }
   ```

### Method 3: Manual Configuration

1. Open file: `~/.vscode/settings.json` (or workspace `.vscode/settings.json`)
2. Add the MCP configuration above
3. Reload VS Code

### Usage in VS Code

- In chat panel, type: `@rss-news add feed https://...`
- Copilot will use RSS tools to fetch and display news

---

## 4️⃣ Cursor IDE

### Normal MCP (stdio) - Recommended ⭐

**Method 1: Settings UI**

1. **Open Cursor Settings**: `Cursor > Settings > MCP Servers` (or `Ctrl/Cmd + ,` then search "MCP")
2. **Add New Server**:
   - Name: `rss-news`
   - Type: `stdio` (or `command`)
   - Command: `node`
   - Args: `["node_modules/tsx/dist/cli.mjs", "src/index.ts"]`
   - Working Directory: `/path/to/RSS-MCP`
3. **Save and Restart** Cursor

**Method 2: Config File**

1. Open Cursor settings file:
   - Windows: `%APPDATA%\Cursor\User\settings.json`
   - macOS: `~/Library/Application Support/Cursor/User/settings.json`
   - Linux: `~/.config/Cursor/User/settings.json`

2. Add configuration:
   ```json
   {
     "mcp.servers": {
       "rss-news": {
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
   
   **Important**: Update the `cwd` path to your project directory.

3. **Restart Cursor**

### Alternative: HTTP Mode

If you prefer HTTP mode:

1. Start server in HTTP mode:
   ```bash
   npm run dev:http
   ```

2. In Cursor Settings > MCP Servers:
   - Name: `rss-news`
   - Type: `HTTP`
   - URL: `http://localhost:3000/mcp`

### Usage

- Use `@rss-news` in chat to invoke RSS tools
- Example: `@rss-news son 5 haber başlığını listele`
- Example: `@rss-news feedleri listele`
- Example: `@rss-news feedleri güncelle`

**Note**: With stdio mode, Cursor will automatically start the MCP server - no need to run it manually!

---

## 5️⃣ Custom MCP Client (TypeScript)

If building your own MCP client:

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const transport = new StreamableHTTPClientTransport(
  new URL('http://localhost:3000/mcp')
);

const client = new Client({
  name: 'my-rss-client',
  version: '1.0.0'
}, {
  capabilities: {}
});

await client.connect(transport);

// List tools
const tools = await client.listTools();
console.log(tools);

// Call rss_add tool
const result = await client.callTool({
  name: 'rss_add',
  arguments: {
    url: 'https://feeds.bbci.co.uk/news/rss.xml'
   }
});

console.log(result);
```

---

## 🔧 Troubleshooting

### Server Not Reachable

**Problem**: Client can't connect to `http://localhost:3000/mcp`

**Solutions**:
1. Verify server is running: `npm run dev`
2. Check if port 3000 is available
3. Test with curl: `curl http://localhost:3000/health`
4. Check firewall settings

### Tools Not Appearing

**Problem**: MCP client connected but tools not listed

**Solutions**:
1. Restart the MCP client application
2. Check server logs for errors
3. Verify JSON configuration syntax
4. Try re-adding the server configuration

### Permission Errors

**Problem**: Claude Desktop can't access configuration file

**Solutions**:
1. Run text editor as administrator (Windows)
2. Check file permissions
3. Manually create directory if missing

### Network Errors

**Problem**: "Fetch failed" or timeout errors

**Solutions**:
1. Use `http://localhost:3000/mcp` (not https)
2. Disable VPN/proxy temporarily
3. Check antivirus blocking localhost connections
4. Increase timeout in client settings

---

## 📝 Server Management

### Starting the Server

**Development** (recommended):
```bash
npm run dev
```
- Hot reload enabled
- Detailed logging
- No build step needed

**Production**:
```bash
npm run dev  # Use this for production too
```
*(Due to TypeScript compilation issues, use tsx in production)*

### Environment Variables

Create `.env` file:
```env
PORT=3000
DB_PATH=./data/rss.db
RATE_LIMIT_PER_DOMAIN=1
MAX_REDIRECTS=3
REQUEST_TIMEOUT=10000
```

### Running as Background Service

**Using PM2** (recommended for production):
```bash
npm install -g pm2
pm2 start "npm run dev" --name rss-mcp
pm2 save
pm2 startup
```

**Using nohup** (Linux/Mac):
```bash
nohup npm run dev > rss-mcp.log 2>&1 &
```

---

## 🌐 Remote Access (Optional)

To expose server to network (use with caution):

1. **Update server binding** in `src/index.ts`:
   ```typescript
   app.listen(port, '0.0.0.0', () => { ... });
   ```

2. **Use ngrok for public URL**:
   ```bash
   ngrok http 3000
   ```
   Then use the ngrok URL in client config.

3. **Add authentication** (recommended for remote access)

---

## ✅ Verification Checklist

- [ ] Server starts without errors
- [ ] Health endpoint responds: `http://localhost:3000/health`
- [ ] MCP Inspector can connect and list 5 tools
- [ ] Client application shows RSS tools
- [ ] Can successfully add a feed
- [ ] Can retrieve news articles
- [ ] Arabic text displays with correct RTL direction

---

## 🎯 Quick Reference

| Client | Config File Location | Restart Required |
|--------|---------------------|------------------|
| Claude Desktop (Windows) | `%APPDATA%\Claude\claude_desktop_config.json` | Yes |
| Claude Desktop (macOS) | `~/Library/Application Support/Claude/claude_desktop_config.json` | Yes |
| VS Code | `~/.vscode/settings.json` or workspace settings | Reload |
| Cursor | Settings > MCP Servers | Yes |
| MCP Inspector | Web UI | No |

---

## 📖 Additional Resources

- [MCP Official Documentation](https://modelcontextprotocol.io)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Claude Desktop MCP Guide](https://docs.claude.com/en/docs/claude-code/mcp)
- [RSS MCP Tool README](./README.md)
