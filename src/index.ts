/**
 * ADHDone - MCP Server with SSE Transport
 *
 * ChatGPT connects via Server-Sent Events (SSE)
 */

import express, { Request, Response } from "express";

const PORT = process.env.PORT || 8080;
const app = express();
app.use(express.json());

// ============================================
// Tool Definitions
// ============================================

const TOOLS = [
  {
    name: "help_me_start",
    description:
      "Help the user start a task they're stuck on. Call this when someone expresses difficulty starting, procrastination, or ADHD-related task paralysis.",
    inputSchema: {
      type: "object",
      properties: {
        task: {
          type: "string",
          description: "What the user wants to do or is struggling to start",
        },
      },
      required: ["task"],
    },
  },
  {
    name: "break_down_task",
    description:
      "Break an overwhelming task into small, ADHD-friendly micro-tasks of 2-5 minutes each.",
    inputSchema: {
      type: "object",
      properties: {
        task: {
          type: "string",
          description: "The task to break down",
        },
      },
      required: ["task"],
    },
  },
  {
    name: "start_timer",
    description: "Start a short focus timer for a specific micro-task.",
    inputSchema: {
      type: "object",
      properties: {
        task: {
          type: "string",
          description: "The micro-task to focus on",
        },
        minutes: {
          type: "number",
          description: "How many minutes (default: 5)",
        },
      },
      required: ["task"],
    },
  },
  {
    name: "complete_task",
    description: "Mark a task as completed and celebrate the win!",
    inputSchema: {
      type: "object",
      properties: {
        task: {
          type: "string",
          description: "What was completed",
        },
      },
      required: ["task"],
    },
  },
];

// ============================================
// Tool Handlers
// ============================================

function handleHelpMeStart(args: any): string {
  const { task } = args;
  return `🧠 **ADHDone is here to help!**

I hear you - "${
    task || "this"
  }" feels overwhelming right now. That's completely normal.

**Let's make this tiny:**
What's the absolute smallest first step? Something you could do in 2 minutes or less?

For example, if your task is "clean the kitchen", the tiniest step might be:
- Pick up 5 things from the counter
- Or just... walk to the kitchen and look at it

What feels doable right now?`;
}

function handleBreakDownTask(args: any): string {
  const { task } = args;
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
  } else if (
    taskLower.includes("study") ||
    taskLower.includes("homework") ||
    taskLower.includes("assignment")
  ) {
    microTasks = [
      "📚 Get your materials out on the desk (1 min)",
      "📖 Open to the right page/document (30 sec)",
      "👁️ Read just the first paragraph/section (2 min)",
      "✏️ Write ONE sentence about what you read (2 min)",
      "🎯 Decide: continue or take a 2-min break?",
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

  return `## Breaking down: "${task}"

Here are tiny, ADHD-friendly steps:

${microTasks.map((t, i) => `${i + 1}. ${t}`).join("\n")}

---

**Ready to start?** Just do step 1. Nothing else matters right now.

Would you like me to start a timer for the first step?`;
}

function handleStartTimer(args: any): string {
  const { task, minutes = 5 } = args;

  return `## ⏱️ Timer Started: ${minutes} minutes

**Your focus task:** ${task}

---

🎯 **Just this ONE thing.** Nothing else exists right now.

When you're done (or the time is up), tell me and we'll celebrate!`;
}

function handleCompleteTask(args: any): string {
  const { task } = args;

  const celebrations = [
    "🎉 **YES! You did it!**",
    "🌟 **Amazing! Look at you go!**",
    "🚀 **Task CRUSHED!**",
    "💪 **That's what I'm talking about!**",
    "✨ **Incredible! You started AND finished!**",
  ];

  const celebration =
    celebrations[Math.floor(Math.random() * celebrations.length)];

  return `${celebration}

You completed: **${task}**

---

Remember: With ADHD, starting is the hardest part. You didn't just do a task - you **beat the paralysis**. That's huge.

**What now?**
- 🔄 Want to tackle another micro-task?
- ☕ Take a well-deserved break?`;
}

function callTool(name: string, args: any): string {
  switch (name) {
    case "help_me_start":
      return handleHelpMeStart(args);
    case "break_down_task":
      return handleBreakDownTask(args);
    case "start_timer":
      return handleStartTimer(args);
    case "complete_task":
      return handleCompleteTask(args);
    default:
      return `Unknown tool: ${name}`;
  }
}

// ============================================
// SSE Endpoint for MCP
// ============================================

app.get("/sse", (req: Request, res: Response) => {
  console.log("[SSE] Client connected");

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders();

  // Send initial connection message
  const sessionId = `session-${Date.now()}`;
  res.write(`data: ${JSON.stringify({ type: "session", sessionId })}\n\n`);

  // Keep connection alive
  const keepAlive = setInterval(() => {
    res.write(`: keepalive\n\n`);
  }, 30000);

  req.on("close", () => {
    console.log("[SSE] Client disconnected");
    clearInterval(keepAlive);
  });
});

// ============================================
// MCP Message Endpoint
// ============================================

app.post("/message", (req: Request, res: Response) => {
  const { method, params, id } = req.body;

  console.log(`[MCP] Method: ${method}, ID: ${id}`);

  let result: any;

  switch (method) {
    case "initialize":
      result = {
        protocolVersion: "2024-11-05",
        capabilities: {
          tools: {},
        },
        serverInfo: {
          name: "adhdone",
          version: "0.1.0",
        },
      };
      break;

    case "tools/list":
      result = { tools: TOOLS };
      break;

    case "tools/call":
      const toolName = params?.name;
      const toolArgs = params?.arguments || {};
      console.log(`[MCP] Calling tool: ${toolName}`, toolArgs);

      const content = callTool(toolName, toolArgs);
      result = {
        content: [{ type: "text", text: content }],
      };
      break;

    default:
      result = { error: `Unknown method: ${method}` };
  }

  res.json({ jsonrpc: "2.0", id, result });
});

// ============================================
// Combined SSE + Message endpoint (what ChatGPT expects)
// ============================================

app.all("/", (req: Request, res: Response) => {
  // If it's asking for SSE
  if (
    req.headers.accept?.includes("text/event-stream") ||
    req.method === "GET"
  ) {
    console.log("[Root] SSE connection requested");

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.flushHeaders();

    // Send endpoint info
    const endpoint = `https://${req.headers.host}/message`;
    res.write(`event: endpoint\ndata: ${endpoint}\n\n`);

    // Keep alive
    const keepAlive = setInterval(() => {
      res.write(`: keepalive\n\n`);
    }, 30000);

    req.on("close", () => {
      clearInterval(keepAlive);
    });

    return;
  }

  // Otherwise return server info as JSON
  res.json({
    name: "ADHDone MCP Server",
    version: "0.1.0",
    description: "AI-powered ADHD task coach for ChatGPT",
    status: "running",
  });
});

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "adhdone",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// Start Server
// ============================================

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║           ADHDone MCP Server              ║
║            SSE Edition                    ║
╠═══════════════════════════════════════════╣
║  Version: 0.1.0                           ║
║  Port: ${PORT}                              ║
╚═══════════════════════════════════════════╝

✅ Health: http://localhost:${PORT}/health
✅ SSE: http://localhost:${PORT}/sse
  `);
});
