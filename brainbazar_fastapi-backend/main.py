import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import projects, milestones

# Get environment variables
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
EXPRESS_API_URL = os.getenv("EXPRESS_API_URL", "http://localhost:5000")

app = FastAPI(
    title="BrainBazaar AI Project Guide API",
    description="AI-powered project mentor using Gemini. Guides users through building projects milestone by milestone.",
    version="1.0.0",
)

# CORS Configuration - Specific origins for security
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        EXPRESS_API_URL,
        "http://localhost:5173",
        "http://localhost:5000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router, prefix="/projects", tags=["Projects"])
app.include_router(milestones.router, prefix="/projects", tags=["Milestones"])

@app.get("/", tags=["Health"])
def root():
    return {
        "message": "BrainBazaar AI Project Guide API is running",
        "docs": "/docs",
        "version": "1.0.0"
    }
