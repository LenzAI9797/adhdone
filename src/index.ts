/**
 * ADHDone - Hello World MCP Server
 *
 * Simplified version for testing deployment
 */

import express from "express";

// ============================================
// Configuration
// ============================================

const PORT = process.env.PORT || 8080;

// ============================================
// Express Server for Health Checks & Basic API
// ============================================

const app = express();
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "adhdone",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
  });
});

// Server info
app.get("/", (req, res) => {
  res.json({
    name: "ADHDone MCP Server",
    version: "0.1.0",
    description: "AI-powered ADHD task coach for ChatGPT",
    status: "running",
    tools: ["help_me_start", "break_down_task", "start_timer", "complete_task"],
  });
});

// ============================================
// Tool Endpoints (Simple REST for now)
// ============================================

// Help me start
app.post("/tools/help_me_start", (req, res) => {
  const { task, feeling } = req.body;
  const userId = req.headers["x-openai-subject"] || "unknown";

  console.log(
    `[help_me_start] User: ${String(userId).substring(0, 20)}... Task: ${task}`
  );

  res.json({
    message: `🧠 **ADHDone is here to help!**

I hear you - "${task}" feels overwhelming right now. That's completely normal.

**Let's make this tiny:**
What's the absolute smallest first step? Something you could do in 2 minutes or less?

For example, if your task is "clean the kitchen", the tiniest step might be:
- Pick up 5 things from the counter
- Or just... walk to the kitchen and look at it

What feels doable right now?

---
*User tracking working: ${String(userId).substring(0, 8)}...*`,
  });
});

// Break down task
app.post("/tools/break_down_task", (req, res) => {
  const { task } = req.body;
  const userId = req.headers["x-openai-subject"] || "unknown";

  console.log(
    `[break_down_task] User: ${String(userId).substring(
      0,
      20
    )}... Task: ${task}`
  );

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
      `🎯 Think: What's the very first physical action? (1 min)`,
      `👣 Do that first action - nothing else (2 min)`,
      `✅ Notice: You started! That's the hardest part`,
      `🔄 What's the next tiny step? (2 min)`,
      `🎉 Keep going or celebrate what you did!`,
    ];
  }

  res.json({
    task: task,
    microTasks: microTasks,
    message: `## Breaking down: "${task}"

Here are tiny, ADHD-friendly steps:

${microTasks.map((t, i) => `${i + 1}. ${t}`).join("\n")}

---

**Ready to start?** Just do step 1. Nothing else matters right now.

Would you like me to start a timer for the first step?`,
  });
});

// Start timer
app.post("/tools/start_timer", (req, res) => {
  const { task, minutes = 5 } = req.body;
  const userId = req.headers["x-openai-subject"] || "unknown";

  console.log(
    `[start_timer] User: ${String(userId).substring(
      0,
      20
    )}... Task: ${task}, ${minutes} min`
  );

  res.json({
    task: task,
    minutes: minutes,
    message: `## ⏱️ Timer Started: ${minutes} minutes

**Your focus task:** ${task}

---

🎯 **Just this ONE thing.** Nothing else exists right now.

When you're done (or the time is up), tell me and we'll celebrate!

---
*[Timer widget coming soon - for now, use your phone timer!]*`,
  });
});

// Complete task
app.post("/tools/complete_task", (req, res) => {
  const { task, how_it_went } = req.body;
  const userId = req.headers["x-openai-subject"] || "unknown";

  console.log(
    `[complete_task] User: ${String(userId).substring(
      0,
      20
    )}... Completed: ${task}`
  );

  const celebrations = [
    "🎉 **YES! You did it!**",
    "🌟 **Amazing! Look at you go!**",
    "🚀 **Task CRUSHED!**",
    "💪 **That's what I'm talking about!**",
    "✨ **Incredible! You started AND finished!**",
  ];

  const celebration =
    celebrations[Math.floor(Math.random() * celebrations.length)];

  res.json({
    task: task,
    celebration: celebration,
    message: `${celebration}

You completed: **${task}**

---

Remember: With ADHD, starting is the hardest part. You didn't just do a task - you **beat the paralysis**. That's huge.

${how_it_went ? `\nYou said: "${how_it_went}"` : ""}

---

**What now?**
- 🔄 Want to tackle another micro-task?
- ☕ Take a well-deserved break?

---
*Streak: 1 day (tracking coming soon)*`,
  });
});

// ============================================
// Start Server
// ============================================

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║           ADHDone MCP Server              ║
║         Hello World Edition               ║
╠═══════════════════════════════════════════╣
║  Version: 0.1.0                           ║
║  Port: ${PORT}                              ║
╚═══════════════════════════════════════════╝

✅ Health check: http://localhost:${PORT}/health
✅ Server info: http://localhost:${PORT}/
  `);
});
