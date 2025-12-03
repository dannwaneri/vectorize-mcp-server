# Vectorize MCP Server

MCP server that provides semantic search capabilities using Cloudflare Vectorize.

## Features

- **semantic_search**: Natural language semantic search powered by Workers AI embeddings and Vectorize
- Connects to Cloudflare Workers backend for vector search
- Returns similarity scores with results

## Architecture
```
Claude Desktop → MCP Server (stdio) → Vectorize Worker (HTTP) → Vectorize Index
```

## Setup
```bash
npm install
npm run build
```

## Usage with Claude Desktop

Add to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "vectorize-search": {
      "command": "node",
      "args": ["C:\\path\\to\\vectorize-mcp-server\\dist\\index.js"]
    }
  }
}
```

## Backend Worker

This MCP server connects to: `https://vectorize-mcp-worker.fpl-test.workers.dev`

## Tech Stack

- TypeScript
- @modelcontextprotocol/sdk
- Cloudflare Workers AI (bge-small-en-v1.5)
- Cloudflare Vectorize (384 dimensions, cosine similarity)

## Next Steps

- [ ] Deploy MCP server to Workers (Phase 4)
- [ ] Add authentication
- [ ] Add caching