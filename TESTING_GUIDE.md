# 🚀 BrainBazaar - Complete Testing Guide

**Last Updated:** March 22, 2026  
**Status:** Production Ready

---

## 📋 Prerequisites

Before starting, make sure you have:

1. ✅ **MongoDB** installed and running (or MongoDB Atlas connection string)
2. ✅ **Node.js** v16+ installed
3. ✅ **Python** v3.9+ installed (for FastAPI)
4. ✅ **GitHub OAuth App** created (credentials in `.env`)
5. ✅ All dependencies installed (`npm install` in server & frontend)

---

## 🎯 STEP 1: Start All Services

### **Terminal 1: MongoDB** (if using local)
```bash
# Windows
mongod

# Mac/Linux
sudo systemctl start mongod
# OR
brew services start mongodb-community
```

**Verify MongoDB is running:**
```bash
mongosh
# Should connect without errors
```

---

### **Terminal 2: Express Backend** (Port 5000)
```bash
cd "C:\Users\Daksh Dixit\Desktop\BrainBazaar\server"
npm run dev
```

**Expected Output:**
```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🎓 BrainBazaar Server is running!                       ║
║                                                           ║
║   📡 Port: 5000                                           ║
║   🔗 API: http://localhost:5000/api/v1                    ║
║   🏥 Health: http://localhost:5000/ping                   ║
║                                                           ║
║   Environment: development                                ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

Connected to MongoDB: localhost
```

**Test it:**
```bash
curl http://localhost:5000/ping
# Should return: {"message": "BrainBazaar API is running!", ...}
```

---

### **Terminal 3: Frontend** (Port 5173)
```bash
cd "C:\Users\Daksh Dixit\Desktop\BrainBazaar\frontend"
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**Open in browser:** http://localhost:5173

---

### **Terminal 4: FastAPI Backend** (Port 8000)
```bash
cd "C:\Users\Daksh Dixit\Desktop\BrainBazaar\brainbazar_fastapi-backend"
uvicorn main:app --reload --port 8000
```

**Expected Output:**
```
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://localhost:8000 (Press CTRL+C to quit)
```

**Test it:**
```bash
curl http://localhost:8000/
# Should return: {"message": "SRMS AI Project Guide API is running", ...}
```

**Open API docs:** http://localhost:8000/docs

---

## ✅ STEP 2: Verify All Services

Open these URLs in your browser:

| Service | URL | Expected Result |
|---------|-----|-----------------|
| **Frontend** | http://localhost:5173 | BrainBazaar homepage |
| **Express API** | http://localhost:5000/ping | `{"message": "BrainBazaar API is running!"}` |
| **FastAPI** | http://localhost:8000 | `{"message": "SRMS AI Project Guide API is running"}` |
| **FastAPI Docs** | http://localhost:8000/docs | Swagger UI |

---

## 🎯 STEP 3: Test User Registration (Buyer Flow)

### **3.1 Register as Buyer**

1. Go to: http://localhost:5173/auth
2. Click **"Sign Up"** tab
3. Fill in:
   - Name: `Test Buyer`
   - Email: `buyer@test.com`
   - Password: `password123`
4. Click **"Sign Up"**

**Expected:** 
- Redirects to `/catalog`
- You're logged in
- See welcome message

**Verify in database:**
```javascript
// In MongoDB
db.users.findOne({ email: "buyer@test.com" })
// Should show: role: "user", credits: 20
```

---

### **3.2 Browse Catalog**

1. Go to: http://localhost:5173/catalog
2. You should see projects (if any exist in database)

**If no projects:** Skip to STEP 4 (Seller Flow) to create one!

---

## 🎯 STEP 4: Test Seller Flow (COMPLETE WORKFLOW)

### **4.1 Register as Seller**

1. Go to: http://localhost:5173/auth
2. Click **"Sign Up"** tab
3. Click **"Seller"** toggle
4. Fill in:
   - Name: `Test Seller`
   - Email: `seller@test.com`
   - Password: `password123`
5. Click **"Register as Seller"**

**Expected:**
- Redirects to `/seller` (Seller Portal)
- Role is "seller" in database

---

### **4.2 Connect GitHub**

1. In Seller Portal, click **"Connect GitHub"**
2. GitHub OAuth page opens
3. Authorize BrainBazaar
4. Redirects back to Seller Portal

**Expected:**
- Shows "Connected as @yourusername"
- Green checkmark

**Verify in database:**
```javascript
db.users.findOne({ email: "seller@test.com" })
// Should show: githubConnected: true, githubUsername: "yourusername"
```

---

### **4.3 Upload Project (8 Steps)**

Go to: http://localhost:5173/seller/upload

#### **Step 1: Connect GitHub** ✅
- Should already be connected from 4.2
- Click **"Next"**

#### **Step 2: Select Repository**
1. Wait for repositories to load
2. Click on a repository (e.g., "weather-app")
3. Click **"Next"**

**Expected:** Repository selected, moves to Step 3

#### **Step 3: Upload README**
1. README should auto-load from repo
2. If not, paste this:
```markdown
# Weather Dashboard App

A beautiful weather application that fetches real-time weather data.

## Features
- Real-time weather data
- Location search
- 5-day forecast
- Responsive design

## Tech Stack
- React
- Node.js
- OpenWeather API
```
3. Click **"Next"**

#### **Step 4: Select Main Files**
1. Wait for file tree to load
2. Select entry-point files:
   - `App.jsx` or `app.js`
   - `server.js` or `index.js`
   - `package.json`
   - Any main component files
3. Click **"Next"**

#### **Step 5: AI Processing** ⏳
1. Wait for AI to generate milestones
2. Should see loading screen with progress

**Expected:**
- AI generates 4 milestones
- Summary generated
- Complexity analyzed

**If AI fails:** Fallback milestones generated (still works!)

#### **Step 6: Review & Edit**
1. Review AI-generated content:
   - Title
   - Description
   - Milestones
2. Edit if needed
3. Click **"Next"**

#### **Step 7: Set Pricing**
1. Fill in:
   - **Category:** Select "Trending"
   - **Badge:** Select "Gold" (or auto-selected)
   - **Price:** ₹499
   - **Tech Stack:** Add "React", "Node.js", "API"
2. Click **"Next"**

#### **Step 8: Terms & Submit**
1. Check "I agree to 20% platform fee"
2. Click **"Submit for Review"**

**Expected:**
- Success message
- Redirects to Seller Portal
- Project shows as "Pending Review"

---

## 🎯 STEP 5: Test Admin Review

### **5.1 Login as Admin**

1. Go to: http://localhost:5173/auth
2. Login with admin account:
   - Email: `admin@brainbazaar.com` (or create one)
   - Password: your admin password

**If no admin account:**
```javascript
// In MongoDB, update a user to admin
db.users.updateOne(
  { email: "seller@test.com" },
  { $set: { role: "admin" } }
)
```

---

### **5.2 Review Project**

1. Go to: http://localhost:5173/admin
2. See "Pending Projects" queue
3. Click on your project
4. Review details:
   - Title, description
   - Milestones
   - README
   - Price

### **5.3 Approve Project**

1. Click **"Approve"** button
2. Add admin notes: "Looks good! Approved for publishing."
3. Confirm

**Expected:**
- Project status changes to "Approved"
- Project is now published
- Appears in catalog

**Verify in database:**
```javascript
db.projects.findOne({ title: "Weather Dashboard App" })
// Should show: reviewStatus: "approved", isPublished: true
```

---

## 🎯 STEP 6: Test Buyer Purchase Flow

### **6.1 Browse Catalog**

1. Logout from admin
2. Login as buyer (`buyer@test.com`)
3. Go to: http://localhost:5173/catalog
4. You should see your approved project!

---

### **6.2 View Project Details**

1. Click on project card
2. See:
   - Project images
   - Description
   - Milestones roadmap
   - Technologies
   - Price (₹499)
   - Two buttons:
     - **"Get Project Now"** (Buy full project)
     - **"Build with AI"** (Learn milestone-by-milestone)

---

### **6.3 Option A: Buy Full Project**

1. Click **"Get Project Now"**
2. Checkout modal opens
3. Click **"Pay ₹499"**
4. Complete payment (demo mode: no real payment)

**Expected:**
- Purchase recorded in database
- Download link appears
- Can download ZIP from GitHub

**Verify:**
```javascript
db.purchases.findOne({ buyer: buyerId, project: projectId })
// Should show: status: "completed", amount: 499
```

---

### **6.4 Option B: Learn with AI (Lab)**

1. Click **"Build with AI"** or **"Enter Lab"**
2. Lab loads with project

---

## 🎯 STEP 7: Test Lab Learning Flow

### **7.1 Onboarding**

1. Lab opens → Onboarding modal appears
2. Fill in:
   - **OS:** Windows/macOS/Linux
   - **Node installed:** Yes
   - **Python installed:** No
   - **IDE:** VS Code
3. Click **"Start Learning"**

**Expected:**
- Environment saved
- Lab interface loads
- Milestone 1 active

---

### **7.2 Milestone 1 (FREE)**

1. Read milestone summary
2. Complete tasks in editor
3. Click **"Mark Complete"**
4. Quiz opens
5. Complete quiz (need 70%+)
6. Milestone complete!

**Expected:**
- Credits: Still 20 (Milestone 1 is FREE)
- Milestone 1 marked complete
- Milestone 2 shows as "Locked"

---

### **7.3 Milestone 2 (PAYWALL)**

1. Click on Milestone 2
2. **CreditModal** appears:
   ```
   Insufficient Credits
   You need 70 credits to unlock this milestone.
   You currently have 20 credits.
   ```
3. Two options:
   - **"Buy Credit Packs"** → Goes to /buy-credits
   - **"Maybe Later"** → Closes modal

---

### **7.4 Buy Credits**

1. Click **"Buy Credit Packs"**
2. Go to: http://localhost:5173/buy-credits
3. Select "Milestone Unlock" pack (70 credits, ₹99)
4. Click **"Buy Now"**
5. Complete payment (demo mode)

**Expected:**
- Credits: 20 + 70 = 90 credits
- Balance updated

**Verify:**
```javascript
db.users.findOne({ email: "buyer@test.com" })
// Should show: credits: 90
```

---

### **7.5 Unlock Milestone 2**

1. Go back to Lab
2. Click Milestone 2
3. **UnlockConfirmationModal** appears:
   ```
   Unlock Milestone for 70 credits?
   You have 90 credits available.
   ```
4. Click **"Confirm Unlock"**

**Expected:**
- 70 credits deducted (90 - 70 = 20)
- Milestone 2 unlocks
- Can now access content

---

### **7.6 AI Chat (Credit Deduction)**

1. Open AI panel (right sidebar)
2. Type question: "How do I set up the project structure?"
3. Click **"Send"**

**Expected:**
- 2 credits deducted (20 - 2 = 18)
- AI responds with answer
- Response appears in chat

**Verify:**
```javascript
db.users.findOne({ email: "buyer@test.com" })
// Should show: credits: 18
```

---

## 🎯 STEP 8: Test GitHub Download (After Purchase)

### **8.1 Purchase Project**

1. As buyer, purchase the project (Step 6.3)
2. Go to: http://localhost:5173/dashboard
3. Click "My Purchases"
4. Click "Download" on the project

**Expected:**
- Verifies purchase in database
- Fetches seller's GitHub token
- Decrypts token
- Streams ZIP from GitHub
- Download starts

**Test the endpoint directly:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/v1/projects/PROJECT_ID/download
```

---

## 🎯 STEP 9: Test Credit System

### **9.1 Check Balance**

1. Go to: http://localhost:5173/buy-credits
2. See current balance: 18 credits

### **9.2 Buy More Credits**

1. Select "Starter Pack" (100 credits, ₹49)
2. Click **"Buy Now"**
3. Complete payment

**Expected:**
- Credits: 18 + 100 = 118

### **9.3 View History**

1. Click "Credit History"
2. See transactions:
   ```
   +70 credits - Milestone Unlock (₹99)
   +100 credits - Starter Pack (₹49)
   -2 credits - AI Chat
   -70 credits - Milestone 2 Unlock
   ```

---

## 🎯 STEP 10: Test Admin Statistics

### **10.1 View Dashboard**

1. Login as admin
2. Go to: http://localhost:5173/admin
3. See statistics:
   - Total Users: 2
   - Total Sellers: 1
   - Total Projects: 1
   - Published Projects: 1
   - Total Revenue: ₹499
   - Platform Revenue (20%): ₹99.80

**Verify:**
```javascript
// Total revenue from purchases
db.purchases.aggregate([
  { $match: { status: "completed" } },
  { $group: { _id: null, total: { $sum: "$amount" } } }
])
```

---

## ✅ TESTING CHECKLIST

Mark these off as you test:

### **Backend Services**
- [ ] MongoDB connected
- [ ] Express API running (port 5000)
- [ ] FastAPI running (port 8000)
- [ ] All endpoints responding

### **Authentication**
- [ ] Buyer registration works
- [ ] Seller registration works
- [ ] Login works
- [ ] Token stored in localStorage

### **GitHub OAuth**
- [ ] Connect GitHub button works
- [ ] OAuth redirect works
- [ ] Token encrypted and stored
- [ ] Repositories load
- [ ] Files can be fetched

### **Project Upload**
- [ ] All 8 steps work
- [ ] README uploads
- [ ] Files selected
- [ ] AI generates milestones
- [ ] Project submits for review

### **Admin Review**
- [ ] Pending projects show
- [ ] Approve works
- [ ] Decline works
- [ ] Project publishes

### **Buyer Flow**
- [ ] Catalog shows projects
- [ ] Project details load
- [ ] Checkout works
- [ ] Purchase recorded
- [ ] Download works

### **Lab**
- [ ] Lab loads
- [ ] Onboarding saves
- [ ] Milestone 1 free
- [ ] Paywall appears at Milestone 2
- [ ] Credit modal works
- [ ] Unlock confirmation works
- [ ] Credits deduct properly
- [ ] AI chat works

### **Credits**
- [ ] Balance displays
- [ ] Purchase credits works
- [ ] History shows transactions
- [ ] Milestone unlock deducts 70
- [ ] AI chat deducts 2

---

## 🐛 TROUBLESHOOTING

### **MongoDB Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Fix:** Start MongoDB
```bash
mongod
```

### **Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Fix:** Kill the process
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### **GitHub OAuth Fails**
```
redirect_uri_mismatch
```
**Fix:** Check GitHub OAuth App settings
```
Authorization callback URL must be:
http://localhost:5000/api/v1/github/callback
```

### **AI Generation Fails**
```
FastAPI returned 500
```
**Fix:** Check FastAPI is running and GEMINI_API_KEY is set
```bash
cd brainbazar_fastapi-backend
uvicorn main:app --reload --port 8000
```

### **Credits Not Deducting**
```
Credits stay same after AI chat
```
**Fix:** Check `useLabStore.js:addAiUserMessage()` is calling `deductCredit(2)`

---

## 🎉 SUCCESS CRITERIA

Your app is working correctly if:

1. ✅ Can register as buyer AND seller
2. ✅ Can connect GitHub account
3. ✅ Can upload project (all 8 steps)
4. ✅ AI generates milestones
5. ✅ Admin can approve project
6. ✅ Project appears in catalog
7. ✅ Can purchase project
8. ✅ Can download ZIP from GitHub
9. ✅ Can enter Lab
10. ✅ Milestone 1 is free
11. ✅ Milestone 2 requires 70 credits
12. ✅ AI chat deducts 2 credits
13. ✅ Can buy credit packs
14. ✅ Admin sees statistics

---

## 🚀 YOU'RE READY!

If all tests pass, **YOUR APP IS PRODUCTION READY!** 🎊

Time to:
1. Deploy to production
2. Add real payment keys
3. Launch! 🚀

---

**Good luck with testing!** Let me know if you hit any issues! 😄
