/**
 * ADHDone - MCP Server for ChatGPT (Streamable HTTP)
 */

import express from "express";
import cors from "cors";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";

const PORT = process.env.PORT || 8080;
const app = express();

// Enable CORS for ChatGPT
app.use(
  cors({
    origin: "https://chatgpt.com",
    credentials: true,
  })
);
app.use(express.json());

// Create MCP server
const mcpServer = new Server(
  { name: "adhdone", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// Tool handlers
function helpMeStart(task: string): string {
  return `🧠 **ADHDone is here to help!**

I hear you - "${task}" feels overwhelming right now. That's completely normal.

**Let's make this tiny:**
What's the absolute smallest first step? Something you could do in 2 minutes or less?`;
}

function breakDownTask(task: string): string {
  const taskLower = task.toLowerCase();
  let steps: string[];

  if (taskLower.includes("clean") || taskLower.includes("tidy")) {
    steps = [
      "🎯 Stand up and walk to the room (30 sec)",
      "👀 Pick ONE surface to focus on (30 sec)",
      "🗑️ Grab 5 items that are rubbish and bin them (2 min)",
      "📦 Put 5 things back where they belong (2 min)",
      "✨ Wipe down that ONE surface (2 min)",
    ];
  } else if (taskLower.includes("email")) {
    steps = [
      "📧 Open your email app (30 sec)",
      "🗑️ Delete 5 spam emails (1 min)",
      "⭐ Star 3 emails that need replies (1 min)",
      "✍️ Reply to ONE email (3 min)",
      "🎉 Close email. Done!",
    ];
  } else {
    steps = [
      "🎯 What's the very first physical action? (1 min)",
      "👣 Do that first action - nothing else (2 min)",
      "✅ You started! That's the hardest part",
      "🔄 What's the next tiny step? (2 min)",
      "🎉 Keep going or celebrate!",
    ];
  }

  return `## Breaking down: "${task}"

${steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}

**Just do step 1.** Nothing else matters right now.`;
}

function completeTask(task: string): string {
  const celebrations = [
    "🎉 **YES!**",
    "🌟 **Amazing!**",
    "🚀 **CRUSHED IT!**",
    "💪 **Awesome!**",
  ];
  const celebration =
    celebrations[Math.floor(Math.random() * celebrations.length)];

  return `${celebration}

You completed: **${task}**

With ADHD, starting is the hardest part. You beat the paralysis!`;
}

// Register tools
mcpServer.setRequestHandler("tools/list" as any, async () => ({
  tools: [
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
  ],
}));

mcpServer.setRequestHandler("tools/call" as any, async (request: any) => {
  const { name, arguments: args } = request.params;
  let text: string;

  switch (name) {
    case "help_me_start":
      text = helpMeStart(args.task);
      break;
    case "break_down_task":
      text = breakDownTask(args.task);
      break;
    case "complete_task":
      text = completeTask(args.task);
      break;
    default:
      text = "Unknown tool";
  }

  return { content: [{ type: "text", text }] };
});

// MCP endpoint (Streamable HTTP)
app.post("/mcp", async (req, res) => {
  console.log("[MCP] Request received");

  try {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => `session-${Date.now()}`,
    });
    await mcpServer.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("[MCP] Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Also support GET for initialization
app.get("/mcp", async (req, res) => {
  res.json({ name: "ADHDone", version: "1.0.0", status: "ready" });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/", (req, res) => {
  res.json({ name: "ADHDone MCP Server", status: "running" });
});

app.listen(PORT, () => {
  console.log(`ADHDone running on port ${PORT}`);
});
