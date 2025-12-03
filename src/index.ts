#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

const WORKER_URL = "https://vectorize-mcp-worker.fpl-test.workers.dev";

// Initialize MCP server
const server = new Server(
  {
    name: "vectorize-search-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools: Tool[] = [
    {
      name: "semantic_search",
      description:
        "Search the knowledge base using semantic similarity. This finds content based on meaning, not just keywords. Perfect for finding relevant information even when the exact words don't match.",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Natural language search query",
          },
          topK: {
            type: "number",
            description: "Number of results to return (1-10)",
            default: 5,
          },
        },
        required: ["query"],
      },
    },
  ];

  return { tools };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "semantic_search") {
      const query = args?.query as string;
      const topK = Math.min((args?.topK as number) || 5, 10);

      if (!query) {
        throw new Error("Query parameter is required");
      }

      // Call the Vectorize Worker
      const response = await fetch(`${WORKER_URL}/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, topK }),
      });

      if (!response.ok) {
        throw new Error(`Worker returned ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                query: data.query,
                resultsCount: data.resultsCount,
                results: data.results.map((r: any) => ({
                  id: r.id,
                  score: r.score.toFixed(4),
                  content: r.content,
                  category: r.category,
                })),
              },
              null,
              2
            ),
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: errorMessage,
          }),
        },
      ],
      isError: true,
    };
  }
});

// Error handling
server.onerror = (error) => {
  console.error("[MCP Error]", error);
};

process.on("SIGINT", async () => {
  await server.close();
  process.exit(0);
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Vectorize MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});