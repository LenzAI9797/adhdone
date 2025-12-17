/**
 * ADHDone - Simple MCP Server (No SDK)
 */

import express from "express";
import cors from "cors";

const PORT = process.env.PORT || 8080;
const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

// Tools
const TOOLS = [
  {
    name: "help_me_start",
    description:
      "Help user start a task they're stuck on. Use when someone expresses difficulty starting or ADHD-related paralysis.",
    inputSchema: {
      type: "object",
      properties: {
        task: { type: "string", description: "The task to start" },
      },
      required: ["task"],
    },
  },
  {
    name: "break_down_task",
    description:
      "Break an overwhelming task into small 2-5 minute micro-tasks.",
    inputSchema: {
      type: "object",
      properties: {
        task: { type: "string", description: "The task to break down" },
      },
      required: ["task"],
    },
  },
  {
    name: "complete_task",
    description: "Mark a task as completed and celebrate!",
    inputSchema: {
      type: "object",
      properties: {
        task: { type: "string", description: "What was completed" },
      },
      required: ["task"],
    },
  },
];

// Tool handlers
function callTool(name: string, args: any): string {
  switch (name) {
    case "help_me_start":
      return `🧠 **ADHDone is here to help!**\n\nI hear you - "${args.task}" feels overwhelming. That's normal.\n\n**What's the tiniest first step?** Something you could do in 2 minutes?`;

    case "break_down_task": {
      const task = args.task?.toLowerCase() || "";
      let steps: string[];
      if (task.includes("clean") || task.includes("tidy")) {
        steps = [
          "🎯 Walk to the room (30 sec)",
          "👀 Pick ONE surface (30 sec)",
          "🗑️ Bin 5 items (2 min)",
          "📦 Put 5 things away (2 min)",
          "✨ Wipe surface (2 min)",
        ];
      } else {
        steps = [
          "🎯 First physical action? (1 min)",
          "👣 Do just that (2 min)",
          "✅ You started!",
          "🔄 Next tiny step? (2 min)",
          "🎉 Celebrate!",
        ];
      }
      return `## Breaking down: "${args.task}"\n\n${steps
        .map((s, i) => `${i + 1}. ${s}`)
        .join("\n")}\n\n**Just do step 1.**`;
    }

    case "complete_task": {
      const celebrations = [
        "🎉 **YES!**",
        "🌟 **Amazing!**",
        "🚀 **CRUSHED IT!**",
      ];
      return `${
        celebrations[Math.floor(Math.random() * celebrations.length)]
      }\n\nYou completed: **${args.task}**\n\nYou beat the paralysis!`;
    }

    default:
      return "Unknown tool";
  }
}

// MCP Protocol Handler
function handleMcpRequest(body: any): any {
  const { method, id, params } = body;

  console.log(`[MCP] ${method}`);

  switch (method) {
    case "initialize":
      return {
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {} },
          serverInfo: { name: "adhdone", version: "1.0.0" },
        },
      };

    case "notifications/initialized":
      return { jsonrpc: "2.0", id, result: {} };

    case "tools/list":
      return { jsonrpc: "2.0", id, result: { tools: TOOLS } };

    case "tools/call":
      const text = callTool(params.name, params.arguments || {});
      return {
        jsonrpc: "2.0",
        id,
        result: { content: [{ type: "text", text }] },
      };

    default:
      return { jsonrpc: "2.0", id, result: {} };
  }
}

// MCP endpoint
app.post("/mcp", (req, res) => {
  const response = handleMcpRequest(req.body);
  res.json(response);
});

app.get("/mcp", (req, res) => {
  res.json({ name: "ADHDone", version: "1.0.0" });
});

// Health
app.get("/health", (req, res) => res.json({ status: "ok" }));
app.get("/", (req, res) => res.json({ name: "ADHDone", status: "running" }));

app.listen(PORT, () => console.log(`ADHDone running on port ${PORT}`));
