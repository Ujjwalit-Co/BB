# BrainBazaar Architecture & Implementation Guide

**Last Updated:** March 18, 2026  
**Version:** 2.0

**Team:**
- **Daksh Dixit** - Code Editor / Lab Frontend Lead
- **Tanishq Rastogi** - Node.js Backend (Express + MongoDB + Payments)
- **Aayush Kumar** - FastAPI Backend (AI Services)
- **Priyanshu Sharma** - Other Pages Frontend (Home, Catalog, Dashboard, Auth, Seller Portal)

---

## 📋 Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [Data Flow Diagrams](#data-flow-diagrams)
3. [Database Schemas](#database-schemas)
4. [API Endpoints](#api-endpoints)
5. [Frontend Components](#frontend-components)
6. [Team Responsibilities](#team-responsibilities)
7. [Implementation Checklist](#implementation-checklist)
8. [Free Trial System](#free-trial-system)

---

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + Vite)                         │
│                         Port: 5173 (dev)                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │   Code Editor    │  │   Other Pages    │  │   Auth/Payment   │      │
│  │   (Daksh)        │  │   (Priyanshu,    │  │   (Tushar)       │      │
│  │                  │  │    Tanishq)      │  │                  │      │
│  │  - Lab.jsx       │  │                  │  │                  │      │
│  │  - EditorPane    │  │                  │  │                  │      │
│  │  - AiPanel.jsx   │  │  - Home.jsx      │  │  - Login.jsx     │      │
│  │  - FileSidebar   │  │  - Catalog.jsx   │  │  - Checkout.jsx  │      │
│  │  - Onboarding    │  │  - Dashboard.jsx │  │  - Profile.jsx   │      │
│  │  - PaywallModal  │  │  - ProjectDetails│  │                  │      │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
         │                                        │
         │                                        │
         │ (AI Features)                          │ (CRUD, Auth, Payments)
         │                                        │
         ▼                                        ▼
┌─────────────────────────┐          ┌─────────────────────────────────┐
│   FastAPI Backend       │          │   Node.js Backend (Express)     │
│   (Aayush)              │          │   (Ujjwal)                      │
│   Port: 8000 / Railway  │          │   Port: 5000                    │
├─────────────────────────┤          ├─────────────────────────────────┤
│                         │          │                                 │
│  AI Services:           │          │  Core Services:                 │
│  • Generate Milestones  │          │  • User Authentication          │
│  • Generate Quizzes     │          │  • Project CRUD                 │
│  • Complexity Analysis  │          │  • Progress Tracking            │
│  • AI Chat/Tutor        │          │  • Payment Integration          │
│  • Code Review          │          │  • File Storage (Mongo GridFS)  │
│  • Hints & Guides       │          │  • Purchase History             │
│  • Free Trial Logic     │          │  • Free Trial Management        │
│                         │          │                                 │
│  Endpoints:             │          │  Endpoints:                     │
│  /generate-milestones   │          │  /api/projects                  │
│  /generate-quiz         │          │  /api/users                     │
│  /analyze-complexity    │          │  /api/progress                  │
│  /chat                  │          │  /api/purchases                 │
│  /hint                  │          │  /api/auth                      │
│  /ask                   │          │  /api/payment                   │
│  /complete              │          │  /api/trial                     │
│                         │          │                                 │
└─────────────────────────┘          └─────────────────────────────────┘
         │                                        │
         │                                        │
         ▼                                        ▼
┌─────────────────────────┐          ┌─────────────────────────────────┐
│   AI/LLM APIs           │          │   MongoDB Atlas                 │
│   (OpenAI / Anthropic)  │          │   (Database)                    │
└─────────────────────────┘          └─────────────────────────────────┘
```

---

## 🔄 Data Flow Diagrams

### 1. User A (Seller) - Project Creation Flow

```
┌──────────┐
│  Seller  │
└────┬─────┘
     │
     │ 1. Upload Project
     │ (GitHub URL / Files / Drive)
     ▼
┌─────────────────────────────────┐
│  Project Details Form           │
│  - Title, Description           │
│  - README (mandatory)           │
│  - Price                        │
│  - [Generate Milestones] button │
└────────────┬────────────────────┘
             │
             │ 2. Click "Generate Milestones"
             ▼
┌─────────────────────────────────────────┐
│  Frontend → Node.js Backend             │
│  POST /api/ai/generate-milestones       │
│  Body: { readme, techStack, files }     │
└────────────┬────────────────────────────┘
             │
             │ 3. Proxy to FastAPI
             ▼
┌─────────────────────────────────────────┐
│  Node.js → FastAPI                      │
│  POST /generate-milestones              │
└────────────┬────────────────────────────┘
             │
             │ 4. AI Processes README
             ▼
┌─────────────────────────────────────────┐
│  FastAPI → LLM (OpenAI)                 │
│  Prompt: "Generate milestones for..."   │
└────────────┬────────────────────────────┘
             │
             │ 5. Returns Milestones + Steps
             ▼
┌─────────────────────────────────────────┐
│  FastAPI → Node.js                      │
│  { milestones: [{ title, steps: [] }] } │
└────────────┬────────────────────────────┘
             │
             │ 6. Returns to Frontend
             ▼
┌─────────────────────────────────────────┐
│  Frontend Shows Preview                 │
│  Seller can edit milestones/steps       │
└────────────┬────────────────────────────┘
             │
             │ 7. Seller Confirms & Submits
             ▼
┌─────────────────────────────────────────┐
│  Node.js Backend → MongoDB              │
│  Save Project with milestones, files    │
└────────────┬────────────────────────────┘
             │
             │ 8. Project Published
             ▼
┌──────────┐
│  Success │ → Redirect to Dashboard
└──────────┘
```

---

### 2. User B (Buyer) - Free Trial → Purchase Flow

```
┌─────────┐
│  Buyer  │
└───┬─────┘
    │
    │ 1. Browse Catalog
    ▼
┌─────────────────────────────────┐
│  Catalog Page                   │
│  - Project cards with:          │
│    • Title, Image, Price        │
│    • [Try Free] button          │
│    • [Buy Now] button           │
└────────────┬────────────────────┘
             │
             │ Click "Try Free"
             ▼
┌─────────────────────────────────┐
│  /lab/:projectId?trial=true     │
│  Lab.jsx mounts                 │
└────────────┬────────────────────┘
             │
             │ 3. Check Authentication
             ▼
      ┌──────┴──────┐
      │             │
   Not Logged   Logged In
      │             │
      ▼             ▼
┌──────────┐   ┌──────────────┐
│ Redirect │   │ Load Project │
│ to Login │   │ in Trial Mode│
└──────────┘   └──────┬───────┘
                      │
                      │ 4. Set Free Trial Flag
                      ▼
┌─────────────────────────────────────────┐
│  Node.js Backend                        │
│  Create UserProgress with:              │
│  { isFreeTrial: true,                   │
│    unlockedMilestones: 1 }              │
└────────────┬────────────────────────────┘
             │
             │ 5. User Learns Milestone 1
             ▼
┌─────────────────────────────────────────┐
│  Complete Steps → Take Quiz → Done!     │
│  AI welcomes user, guides through       │
└────────────┬────────────────────────────┘
             │
             │ 6. User Clicks Milestone 2
             ▼
┌─────────────────────────────────────────┐
│  ⚠️ PAYWALL MODAL                       │
│                                         │
│  "Great progress! 🎉"                   │
│  You've completed Milestone 1.          │
│                                         │
│  Unlock full project for ₹149:          │
│  - All milestones (5 total)             │
│  - AI-powered guidance                  │
│  - Quizzes & certificates               │
│                                         │
│  [Buy Now - ₹149]  [Maybe Later]        │
└────────────┬────────────────────────────┘
             │
             │ Click "Buy Now"
             ▼
┌─────────────────────────────────────────┐
│  Checkout Page → Payment Gateway        │
│  (Razorpay/Stripe)                      │
└────────────┬────────────────────────────┘
             │
             │ Payment Success
             ▼
┌─────────────────────────────────────────┐
│  Node.js Backend                        │
│  Update UserProgress:                   │
│  { isFreeTrial: false,                  │
│    unlockedMilestones: Infinity }       │
│  Create Purchase Record                 │
└────────────┬────────────────────────────┘
             │
             │ Redirect back to Lab
             ▼
┌─────────────────────────────────────────┐
│  Full Project Access Unlocked! 🎉       │
│  AI: "Welcome to the full course!..."   │
└─────────────────────────────────────────┘
```

---

### 3. User B (Buyer) - Full Purchase Flow (Skip Trial)

```
┌─────────┐
│  Buyer  │
└───┬─────┘
    │
    │ 1. Click "Buy Now" in Catalog
    ▼
┌─────────────────────────────────┐
│  Checkout Page                  │
│  - Project details              │
│  - Price: ₹149                  │
│  - Payment options              │
└────────────┬────────────────────┘
             │
             │ 2. Complete Payment
             ▼
┌─────────────────────────────────┐
│  Payment Gateway                │
│  → On Success:                  │
│  - Create Purchase Record       │
│  - Grant Full Access            │
└────────────┬────────────────────┘
             │
             │ 3. Redirect to Lab
             ▼
┌─────────────────────────────────┐
│  /lab/:projectId                │
│  Lab.jsx mounts                 │
│  - Load with isFreeTrial: false │
│  - All milestones unlocked      │
└─────────────────────────────────┘
```

---

### 4. AI Chat Flow (Code Editor)

```
┌──────────────────┐
│  User in Lab     │
│  Types question  │
│  in AI panel     │
└────────┬─────────┘
         │
         │ "How do I fix CORS error?"
         ▼
┌─────────────────────────────────────────┐
│  Frontend                               │
│  - Get current code context             │
│  - Get user environment (OS, Node ver)  │
│  - Get current milestone                │
│  - Check trial status                   │
└────────────┬────────────────────────────┘
             │
             │ POST /chat
             │ {
             │   projectId: "demo5",
             │   milestoneIndex: 1,
             │   message: "How do I fix CORS?",
             │   codeContext: "const app = express()...",
             │   userEnvironment: { os: "windows", hasNode: true },
             │   isFreeTrial: true
             │ }
             ▼
┌─────────────────────────────────────────┐
│  FastAPI Backend                        │
│  /chat endpoint                         │
│                                         │
│  1. Retrieve project from cache/DB      │
│  2. Get user's current code             │
│  3. Build AI prompt with context:       │
│     - Project README                    │
│     - Current milestone instructions    │
│     - User's code                       │
│     - User's environment                │
│     - Trial status (for messaging)      │
│  4. Call LLM (OpenAI)                   │
└────────────┬────────────────────────────┘
             │
             │ AI Response:
             │ {
             │   answer: "CORS error occurs...",
             │   suggestedFiles: [
             │     { name: "server.js", action: "edit" }
             │   ],
             │   suggestedCommands: [
             │     "npm install cors"
             │   ]
             │ }
             ▼
┌─────────────────────────────────────────┐
│  Frontend Shows Response                │
│                                         │
│  - Display answer in chat               │
│  - Show "Edit server.js" button         │
│  - Show "Copy Command" button           │
│  - User can accept or dismiss           │
└─────────────────────────────────────────┘
```

---

### 5. Progress Auto-Save Flow

```
┌──────────────────┐
│  User Completes  │
│  a Step          │
└────────┬─────────┘
         │
         │ Click "Mark Complete"
         ▼
┌─────────────────────────────────────────┐
│  Frontend (useLabStore)                 │
│  completeStep(stepId)                   │
│                                         │
│  1. Update local state (optimistic)     │
│  2. Debounced save to backend (500ms)   │
└────────────┬────────────────────────────┘
             │
             │ PUT /api/users/:id/progress/:projectId
             │ {
             │   currentMilestoneIndex: 1,
             │   completedSteps: [
             │     { milestoneIndex: 0, stepIndex: 0 },
             │     { milestoneIndex: 0, stepIndex: 1 },
             │     { milestoneIndex: 1, stepIndex: 0 }
             │   ],
             │   lastActive: "2026-03-18T10:30:00Z"
             │ }
             ▼
┌─────────────────────────────────────────┐
│  Node.js Backend                        │
│  - Upsert UserProgress document         │
│  - Update lastActive timestamp          │
│  - Check trial status:                  │
│    if (isFreeTrial && milestoneIdx > 0) │
│      return locked response             │
│  - Return success                       │
└────────────┬────────────────────────────┘
             │
             │ Response: { success: true }
             ▼
┌──────────────────┐
│  Show "Saved"    │
│  checkmark (1.5s)│
└──────────────────┘
```

---

## 🗄️ Database Schemas

### MongoDB Collections (Node.js Backend - Ujjwal)

```
┌─────────────────────────────────────────────────────────────────┐
│  Collection: users                                              │
├─────────────────────────────────────────────────────────────────┤
│  {                                                              │
│    _id: ObjectId("..."),                                        │
│    email: "user@example.com",                                   │
│    password: "$2b$10$hashed...",  // bcrypt                      │
│    name: "John Doe",                                            │
│    role: "buyer" | "seller" | "admin",                          │
│    credits: 20,                                                 │
│    createdAt: ISODate("2026-03-18T10:00:00Z")                   │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Collection: projects                                           │
├─────────────────────────────────────────────────────────────────┤
│  {                                                              │
│    _id: ObjectId("..."),                                        │
│    seller: ObjectId("user_id"),                                 │
│    title: "E-commerce Dashboard",                               │
│    description: "A full-stack e-commerce platform",             │
│    readme: "# E-commerce Dashboard\n\n...",                     │
│    complexity: "simple" | "complex",                            │
│    techStack: ["React", "Node.js", "MongoDB"],                  │
│    files: [                                                     │
│      {                                                          │
│        name: "App.jsx",                                         │
│        path: "src/App.jsx",                                     │
│        language: "javascript",                                  │
│        content: "import React...",                              │
│        isContextFile: true,                                     │
│        isMain: true                                             │
│      }                                                          │
│    ],                                                           │
│    milestones: [                                                │
│      {                                                          │
│        title: "Project Setup",                                  │
│        description: "Initialize React + Vite",                  │
│        order: 1,                                                │
│        steps: [                                                 │
│          {                                                      │
│            title: "Install dependencies",                       │
│            instructions: "Run npm install",                     │
│            order: 1                                             │
│          }                                                      │
│        ],                                                       │
│        quiz: {                                                  │
│          questions: [                                           │
│            {                                                    │
│              question: "What command installs dependencies?",   │
│              options: ["npm install", "npm start", "npm build"],│
│              correctAnswer: 0                                   │
│            }                                                    │
│          ]                                                      │
│        }                                                        │
│      }                                                          │
│    ],                                                           │
│    githubUrl: "https://github.com/...",                         │
│    googleDriveUrl: "https://drive.google.com/...",              │
│    price: 149,                                                  │
│    isPublished: true,                                           │
│    trialSettings: {                                             │
│      isTrialAvailable: true,                                    │
│      trialMilestones: 1  // Number of milestones available free │
│    },                                                           │
│    createdAt: ISODate("2026-03-18T10:00:00Z"),                  │
│    updatedAt: ISODate("2026-03-18T10:00:00Z")                   │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Collection: userProgress                                       │
├─────────────────────────────────────────────────────────────────┤
│  {                                                              │
│    _id: ObjectId("..."),                                        │
│    user: ObjectId("user_id"),                                   │
│    project: ObjectId("project_id"),                             │
│                                                                 │
│    ⭐ FREE TRIAL FIELDS:                                        │
│    isFreeTrial: { type: Boolean, default: true },               │
│    trialStartedAt: ISODate("2026-03-18T10:00:00Z"),             │
│    trialExpiresAt: ISODate("2026-03-25T10:00:00Z"), // 7 days  │
│    unlockedMilestones: { type: Number, default: 1 },            │
│                                                                 │
│    currentMilestoneIndex: { type: Number, default: 0 },         │
│    completedSteps: [                                            │
│      {                                                          │
│        milestoneIndex: 0,                                       │
│        stepIndex: 0,                                            │
│        completedAt: ISODate("2026-03-18T11:00:00Z")             │
│      }                                                          │
│    ],                                                           │
│    quizScores: [                                                │
│      {                                                          │
│        milestoneIndex: 0,                                       │
│        score: 85,                                               │
│        attempts: [                                              │
│          {                                                      │
│            score: 75,                                           │
│            answers: [0, 1, 2, 0],                               │
│            attemptedAt: ISODate("2026-03-18T11:30:00Z")         │
│          }                                                      │
│        ]                                                        │
│      }                                                          │
│    ],                                                           │
│    userEnvironment: {                                           │
│      os: "windows",                                             │
│      hasNode: true,                                             │
│      hasPython: false,                                          │
│      nodeVersion: "v18.16.0",                                   │
│      codeEditor: "VS Code",                                     │
│      savedAt: ISODate("2026-03-18T10:05:00Z")                   │
│    },                                                           │
│    isComplete: { type: Boolean, default: false },               │
│    completedAt: Date,                                           │
│    lastActive: { type: Date, default: Date.now }                │
│  }                                                              │
│                                                                 │
│  Index: { user: 1, project: 1 } (unique)                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Collection: purchases                                          │
├─────────────────────────────────────────────────────────────────┤
│  {                                                              │
│    _id: ObjectId("..."),                                        │
│    buyer: ObjectId("user_id"),                                  │
│    project: ObjectId("project_id"),                             │
│    amount: 149,                                                 │
│    status: "pending" | "completed" | "failed",                  │
│    paymentId: "pay_1234567890",                                 │
│    isTrialConversion: { type: Boolean, default: false },        │
│    purchasedAt: ISODate("2026-03-18T10:00:00Z")                 │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Collection: trials (Optional - for analytics)                  │
├─────────────────────────────────────────────────────────────────┤
│  {                                                              │
│    _id: ObjectId("..."),                                        │
│    user: ObjectId("user_id"),                                   │
│    project: ObjectId("project_id"),                             │
│    startedAt: ISODate("2026-03-18T10:00:00Z"),                  │
│    completedMilestones: [0],                                    │
│    converted: { type: Boolean, default: false },                │
│    convertedAt: Date,                                           │
│    abandoned: { type: Boolean, default: false },                │
│    abandonedAt: Date                                            │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔌 API Endpoints

### Node.js Backend (Express + MongoDB) - Ujjwal
**Base URL:** `http://localhost:5000/api` (dev) or production URL

#### Authentication
```
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # Login user
POST   /api/auth/logout             # Logout user
GET    /api/auth/me                # Get current user
PUT    /api/auth/me                # Update profile
```

#### Projects (CRUD)
```
GET    /api/projects               # List all projects (with filters)
GET    /api/projects/:id           # Get single project (with files, milestones)
POST   /api/projects               # Create project (seller only)
PUT    /api/projects/:id           # Update project (seller only)
DELETE /api/projects/:id           # Delete project (seller only)
POST   /api/projects/:id/publish   # Publish project (seller only)
```

#### AI Integration (Proxy to FastAPI)
```
POST   /api/ai/generate-milestones    # Generate milestones from README
POST   /api/ai/generate-quiz          # Generate quiz for milestone
POST   /api/ai/analyze-complexity     # Analyze project complexity
```

#### ⭐ FREE TRIAL ENDPOINTS
```
POST   /api/trial/start               # Start free trial for a project
GET    /api/trial/status/:projectId   # Check trial status
POST   /api/trial/convert             # Convert trial to purchase
```

#### User Progress
```
GET    /api/users/:userId/progress/:projectId    # Get user's progress
PUT    /api/users/:userId/progress/:projectId    # Save/update progress
POST   /api/users/:userId/progress/complete      # Mark project complete
GET    /api/users/:userId/progress               # Get all user progress
```

#### Purchases
```
POST   /api/purchases               # Create purchase (buy project)
GET    /api/users/:userId/purchases # Get user's purchased projects
GET    /api/purchases/:id           # Get purchase details
```

#### Payments (Integration with Razorpay/Stripe)
```
POST   /api/payment/create-order    # Create payment order
POST   /api/payment/verify          # Verify payment signature
POST   /api/payment/webhook         # Payment gateway webhook
```

---

### FastAPI Backend (AI Services) - Aayush
**Base URL:** `https://brainbazarfastapi-backend-production.up.railway.app`

#### Milestone Generation
```
POST   /generate-milestones
```
**Request:**
```json
{
  "readme": "# E-commerce Dashboard\n\n...",
  "techStack": ["React", "Node.js", "MongoDB"],
  "files": [
    { "name": "App.jsx", "content": "..." }
  ]
}
```
**Response:**
```json
{
  "milestones": [
    {
      "title": "Project Setup",
      "description": "Initialize React + Vite",
      "steps": [
        {
          "title": "Install dependencies",
          "instructions": "Run npm install"
        }
      ]
    }
  ]
}
```

---

#### Quiz Generation
```
POST   /generate-quiz
```
**Request:**
```json
{
  "milestoneTitle": "Project Setup",
  "milestoneSteps": [...],
  "readme": "# E-commerce Dashboard\n\n...",
  "difficulty": "beginner"
}
```
**Response:**
```json
{
  "questions": [
    {
      "question": "What command installs dependencies?",
      "options": ["npm install", "npm start", "npm build"],
      "correctAnswer": 0
    }
  ]
}
```

---

#### Complexity Analysis
```
POST   /analyze-complexity
```
**Request:**
```json
{
  "readme": "...",
  "files": [...],
  "techStack": ["React", "Node.js"]
}
```
**Response:**
```json
{
  "complexity": "simple",
  "requiresLocalDev": false,
  "reason": "This is a static React app that can run in browser",
  "recommendedMode": "browser-execution"
}
```

---

#### AI Chat (Code Editor Tutor)
```
POST   /chat
```
**Request:**
```json
{
  "projectId": "demo5",
  "milestoneIndex": 1,
  "message": "How do I fix CORS error?",
  "codeContext": "const app = express()...",
  "userEnvironment": {
    "os": "windows",
    "hasNode": true,
    "nodeVersion": "v18.16.0"
  },
  "conversationHistory": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ],
  "isFreeTrial": true  # ⭐ NEW: For contextual messaging
}
```
**Response:**
```json
{
  "answer": "CORS error occurs when your frontend and backend run on different ports. Here's how to fix it...",
  "suggestedFiles": [
    {
      "name": "server.js",
      "action": "edit",
      "suggestedCode": "app.use(cors())"
    }
  ],
  "suggestedCommands": [
    "npm install cors"
  ]
}
```

---

#### Milestone Guide
```
GET   /projects/{projectId}/milestones/{milestoneNumber}/guide
```
**Response:**
```json
{
  "project_id": "demo5",
  "milestone_number": 1,
  "milestone_name": "Project Setup",
  "content": "Step-by-step guide for this milestone..."
}
```

---

#### Milestone Hint
```
GET   /projects/{projectId}/milestones/{milestoneNumber}/hint
```
**Response:**
```json
{
  "project_id": "demo5",
  "milestone_number": 1,
  "milestone_name": "Project Setup",
  "hint": "You're off to a great start! When installing dependencies..."
}
```

---

#### Ask Question
```
POST   /projects/{projectId}/milestones/{milestoneNumber}/ask
```
**Request:**
```json
{
  "question": "How do I install Tailwind CSS?"
}
```
**Response:**
```json
{
  "project_id": "demo5",
  "milestone_number": 1,
  "question": "How do I install Tailwind CSS?",
  "answer": "To install Tailwind CSS, run: npm install -D tailwindcss..."
}
```

---

#### Complete Milestone
```
POST   /projects/{projectId}/milestones/{milestoneNumber}/complete
```
**Response:**
```json
{
  "project_id": "demo5",
  "milestone_number": 1,
  "message": "Congratulations! Milestone 1 complete. Next up: Basic Structure..."
}
```

---

## 🎨 Frontend Components

### Code Editor Structure (Daksh)

```
src/
├── components/
│   └── lab/
│       ├── Lab.jsx                    # Main lab container
│       ├── LabHeader.jsx              # Top bar (project name, credits, save)
│       ├── FileSidebar.jsx            # Left sidebar (files, milestones)
│       ├── EditorPane.jsx             # Main code editor area
│       ├── AiPanel.jsx                # Right sidebar (AI chat)
│       ├── OnboardingModal.jsx        # First-time user setup
│       ├── QuizModal.jsx              # Quiz at end of milestone
│       ├── MilestoneCompleteModal.jsx # Milestone completion popup
│       ├── PaywallModal.jsx           # ⭐ NEW: Trial → Purchase upsell
│       └── TerminalPanel.jsx          # Command suggestions (copy only)
│
├── store/
│   └── useLabStore.js                 # Zustand state management
│
├── services/
│   └── api.js                         # API calls (Node.js + FastAPI)
│
├── hooks/
│   ├── useUserEnvironment.js          # Load/save user environment
│   └── useTrialStatus.js              # ⭐ NEW: Check trial status
│
└── pages/
    └── Lab.jsx                        # Load project + progress
```

---

### ⭐ NEW Component: PaywallModal.jsx (Daksh)

```jsx
// src/components/lab/PaywallModal.jsx
import React from 'react';
import { Lock, CheckCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PaywallModal({ 
  projectName, 
  completedMilestones, 
  totalMilestones,
  price,
  onContinueTrial,
  isTrialExpired = false
}) {
  const navigate = useNavigate();

  const handleBuyNow = () => {
    // Navigate to checkout with project ID
    navigate(`/checkout/${projectId}`);
  };

  return (
    <div className="paywall-overlay">
      <div className="paywall-modal">
        <div className="paywall-header">
          <div className="paywall-icon">
            {isTrialExpired ? <Lock size={48} /> : <Sparkles size={48} />}
          </div>
          <h2>
            {isTrialExpired 
              ? "Trial Expired" 
              : completedMilestones > 0 
                ? "Great Progress! 🎉" 
                : "Unlock Full Project"}
          </h2>
        </div>

        <div className="paywall-content">
          {isTrialExpired ? (
            <p className="paywall-message">
              Your 7-day free trial has expired. Purchase full access to continue learning.
            </p>
          ) : completedMilestones > 0 ? (
            <>
              <p className="paywall-message">
                You've completed <strong>{completedMilestones} of {totalMilestones}</strong> milestones!
              </p>
              <p className="paywall-submessage">
                Unlock the remaining {totalMilestones - completedMilestones} milestones to master {projectName}.
              </p>
            </>
          ) : (
            <p className="paywall-message">
              Start your learning journey with full access to all features.
            </p>
          )}

          <div className="paywall-features">
            <h3>What you'll get:</h3>
            <ul>
              <li>
                <CheckCircle size={16} className="check-icon" />
                <span>Unlimited access to all {totalMilestones} milestones</span>
              </li>
              <li>
                <CheckCircle size={16} className="check-icon" />
                <span>AI-powered code review & guidance</span>
              </li>
              <li>
                <CheckCircle size={16} className="check-icon" />
                <span>Quizzes & completion certificate</span>
              </li>
              <li>
                <CheckCircle size={16} className="check-icon" />
                <span>Lifetime access with updates</span>
              </li>
              <li>
                <CheckCircle size={16} className="check-icon" />
                <span>Community support & discussions</span>
              </li>
            </ul>
          </div>

          <div className="paywall-price">
            <span className="price-original">₹{price}</span>
            <span className="price-discount">₹{Math.floor(price * 0.8)}</span>
            <span className="price-note">One-time payment, lifetime access</span>
          </div>
        </div>

        <div className="paywall-actions">
          {!isTrialExpired && (
            <button className="btn-secondary" onClick={onContinueTrial}>
              Continue Free Trial
            </button>
          )}
          <button className="btn-primary btn-large" onClick={handleBuyNow}>
            Unlock Full Access - ₹{Math.floor(price * 0.8)}
          </button>
        </div>

        <div className="paywall-guarantee">
          <p>🔒 Secure payment • 7-day money-back guarantee</p>
        </div>
      </div>
    </div>
  );
}
```

---

### ⭐ UPDATED: useLabStore.js (Daksh - Key Changes)

```javascript
// src/store/useLabStore.js
import { create } from 'zustand';
import {
  getProject,
  getUserProgress,
  saveUserProgress,
  startFreeTrial,
  checkTrialStatus,
} from '../services/api';

const useLabStore = create((set, get) => ({
  // State
  projectId: null,
  userId: null,  // From auth context
  project: null,
  userProgress: null,
  userEnvironment: null,
  files: [],
  milestones: [],
  currentMilestoneId: null,
  isFreeTrial: false,  // ⭐ NEW
  trialExpired: false, // ⭐ NEW
  
  // ... existing state (openTabs, activeFileId, etc.)

  // ⭐ UPDATED: Load project + progress from Node.js backend
  loadProject: async (projectId, userId, isTrial = false) => {
    set({ projectId, userId });
    
    try {
      // Load project from Node.js backend
      const project = await getProject(projectId);
      
      // Start free trial if requested
      if (isTrial) {
        const trialData = await startFreeTrial(userId, projectId);
        set({ 
          isFreeTrial: true,
          trialExpiresAt: trialData.expiresAt
        });
      }
      
      // Load user's progress
      let progress = null;
      try {
        progress = await getUserProgress(userId, projectId);
      } catch (err) {
        // First time user - no progress yet
      }
      
      // Check trial status
      if (progress?.isFreeTrial) {
        const trialStatus = await checkTrialStatus(userId, projectId);
        if (trialStatus.expired) {
          set({ trialExpired: true });
        }
      }
      
      // Load saved environment from localStorage
      const savedEnv = localStorage.getItem('userEnvironment');
      const userEnvironment = savedEnv ? JSON.parse(savedEnv) : null;
      
      // Determine starting milestone
      const startMilestoneIndex = progress?.currentMilestoneIndex || 0;
      
      // Check if milestones should be locked (free trial)
      const maxUnlockedMilestone = progress?.isFreeTrial 
        ? (progress?.unlockedMilestones || 1) 
        : project.milestones.length;
      
      set({
        project,
        userProgress: progress,
        userEnvironment,
        isFreeTrial: progress?.isFreeTrial || isTrial,
        currentMilestoneId: project.milestones[startMilestoneIndex]?.id,
        files: project.files || [],
        milestones: project.milestones?.map((m, idx) => {
          // Determine milestone status
          let status = 'locked';
          let isLocked = idx >= maxUnlockedMilestone;
          
          if (progress?.completedSteps?.some(s => s.milestoneIndex === idx)) {
            status = 'completed';
          } else if (idx === startMilestoneIndex && !isLocked) {
            status = 'active';
          }
          
          return {
            id: `m${idx}`,
            title: m.title,
            description: m.description,
            order: m.order,
            status,
            isLocked,  // ⭐ NEW: For paywall trigger
            steps: m.steps.map((s, sIdx) => {
              // Determine step status
              let stepStatus = 'locked';
              if (progress?.completedSteps?.some(
                step => step.milestoneIndex === idx && step.stepIndex === sIdx
              )) {
                stepStatus = 'completed';
              } else if (idx === startMilestoneIndex && sIdx === 0 && !isLocked) {
                stepStatus = 'active';
              }
              
              return {
                id: `s${idx}-${sIdx}`,
                title: s.title,
                instructions: s.instructions,
                order: s.order,
                status: stepStatus
              };
            }),
            quiz: m.quiz
          };
        }) || []
      });
    } catch (error) {
      console.error('Failed to load project:', error);
      throw error;
    }
  },

  // ⭐ NEW: Check if user can access milestone
  canAccessMilestone: (milestoneIndex) => {
    const { isFreeTrial, userProgress } = get();
    
    if (!isFreeTrial) return true;
    
    const unlockedMilestones = userProgress?.unlockedMilestones || 1;
    return milestoneIndex < unlockedMilestones;
  },

  // ⭐ UPDATED: Complete step + auto-save with trial check
  completeStep: async (stepId) => {
    const state = get();
    const { projectId, currentMilestoneId, milestones, isFreeTrial } = state;
    
    // Find current milestone number for API call
    const milestoneIndex = milestones.findIndex(m => m.id === currentMilestoneId);
    const milestoneNumber = milestoneIndex + 1;

    // Check trial access before completing
    if (isFreeTrial && !get().canAccessMilestone(milestoneIndex)) {
      // Show paywall
      set({ showPaywallModal: true });
      return;
    }

    // Check if this is an assessment step
    const currentMilestone = milestones.find(m => m.id === currentMilestoneId);
    const step = currentMilestone?.steps.find(s => s.id === stepId);
    const isAssessment = step?.title.toLowerCase().includes('assessment');

    // If assessment and project is loaded, call FastAPI
    if (projectId && isAssessment) {
      try {
        const completionResponse = await completeMilestone(projectId, milestoneNumber);
        set((s) => ({
          aiMessages: [...s.aiMessages, {
            role: 'ai',
            content: completionResponse.message || 'Milestone completed! Great work!'
          }]
        }));
      } catch (error) {
        console.error('Failed to complete milestone via API:', error);
      }
    }

    // Update local state
    set((s) => {
      const updatedMilestones = s.milestones.map(m => {
        const updatedSteps = m.steps.map(step =>
          step.id === stepId ? { ...step, status: 'completed' } : step
        );

        // Unlock next step
        const stepIndex = m.steps.findIndex(s => s.id === stepId);
        if (stepIndex < m.steps.length - 1) {
          updatedSteps[stepIndex + 1].status = 
            updatedSteps[stepIndex + 1].status === 'locked' ? 'active' : updatedSteps[stepIndex + 1].status;
        }

        return { ...m, steps: updatedSteps };
      });

      // Check if milestone is complete
      const allStepsComplete = updatedMilestones
        .find(m => m.id === currentMilestoneId)
        ?.steps.every(s => s.status === 'completed');

      if (allStepsComplete) {
        // Unlock next milestone (or show paywall for trial users)
        const milestoneIdx = updatedMilestones.findIndex(m => m.id === currentMilestoneId);
        if (milestoneIdx < updatedMilestones.length - 1) {
          const nextMilestoneLocked = isFreeTrial && (milestoneIdx + 1 >= (s.userProgress?.unlockedMilestones || 1));
          
          if (nextMilestoneLocked) {
            // Show paywall instead of unlocking
            set({ showPaywallModal: true });
          } else {
            updatedMilestones[milestoneIdx + 1].status = 'active';
          }
        }
      }

      return { milestones: updatedMilestones };
    });

    // Auto-save progress to backend
    await get().saveProgress();
  },

  // ... rest of existing actions
}));
```

---

### Catalog Page with Free Trial Button (Tushar, Tanishq, Priyanshu)

```jsx
// src/pages/Catalog.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Catalog({ projects }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleTryFree = (projectId) => {
    if (!user) {
      // Redirect to login with return URL
      navigate(`/login?redirect=/lab/${projectId}?trial=true`);
      return;
    }
    navigate(`/lab/${projectId}?trial=true`);
  };

  const handleBuyNow = (projectId) => {
    navigate(`/checkout/${projectId}`);
  };

  return (
    <div className="catalog-page">
      <h1>Browse Projects</h1>
      <div className="project-grid">
        {projects.map(project => (
          <div key={project.id} className="project-card">
            <img src={project.image} alt={project.title} />
            <div className="project-info">
              <h3>{project.title}</h3>
              <p className="project-description">{project.description}</p>
              <div className="project-meta">
                <span className="project-level">{project.level}</span>
                <span className="project-milestones">
                  {project.milestones?.length || 0} milestones
                </span>
              </div>
              <div className="project-price">
                <span className="price">₹{project.price}</span>
                {project.trialSettings?.isTrialAvailable && (
                  <span className="trial-badge">Free Trial Available</span>
                )}
              </div>
              <div className="project-actions">
                {project.trialSettings?.isTrialAvailable ? (
                  <button 
                    className="btn-trial"
                    onClick={() => handleTryFree(project.id)}
                  >
                    Try Free (Milestone 1)
                  </button>
                ) : null}
                <button 
                  className="btn-buy"
                  onClick={() => handleBuyNow(project.id)}
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 👥 Team Responsibilities

### **Daksh (Code Editor Lead)**

#### Files to Create/Update:
```
✅ CREATE: src/components/lab/OnboardingModal.jsx
✅ CREATE: src/components/lab/PaywallModal.jsx
✅ CREATE: src/hooks/useUserEnvironment.js
✅ CREATE: src/hooks/useTrialStatus.js
✅ UPDATE: src/store/useLabStore.js (add progress tracking + trial logic)
✅ UPDATE: src/pages/Lab.jsx (load project + progress + trial mode)
✅ UPDATE: src/services/api.js (add Node.js backend calls + trial endpoints)
✅ CREATE: src/components/lab/TerminalPanel.jsx (command suggestions)
✅ UPDATE: src/components/lab/AiPanel.jsx (file creation suggestions)
✅ UPDATE: src/components/lab/FileSidebar.jsx (hint button)
✅ UPDATE: src/index.css (onboarding + paywall modal styles)
```

#### Features to Implement:
1. ✅ Onboarding modal (OS, Node.js, Python, code editor)
2. ✅ Load project from Node.js backend
3. ✅ Load/save user progress
4. ✅ Auto-save progress on step completion
5. ✅ AI welcome message based on environment
6. ✅ Command copy UI (no terminal execution)
7. ✅ AI file creation suggestions (with user confirmation)
8. ✅ Browser execution for simple projects only
9. ✅ Complexity mode toggle (browser vs local-dev)
10. ⭐ **FREE TRIAL: Paywall modal**
11. ⭐ **FREE TRIAL: Trial mode detection**
12. ⭐ **FREE TRIAL: Milestone locking logic**
13. ⭐ **FREE TRIAL: Trial status checks**

---

### **Ujjwal (Node.js Backend - Express + MongoDB)**

#### Files to Create:
```
✅ server.js (Express app)
✅ models/User.js
✅ models/Project.js
✅ models/UserProgress.js
✅ models/Purchase.js
✅ models/Trial.js (optional - for analytics)
✅ routes/auth.js
✅ routes/projects.js
✅ routes/progress.js
✅ routes/purchases.js
✅ routes/payment.js
✅ routes/trial.js ⭐ NEW
✅ middleware/auth.js (JWT verification)
✅ .env (MongoDB URI, JWT secret, payment keys)
```

#### Endpoints to Build:
```
✅ POST   /api/auth/register
✅ POST   /api/auth/login
✅ GET    /api/auth/me
✅ GET    /api/projects
✅ GET    /api/projects/:id
✅ POST   /api/projects
✅ PUT    /api/projects/:id
✅ DELETE /api/projects/:id
✅ POST   /api/ai/generate-milestones (proxy to FastAPI)
✅ POST   /api/ai/generate-quiz (proxy to FastAPI)
✅ POST   /api/ai/analyze-complexity (proxy to FastAPI)
✅ GET    /api/users/:userId/progress/:projectId
✅ PUT    /api/users/:userId/progress/:projectId
✅ POST   /api/users/:userId/progress/complete
✅ POST   /api/purchases
✅ GET    /api/users/:userId/purchases
✅ POST   /api/payment/create-order
✅ POST   /api/payment/verify
⭐ POST   /api/trial/start               # Start free trial
⭐ GET    /api/trial/status/:projectId   # Check trial status
⭐ POST   /api/trial/convert             # Convert trial to purchase
```

#### ⭐ FREE TRIAL Logic:
```javascript
// routes/trial.js
router.post('/start', auth, async (req, res) => {
  const { projectId } = req.body;
  const userId = req.user.id;
  
  // Check if user already has access
  const existingPurchase = await Purchase.findOne({ buyer: userId, project: projectId });
  if (existingPurchase) {
    return res.status(400).json({ message: 'Already owns this project' });
  }
  
  // Check if trial already exists
  let trial = await UserProgress.findOne({ user: userId, project: projectId });
  
  if (!trial) {
    // Create new trial
    trial = await UserProgress.create({
      user: userId,
      project: projectId,
      isFreeTrial: true,
      trialStartedAt: new Date(),
      trialExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      unlockedMilestones: 1
    });
  }
  
  res.json({
    success: true,
    isFreeTrial: true,
    expiresAt: trial.trialExpiresAt,
    unlockedMilestones: trial.unlockedMilestones
  });
});

router.get('/status/:projectId', auth, async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;
  
  const progress = await UserProgress.findOne({ user: userId, project: projectId });
  
  if (!progress || !progress.isFreeTrial) {
    return res.json({ isFreeTrial: false });
  }
  
  const expired = new Date() > progress.trialExpiresAt;
  
  res.json({
    isFreeTrial: true,
    expired,
    expiresAt: progress.trialExpiresAt,
    unlockedMilestones: progress.unlockedMilestones
  });
});

router.post('/convert', auth, async (req, res) => {
  const { projectId, paymentId } = req.body;
  const userId = req.user.id;
  
  // Update trial to full access
  await UserProgress.findOneAndUpdate(
    { user: userId, project: projectId },
    { 
      isFreeTrial: false,
      unlockedMilestones: Infinity
    }
  );
  
  // Create purchase record
  await Purchase.create({
    buyer: userId,
    project: projectId,
    paymentId,
    status: 'completed',
    isTrialConversion: true
  });
  
  res.json({ success: true });
});
```

---

### **Aayush (FastAPI Backend - AI Services)**

#### Endpoints to Build:
```python
✅ POST /generate-milestones       # AI generates from README
✅ POST /generate-quiz             # AI generates quiz questions
✅ POST /analyze-complexity        # AI determines simple/complex
✅ POST /chat                      # AI tutor for code editor
✅ GET  /projects/{id}/milestones/{n}/guide
✅ GET  /projects/{id}/milestones/{n}/hint
✅ POST /projects/{id}/milestones/{n}/ask
✅ POST /projects/{id}/milestones/{n}/complete
```

#### AI Integration:
- Use OpenAI API or Anthropic Claude
- Cache AI responses to reduce costs
- Rate limiting per user
- Store conversation history for context

#### Files to Create:
```
✅ main.py (FastAPI app)
✅ ai_services.py (AI logic)
✅ prompts.py (AI prompt templates)
✅ models.py (Pydantic models)
✅ requirements.txt
```

---

### **Tushar, Tanishq, Priyanshu (Other Pages Frontend)**

#### Pages to Build:
```
✅ pages/Home.jsx
✅ pages/Catalog.jsx (project listing with Try Free button) ⭐ UPDATED
✅ pages/ProjectDetails.jsx
✅ pages/Dashboard.jsx (buyer dashboard - progress)
✅ pages/SellerDashboard.jsx (seller dashboard - sales)
✅ pages/Auth.jsx (login/register)
✅ pages/Checkout.jsx
```

#### ⭐ FREE TRIAL Integration:
```jsx
// In Catalog.jsx - Add "Try Free" button
<div className="project-actions">
  {project.trialSettings?.isTrialAvailable && (
    <button 
      className="btn-trial"
      onClick={() => navigate(`/lab/${project.id}?trial=true`)}
    >
      Try Free (Milestone 1)
    </button>
  )}
  <button 
    className="btn-buy"
    onClick={() => navigate(`/checkout/${project.id}`)}
  >
    Buy Now
  </button>
</div>
```

#### Integration:
- Fetch projects from Node.js backend
- Display project cards with price, tech stack
- Link to Lab page: `/lab/:projectId?trial=true`
- Show user's purchased projects in dashboard
- Show progress in buyer dashboard

---

## ✅ Implementation Checklist

### Phase 1: Foundation (Week 1)

#### Ujjwal (Node.js Backend)
- [ ] Set up Express + MongoDB project
- [ ] Create Mongoose schemas
- [ ] Implement auth endpoints
- [ ] Implement project CRUD endpoints
- [ ] ⭐ Add trial endpoints (/api/trial/start, /status, /convert)
- [ ] Test with Postman

#### Aayush (FastAPI Backend)
- [ ] Set up FastAPI project
- [ ] Implement `/generate-milestones` endpoint
- [ ] Implement `/generate-quiz` endpoint
- [ ] Implement `/analyze-complexity` endpoint
- [ ] Test AI responses

#### Daksh (Code Editor)
- [ ] Create OnboardingModal component
- [ ] Create PaywallModal component ⭐ NEW
- [ ] Update useLabStore with progress tracking + trial logic
- [ ] Update Lab.jsx to load project + progress + trial mode
- [ ] Update API service for Node.js backend calls
- [ ] Create useTrialStatus hook ⭐ NEW

#### Tushar, Tanishq, Priyanshu (Other Pages)
- [ ] Create Home page
- [ ] Create Catalog page with "Try Free" buttons ⭐ UPDATED
- [ ] Create Project Details page
- [ ] Link to Lab page

---

### Phase 2: Integration (Week 2)

#### Ujjwal
- [ ] Add proxy endpoints to FastAPI
- [ ] Implement progress tracking endpoints
- [ ] Implement purchase endpoints
- [ ] Add payment integration (Razorpay/Stripe)
- [ ] Add trial conversion logic

#### Aayush
- [ ] Implement `/chat` endpoint (AI tutor)
- [ ] Add conversation history support
- [ ] Optimize AI prompts for better responses
- [ ] Add caching for AI responses

#### Daksh
- [ ] Add auto-save progress functionality
- [ ] Add AI file creation suggestions
- [ ] Add command copy UI
- [ ] Implement milestone locking for trial users
- [ ] Test full flow: Trial → Paywall → Purchase → Unlock

#### Tushar, Tanishq, Priyanshu
- [ ] Create Buyer Dashboard
- [ ] Create Seller Dashboard
- [ ] Create Checkout page
- [ ] Add authentication flow

---

### Phase 3: Polish (Week 3)

#### Everyone
- [ ] End-to-end testing
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] Security audit
- [ ] Deploy to production

#### Ujjwal
- [ ] Set up production MongoDB
- [ ] Add rate limiting
- [ ] Add error logging
- [ ] Deploy Node.js backend

#### Aayush
- [ ] Optimize AI response times
- [ ] Add error handling
- [ ] Deploy FastAPI backend

#### Daksh
- [ ] Add loading states
- [ ] Add error boundaries
- [ ] Improve UI/UX
- [ ] Test on different browsers

#### Tushar, Tanishq, Priyanshu
- [ ] Responsive design
- [ ] Accessibility improvements
- [ ] SEO optimization

---

## 🆓 Free Trial System - Detailed Specification

### Overview
Allow users to access the **first milestone** of any project for free, then require payment to continue.

### User Flow

```
1. User browses catalog → Sees "Try Free" button
2. Clicks "Try Free" → If not logged in, redirect to login
3. Lab opens with project in TRIAL MODE
4. User completes Milestone 1 (all steps + quiz)
5. User clicks Milestone 2 → Paywall modal appears
6. User can:
   - Click "Buy Now" → Checkout → Full access
   - Click "Continue Trial" → Stay on Milestone 1
7. After purchase → All milestones unlocked
```

### Database Changes (Ujjwal)

Add to `UserProgress` schema:
```javascript
{
  isFreeTrial: { type: Boolean, default: true },
  trialStartedAt: Date,
  trialExpiresAt: Date,  // 7 days from start
  unlockedMilestones: { type: Number, default: 1 }
}
```

Add to `Project` schema:
```javascript
{
  trialSettings: {
    isTrialAvailable: { type: Boolean, default: true },
    trialMilestones: { type: Number, default: 1 }
  }
}
```

### Backend Logic (Ujjwal)

```javascript
// Middleware to check trial access
const checkTrialAccess = async (req, res, next) => {
  const { userId, projectId } = req.body;
  
  const progress = await UserProgress.findOne({ user: userId, project: projectId });
  
  if (!progress) {
    return res.status(403).json({ message: 'No access to this project' });
  }
  
  if (progress.isFreeTrial) {
    const expired = new Date() > progress.trialExpiresAt;
    if (expired) {
      return res.status(403).json({ 
        message: 'Trial expired',
        trialExpired: true
      });
    }
  }
  
  next();
};

// In progress endpoint - lock milestones beyond trial limit
PUT /api/users/:userId/progress/:projectId
{
  // If isFreeTrial && milestoneIndex >= unlockedMilestones
  // Return error or locked status
}
```

### Frontend Logic (Daksh)

```javascript
// In Lab.jsx
const { isFreeTrial, trialExpired, canAccessMilestone } = useLabStore();

// When clicking on milestone
const handleMilestoneClick = (milestoneId, index) => {
  if (!canAccessMilestone(index)) {
    setShowPaywallModal(true);
    return;
  }
  setCurrentMilestoneId(milestoneId);
};

// When completing milestone
const handleMilestoneComplete = async () => {
  const nextMilestoneIndex = currentIndex + 1;
  
  if (isFreeTrial && !canAccessMilestone(nextMilestoneIndex)) {
    // Show paywall instead of unlocking
    setShowPaywallModal(true);
    return;
  }
  
  // Continue normally
};
```

### Trial Expiration

- **Default:** 7 days from trial start
- **After expiration:** User can't access any milestone content
- **Reminder:** Show "2 days left in trial" banner on day 5

### Analytics (Optional)

Track trial conversion rates:
```javascript
// In Trial collection
{
  user: ObjectId,
  project: ObjectId,
  startedAt: Date,
  completedMilestones: [0],
  converted: Boolean,
  convertedAt: Date,
  abandoned: Boolean,
  abandonedAt: Date
}
```

---

## 🔒 Security Considerations

### Node.js Backend (Ujjwal)
```javascript
// ✅ Use bcrypt for password hashing
const hashedPassword = await bcrypt.hash(password, 10);

// ✅ Use JWT for authentication
const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ✅ Validate input with Joi or express-validator
const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
});

// ✅ Use helmet for security headers
app.use(helmet());

// ✅ Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));

// ✅ CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// ✅ Trial abuse prevention
// - Limit one trial per user per project
// - Check IP address for multiple accounts
// - Require phone verification for repeat abusers
```

### FastAPI Backend (Aayush)
```python
# ✅ Use API key for LLM calls
openai.api_key = os.getenv("OPENAI_API_KEY")

# ✅ Rate limiting
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)

# ✅ Input validation
from pydantic import BaseModel, validator

class ChatRequest(BaseModel):
    projectId: str
    message: str
    codeContext: str
    
    @validator('message')
    def message_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Message cannot be empty')
        return v
```

### Frontend (Daksh, Tushar, Tanishq, Priyanshu)
```javascript
// ✅ Store sensitive data in environment variables
const API_URL = import.meta.env.VITE_API_URL;

// ✅ Don't store secrets in localStorage
// ❌ Bad: localStorage.setItem('token', token);
// ✅ Good: Use httpOnly cookies (set by backend)

// ✅ Validate AI responses before rendering
if (aiResponse.suggestedFiles) {
  // Sanitize file names to prevent XSS
  const safeFileName = sanitizeFileName(aiResponse.suggestedFiles[0].name);
}

// ✅ Use HTTPS in production
if (import.meta.env.PROD) {
  // Enforce HTTPS
}

// ✅ Trial mode enforcement (server-side check is primary)
// Client-side is for UX only
```

---

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
# Build command
npm run build

# Output directory
dist

# Environment variables
VITE_NODE_API_URL=https://your-node-backend.com/api
VITE_FASTAPI_URL=https://brainbazarfastapi-backend-production.up.railway.app
```

### Node.js Backend (Railway/Render)
```bash
# Start command
node server.js

# Environment variables
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
FRONTEND_URL=https://your-frontend.com
TRIAL_DURATION_DAYS=7
```

### FastAPI Backend (Railway)
```bash
# Start command
uvicorn main:app --host 0.0.0.0 --port $PORT

# Environment variables
OPENAI_API_KEY=sk-...
DATABASE_URL=...
```

---

## 📞 Communication

### Team Chat (Discord/Slack)
- `#frontend` - Daksh + Tushar + Tanishq + Priyanshu
- `#backend-node` - Ujjwal
- `#backend-fastapi` - Aayush
- `#general` - Everyone

### Weekly Sync Meetings
- **Monday:** Sprint planning (what to build this week)
- **Wednesday:** Mid-week check-in (blockers?)
- **Friday:** Demo + retrospective (what worked, what didn't)

### Git Workflow
```bash
# Main branch (production-ready)
main

# Development branch
dev

# Feature branches
feature/paywall-modal
feature/free-trial-endpoints
feature/trial-tracking

# Pull Request Process
1. Create feature branch from dev
2. Make changes + test locally
3. Create PR to dev
4. Code review by teammate
5. Merge to dev
6. Test on staging
7. Merge to main (Friday)
```

---

## 📝 Notes

### AI Cost Optimization
1. **Cache AI responses** - Don't regenerate same milestones twice
2. **Use cheaper models** - GPT-3.5-turbo for chat, GPT-4 for complex tasks
3. **Rate limit** - Max 10 AI calls per user per hour
4. **Batch requests** - Generate all quizzes in one call if possible

### Performance Tips
1. **Lazy load** - Only load project files when user opens Lab
2. **Debounce saves** - Auto-save progress after 500ms of inactivity
3. **Optimistic UI** - Update UI immediately, sync to backend in background
4. **Code splitting** - Split Lab component from other pages

### Accessibility
1. **Keyboard navigation** - All buttons should be focusable
2. **Screen reader support** - Add aria-labels
3. **Color contrast** - Meet WCAG AA standards
4. **Loading states** - Show spinners for async actions

### Free Trial Best Practices
1. **Clear messaging** - "First milestone free" not "Free trial"
2. **No credit card required** - Reduce friction
3. **Show value early** - Make milestone 1 impactful
4. **Timed expiration** - 7 days creates urgency
5. **Conversion analytics** - Track trial → purchase rate

---

## 🆘 Troubleshooting

### Common Issues

**Problem:** Project doesn't load in Lab
```
✅ Check: Node.js backend is running
✅ Check: MongoDB has project data
✅ Check: Frontend API_URL is correct
✅ Check: Network tab for 404 errors
```

**Problem:** AI chat returns errors
```
✅ Check: FastAPI backend is running
✅ Check: OpenAI API key is valid
✅ Check: Request payload format
✅ Check: Rate limits
```

**Problem:** Progress doesn't save
```
✅ Check: User is authenticated
✅ Check: PUT endpoint is working
✅ Check: MongoDB connection
✅ Check: Console for errors
```

**Problem:** Trial user can access all milestones
```
✅ Check: isFreeTrial flag in UserProgress
✅ Check: canAccessMilestone() function in frontend
✅ Check: Milestone locking logic in backend
✅ Check: Paywall modal trigger
```

---

**Good luck with the project! 🚀**

For questions, refer to this document or reach out in the team chat.
