# 🎯 BrainBazaar Complete Project Workflow

## **The Big Picture**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BrainBazaar Platform                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│    ┌──────────────┐                    ┌──────────────┐                     │
│    │    SELLER    │                    │    BUYER     │                     │
│    │   (Upload)   │                    │  (Purchase)  │                     │
│    └──────┬───────┘                    └──────┬───────┘                     │
│           │                                   │                              │
│           ▼                                   ▼                              │
│    ┌──────────────┐                    ┌──────────────┐                     │
│    │ GitHub/Drive │                    │  Direct Buy  │ ← Get full code     │
│    │   OAuth      │                    │      OR      │                     │
│    └──────┬───────┘                    │ Build + AI   │ ← Learn milestone   │
│           │                            └──────────────┘                     │
│           ▼                                   │                              │
│    ┌──────────────┐                          │                              │
│    │ File Extract │                          ▼                              │
│    │ (Main files) │                    ┌──────────────┐                     │
│    └──────┬───────┘                    │ Code Editor  │                     │
│           │                            │ + AI Chat    │                     │
│           ▼                            └──────────────┘                     │
│    ┌──────────────┐                                                          │
│    │   MongoDB    │ ← Stores TEXT only (~70KB per project)                  │
│    │  (AI Context)│                                                          │
│    └──────────────┘                                                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## **PART 1: SELLER FLOW** 👨‍💻

### **Story: Aayush Wants to Sell His Project**

Aayush built an awesome "Weather App with AI Predictions" using React + FastAPI + Gemini. He wants to sell it on BrainBazaar.

---

### **Step 1: Seller Registration & Source Selection**

```
┌─────────────────────────────────────────────────────────────────┐
│                    SELLER DASHBOARD                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│    "Where is your project code?"                                │
│                                                                 │
│    ┌─────────────────────┐    ┌─────────────────────┐          │
│    │   🔗 GITHUB         │    │   📁 GOOGLE DRIVE   │          │
│    │                     │    │                     │          │
│    │  [Connect GitHub]   │    │  [Connect Drive]    │          │
│    │                     │    │                     │          │
│    │  ✅ Private repos   │    │  ✅ ZIP files       │          │
│    │  ✅ Public repos    │    │  ✅ Folders         │          │
│    │  ✅ Auto extract    │    │  ✅ Manual select   │          │
│    └─────────────────────┘    └─────────────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**What Happens Behind the Scenes:**

```
Aayush clicks "Connect GitHub"
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│  GITHUB OAUTH FLOW (FREE & LEGAL)                         │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  1. BrainBazaar redirects to GitHub OAuth page           │
│     URL: github.com/login/oauth/authorize                │
│          ?client_id=YOUR_CLIENT_ID                       │
│          &scope=repo         ← Access private repos      │
│          &state=random_csrf                              │
│                                                           │
│  2. Aayush sees:                                           │
│     "BrainBazaar wants to access your repositories"      │
│     [Authorize] [Cancel]                                  │
│                                                           │
│  3. Aayush clicks [Authorize]                              │
│                                                           │
│  4. GitHub redirects back with temporary code            │
│     brainbazaar.com/auth/github/callback?code=XYZ        │
│                                                           │
│  5. Backend exchanges code for access_token              │
│     POST github.com/login/oauth/access_token             │
│     Returns: { access_token: "gho_xxxx" }               │
│                                                           │
│  6. Token stored in session (NOT in database)            │
│     Used only for this upload session                    │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

### **Step 2: Repository Selection**

```
┌─────────────────────────────────────────────────────────────────┐
│              SELECT YOUR REPOSITORY                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Your Repositories (Private 🔒 and Public 🌐):                  │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ 🔒 weather-ai-app                          [Select]       ││
│  │    React + FastAPI + Gemini  •  Updated 2 days ago       ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ 🌐 todo-app-mern                           [Select]       ││
│  │    MERN Stack  •  Updated 1 week ago                      ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ 🔒 expense-tracker                         [Select]       ││
│  │    Python Django  •  Updated 3 weeks ago                  ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Aayush selects "weather-ai-app"**

---

### **Step 3: Smart File Extraction (The Magic!)**

```
┌─────────────────────────────────────────────────────────────────┐
│              EXTRACTING PROJECT FILES...                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ████████████████████████████████████████ 100%                 │
│                                                                 │
│  ✅ Folder structure scanned                                    │
│  ✅ Main files identified                                       │
│  ✅ README extracted                                            │
│  ✅ Tech stack detected                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

                    │
                    ▼

┌─────────────────────────────────────────────────────────────────┐
│              WHAT WE EXTRACT (for AI Context)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📁 FOLDER STRUCTURE (stored as text, ~2KB)                    │
│  ─────────────────────────────────────────────                  │
│  weather-ai-app/                                                │
│  ├── frontend/                                                  │
│  │   ├── src/                                                   │
│  │   │   ├── App.jsx           ← MAIN FILE (extracted)         │
│  │   │   ├── components/                                        │
│  │   │   │   ├── WeatherCard.jsx ← MAIN FILE (extracted)       │
│  │   │   │   └── SearchBar.jsx ← MAIN FILE (extracted)         │
│  │   │   └── api/                                               │
│  │   │       └── weather.js    ← MAIN FILE (extracted)         │
│  │   └── package.json          ← CONFIG (extracted)            │
│  ├── backend/                                                   │
│  │   ├── main.py               ← MAIN FILE (extracted)         │
│  │   ├── requirements.txt      ← CONFIG (extracted)            │
│  │   └── routes/                                                │
│  │       └── weather.py        ← MAIN FILE (extracted)         │
│  └── README.md                 ← DOCS (extracted)              │
│                                                                 │
│  📄 MAIN FILES CONTENT (stored as text, ~40KB)                 │
│  ────────────────────────────────────────                       │
│  • App.jsx (150 lines)                                         │
│  • WeatherCard.jsx (80 lines)                                  │
│  • SearchBar.jsx (60 lines)                                    │
│  • weather.js (40 lines)                                       │
│  • main.py (100 lines)                                         │
│  • weather.py (80 lines)                                       │
│  • package.json                                                │
│  • requirements.txt                                            │
│                                                                 │
│  ❌ WHAT WE SKIP (not stored)                                   │
│  ─────────────────────────                                     │
│  • node_modules/ (thousands of files)                          │
│  • .git/ (git history)                                         │
│  • __pycache__/                                                │
│  • .env (sensitive)                                            │
│  • dist/, build/                                               │
│  • All test files, large assets                                │
│                                                                 │
│  📦 FULL PROJECT ZIP                                            │
│  ─────────────────                                             │
│  Seller provides Google Drive link for complete download       │
│  (Buyer gets this ONLY after purchase)                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### **Step 4: Seller Reviews & Adds Details**

```
┌─────────────────────────────────────────────────────────────────┐
│              PROJECT DETAILS FORM                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Project Title:                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Weather App with AI Predictions                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Description:                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ A beautiful weather application that uses Gemini AI to  │   │
│  │ predict weather patterns. Features real-time updates,   │   │
│  │ location search, and 7-day forecasts with smart         │   │
│  │ recommendations based on weather conditions.            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Category: [Trending ▼]  Badge: [Gold ▼]  Price: [₹499 ▼]     │
│                                                                 │
│  Tech Stack (Auto-detected):                                    │
│  [React] [FastAPI] [Gemini AI] [Python] [JavaScript]           │
│                                                                 │
│  Full Project ZIP Download Link (Google Drive):                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ https://drive.google.com/file/d/xxxxx                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Screenshots (Upload to Cloudinary):                           │
│  [img1.png] [img2.png] [img3.png]                              │
│                                                                 │
│  [Generate Milestones with AI]  [Submit for Review]            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### **Step 5: AI Generates Milestones**

```
┌─────────────────────────────────────────────────────────────────┐
│              AI-GENERATED MILESTONES                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Gemini analyzes the code and generates:                        │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ MILESTONE 1: Setup & Basic UI (FREE for everyone)          ││
│  │ ├── Create React app structure                             ││
│  │ ├── Set up Tailwind CSS                                    ││
│  │ ├── Create WeatherCard component                           ││
│  │ └── Basic layout with search bar                           ││
│  │ Estimated time: 2 hours                                     ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ MILESTONE 2: API Integration (PAID)                        ││
│  │ ├── Connect to weather API                                 ││
│  │ ├── Handle loading states                                  ││
│  │ ├── Error handling                                         ││
│  │ └── Display weather data                                   ││
│  │ Estimated time: 3 hours                                     ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ MILESTONE 3: Backend Setup (PAID)                          ││
│  │ ├── FastAPI project structure                              ││
│  │ ├── Weather routes                                         ││
│  │ ├── Environment variables                                  ││
│  │ └── CORS configuration                                     ││
│  │ Estimated time: 2 hours                                     ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ MILESTONE 4: Gemini AI Integration (PAID)                  ││
│  │ ├── Connect to Gemini API                                  ││
│  │ ├── Create prediction endpoint                             ││
│  │ ├── Smart recommendations logic                            ││
│  │ └── Display AI insights                                    ││
│  │ Estimated time: 3 hours                                     ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ MILESTONE 5: Polish & Deploy (PAID)                        ││
│  │ ├── Responsive design                                      ││
│  │ ├── Animations                                             ││
│  │ ├── Deploy to Vercel + Render                              ││
│  │ └── Final testing                                          ││
│  │ Estimated time: 2 hours                                     ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  [Edit Milestones]  [Approve & Publish]                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### **Step 6: Project Stored in MongoDB**

```
┌─────────────────────────────────────────────────────────────────┐
│              MONGODB DOCUMENT (Projects Collection)             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  {                                                              │
│    "_id": "proj_weather_001",                                  │
│    "title": "Weather App with AI Predictions",                 │
│    "description": "A beautiful weather...",                    │
│    "seller_id": "user_Aayush_123",                              │
│    "seller_name": "Aayush Sharma",                              │
│    "category": "trending",                                     │
│    "badge": "gold",                                            │
│    "price": 499,                                               │
│    "tech_stack": ["React", "FastAPI", "Gemini AI"],           │
│    "views": 0,                                                 │
│    "purchases": 0,                                             │
│    "rating": 0,                                                │
│                                                                 │
│    "folder_structure": "weather-ai-app/\n├── frontend/...",    │
│                                                                 │
│    "code_files": [               ← ~40KB of TEXT              │
│      {                                                          │
│        "filename": "App.jsx",                                  │
│        "path": "frontend/src/App.jsx",                         │
│        "content": "import React from 'react'...",              │
│        "language": "javascript"                                │
│      },                                                         │
│      {                                                          │
│        "filename": "main.py",                                  │
│        "path": "backend/main.py",                              │
│        "content": "from fastapi import FastAPI...",            │
│        "language": "python"                                    │
│      }                                                          │
│      // ... more main files                                    │
│    ],                                                           │
│                                                                 │
│    "milestones": [              ← Generated by Gemini          │
│      {                                                          │
│        "number": 1,                                            │
│        "title": "Setup & Basic UI",                            │
│        "steps": [...],                                         │
│        "estimated_time": "2 hours"                             │
│      },                                                         │
│      // ... more milestones                                    │
│    ],                                                           │
│                                                                 │
│    "readme_content": "# Weather AI App...",                    │
│                                                                 │
│    "download_link": "https://drive.google.com/file/d/xxx",     │
│    "screenshots": [                                             │
│      "https://res.cloudinary.com/brainbazaar/img1.jpg",        │
│      "https://res.cloudinary.com/brainbazaar/img2.jpg"         │
│    ]                                                            │
│  }                                                              │
│                                                                 │
│  TOTAL SIZE: ~70KB (well within 512MB free tier)              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## **PART 2: BUYER FLOW** 👩‍🎓

### **Story: Priyanshu Wants to Buy/Learn**

Priyanshu is a 3rd year CS student. he needs a weather app project for his semester submission. he discovers BrainBazaar.

---

### **Step 1: Discovery & Browse**

```
┌─────────────────────────────────────────────────────────────────┐
│              BrainBazaar - Project Marketplace                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Search: weather app____________________] [🔍]                │
│                                                                 │
│  Filters: [React] [Python] [Beginner] [Gold]                   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🔥 TRENDING IN MARKET                                       ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │                                                             ││
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                  ││
│  │  │ [Image]  │  │ [Image]  │  │ [Image]  │                  ││
│  │  │          │  │          │  │          │                  ││
│  │  │ 🥇 GOLD  │  │ 🥈 SILVER│  │ 💎 DIAMOND│                 ││
│  │  │          │  │          │  │          │                  ││
│  │  │ Weather  │  │ Todo App │  │ AI Chat  │                  ││
│  │  │ AI App   │  │ MERN     │  │ Bot      │                  ││
│  │  │          │  │          │  │          │                  ││
│  │  │⚛️ 🐍 🤖 │  │⚛️ 🟢    │  │⚛️ 🐍 🧠│                  ││
│  │  │          │  │          │  │          │                  ││
│  │  │ [Get →]  │  │ [Get →]  │  │ [Get →]  │                  ││
│  │  └──────────┘  └──────────┘  └──────────┘                  ││
│  │                                                             ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Note: No prices shown on cards! Badge indicates value.        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### **Step 2: Project Detail Page**

```
┌─────────────────────────────────────────────────────────────────┐
│              Weather App with AI Predictions                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🥇 GOLD Badge                            ⭐ 4.8 (23 reviews)  │
│                                                                 │
│  [Screenshot Carousel]                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │     [Live Weather Display with AI Predictions]         │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Description:                                                   │
│  A beautiful weather application that uses Gemini AI to        │
│  predict weather patterns and give smart recommendations...    │
│                                                                 │
│  Technologies: React • FastAPI • Gemini AI • Python            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 📋 MILESTONE ROADMAP (Visible before purchase!)         │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                         │   │
│  │  M1: Setup & Basic UI ────── FREE ────── ✓             │   │
│  │  M2: API Integration ──────── 🔒 Paid                  │   │
│  │  M3: Backend Setup ────────── 🔒 Paid                  │   │
│  │  M4: Gemini AI Integration ── 🔒 Paid                  │   │
│  │  M5: Polish & Deploy ──────── 🔒 Paid                  │   │
│  │                                                         │   │
│  │  Total: 5 milestones • ~12 hours learning              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  💰 Price: ₹499                                         │   │
│  │                                                         │   │
│  │  ┌─────────────────┐    ┌─────────────────────────────┐│   │
│  │  │  🛒 GET IT NOW  │    │  🚀 BUILD & LEARN WITH AI  ││   │
│  │  │  (Direct Buy)   │    │  (Milestone by Milestone)  ││   │
│  │  └─────────────────┘    └─────────────────────────────┘│   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## **BUYER PATH A: DIRECT BUY** 🛒

### **Story: Priyanshu chooses "Get It Now"**

```
┌─────────────────────────────────────────────────────────────────┐
│              DIRECT BUY FLOW                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Priyanshu clicks "Get It Now"                                      │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ CHECKOUT                                                 │   │
│  │                                                         │   │
│  │  Weather App with AI Predictions - Gold                 │   │
│  │                                                         │   │
│  │  Project Price:                      ₹499               │   │
│  │                                                         │   │
│  │  Add AI Build Credits?                                   │   │
│  │  [ ] +100 credits for ₹49 more                          │   │
│  │                                                         │   │
│  │  ─────────────────────────────────────────              │   │
│  │  Total:                              ₹499               │   │
│  │                                                         │   │
│  │  Pay with:                                               │   │
│  │  [UPI] [Card] [Net Banking] [Wallet]                    │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ RAZORPAY CHECKOUT (popup)                               │   │
│  │                                                         │   │
│  │  Scan QR or enter UPI ID                                │   │
│  │                                                         │   │
│  │  ████████████████████████████                           │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│           │                                                     │
│           ▼ (Payment Success)                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ PURCHASE COMPLETE! 🎉                                    │   │
│  │                                                         │   │
│  │  You now have access to:                                │   │
│  │  ✅ Full project source code (ZIP download)             │   │
│  │  ✅ README with setup instructions                      │   │
│  │  ✅ Google Drive download link                          │   │
│  │  ✅ Email support (24hr response)                       │   │
│  │  ✅ Setup video walkthrough                             │   │
│  │                                                         │   │
│  │  [Go to My Projects]                                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### **What Priyanshu Gets After Purchase**

```
┌─────────────────────────────────────────────────────────────────┐
│              MY PROJECTS DASHBOARD                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Weather App with AI Predictions                               │
│  Purchased: 15 Mar 2025                                        │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ DOWNLOAD OPTIONS                                         │   │
│  │                                                         │   │
│  │  [📥 Download ZIP]  (Direct from BrainBazaar)           │   │
│  │                                                         │   │
│  │  [📁 Google Drive]  (Seller's original files)           │   │
│  │      Link: https://drive.google.com/file/d/xxx          │   │
│  │      (Only visible after purchase)                      │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ STILL WANT TO LEARN?                                     │   │
│  │                                                         │   │
│  │  You can also build this project step-by-step!          │   │
│  │                                                         │   │
│  │  [🚀 Start Build Mode]  (All milestones unlocked)       │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## **BUYER PATH B: BUILD & LEARN WITH AI** 🚀

### **Story: Priyanshu chooses "Build & Learn"**

he wants to actually LEARN how to build it!

```
┌─────────────────────────────────────────────────────────────────┐
│              BUILD MODE FLOW                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Priyanshu clicks "Build & Learn with AI"                           │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ENVIRONMENT SETUP (AI Onboarding)                       │   │
│  │                                                         │   │
│  │  🤖 AI: "Hi Priyanshu! Before we start, let me know        │   │
│  │         your setup so I can personalize the guide."    │   │
│  │                                                         │   │
│  │  What operating system are you on?                      │   │
│  │  [Windows] [macOS] [Linux]                             │   │
│  │                                                         │   │
│  │  Which do you have installed?                           │   │
│  │  [✓] Node.js    [✓] Python    [ ] Git                  │   │
│  │  [✓] VS Code    [ ] Docker                            │   │
│  │                                                         │   │
│  │  Have you built a React project before?                 │   │
│  │  [Yes, several] [A few] [Never]                        │   │
│  │                                                         │   │
│  │                                    [Start Building →]   │   │
│  └─────────────────────────────────────────────────────────┘   │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ MILESTONE 1: Setup & Basic UI ━━━━━━ FREE ━━━━━━        │   │
│  │                                                         │   │
│  │  Progress: ████████░░░░░░░░░░░░ 40%                     │   │
│  │                                                         │   │
│  │  Current Step: Create WeatherCard component             │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## **THE CODE EDITOR + AI CHAT INTERFACE** 💻

### **What Priyanshu Sees While Building**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              BUILD MODE INTERFACE                                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────┐  ┌─────────────────────────────────────┐  │
│  │ MILESTONES SIDEBAR              │  │ MAIN CONTENT AREA                   │  │
│  │                                 │  │                                     │  │
│  │ ✓ M1: Setup & Basic UI (FREE)   │  │ ┌─────────────────────────────────┐│  │
│  │   ✓ Step 1: Create React app    │  │ │                                 ││  │
│  │   ✓ Step 2: Set up Tailwind     │  │ │   MONACO CODE EDITOR            ││  │
│  │   → Step 3: WeatherCard         │  │ │                                 ││  │
│  │   ○ Step 4: SearchBar           │  │ │   [App.jsx] [WeatherCard.jsx]   ││  │
│  │                                 │  │ │                                 ││  │
│  │ 🔒 M2: API Integration          │  │ │   import React from 'react';    ││  │
│  │ 🔒 M3: Backend Setup            │  │ │                                 ││  │
│  │ 🔒 M4: Gemini AI                │  │ │   function WeatherCard() {      ││  │
│  │ 🔒 M5: Polish & Deploy          │  │ │     return (                    ││  │
│  │                                 │  │ │       <div className="card">    ││  │
│  │ ─────────────────────────────── │  │ │         {/* Your code here */} ││  │
│  │                                 │  │ │       </div>                    ││  │
│  │ Credits: 20 free remaining      │  │ │     );                          ││  │
│  │                                 │  │ │   }                             ││  │
│  │ [Buy More Credits]              │  │ │                                 ││  │
│  │                                 │  │ │   export default WeatherCard;  ││  │
│  │                                 │  │ │                                 ││  │
│  │                                 │  │ │   ────────────────────────────  ││  │
│  │                                 │  │ │   💡 AI: I see you're building  ││  │
│  │                                 │  │ │   the card. Add props for:     ││  │
│  │                                 │  │ │   temperature, city, condition ││  │
│  │                                 │  │ └─────────────────────────────────┘│  │
│  │                                 │  │                                     │  │
│  │                                 │  │ ┌─────────────────────────────────┐│  │
│  │                                 │  │ │ LIVE PREVIEW (Sandboxed)        ││  │
│  │                                 │  │ │                                 ││  │
│  │                                 │  │ │   ┌─────────────────┐           ││  │
│  │                                 │  │ │   │   🌤️ 28°C       │           ││  │
│  │                                 │  │ │   │   Mumbai        │           ││  │
│  │                                 │  │ │   │   Partly Cloudy │           ││  │
│  │                                 │  │ │   └─────────────────┘           ││  │
│  │                                 │  │ │                                 ││  │
│  │                                 │  │ └─────────────────────────────────┘│  │
│  │                                 │  │                                     │  │
│  └─────────────────────────────────┘  └─────────────────────────────────────┘  │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │ AI CHAT WINDOW                                                          💬  ││
│  ├─────────────────────────────────────────────────────────────────────────────┤│
│  │                                                                             ││
│  │  🤖 AI: Great progress! Now let's add the SearchBar component.            ││
│  │         Here's the code you need:                                          ││
│  │                                                                             ││
│  │         ```javascript                                                      ││
│  │         function SearchBar({ onSearch }) {                                ││
│  │           const [city, setCity] = useState('');                           ││
│  │           return (                                                         ││
│  │             <input                                                         ││
│  │               value={city}                                                 ││
│  │               onChange={(e) => setCity(e.target.value)}                   ││
│  │               placeholder="Search city..."                                 ││
│  │             />                                                             ││
│  │           );                                                               ││
│  │         }                                                                  ││
│  │         ```                                                                ││
│  │                                                                             ││
│  │         [Insert Code ↩️]  I'll add it to your editor!                     ││
│  │                                                                             ││
│  │  ─────────────────────────────────────────────────────────────────────    ││
│  │                                                                             ││
│  │  👤 Priyanshu: Why do we need useState here?                                  ││
│  │                                                                             ││
│  │  🤖 AI: useState allows the component to "remember" the city value.       ││
│  │         When user types, setCity updates the value and React re-renders.  ││
│  │         Without useState, the input would be "uncontrolled" and lose      ││
│  │         its value on every re-render.                                     ││
│  │                                                                             ││
│  │         (This answer used 2 credits. You have 18 remaining.)              ││
│  │                                                                             ││
│  │  ─────────────────────────────────────────────────────────────────────    ││
│  │                                                                             ││
│  │  [Type your question..._______________________________] [Send]            ││
│  │                                                                             ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

### **What Happens Behind the Scenes: AI Chat Flow**

```
┌─────────────────────────────────────────────────────────────────┐
│              AI CHAT REQUEST FLOW                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Priyanshu asks: "Why do we need useState?"                         │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ FRONTEND (React)                                        │   │
│  │                                                         │   │
│  │  POST /api/projects/proj_weather_001/chat               │   │
│  │  {                                                      │   │
│  │    "message": "Why do we need useState?",              │   │
│  │    "milestone": 1,                                      │   │
│  │    "current_file": "WeatherCard.jsx",                   │   │
│  │    "session_id": "sess_Priyanshu_456"                       │   │
│  │  }                                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ BACKEND (FastAPI) - Gate Check                          │   │
│  │                                                         │   │
│  │  1. Is milestone 1? → YES → Free access                 │   │
│  │     OR                                                   │   │
│  │  2. Is milestone > 1?                                   │   │
│  │     - Check if project purchased → Allow                 │   │
│  │     - Check if user has credits → Deduct & Allow        │   │
│  │     - Else → Return 402 Payment Required                │   │
│  │                                                         │   │
│  │  3. For M1: Check free question count                   │   │
│  │     - If < 10 free questions → Allow                    │   │
│  │     - Else → Require credits                            │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│           │                                                     │
│           ▼ (Gate passed)                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ RAG CONTEXT BUILDER                                     │   │
│  │                                                         │   │
│  │  Build context for Gemini:                              │   │
│  │                                                         │   │
│  │  SYSTEM PROMPT:                                         │   │
│  │  "You are an AI tutor helping a student build a        │   │
│  │   Weather App. Be encouraging but thorough."            │   │
│  │                                                         │   │
│  │  PROJECT CONTEXT (from MongoDB):                        │   │
│  │  - Folder structure                                     │   │
│  │  - Main code files (App.jsx, WeatherCard.jsx, etc.)    │   │
│  │  - Current milestone description                        │   │
│  │  - Tech stack info                                      │   │
│  │                                                         │   │
│  │  CONVERSATION HISTORY (from MongoDB):                   │   │
│  │  - Previous questions and answers in this session       │   │
│  │                                                         │   │
│  │  CURRENT CONTEXT:                                       │   │
│  │  - Current file being edited                            │   │
│  │  - Current milestone step                               │   │
│  │                                                         │   │
│  │  USER QUESTION:                                         │   │
│  │  "Why do we need useState?"                             │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ GEMINI API (1M Context Window)                          │   │
│  │                                                         │   │
│  │  POST https://generativelanguage.googleapis.com/...     │   │
│  │                                                         │   │
│  │  All context fits in 1M token window!                   │   │
│  │  - Full project code (~10K tokens)                      │   │
│  │  - Conversation history (~5K tokens)                    │   │
│  │  - System prompt + user question (~500 tokens)          │   │
│  │                                                         │   │
│  │  Total: ~15K tokens (well within limits)                │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│           │                                                     │
│           ▼ (Streaming response)                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ FRONTEND displays AI response word by word              │   │
│  │                                                         │   │
│  │  "useState allows the component to remember..."         │   │
│  │                                                         │   │
│  │  Code blocks rendered with syntax highlighting          │   │
│  │  [Insert Code] button available                         │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## **MILESTONE GATE: The Paywall Moment** 🚧

### **Story: Priyanshu completes Milestone 1**

```
┌─────────────────────────────────────────────────────────────────┐
│              MILESTONE 1 COMPLETE! 🎉                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │   🏆 Congratulations! You've completed Milestone 1!     │   │
│  │                                                         │   │
│  │   You now have a basic weather UI with:                 │   │
│  │   ✅ React app structure                                │   │
│  │   ✅ Tailwind CSS styling                               │   │
│  │   ✅ WeatherCard component                              │   │
│  │   ✅ SearchBar component                                │   │
│  │                                                         │   │
│  │   Ready for Milestone 2: API Integration?               │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🔒 MILESTONE 2 UNLOCK REQUIRED                          │   │
│  │                                                         │   │
│  │   To continue building, choose an option:               │   │
│  │                                                         │   │
│  │   ┌─────────────────────────────────────────────────┐   │   │
│  │   │ 🛒 PURCHASE PROJECT                             │   │   │
│  │   │                                                 │   │   │
│  │   │   ₹499 one-time                                │   │   │
│  │   │   ✓ All milestones unlocked                    │   │   │
│  │   │   ✓ Full source code download                  │   │   │
│  │   │   ✓ Unlimited AI questions                     │   │   │
│  │   │   ✓ Support access                             │   │   │
│  │   │                                                 │   │   │
│  │   │ [Purchase Now]                                  │   │   │
│  │   └─────────────────────────────────────────────────┘   │   │
│  │                                                         │   │
│  │   ┌─────────────────────────────────────────────────┐   │   │
│  │   │ 💳 USE CREDITS                                  │   │   │
│  │   │                                                 │   │   │
│  │   │   Your balance: 18 credits                      │   │   │
│  │   │   Cost per AI question: 2 credits               │   │   │
│  │   │   Cost per milestone step: 20 credits            │   │   │
│  │   │                                                 │   │   │
│  │   │   ⚠️ Not enough for full milestone              │   │   │
│  │   │   [Buy Credits: 100 for ₹49]                    │   │   │
│  │   └─────────────────────────────────────────────────┘   │   │
│  │                                                         │   │
│  │   💡 Tip: Purchase the project for best value!          │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## **COMPLETE DATA FLOW DIAGRAM** 📊

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         BrainBazaar Complete Data Flow                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  SELLER                                                                         │
│  ======                                                                         │
│  ┌─────────┐    OAuth     ┌─────────────┐    Extract    ┌─────────────────┐   │
│  │ GitHub  │ ──────────→ │  FastAPI    │ ────────────→ │  MongoDB        │   │
│  │ or Drive│             │  Backend    │               │  (Projects)     │   │
│  └─────────┘             └─────────────┘               │                 │   │
│                                │                      │ • Title, Desc   │   │
│                                │                      │ • Code Files    │   │
│                                ▼                      │   (TEXT only)   │   │
│                         ┌─────────────┐               │ • Milestones    │   │
│                         │   Gemini    │               │ • Folder Tree   │   │
│                         │  API        │               │ • Download Link │   │
│                         │             │               └─────────────────┘   │
│                         │ Generate    │                      ▲              │
│                         │ Milestones  │                      │              │
│                         └─────────────┘                      │              │
│                                                              │              │
│  BUYER                                                       │              │
│  =====                                                       │              │
│  ┌─────────┐    Browse    ┌─────────────┐    Load Project   │              │
│  │ React   │ ──────────→ │  Node.js    │ ──────────────────┘              │
│  │ Frontend│             │  Express    │                                   │
│  └─────────┘             │  Backend    │                                   │
│       │                   └─────────────┘                                   │
│       │                         │                                           │
│       │ Chat Request            │ Payment                                   │
│       │                         │                                           │
│       ▼                         ▼                                           │
│  ┌─────────────┐         ┌─────────────┐         ┌─────────────────┐       │
│  │  FastAPI    │         │  Razorpay   │         │  MongoDB        │       │
│  │  AI Backend │         │  Payment    │         │  (Purchases)    │       │
│  │             │         │             │         │                 │       │
│  │ • Gate Check│         │ • UPI/Card  │         │ • user_id       │       │
│  │ • RAG Build │         │ • Webhook   │         │ • project_id    │       │
│  │ • Gemini    │         │ • Verify    │         │ • purchase_date │       │
│  │   Call      │         └─────────────┘         │ • amount        │       │
│  └─────────────┘                                 └─────────────────┘       │
│       │                                                                     │
│       │ Stream Response                                                     │
│       ▼                                                                     │
│  ┌─────────────┐                                                            │
│  │  React      │                                                            │
│  │  Chat UI    │                                                            │
│  │             │                                                            │
│  │ • Monaco    │                                                            │
│  │   Editor    │                                                            │
│  │ • AI Chat   │                                                            │
│  │ • Preview   │                                                            │
│  └─────────────┘                                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## **STORAGE & COSTS SUMMARY** 💰

```
┌─────────────────────────────────────────────────────────────────┐
│              STORAGE BREAKDOWN (All FREE Tier)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  MONGODB ATLAS (512MB FREE)                                     │
│  ─────────────────────────────                                  │
│  Per Project: ~70KB                                             │
│  • Metadata: ~5KB                                               │
│  • Code files (TEXT): ~40KB                                     │
│  • Folder structure: ~5KB                                       │
│  • Milestones: ~15KB                                            │
│  • README: ~5KB                                                 │
│                                                                 │
│  Capacity: ~7,000 projects on free tier!                        │
│                                                                 │
│  CLOUDINARY (25GB FREE)                                         │
│  ─────────────────────────                                      │
│  • Project screenshots                                          │
│  • User avatars                                                 │
│  • ~500KB per project (3-4 images)                              │
│  Capacity: ~50,000 project images                               │
│                                                                 │
│  SELLER'S GOOGLE DRIVE (15GB FREE per seller)                   │
│  ───────────────────────────────────────────                    │
│  • Full ZIP downloads                                           │
│  • Seller's own storage (not yours!)                            │
│  • Link shared only after purchase                              │
│                                                                 │
│  YOUR COSTS: ₹0/month                                           │
│  ─────────────────────                                          │
│  • MongoDB Atlas: FREE                                          │
│  • Railway (FastAPI): FREE (500hr/month)                        │
│  • Render (Express): FREE (750hr/month)                         │
│  • Vercel (Frontend): FREE                                      │
│  • Cloudinary: FREE                                             │
│  • Gemini API: FREE (1M tokens/day)                             │
│  • Razorpay: 2% per transaction only                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## **SUMMARY: How It All Works Together** 🎯

| Actor | Action | What Happens | Storage |
|-------|--------|--------------|---------|
| **Seller** | Connects GitHub | OAuth flow, gets temporary access token | None (session only) |
| **Seller** | Selects repo | Backend reads repo contents via GitHub API | None |
| **Seller** | Extracts files | Main files + folder tree + README extracted | MongoDB (~70KB) |
| **Seller** | Provides ZIP link | Google Drive link for full download | Seller's Drive |
| **Seller** | AI generates milestones | Gemini creates learning roadmap | MongoDB (~15KB) |
| **Buyer** | Browses projects | React frontend loads from MongoDB | None |
| **Buyer** | Direct purchase | Razorpay payment → unlock download | MongoDB (purchase record) |
| **Buyer** | Build mode M1 | Free access to first milestone | None |
| **Buyer** | AI chat in M1 | Gemini RAG with project context | MongoDB (chat history) |
| **Buyer** | Reaches M2 | Gate check → upsell modal | None |
| **Buyer** | Purchases/credits | Unlock all milestones | MongoDB (purchase/credits) |
| **Buyer** | Downloads ZIP | Gets seller's Google Drive link | None (link already stored) |

---

**That's the complete BrainBazaar workflow** 