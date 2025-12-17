# ADHDone - Hello World MCP Server

AI-powered ADHD task coach for ChatGPT. This is the starter/hello-world version to prove everything connects before adding complexity.

## What This Does

This minimal version proves:
- ✅ MCP server starts and listens
- ✅ Tools are registered correctly
- ✅ User identification works (`openai/subject`)
- ✅ ChatGPT can invoke tools and get responses

## Tools Included

| Tool | Description |
|------|-------------|
| `help_me_start` | Initial help when user is stuck |
| `break_down_task` | Breaks task into micro-tasks (hardcoded examples) |
| `start_timer` | Placeholder for timer (no actual timer yet) |
| `complete_task` | Celebrates completion |

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Locally

```bash
npm run dev
```

Server starts at `http://localhost:8080`

### 3. Test Endpoints

```bash
# Health check
curl http://localhost:8080/health

# Server info
curl http://localhost:8080/
```

## Deploy to Railway

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial ADHDone server"
git remote add origin https://github.com/YOUR_USERNAME/adhdone.git
git push -u origin main
```

### 2. Connect to Railway

1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub repo
3. Select your `adhdone` repo
4. Railway auto-detects Node.js and deploys

### 3. Get Your URL

Railway gives you a URL like:
```
https://adhdone-production.up.railway.app
```

## Connect to ChatGPT

### 1. Open ChatGPT Developer Mode

1. ChatGPT → Settings → Apps & Connectors → Advanced
2. Enable Developer Mode

### 2. Add Your Server

1. Create new connector
2. Enter your Railway URL
3. Save

### 3. Test

Say to ChatGPT:
> "I can't start cleaning my flat, help me with ADHDone"

## Project Structure

```
adhdone-starter/
├── src/
│   └── index.ts      # Main MCP server (this file)
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Next Steps (After Hello World Works)

1. **Add Supabase** - Database for user data, patterns, streaks
2. **Real task breakdown** - AI-powered or pattern-matched breakdown
3. **Widgets** - Visual timer, celebration animations
4. **Rate limiting** - Track tool calls, enforce free tier limits
5. **Stripe** - Premium subscriptions

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

For Railway, add these in the dashboard under Variables.

## Troubleshooting

### Server won't start
- Check Node.js version: `node --version` (need 18+)
- Check port isn't in use: `lsof -i :8080`

### ChatGPT can't connect
- Verify Railway deployment is successful
- Check Railway logs for errors
- Ensure URL is HTTPS (Railway provides this)
- If in UK: May need VPN for Developer Mode

### Tools not appearing
- Verify server is running (`/health` returns OK)
- Check ChatGPT Developer Mode is enabled
- Try refreshing ChatGPT

## UK/EU Developer Note

ChatGPT Apps are currently unavailable in UK/EU for end users. However:
- ✅ You can develop and deploy from UK
- ✅ You can test with VPN (connect to US)
- ✅ US/global users can use your app
- ⏳ UK/EU access expected Q1-Q2 2025

---

Built for the ADHD community 🧠💜
