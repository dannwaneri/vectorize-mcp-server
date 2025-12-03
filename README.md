# Vectorize MCP Server

A Model Context Protocol (MCP) server that provides semantic search capabilities by connecting Claude Desktop to a Cloudflare Workers backend with Vectorize.

## Architecture
```
Claude Desktop ──stdio──> MCP Server ──HTTP──> Vectorize Worker ──> Vectorize Index
```

This is a **hybrid architecture** - the MCP server runs locally and bridges Claude Desktop to a remote Cloudflare Workers backend.

## Features

- **Semantic Search Tool**: Natural language search using vector similarity
- **stdio Transport**: Works with Claude Desktop and other MCP clients
- **Remote Backend**: Heavy lifting (embeddings, vector search) happens on Cloudflare Workers
- **Type-safe**: Full TypeScript implementation

## Prerequisites

- Node.js 18+ installed
- Claude Desktop installed
- [vectorize-mcp-worker](https://github.com/dannwaneri/vectorize-mcp-worker) deployed

## Installation

**1. Clone and install:**
```bash
git clone https://github.com/dannwaneri/vectorize-mcp-server.git
cd vectorize-mcp-server
npm install
```

**2. Build:**
```bash
npm run build
```

**3. Configure Claude Desktop:**

Edit your Claude Desktop config file:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

Add this server:
```json
{
  "mcpServers": {
    "vectorize-search": {
      "command": "node",
      "args": [
        "/absolute/path/to/vectorize-mcp-server/dist/index.js"
      ]
    }
  }
}
```

**4. Restart Claude Desktop**

## Usage

The server exposes one tool to Claude:

### `semantic_search`

Search the knowledge base using semantic similarity.

**Parameters:**
- `query` (string, required): Natural language search query
- `topK` (number, optional): Number of results to return (default: 5)

**Example in Claude Desktop:**
```
Search for information about AI embeddings
```

Claude will automatically use the `semantic_search` tool and return results with similarity scores.

## How It Works

1. **Claude sends query** to MCP server via stdio
2. **MCP server forwards** query to Vectorize Worker via HTTP
3. **Worker generates embedding** using Workers AI
4. **Vectorize searches** for similar vectors
5. **Results flow back** through MCP server to Claude
6. **Claude synthesizes** answer using the search results

## Configuration

### Change Backend URL

Edit `src/index.ts` and update the Worker URL:
```typescript
const WORKER_URL = "https://your-worker.workers.dev";
```

Then rebuild:
```bash
npm run build
```

### Adjust Result Count

The default `topK` is 5. Users can override this:
```
Search for "databases" and show me 10 results
```

## Development

**Run in development mode:**
```bash
npm run dev
```

**Build for production:**
```bash
npm run build
```

**Test locally:**
```bash
node dist/index.js
```

The server will output: `Vectorize MCP server running on stdio`

## Example Queries

Try these in Claude Desktop:
```
What do you know about vector databases?
```
```
Find information about RAG systems
```
```
Search for anything related to Cloudflare Workers
```
```
Tell me about machine learning at the edge
```

## Response Format

The tool returns JSON with:
- `query`: Original search query
- `resultsCount`: Number of results found
- `results`: Array of matches with:
  - `id`: Entry identifier
  - `score`: Similarity score (0-1, higher is better)
  - `content`: Actual content
  - `category`: Content category

Claude automatically parses this and presents it naturally.

## Troubleshooting

**Server not appearing in Claude Desktop:**
1. Check the config file path is correct
2. Verify the absolute path to `dist/index.js`
3. Make sure you restarted Claude Desktop completely (quit, not just close)
4. Check Developer Console (Ctrl+Shift+I in Claude Desktop)

**"Not connected" errors:**
1. Ensure Worker is deployed and accessible
2. Check `WORKER_URL` in `src/index.ts`
3. Verify Worker has data populated (`POST /populate`)

**No results returned:**
1. Populate the Vectorize index using the Worker's `/populate` endpoint
2. Try broader search terms
3. Check Worker logs with `wrangler tail`

## Technology Stack

- **TypeScript**: Type-safe development
- **@modelcontextprotocol/sdk**: Official MCP SDK
- **Node.js**: Runtime environment
- **stdio transport**: Standard MCP communication method

## Related Projects

- [vectorize-mcp-worker](https://github.com/dannwaneri/vectorize-mcp-worker) - Backend Worker (required)
- [mcp-server-worker](https://github.com/dannwaneri/mcp-server-worker) - Full HTTP-based MCP on Workers

## Why This Architecture?

**Advantages:**
- Works with Claude Desktop (requires stdio)
- Backend runs on edge (fast, scalable)
- Can share Worker backend across multiple clients
- Heavy processing (embeddings, search) happens remotely

**Tradeoffs:**
- Requires both local server and remote Worker
- Extra network hop adds latency (~50-100ms)
- Need to keep local server running

For a fully remote solution, see [mcp-server-worker](https://github.com/dannwaneri/mcp-server-worker).

## License

MIT

## Author

Daniel Nwaneri - [GitHub](https://github.com/dannwaneri) | [Upwork](https://www.upwork.com/freelancers/~01d5946abaa558d9aa)