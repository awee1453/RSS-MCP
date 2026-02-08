# AI Clients & Editor Integration (Quick Setup)

This document shows quick, safe setup instructions to connect common AI assistants and editors to the local RSS-MCP server.

Warning: Never commit personal/private credentials into the repository. Use placeholders or environment variables.

1) GitHub Copilot (VS Code)

- Add the MCP server to your workspace settings (this repo includes `.vscode/settings.json`):

```json
{
  "github.copilot.mcp.servers": {
    "rss-mcp": { "type": "http", "url": "http://localhost:3000/mcp" }
  }
}
```

2) GitHub Copilot Chat

- Use the Copilot Chat extension and ensure the same MCP entry is available in the workspace settings. Use the chat prefix `@rss-mcp` to call tools.

3) Claude Desktop

- Use the `configs/claude_desktop_config_stdio.json` (stdio) or `configs/claude_desktop_config_http.json` (HTTP) provided in the `configs/` folder.
- Update the `cwd` in the stdio config to your local project directory if needed, or use `node_modules/tsx/dist/cli.mjs` and `src/index.ts` as the command+args and set working directory to the project root.

4) Cursor / Other Editors

- Cursor and other MCP-capable editors accept the same `command+args+cwd` or HTTP `url`. Use the provided `configs/cursor_settings.json` as a template.

5) Local Run (HTTP)

- Start the server in HTTP mode and point clients to `http://localhost:3000/mcp`:

```bash
MCP_TRANSPORT=http npm run dev
```

6) Security Checklist

- Ensure `.env` files with secrets are NOT committed. Use `.env.example` for placeholders.
- Remove any user-specific absolute paths from configs (this repository uses `/path/to/RSS-MCP` placeholders and workspace variables).
- If you accidentally committed secrets, rotate them immediately and remove from git history (do not attempt to hide them with a new commit).
