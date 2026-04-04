# 🚀 BrainBazaar - Render Deployment Guide

## 📋 Prerequisites

- [ ] GitHub repository with all code pushed
- [ ] MongoDB Atlas cluster (free tier works)
- [ ] Render account at [render.com](https://render.com)
- [ ] OpenAI/Gemini API key for AI features
- [ ] Cloudinary account for image storage
- [ ] Razorpay account for payments (optional for testing)

---

## 🏗️ Architecture on Render

```
┌─────────────────────────────────────────────────────────────┐
│                    Render Blueprint                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐    ┌──────────────────┐               │
│  │   Frontend       │    │   Node.js Server │               │
│  │   (Static Site)  │───▶│   (Web Service)  │               │
│  │   brainbazaar-   │    │   brainbazaar-   │               │
│  │   frontend       │    │   server         │               │
│  │                  │    │   :5000          │               │
│  │   :443 (HTTPS)   │    └────────┬─────────┘               │
│  └──────────────────┘             │                          │
│                                   │                          │
│                          ┌────────▼─────────┐               │
│                          │   FastAPI Server │               │
│                          │   (Web Service)  │               │
│                          │   brainbazaar-   │               │
│                          │   fastapi        │               │
│                          │   :8000          │               │
│                          └──────────────────┘               │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────┐
│  MongoDB Atlas   │
│  (External)      │
└──────────────────┘
```

---

## 📦 Step-by-Step Deployment

### Step 1: Push Code to GitHub

```bash
cd "C:\Users\Daksh Dixit\Desktop\BrainBazaar"
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

---

### Step 2: Create MongoDB Atlas Database

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a **free M0 cluster**
3. Click **Connect** → **Connect your application**
4. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/brainbazaar?retryWrites=true&w=majority
   ```
5. Create database user and whitelist Render IPs (or use `0.0.0.0/0` for testing)

---

### Step 3: Deploy via Render Blueprint

1. **Login to Render** → [Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will auto-detect `render.yaml`
5. Fill in the required environment variables (see below)
6. Click **"Apply"**

Render will deploy all 3 services automatically!

---

## 🔑 Environment Variables to Set Manually

### Frontend (`brainbazaar-frontend`)
```
VITE_EXPRESS_API_URL=https://brainbazaar-server.onrender.com
VITE_FASTAPI_URL=https://brainbazaar-fastapi.onrender.com
```

### Node.js Server (`brainbazaar-server`)
```
MONGODB_URI=mongodb+srv://user:pass@cluster0.mongodb.net/brainbazaar
JWT_SECRET=super-secret-jwt-key-change-this
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_ENCRYPTION_KEY=32-character-random-string
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your-razorpay-secret
FRONTEND_URL=https://brainbazaar-frontend.onrender.com
FASTAPI_URL=https://brainbazaar-fastapi.onrender.com
```

### FastAPI Backend (`brainbazaar-fastapi`)
```
OPENAI_API_KEY=sk-proj-xxxxx
GEMINI_API_KEY=AIzaSy-xxxxx
FRONTEND_URL=https://brainbazaar-frontend.onrender.com
EXPRESS_API_URL=https://brainbazaar-server.onrender.com
```

---

## 💰 Cost Breakdown

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| Frontend (Static) | Free | $0 |
| Node.js Backend | Free | $0 |
| FastAPI Backend | Free | $0 |
| MongoDB Atlas (M0) | Free | $0 |
| **Total** | | **$0/month** 🎉 |

**Note:** Free tier services spin down after 15 mins of inactivity. First request after spin-down takes ~30 seconds.

### Paid Tier (Recommended for Production)

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| Frontend (Static) | Free | $0 |
| Node.js Backend | Starter | $7/mo |
| FastAPI Backend | Starter | $7/mo |
| MongoDB Atlas (M10) | Paid | $57/mo |
| **Total** | | **$71/month** |

---

## 🔄 Update Your Code After Deployment

### 1. Update Frontend API URLs

After deployment, update the `.env` file in frontend:

```env
VITE_EXPRESS_API_URL=https://brainbazaar-server.onrender.com/api/v1
VITE_FASTAPI_URL=https://brainbazaar-fastapi.onrender.com
```

### 2. Update CORS in FastAPI

In `brainbazar_fastapi-backend/main.py`, update CORS origins:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://brainbazaar-frontend.onrender.com",
        "https://brainbazaar-server.onrender.com",
        "http://localhost:5173",  # Keep for local dev
    ],
    ...
)
```

### 3. Update CORS in Node.js Server

In `server/app.js`:

```javascript
app.use(cors({
  origin: [
    'https://brainbazaar-frontend.onrender.com',
    'http://localhost:5173',
  ],
  credentials: true,
}));
```

---

## 🧪 Post-Deployment Testing Checklist

- [ ] Frontend loads at `https://brainbazaar-frontend.onrender.com`
- [ ] Node.js health check: `https://brainbazaar-server.onrender.com/ping`
- [ ] FastAPI docs: `https://brainbazaar-fastapi.onrender.com/docs`
- [ ] User registration works
- [ ] GitHub OAuth connection works
- [ ] Project upload works
- [ ] AI chat responds correctly
- [ ] Payment flow (test mode)
- [ ] Lab environment loads

---

## ⚠️ Common Issues & Fixes

### 1. Frontend 404 on Refresh

**Fix:** Already handled in `render.yaml` with rewrite rule.

### 2. CORS Errors

**Fix:** Ensure all services have correct `FRONTEND_URL` and `EXPRESS_API_URL` set.

### 3. MongoDB Connection Failed

**Fix:** 
- Check `MONGODB_URI` is correct
- Whitelist `0.0.0.0/0` in MongoDB Atlas network access
- Ensure database user has readWrite permissions

### 4. AI Features Not Working

**Fix:**
- Verify `OPENAI_API_KEY` or `GEMINI_API_KEY` is set
- Check FastAPI logs in Render dashboard

### 5. Free Tier Spin-Down Timeout

**Fix:** Upgrade to Starter plan ($7/mo) for always-on services.

---

## 🚀 Deploy Commands (Alternative Manual Method)

If Blueprint doesn't work, deploy manually:

```bash
# Install Render CLI
npm install -g @render-cloud/cli

# Login
render login

# Deploy each service
render deploy frontend --root-dir frontend --build-command "npm install && npm run build"
render deploy server --root-dir server --build-command "npm install" --start-command "node server.js"
render deploy fastapi --root-dir brainbazar_fastapi-backend --build-command "pip install -r requirements.txt" --start-command "uvicorn main:app --host 0.0.0.0 --port $PORT"
```

---

## 📊 Monitoring Your Deployment

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click each service → **Logs** tab
3. Monitor:
   - Build logs (during deployment)
   - Runtime logs (after deployment)
   - Health checks
   - Resource usage

---

## 🎯 Next Steps

1. Set up **custom domain** (optional)
2. Configure **auto-deploy on git push**
3. Set up **email notifications** for build failures
4. Add **health check endpoints**
5. Configure **rate limiting** for production

---

*Need help? Check [Render Docs](https://render.com/docs) or contact support.*
