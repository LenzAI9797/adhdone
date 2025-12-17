/**
 * ADHDone - MCP Server for ChatGPT
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import { z } from "zod";

const PORT = process.env.PORT || 8080;
const app = express();
app.use(express.json());

// Store transports for each session
const transports = new Map<string, SSEServerTransport>();

// Create MCP Server
const server = new McpServer({
  name: "adhdone",
  version: "0.1.0",
});

// ============================================
// Register Tools
// ============================================

server.tool(
  "help_me_start",
  "Help the user start a task they're stuck on. Call this when someone expresses difficulty starting, procrastination, or ADHD-related task paralysis.",
  {
    task: z
      .string()
      .describe("What the user wants to do or is struggling to start"),
  },
  async ({ task }) => {
    return {
      content: [
        {
          type: "text",
          text: `🧠 **ADHDone is here to help!**

I hear you - "${
            task || "this"
          }" feels overwhelming right now. That's completely normal.

**Let's make this tiny:**
What's the absolute smallest first step? Something you could do in 2 minutes or less?

For example, if your task is "clean the kitchen", the tiniest step might be:
- Pick up 5 things from the counter
- Or just... walk to the kitchen and look at it

What feels doable right now?`,
        },
      ],
    };
  }
);

server.tool(
  "break_down_task",
  "Break an overwhelming task into small, ADHD-friendly micro-tasks of 2-5 minutes each.",
  { task: z.string().describe("The task to break down") },
  async ({ task }) => {
    const taskLower = (task || "").toLowerCase();
    let microTasks: string[];

    if (taskLower.includes("clean") || taskLower.includes("tidy")) {
      microTasks = [
        "🎯 Stand up and walk to the room (30 sec)",
        "👀 Look around and pick ONE surface to focus on (30 sec)",
        "🗑️ Grab 5 items that are rubbish and bin them (2 min)",
        "📦 Put 5 things back where they belong (2 min)",
        "✨ Wipe down that ONE surface (2 min)",
      ];
    } else if (taskLower.includes("email") || taskLower.includes("inbox")) {
      microTasks = [
        "📧 Open your email app (30 sec)",
        "🗑️ Delete 5 obvious spam/junk emails (1 min)",
        "⭐ Star 3 emails that actually need replies (1 min)",
        "✍️ Reply to ONE email - just 2-3 sentences (3 min)",
        "🎉 Close email. You did something!",
      ];
    } else {
      microTasks = [
        "🎯 Think: What's the very first physical action? (1 min)",
        "👣 Do that first action - nothing else (2 min)",
        "✅ Notice: You started! That's the hardest part",
        "🔄 What's the next tiny step? (2 min)",
        "🎉 Keep going or celebrate what you did!",
      ];
    }

    return {
      content: [
        {
          type: "text",
          text: `## Breaking down: "${task}"

Here are tiny, ADHD-friendly steps:

${microTasks.map((t, i) => `${i + 1}. ${t}`).join("\n")}

---

**Ready to start?** Just do step 1. Nothing else matters right now.`,
        },
      ],
    };
  }
);

server.tool(
  "complete_task",
  "Mark a task as completed and celebrate the win!",
  { task: z.string().describe("What was completed") },
  async ({ task }) => {
    const celebrations = [
      "🎉 **YES! You did it!**",
      "🌟 **Amazing! Look at you go!**",
      "🚀 **Task CRUSHED!**",
      "💪 **That's what I'm talking about!**",
      "✨ **Incredible! You started AND finished!**",
    ];
    const celebration =
      celebrations[Math.floor(Math.random() * celebrations.length)];

    return {
      content: [
        {
          type: "text",
          text: `${celebration}

You completed: **${task}**

---

Remember: With ADHD, starting is the hardest part. You didn't just do a task - you **beat the paralysis**. That's huge.`,
        },
      ],
    };
  }
);

// ============================================
// SSE Endpoint
// ============================================

app.get("/sse", async (req, res) => {
  console.log("[SSE] New connection");

  const transport = new SSEServerTransport("/message", res);
  const sessionId = `session-${Date.now()}`;
  transports.set(sessionId, transport);

  res.on("close", () => {
    console.log("[SSE] Connection closed");
    transports.delete(sessionId);
  });

  await server.connect(transport);
});

app.post("/message", async (req, res) => {
  console.log("[Message] Received");

  const transport = Array.from(transports.values())[0];
  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    res.status(400).json({ error: "No active session" });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "adhdone", version: "0.1.0" });
});

app.get("/", (req, res) => {
  res.json({ name: "ADHDone", status: "running" });
});

// Start server
app.listen(PORT, () => {
  console.log(`ADHDone MCP Server running on port ${PORT}`);
});
