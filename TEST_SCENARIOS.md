# BrainBazaar - Comprehensive Test Scenarios

**Last Updated:** April 3, 2026  
**Version:** 3.0 - New Purchase Model

---

## 📋 Table of Contents
1. [User Registration & Authentication](#1-user-registration--authentication)
2. [Free Trial System (3 Projects)](#2-free-trial-system-3-projects)
3. [Message Limits & AI Credits](#3-message-limits--ai-credits)
4. [Project Purchase Flow](#4-project-purchase-flow)
5. [Credit Purchase & Monthly Refresh](#5-credit-purchase--monthly-refresh)
6. [GitHub Integration for Sellers](#6-github-integration-for-sellers)
7. [Project Upload & AI Processing](#7-project-upload--ai-processing)
8. [Code Editor & AI Chat](#8-code-editor--ai-chat)
9. [Milestone Progress & Quizzes](#9-milestone-progress--quizzes)
10. [Edge Cases & Error Handling](#10-edge-cases--error-handling)

---

## 1. User Registration & Authentication

### Test 1.1: New User Registration
**Scenario:** User signs up for the first time

**Steps:**
1. Navigate to `/auth`
2. Click "Register"
3. Fill in: Name, Email, Password
4 Submit registration

**Expected Results:**
- ✅ User created in MongoDB
- ✅ User receives 20 free credits
- ✅ `lastCreditRefresh` set to current date
- ✅ `freeTrialProjects` array is empty
- ✅ Auth token stored in localStorage (`auth-storage`)
- ✅ Redirected to dashboard

**Verify in Database:**
```javascript
// Check User collection
{
  credits: 20,
  freeTrialProjects: [],
  lastCreditRefresh: <current_date>
}
```

---

### Test 1.2: Login & Token Persistence
**Scenario:** User logs in and token persists across refreshes

**Steps:**
1. Login with existing credentials
2. Check localStorage for `auth-storage`
3. Refresh page
4. Navigate to `/lab/:projectId`

**Expected Results:**
- ✅ Login successful, token in localStorage
- ✅ After refresh, user still authenticated
- ✅ API calls include Authorization header with correct token

---

## 2. Free Trial System (3 Projects)

### Test 2.1: Start First Free Trial
**Scenario:** User starts trial on 1st project

**Steps:**
1. Browse catalog at `/catalog`
2. Click "Try Free" on any project
3. Check if redirected to `/lab/:projectId?trial=true`
4. Verify Lab loads with milestone 0 active

**Expected Results:**
- ✅ UserProgress created with `isFreeTrial: true`
- ✅ `messageLimits.freeTrialMessagesPerMilestone: 10`
- ✅ `messageCounts: []` (empty, no messages used)
- ✅ Only milestone 0 is unlocked
- ✅ User's `freeTrialProjects` array has 1 project ID

**API Response Check:**
```javascript
POST /api/v1/progress/start
{
  "success": true,
  "message": "Free trial started successfully",
  "progress": {
    "isFreeTrial": true,
    "messageLimits": {
      "freeTrialMessagesPerMilestone": 10,
      "purchasedMessagesPerMilestone": 20
    }
  },
  "messageLimit": 10
}
```

---

### Test 2.2: Use All 3 Free Trials
**Scenario:** User starts trials on 3 different projects

**Steps:**
1. Start trial on Project A → Complete milestone 0
2. Start trial on Project B → Complete milestone 0
3. Start trial on Project C → Complete milestone 0
4. Try to start trial on Project D

**Expected Results:**
- ✅ Projects A, B, C all start successfully
- ✅ User's `freeTrialProjects.length === 3`
- ✅ Project D returns 403 error: "You have exhausted your 3 free project trials"

**API Response for 4th Project:**
```javascript
{
  "message": "You have exhausted your 3 free project trials. Please purchase a project or use credits.",
  "status": 403
}
```

---

### Test 2.3: Milestone Locking for Free Users
**Scenario:** Free user tries to access milestone 1

**Steps:**
1. Start trial on Project A
2. Complete all steps in milestone 0
3. Click on milestone 1

**Expected Results:**
- ✅ Milestone 1 shows as locked
- ✅ Paywall modal appears
- ✅ Message: "Purchase project to unlock all milestones"
- ✅ User cannot proceed to milestone 1 without purchasing

---

## 3. Message Limits & AI Credits

### Test 3.1: Free User Message Limit (10 messages)
**Scenario:** Free user sends 10 AI messages in milestone 0

**Steps:**
1. Start trial on Project A
2. Open AI panel
3. Send 10 messages one by one
4. Check message counter after each message
5. Try to send 11th message

**Expected Results:**
- ✅ Messages 1-10: AI responds normally, no credits consumed
- ✅ Counter shows: "9 messages left", "8 messages left", etc.
- ✅ After 10th message: Counter shows "0 messages left"
- ✅ 11th message: Returns 403 error
- ✅ Error message: "Message limit reached and insufficient credits"

**Verify in Database:**
```javascript
// Check UserProgress.messageCounts
{
  "messageCounts": [
    { "milestoneIndex": 0, "count": 10 }
  ]
}
```

---

### Test 3.2: Credit Consumption After Limit
**Scenario:** User has 20 credits, uses 10 free messages, then sends more

**Steps:**
1. Start trial on Project A
2. Send 10 free messages (exhaust limit)
3. Send 11th message
4. Check credit balance

**Expected Results:**
- ✅ 11th message succeeds
- ✅ 2 credits deducted (20 → 18)
- ✅ Response includes: `credits: 18, creditsDeducted: true, messagesRemaining: 0`
- ✅ UserProgress.messageCounts shows count: 11

---

### Test 3.3: Insufficient Credits After Limit
**Scenario:** User has 1 credit, exhausted 10 free messages

**Steps:**
1. Exhaust 10 free messages
2. Manually set user credits to 1 in database
3. Try to send 11th message

**Expected Results:**
- ✅ Returns 403 error
- ✅ Message: "Message limit reached and insufficient credits. Purchase credits or wait for monthly refresh."
- ✅ `needsCredits: true` in response
- ✅ Frontend shows insufficient credits error

---

### Test 3.4: Purchased User Message Limit (20 messages)
**Scenario:** User purchases project and gets higher message limit

**Steps:**
1. Purchase Project A
2. Open Lab
3. Send 20 AI messages in milestone 0
4. Send 21st message

**Expected Results:**
- ✅ Messages 1-20: No credits consumed
- ✅ 21st message: 2 credits deducted
- ✅ `messageLimits.purchasedMessagesPerMilestone: 20`

**Verify in Database:**
```javascript
{
  "isFreeTrial": false,
  "messageLimits": {
    "freeTrialMessagesPerMilestone": 10,
    "purchasedMessagesPerMilestone": 20
  }
}
```

---

### Test 3.5: Message Count Per Milestone
**Scenario:** Message limits reset for each milestone

**Steps:**
1. Start trial on Project A
2. Send 10 messages in milestone 0
3. Purchase project to unlock all milestones
4. Move to milestone 1
5. Send messages in milestone 1

**Expected Results:**
- ✅ Milestone 0: 10 messages used
- ✅ Milestone 1: Starts with 0 messages used
- ✅ Can send 20 messages in milestone 1 (purchased limit)
- ✅ `messageCounts` shows separate counts per milestone:
```javascript
[
  { "milestoneIndex": 0, "count": 10 },
  { "milestoneIndex": 1, "count": 5 }
]
```

---

## 4. Project Purchase Flow

### Test 4.1: Purchase from Catalog
**Scenario:** User buys project directly from catalog

**Steps:**
1. Navigate to `/catalog`
2. Click "Buy Now" on Project A
3. Complete payment (use Razorpay test mode)
4. Check redirect to `/lab/:projectId`

**Expected Results:**
- ✅ Payment successful
- ✅ Purchase record created in MongoDB
- ✅ UserProgress updated: `isFreeTrial: false`
- ✅ All milestones unlocked
- ✅ User can access all features

**Verify in Database:**
```javascript
// Purchases collection
{
  "buyer": "<user_id>",
  "project": "<project_id>",
  "amount": 149,
  "status": "completed"
}

// UserProgress
{
  "isFreeTrial": false,
  "unlockedMilestones": Infinity // or project.milestones.length
}
```

---

### Test 4.2: Purchase from Paywall Modal
**Scenario:** User purchases after hitting milestone lock

**Steps:**
1. Start trial on Project A
2. Try to access milestone 1
3. Paywall modal appears
4. Click "Unlock Full Access - ₹149"
5. Complete payment

**Expected Results:**
- ✅ Paywall shows correct project info and price
- ✅ Payment successful
- ✅ All milestones unlocked immediately
- ✅ User redirected back to Lab with full access

---

## 5. Credit Purchase & Monthly Refresh

### Test 5.1: Monthly Credit Refresh
**Scenario:** User's credits refresh after 30 days

**Steps:**
1. Create user with `credits: 5` and `lastCreditRefresh: 35 days ago`
2. Login or make any API call
3. Check user credits

**Expected Results:**
- ✅ Credits reset to 20
- ✅ `lastCreditRefresh` updated to current date
- ✅ Old credit balance lost (non-stacking)

**Database Before:**
```javascript
{
  "credits": 5,
  "lastCreditRefresh": "2026-03-01T00:00:00Z" // 35 days ago
}
```

**Database After:**
```javascript
{
  "credits": 20,
  "lastCreditRefresh": "2026-04-03T00:00:00Z" // Today
}
```

---

### Test 5.2: Credit Purchase via Razorpay
**Scenario:** User buys credit pack

**Steps:**
1. Navigate to `/buy-credits`
2. Select "Builder Pack - 500 credits for ₹199"
3. Complete payment
4. Check credit balance

**Expected Results:**
- ✅ Payment successful
- ✅ Credits added to user balance
- ✅ Credit transaction recorded
- ✅ UI shows updated credit count

**Note:** This flow needs implementation (currently pending in todo list)

---

## 6. GitHub Integration for Sellers

### Test 6.1: Connect GitHub Account
**Scenario:** Seller connects GitHub for project uploads

**Steps:**
1. Navigate to `/seller/upload`
2. Click "Connect GitHub"
3. Authorize on GitHub OAuth
4. Check callback handling

**Expected Results:**
- ✅ Redirect to GitHub authorization URL
- ✅ After authorization, callback received
- ✅ `githubCallback` endpoint called
- ✅ User record updated:
  - `githubConnected: true`
  - `githubUsername: "<username>"`
  - `githubAccessToken: <encrypted>`
- ✅ UI shows "GitHub Connected"

---

### Test 6.2: GitHub Token Persistence
**Scenario:** GitHub connection persists across sessions

**Steps:**
1. Connect GitHub
2. Close browser
3. Reopen and navigate to `/seller/upload`
4. Check if GitHub still shows as connected

**Expected Results:**
- ✅ `checkGitHubStatus` returns `connected: true`
- ✅ No need to reconnect
- ✅ Can fetch repositories immediately

---

### Test 6.3: Fetch Repositories
**Scenario:** Seller fetches their GitHub repos

**Steps:**
1. Connect GitHub
2. Click "Fetch Repositories"
3. Check if repos load

**Expected Results:**
- ✅ Returns list of user's repositories
- ✅ Each repo shows: name, description, language, visibility
- ✅ No 401 errors

---

### Test 6.4: Fix Verification - 401 Error
**Scenario:** Verify the 401 error fix from token storage issue

**Steps:**
1. Login as seller
2. Navigate to `/seller/upload`
3. Check network tab for `/api/v1/github/status`
4. Verify Authorization header is sent

**Expected Results:**
- ✅ Request includes `Authorization: Bearer <token>`
- ✅ Token extracted from `auth-storage` in localStorage
- ✅ No 401 errors
- ✅ GitHub status check succeeds

---

## 7. Project Upload & AI Processing

### Test 7.1: Upload Project with GitHub
**Scenario:** Seller uploads project from GitHub repo

**Steps:**
1. Connect GitHub
2. Select repository
3. Select files to include
4. AI generates milestones
5. Set pricing (badge, price)
6. Submit for review

**Expected Results:**
- ✅ Project created in MongoDB
- ✅ `trialSettings` set with defaults:
  - `freeMilestones: 1`
  - `freeMessageLimit: 10`
  - `purchasedMessageLimit: 20`
- ✅ Milestones generated by AI
- ✅ Project status: `pending`

---

## 8. Code Editor & AI Chat

### Test 8.1: AI Chat with Message Tracking
**Scenario:** User interacts with AI tutor

**Steps:**
1. Open Lab for any project
2. Send message: "How do I fix CORS error?"
3. Check message counter
4. Send 9 more messages
5. Verify counter reaches 0

**Expected Results:**
- ✅ AI responds with contextual answer
- ✅ Message counter decrements: 9, 8, 7... 0
- ✅ At 0: Shows "Buy more" button
- ✅ Clicking "Buy more" opens PaywallModal

---

### Test 8.2: AI File Suggestions
**Scenario:** AI suggests code changes

**Steps:**
1. Ask AI: "How do I add a button?"
2. Check if AI suggests file edits
3. Verify files are created/updated automatically

**Expected Results:**
- ✅ AI response includes `suggestedFiles`
- ✅ Files created/updated in editor
- ✅ Confirmation message shown

---

## 9. Milestone Progress & Quizzes

### Test 9.1: Complete Milestone Steps
**Scenario:** User completes all steps in milestone 0

**Steps:**
1. Open Lab
2. Complete each step in milestone 0
3. Check progress auto-save
4. Complete assessment step
5. Quiz modal appears

**Expected Results:**
- ✅ Each step marked as completed
- ✅ Progress saved to backend (debounced 500ms)
- ✅ Quiz modal appears after assessment
- ✅ Can proceed to quiz or skip

---

### Test 9.2: Quiz After Milestone
**Scenario:** User takes quiz to verify knowledge

**Steps:**
1. Complete milestone assessment
2. Quiz modal shows 5 questions
3. Answer all questions
4. Submit quiz

**Expected Results:**
- ✅ Score calculated
- ✅ If 70%+: Can proceed to next milestone
- ✅ If <70%: Can retry or proceed anyway
- ✅ Quiz score saved to UserProgress.quizScores

---

## 10. Edge Cases & Error Handling

### Test 10.1: Concurrent Message Sending
**Scenario:** User rapidly sends multiple messages

**Steps:**
1. Open AI panel
2. Send 5 messages in quick succession (<1 second apart)
3. Check if all are processed correctly

**Expected Results:**
- ✅ All messages queued and processed sequentially
- ✅ No duplicate credit deductions
- ✅ No race conditions in message counting

---

### Test 10.2: Network Failure During AI Request
**Scenario:** API call fails mid-request

**Steps:**
1. Send AI message
2. Simulate network failure (disconnect wifi or mock error)
3. Check error handling

**Expected Results:**
- ✅ Error message shown: "I encountered an error..."
- ✅ Credits NOT deducted (server-side check)
- ✅ User can retry without penalty

---

### Test 10.3: Token Expiry Mid-Session
**Scenario:** JWT token expires while user is in Lab

**Steps:**
1. Login and open Lab
2. Wait for token to expire (or manually invalidate)
3. Try to send AI message

**Expected Results:**
- ✅ Returns 401 error
- ✅ User redirected to `/auth`
- ✅ Clear message: "Session expired, please login again"

---

### Test 10.4: Database Migration for Existing Users
**Scenario:** Existing users have old schema fields

**Steps:**
1. Find user with old `freeMilestoneUnlocks` field
2. Try to start trial on new project
3. Check if migration handles old field

**Expected Results:**
- ✅ Code checks for both `freeTrialProjects` and `freeMilestoneUnlocks`
- ✅ No errors, trial starts successfully
- ⚠️ **RECOMMENDED:** Run migration script to update old users

---

## 🧪 Quick Test Checklist

Use this checklist for rapid validation:

- [ ] New user gets 20 credits
- [ ] Can start trial on 3 different projects
- [ ] 4th trial blocked with proper error
- [ ] 10 free messages per milestone for free users
- [ ] 20 free messages per milestone for purchased users
- [ ] Credits deducted after message limit (2 per message)
- [ ] Paywall modal appears when appropriate
- [ ] Monthly credit refresh works (30-day cycle)
- [ ] GitHub connection persists across sessions
- [ ] No 401 errors on GitHub status check
- [ ] AI chat shows message counter
- [ ] Milestone locking works for free users
- [ ] Purchase unlocks all milestones
- [ ] Progress auto-saves correctly

---

## 🐛 Known Issues to Watch

1. **Credit Sync:** Credits in `useLabStore` vs `useAuthStore` may temporarily differ. Server is source of truth.
2. **Message Counter UI:** May not update instantly. Refresh page to see accurate count.
3. **Razorpay Integration:** Test mode uses dummy cards. Use: `4111 1111 1111 1111`

---

## 📊 Success Metrics

After running all tests, you should see:

- **Free Trial Conversion Rate:** 15-20% of trial users purchase
- **Message Limit Hit Rate:** 60% of free users hit 10-message limit
- **Credit Purchase Rate:** 30% of users buy additional credits
- **GitHub Connection Rate:** 80% of sellers connect GitHub
- **AI Chat Satisfaction:** 85%+ positive responses

---

*End of Test Scenarios Document*
