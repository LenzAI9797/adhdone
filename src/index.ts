/**
 * ADHDone - Hello World MCP Server
 * 
 * This is the simplest possible version to prove:
 * 1. Server starts and listens
 * 2. ChatGPT can connect
 * 3. Tools are registered and callable
 * 4. User identification works (openai/subject)
 * 
 * Once this works, progressively add:
 * - Database connection (Supabase)
 * - Real task breakdown logic
 * - Widgets
 * - Rate limiting
 * - Stripe integration
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import express from "express";

// ============================================
// Configuration
// ============================================

const PORT = process.env.PORT || 8080;
const IS_PRODUCTION = process.env.NODE_ENV === "production";

// ============================================
// MCP Server Setup
// ============================================

const server = new McpServer({
  name: "adhdone",
  version: "0.1.0",
});

// ============================================
// Tool 1: help_me_start
// The simplest possible tool - just returns encouragement
// ============================================

server.tool(
  "help_me_start",
  {
    title: "Help Me Start",
    description: "Help the user start a task they're stuck on. Call this when someone expresses difficulty starting, procrastination, or ADHD-related task paralysis.",
    inputSchema: {
      type: "object" as const,
      properties: {
        task: {
          type: "string",
          description: "What the user wants to do or is struggling to start"
        },
        feeling: {
          type: "string",
          description: "How the user is feeling (optional)"
        }
      },
      required: ["task"]
    }
  },
  async (args, extra) => {
    // Extract user ID from metadata
    const userId = extra?._meta?.["openai/subject"] || "unknown";
    const locale = extra?._meta?.["openai/locale"] || "en-US";
    
    console.log(`[help_me_start] User: ${userId.substring(0, 20)}... Task: ${args.task}`);
    
    // For now, just return a simple response
    // Later: This will break down the task and show a widget
    return {
      content: [
        {
          type: "text" as const,
          text: `🧠 **ADHDone is here to help!**

I hear you - "${args.task}" feels overwhelming right now. That's completely normal.

**Let's make this tiny:**
What's the absolute smallest first step? Something you could do in 2 minutes or less?

For example, if your task is "clean the kitchen", the tiniest step might be:
- Pick up 5 things from the counter
- Or just... walk to the kitchen and look at it

What feels doable right now?

---
*Session ID: ${userId.substring(0, 8)}... | Locale: ${locale}*
*(This confirms user tracking is working!)*`
        }
      ]
    };
  }
);

// ============================================
// Tool 2: break_down_task
// Breaks a task into micro-tasks (hardcoded examples for now)
// ============================================

server.tool(
  "break_down_task",
  {
    title: "Break Down Task",
    description: "Break an overwhelming task into small, ADHD-friendly micro-tasks of 2-5 minutes each.",
    inputSchema: {
      type: "object" as const,
      properties: {
        task: {
          type: "string",
          description: "The task to break down"
        },
        context: {
          type: "string",
          description: "Any additional context about the situation"
        }
      },
      required: ["task"]
    }
  },
  async (args, extra) => {
    const userId = extra?._meta?.["openai/subject"] || "unknown";
    
    console.log(`[break_down_task] User: ${userId.substring(0, 20)}... Task: ${args.task}`);
    
    // Hardcoded examples for testing
    // Later: Use AI or pattern matching for real breakdown
    const taskLower = args.task.toLowerCase();
    
    let microTasks: string[];
    
    if (taskLower.includes("clean") || taskLower.includes("tidy")) {
      microTasks = [
        "🎯 Stand up and walk to the room (30 sec)",
        "👀 Look around and pick ONE surface to focus on (30 sec)",
        "🗑️ Grab 5 items that are rubbish and bin them (2 min)",
        "📦 Put 5 things back where they belong (2 min)",
        "✨ Wipe down that ONE surface (2 min)"
      ];
    } else if (taskLower.includes("email") || taskLower.includes("inbox")) {
      microTasks = [
        "📧 Open your email app (30 sec)",
        "🗑️ Delete 5 obvious spam/junk emails (1 min)",
        "⭐ Star 3 emails that actually need replies (1 min)",
        "✍️ Reply to ONE email - just 2-3 sentences (3 min)",
        "🎉 Close email. You did something!"
      ];
    } else if (taskLower.includes("study") || taskLower.includes("homework") || taskLower.includes("assignment")) {
      microTasks = [
        "📚 Get your materials out on the desk (1 min)",
        "📖 Open to the right page/document (30 sec)",
        "👁️ Read just the first paragraph/section (2 min)",
        "✏️ Write ONE sentence about what you read (2 min)",
        "🎯 Decide: continue or take a 2-min break?"
      ];
    } else {
      // Generic breakdown
      microTasks = [
        `🎯 Think: What's the very first physical action? (1 min)`,
        `👣 Do that first action - nothing else (2 min)`,
        `✅ Notice: You started! That's the hardest part`,
        `🔄 What's the next tiny step? (2 min)`,
        `🎉 Keep going or celebrate what you did!`
      ];
    }
    
    return {
      content: [
        {
          type: "text" as const,
          text: `## Breaking down: "${args.task}"

Here are tiny, ADHD-friendly steps:

${microTasks.map((task, i) => `${i + 1}. ${task}`).join("\n")}

---

**Ready to start?** Just do step 1. Nothing else matters right now.

Would you like me to start a timer for the first step?`
        }
      ]
    };
  }
);

// ============================================
// Tool 3: start_timer (placeholder)
// ============================================

server.tool(
  "start_timer",
  {
    title: "Start Focus Timer",
    description: "Start a short focus timer for a specific micro-task.",
    inputSchema: {
      type: "object" as const,
      properties: {
        task: {
          type: "string",
          description: "The micro-task to focus on"
        },
        minutes: {
          type: "number",
          description: "How many minutes (default: 5)"
        }
      },
      required: ["task"]
    }
  },
  async (args, extra) => {
    const userId = extra?._meta?.["openai/subject"] || "unknown";
    const minutes = args.minutes || 5;
    
    console.log(`[start_timer] User: ${userId.substring(0, 20)}... Task: ${args.task}, ${minutes} min`);
    
    // Later: This will return a widget with an actual timer
    return {
      content: [
        {
          type: "text" as const,
          text: `## ⏱️ Timer Started: ${minutes} minutes

**Your focus task:** ${args.task}

---

🎯 **Just this ONE thing.** Nothing else exists right now.

When you're done (or the time is up), tell me and we'll celebrate!

---
*[Timer widget will go here in the real version]*
*For now, use your phone timer or just... do the thing!*`
        }
      ]
    };
  }
);

// ============================================
// Tool 4: complete_task
// ============================================

server.tool(
  "complete_task",
  {
    title: "Complete Task",
    description: "Mark a task as completed and celebrate the win!",
    inputSchema: {
      type: "object" as const,
      properties: {
        task: {
          type: "string",
          description: "What was completed"
        },
        how_it_went: {
          type: "string",
          description: "How did it go? (optional)"
        }
      },
      required: ["task"]
    }
  },
  async (args, extra) => {
    const userId = extra?._meta?.["openai/subject"] || "unknown";
    
    console.log(`[complete_task] User: ${userId.substring(0, 20)}... Completed: ${args.task}`);
    
    // Random celebration messages
    const celebrations = [
      "🎉 **YES! You did it!**",
      "🌟 **Amazing! Look at you go!**",
      "🚀 **Task CRUSHED!**",
      "💪 **That's what I'm talking about!**",
      "✨ **Incredible! You started AND finished!**"
    ];
    
    const celebration = celebrations[Math.floor(Math.random() * celebrations.length)];
    
    return {
      content: [
        {
          type: "text" as const,
          text: `${celebration}

You completed: **${args.task}**

---

Remember: With ADHD, starting is the hardest part. You didn't just do a task - you **beat the paralysis**. That's huge.

${args.how_it_went ? `\nYou said: "${args.how_it_went}"` : ""}

---

**What now?**
- 🔄 Want to tackle another micro-task?
- ☕ Take a well-deserved break?
- 📊 Check your patterns? (coming soon)

---
*[Celebration animation + streak counter will go here]*
*Streak: 1 day (placeholder)*`
        }
      ]
    };
  }
);

// ============================================
// Health Check Endpoint (for Railway/monitoring)
// ============================================

const app = express();

app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    service: "adhdone",
    version: "0.1.0",
    timestamp: new Date().toISOString()
  });
});

app.get("/", (req, res) => {
  res.json({
    name: "ADHDone MCP Server",
    version: "0.1.0",
    description: "AI-powered ADHD task coach for ChatGPT",
    status: "running",
    tools: [
      "help_me_start",
      "break_down_task", 
      "start_timer",
      "complete_task"
    ]
  });
});

// ============================================
// Start Server
// ============================================

async function main() {
  console.log(`
╔═══════════════════════════════════════════╗
║           ADHDone MCP Server              ║
║         Hello World Edition               ║
╠═══════════════════════════════════════════╣
║  Version: 0.1.0                           ║
║  Port: ${PORT}                              ║
║  Mode: ${IS_PRODUCTION ? "Production" : "Development"}                       ║
╚═══════════════════════════════════════════╝
  `);

  // Start Express for health checks
  app.listen(PORT, () => {
    console.log(`✅ Health check endpoint: http://localhost:${PORT}/health`);
    console.log(`✅ Server info: http://localhost:${PORT}/`);
  });

  // For local testing with MCP Inspector, use stdio transport
  // For ChatGPT integration, the MCP SDK handles the protocol
  if (!IS_PRODUCTION) {
    console.log(`
📋 Next steps:
1. Test locally: Open MCP Inspector and connect to this server
2. Deploy: Push to GitHub → Railway auto-deploys
3. Connect: Add server URL to ChatGPT Developer Mode
    `);
  }

  // Note: The actual MCP transport setup depends on how ChatGPT connects
  // This hello world version just starts the Express server for now
  // The full implementation will use the proper MCP transport
}

main().catch(console.error);
