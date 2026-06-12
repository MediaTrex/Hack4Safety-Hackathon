# SAJAG AI — Setup & Run Guide

## ❌ Problem You Had
You ran `npm init` which overwrote your package.json. Never run `npm init` on an existing project.

---

## ✅ Fix Steps (copy-paste exactly)

### Step 1 — Open terminal IN the project folder
Right-click the `sajag-ai` folder → "Open in Terminal"  
OR in PowerShell/CMD navigate to it:
```
cd "C:\Users\VIPUL SHAH\Downloads\sajag-ai-v2-final\sajag-ai-v2\sajag-ai"
```

### Step 2 — Install all packages (do this ONCE)
```
npm install
```
Wait 2-5 minutes. This downloads ~300MB into node_modules folder.

### Step 3 — Start the app
```
npm start
```
Browser opens at http://localhost:3000 automatically.

---

## 🔁 Every time after that
Just run:
```
npm start
```
(No need to npm install again unless you deleted node_modules)

---

## ⚠️ Common Errors & Fixes

| Error | Fix |
|-------|-----|
| `'react-scripts' is not recognized` | Run `npm install` first |
| `npm init` broke package.json | Already fixed in this zip |
| Port 3000 in use | Run `set PORT=3001 && npm start` |
| Missing script "dev" | Use `npm start` not `npm run dev` |

---

## 📋 Requirements
- Node.js v16 or higher → https://nodejs.org (download LTS)
- npm (comes with Node.js)

Check your version: `node --version`

