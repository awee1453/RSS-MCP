# RSS MCP Transport Modes

RSS MCP sunucusu iki farklı transport modu destekler:

## 1. stdio (Normal MCP) - Varsayılan ⭐

**Önerilen mod** - Claude Desktop ve diğer MCP istemcileri için standart kullanım.

### Özellikler:
- ✅ Claude Desktop ile otomatik entegrasyon
- ✅ Manuel sunucu başlatmaya gerek yok
- ✅ Daha güvenli (sadece local process)
- ✅ Standart MCP protokolü

### Kullanım:

**Claude Desktop Config:**
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

**Not:** `cwd` yolunu kendi proje dizininize göre güncelleyin.

## 2. HTTP (Streamable HTTP) - Opsiyonel

Web tabanlı istemciler veya test için kullanılabilir.

### Özellikler:
- ✅ MCP Inspector ile test edilebilir
- ✅ Web tabanlı istemciler için uygun
- ⚠️ Manuel olarak sunucuyu başlatmanız gerekir

### Kullanım:

**1. Sunucuyu HTTP modunda başlatın:**
```bash
npm run dev:http
# veya
MCP_TRANSPORT=http npm run dev
```

**2. Claude Desktop Config:**
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

## Mod Seçimi

Varsayılan olarak sunucu **stdio** modunda çalışır. HTTP modunu kullanmak için:

```bash
# Development
MCP_TRANSPORT=http npm run dev

# Production
MCP_TRANSPORT=http npm start
```

Veya `package.json` scriptlerini kullanın:
```bash
npm run dev:http
npm run start:http
```

## Hangi Modu Seçmeliyim?

- **Claude Desktop kullanıyorsanız**: stdio (varsayılan) ✅
- **MCP Inspector ile test ediyorsanız**: HTTP veya stdio
- **Web tabanlı istemci kullanıyorsanız**: HTTP
- **VS Code Copilot kullanıyorsanız**: HTTP

## Sorun Giderme

### stdio Modu Çalışmıyor
- `cwd` yolunun doğru olduğundan emin olun
- Node.js ve tsx'in yüklü olduğunu kontrol edin
- Claude Desktop'ı yeniden başlatın

### HTTP Modu Çalışmıyor
- Port 3000'in kullanılabilir olduğunu kontrol edin
- `MCP_TRANSPORT=http` environment variable'ının ayarlandığından emin olun
- Sunucunun çalıştığını doğrulayın: `curl http://localhost:3000/health`

