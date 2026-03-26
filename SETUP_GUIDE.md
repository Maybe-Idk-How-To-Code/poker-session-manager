# ♠ PokerTrack — Complete Setup, Run & Modification Guide

---

## Table of Contents
1. [What You Have](#1-what-you-have)
2. [Run Locally (Frontend only — no backend needed)](#2-run-locally-frontend-only)
3. [Run Locally (Full stack with backend)](#3-run-locally-full-stack)
4. [Deploy FREE to GitHub Pages](#4-deploy-free-to-github-pages)
5. [How the Code is Organised](#5-how-the-code-is-organised)
6. [How to Modify Things](#6-how-to-modify-things)
7. [Google Sheets Backend Setup](#7-google-sheets-backend-setup)
8. [Common Errors & Fixes](#8-common-errors--fixes)

---

## 1. What You Have

```
poker-session-manager/
│
├── frontend/                   ← React app (this is what users see)
│   ├── src/
│   │   ├── main.jsx            ← React entry point (don't touch this)
│   │   └── PokerApp.jsx        ← THE ENTIRE FRONTEND (all components here)
│   ├── index.html              ← HTML shell
│   ├── package.json            ← npm dependencies
│   └── vite.config.js          ← build config
│
├── backend/                    ← Python FastAPI (optional — only if you want a real DB)
│   ├── main.py                 ← FastAPI server entry point
│   ├── models.py               ← Data shapes (what sessions/players/txs look like)
│   ├── settlement.py           ← The maths: who pays who
│   ├── repository.py           ← Storage interface (swap DB without changing logic)
│   ├── session_service.py      ← Business logic
│   ├── sheets_repository.py    ← Google Sheets storage implementation
│   ├── routes/                 ← HTTP endpoints
│   └── requirements.txt        ← Python packages
│
├── .github/workflows/
│   └── deploy.yml              ← Auto-deploy to GitHub Pages on every git push
│
├── GOOGLE_SHEETS_SCHEMA.md     ← How the spreadsheet tabs are structured
└── SETUP_GUIDE.md              ← This file
```

**Key point:** The frontend is 100% self-contained. It stores everything in
React state (in memory). You can run and deploy the frontend with ZERO backend
setup. The backend + Google Sheets is an optional upgrade for persistent data.

---

## 2. Run Locally (Frontend Only)

This is the quick start. No Python, no Google account, no database needed.
Data lives in browser memory (resets on page refresh — perfect for testing).

### Prerequisites
- Node.js 18+ installed → https://nodejs.org (click the LTS version)
- That's literally it

### Steps

```bash
# 1. Open your terminal and go into the frontend folder
cd poker-session-manager/frontend

# 2. Install dependencies (only needed once)
npm install

# 3. Start the dev server
npm run dev
```

You'll see output like:
```
  VITE v5.x.x  ready in 300ms
  ➜  Local:   http://localhost:5173/
```

Open http://localhost:5173 in your browser. The app is running.

### To stop it
Press `Ctrl + C` in the terminal.

### To build a production version (creates static files you can host anywhere)
```bash
npm run build
# Creates frontend/dist/ folder with your built app
```

---

## 3. Run Locally (Full Stack)

Only do this if you want persistent data saved to Google Sheets.
See Section 7 for the Google Sheets setup first.

### Prerequisites
- Node.js 18+
- Python 3.11+ → https://python.org
- A Google Cloud project with Sheets API enabled (Section 7)

### Backend setup

```bash
# Go to backend folder
cd poker-session-manager/backend

# Create a virtual environment (keeps packages isolated — good practice)
python -m venv venv

# Activate it:
# On Mac/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install Python packages
pip install -r requirements.txt

# Create a .env file with your secrets (never commit this file!)
# Copy the template below and fill in your values:
cp .env.example .env
```

Create `backend/.env`:
```
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id_here
GOOGLE_APPLICATION_CREDENTIALS=credentials.json
```

```bash
# Start the backend server
uvicorn main:app --reload --port 8000
```

The API is now at http://localhost:8000
API docs (auto-generated): http://localhost:8000/docs

### Frontend setup (in a second terminal)

```bash
cd poker-session-manager/frontend
npm install
npm run dev
```

The frontend will now talk to the backend on port 8000.

---

## 4. Deploy FREE to GitHub Pages

GitHub Pages hosts static websites for free. The frontend-only version works
perfectly here. Every time you push code, it auto-deploys.

### One-time setup (5 minutes)

**Step 1: Create a GitHub account** (if you don't have one)
→ https://github.com/signup

**Step 2: Create a new repository**
- Go to https://github.com/new
- Name it `poker-session-manager` (or anything you like)
- Keep it Public (required for free Pages hosting)
- Don't add README/gitignore (we have our own)
- Click "Create repository"

**Step 3: Update the base path in vite.config.js**

Open `frontend/vite.config.js` and change line 6:
```js
// Change this:
base: '/',

// To this (use YOUR repository name):
base: '/poker-session-manager/',
```

**Step 4: Push your code to GitHub**

```bash
# In the poker-session-manager folder:
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/poker-session-manager.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

**Step 5: Enable GitHub Pages**
- Go to your repo on GitHub
- Click **Settings** (top tab)
- Click **Pages** (left sidebar)
- Under "Source", select **GitHub Actions**
- Click Save

**Step 6: Wait ~2 minutes**

GitHub will automatically run the deploy workflow. You can watch it at:
`https://github.com/YOUR_USERNAME/poker-session-manager/actions`

When it goes green ✓ your app is live at:
```
https://YOUR_USERNAME.github.io/poker-session-manager/
```

### Deploying updates

After this initial setup, deploying is just:
```bash
git add .
git commit -m "describe your change"
git push
```
GitHub Actions runs automatically and your site updates in ~2 minutes.

---

## 5. How the Code is Organised

All the frontend logic lives in one file: `frontend/src/PokerApp.jsx`.
It's organised in sections — look for the numbered comments:

```
// 1. SESSION CONTEXT  (SessionProvider)
//    → Holds all app state. Think of it as the app's memory.
//    → useReducer handles state changes via "actions"

// 2. SETTLEMENT ALGORITHM
//    → Pure functions, no React. calculateNetBalances() + minimizeSettlements()
//    → Can be copy-pasted into the Python backend unchanged (same logic)

// 3. HELPER HOOKS
//    → useSessionStats() — calculates pot, active players, per-player P/L
//    → useTimer() — live session duration counter
//    → formatCurrency() — formats numbers as £1,234.56

// 4. TRANSACTION MODAL (TransactionModal component)
//    → The bottom-sheet that slides up when you tap "Add Buy-in"

// 5. SETTLEMENT CARD (SettlementCard component)
//    → Displays "who pays who" results

// 6. STAT CARDS (StatCard component)
//    → Reusable card showing an icon, label, and value

// 7. ACTIVE SESSION SCREEN
//    → The main screen when a session is running
//    → Contains the Ledger / Settle / Players tabs

// 8. NEW SESSION FORM
//    → The form for creating a new session

// 9. DASHBOARD
//    → Home screen with lifetime stats and recent sessions

// 10. ROOT APP + STYLES
//    → All CSS as a template string (APP_STYLES)
//    → The App() component that switches between screens
```

---

## 6. How to Modify Things

### Change the currency symbol (£ → $ or €)

In `PokerApp.jsx`, find the `formatCurrency` function (~line 205):
```js
// BEFORE:
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(amount);
}

// AFTER (US Dollars):
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

// AFTER (Euros):
function formatCurrency(amount) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount);
}
```

---

### Change the colour scheme

All colours are CSS variables defined in `APP_STYLES` near the bottom of `PokerApp.jsx`.
Find the `:root` block:
```css
:root {
  --bg:       #0d1117;   /* Main background */
  --surface:  #161b22;   /* Card backgrounds */
  --surface2: #1e2530;   /* Inputs, secondary surfaces */
  --border:   #30363d;   /* All borders */
  --text:     #e6edf3;   /* Primary text */
  --text-sub: #7d8590;   /* Muted/secondary text */
  --green:    #10b981;   /* Primary accent (buttons, badges) */
  --red:      #ef4444;   /* Negative values, cash-outs */
  --yellow:   #f59e0b;   /* Settlement amounts, warnings */
  --indigo:   #6366f1;   /* Group labels */
  --gold:     #d4a843;   /* Hero suit symbols */
}
```
Just change the hex values. The whole app updates.

---

### Add a new stat card to the dashboard

In `renderDash()` or the `Dashboard` component, copy an existing `<StatCard>` and
change the props. In React (PokerApp.jsx):
```jsx
// Add this anywhere in the stats grid:
<StatCard
  icon={Trophy}          // any Lucide icon
  label="Best Session"   // label text
  value={fmt(999)}       // the value to display
  accent="#f59e0b"       // icon background colour
/>
```

---

### Add a new transaction type (e.g. "TIP")

1. In `APP_STYLES`, add a new badge colour:
```css
.badge-purple { background: rgba(139,92,246,.15); color: #8b5cf6; }
```

2. In `TransactionModal`, add "TIP" to the type selector array:
```js
// Find this line:
{["BUYIN", "REBUY", "CASHOUT"].map(t => (
// Change to:
{["BUYIN", "REBUY", "CASHOUT", "TIP"].map(t => (
```

3. In `txTypeBadge()` function, add the mapping:
```js
const map = { BUYIN: "badge-green", REBUY: "badge-yellow", CASHOUT: "badge-red", TIP: "badge-purple" };
```

4. In `calculateNetBalances()` (the algorithm), decide how TIP affects balance:
```js
// Tips reduce the pot but don't go to any player — just ignore them:
// (no change needed — unknown types are already ignored)

// OR count tips as a loss for the player:
if (tx.type === "TIP") {
  balances[tx.playerId] -= tx.amount;
}
```

---

### Add a player notes/nickname field

1. In the `ADD_PLAYER` reducer case, add a `notes` field:
```js
const player = { id: `p_${Date.now()}`, name: action.payload.name, notes: action.payload.notes || "" };
```

2. In the player row display, render it:
```jsx
<span className="player-meta">Buyins: {formatCurrency(pb.buyins)} · {p.notes}</span>
```

---

### Change the app name and branding

In `PokerApp.jsx` find the navbar section:
```jsx
// Find this:
<div className="nav-brand">
  ♠ <span>PokerTrack</span>
</div>

// Change to whatever you want:
<div className="nav-brand">
  🃏 <span>Friday Night Poker</span>
</div>
```

Also update the `<title>` in `frontend/index.html`.

---

### Make data persist across page refreshes (without a backend)

The app currently resets on page refresh. To save to `localStorage`, add this
to the `SessionProvider` component (below the `useReducer` line):

```jsx
// Load saved state on startup
const [state, dispatch] = useReducer(sessionReducer, initialState, (init) => {
  try {
    const saved = localStorage.getItem('pokertrack_state');
    return saved ? JSON.parse(saved) : init;
  } catch { return init; }
});

// Save state whenever it changes
useEffect(() => {
  localStorage.setItem('pokertrack_state', JSON.stringify(state));
}, [state]);
```

Add `useEffect` to the imports at the top if it isn't there already.

---

## 7. Google Sheets Backend Setup

Only needed for persistent data shared across devices.

### Step 1: Google Cloud Project
1. Go to https://console.cloud.google.com
2. Click "New Project" → name it "PokerTrack" → Create
3. In the search bar, type "Google Sheets API" → Enable it
4. In the search bar, type "Google Drive API" → Enable it

### Step 2: Service Account
1. Go to IAM & Admin → Service Accounts
2. Click "Create Service Account"
3. Name: `pokertrack-sheets` → Create and Continue → Done
4. Click the service account → Keys tab → Add Key → JSON
5. Download the JSON file → rename it `credentials.json`
6. Move it into the `backend/` folder
7. **Add `credentials.json` to .gitignore — never commit secrets!**

### Step 3: Create Spreadsheet
1. Go to https://sheets.google.com → create a blank spreadsheet
2. Copy the ID from the URL:
   `https://docs.google.com/spreadsheets/d/`**THIS_PART_HERE**`/edit`
3. Share the spreadsheet with the service account email
   (found in credentials.json as `"client_email"`)
   → Give it "Editor" access

### Step 4: Configure .env
```bash
# backend/.env
GOOGLE_SHEETS_SPREADSHEET_ID=paste_your_id_here
GOOGLE_APPLICATION_CREDENTIALS=credentials.json
```

### Step 5: First run
On first startup, `SheetsRepository._ensure_tabs_exist()` automatically
creates all 6 tabs with correct headers. Nothing else needed.

See `GOOGLE_SHEETS_SCHEMA.md` for the full tab/column layout.

---

## 8. Common Errors & Fixes

### "npm: command not found"
Node.js isn't installed. Download from https://nodejs.org (LTS version).

### "Module not found: lucide-react"
```bash
cd frontend
npm install
```

### The GitHub Pages site shows a blank page
Your `base` in `vite.config.js` doesn't match your repo name.
```js
// Must be exactly:
base: '/your-exact-repo-name/',
// Including the slashes on both sides
```

### "404 Not Found" when refreshing the page on GitHub Pages
Add a `404.html` workaround. In `frontend/public/`, create `404.html` with:
```html
<!DOCTYPE html>
<html><head><meta charset="utf-8">
<script>
  var l = window.location;
  l.replace(l.protocol+'//'+l.hostname+(l.port?':'+l.port:'')+l.pathname.split('/').slice(0,2).join('/')+'/?p='+encodeURIComponent(l.pathname.slice(1)+l.search)+'&q='+l.hash.slice(1));
</script></head></html>
```

### Python "ModuleNotFoundError: No module named 'fastapi'"
You forgot to activate the virtual environment or install requirements:
```bash
cd backend
source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
```

### "gspread.exceptions.SpreadsheetNotFound"
The spreadsheet ID is wrong, or you haven't shared it with the service account email.

### App resets on page refresh
This is expected — the frontend-only version uses React state (in-memory).
See Section 6 "Make data persist across page refreshes" to add localStorage.

---

## Quick Reference Card

| Task | Command |
|------|---------|
| Run frontend locally | `cd frontend && npm install && npm run dev` |
| Build for production | `cd frontend && npm run build` |
| Run backend locally | `cd backend && uvicorn main:app --reload` |
| Deploy to GitHub Pages | `git add . && git commit -m "msg" && git push` |
| View API docs | http://localhost:8000/docs |
| View running app | http://localhost:5173 |
| Live site | https://USERNAME.github.io/REPO-NAME/ |
