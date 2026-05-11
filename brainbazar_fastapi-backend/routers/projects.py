from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services import data_service, gemini_service
from models.schemas import ProjectSummary, AIResponse, ProjectQuizResponse

router = APIRouter()


# ─── Pydantic model for generate-overview request ───
class GenerateOverviewRequest(BaseModel):
    readme_content: str
    code_files: list = []
    tech_stack: list = []


@router.post("/generate-overview")
def generate_overview(req: GenerateOverviewRequest):
    """Generate AI milestones + summary from readme and code files for a new project upload."""
    try:
        # Build code context string
        code_context = ""
        if req.code_files:
            for cf in req.code_files[:5]:  # Limit to 5 files for token budget
                path = cf.get("path", cf.get("filename", "file"))
                content = cf.get("content", "")[:2000]  # Limit content size
                code_context += f"\n--- {path} ---\n{content}\n"

        tech_str = ", ".join(req.tech_stack) if req.tech_stack else "Unknown"

        prompt = f"""
You are a Senior Project Architect and Curriculum Designer.
Your task is to transform a raw codebase into a high-quality, project-based learning course.
BrainBazaar's core promise: students do not buy finished projects; they learn the journey of rebuilding real projects until they become independent builders.

CONTEXT:
Tech Stack: {tech_str}
{f"README Content: {req.readme_content[:2000]}" if req.readme_content else "No README provided."}
{f"Code Structure Overview: {code_context}" if code_context else "Minimal code provided."}

OBJECTIVE:
Generate a structured learning roadmap that guides a student from zero to a fully functional build, with milestones based on the real capabilities of this project.

REQUIRED OUTPUT (JSON ONLY):
{{
  "readme": "A professional, updated README.md in GitHub flavor markdown.",
  "summary": "A high-impact, 2-sentence marketing summary for the marketplace.",
  "milestones": [
    {{
      "title": "Clear, Milestone Title (e.g., 'Phase 1: Environment Setup')",
      "description": "The specific objective of this phase.",
      "estimatedTime": "e.g., '45 min'",
      "steps": [
        {{
          "stepNumber": 1,
          "title": "Action-oriented step title",
          "description": "High-level goal of this step.",
          "instructions": "Step-by-step technical instructions. Use markdown bullet points (-). Be precise.",
          "verificationSteps": "Specific command or visual check to confirm success.",
          "hints": "A strategic hint to help if stuck."
        }}
      ]
    }}
  ]
}}

STRICT GUIDELINES:
1. CURRICULUM DEPTH: Generate 5-15 milestones depending on project complexity. Do not skip logic implementation or local setup.
2. STEP GRANULARITY: Each milestone must have 2-4 concrete, logical steps that map to actual project capabilities.
3. VALID JSON: Ensure the entire response is a perfectly valid JSON object. No pre-amble or post-amble text.
4. TONE: Professional, encouraging, and technically accurate.
5. SAFETY: Never include node_modules, pycache, build output, logs, secrets, or generated dependency folders as learning files.
""".strip()

        result = gemini_service._call_gemini_json(prompt)

        return {
            "success": True,
            "readme": result.get("readme", ""),
            "milestones": result.get("milestones", []),
            "summary": result.get("summary", req.readme_content[:300]),
        }
    except Exception as e:
        # Fallback milestones if Gemini fails
        fallback_milestones = [
            {
                "title": "Project Setup & Environment",
                "description": "Set up the development environment, install dependencies, and configure the project structure.",
                "estimatedTime": "30 min",
                "steps": [{"stepNumber": 1, "title": "Initialize project", "description": "Set up the project structure and install dependencies"}],
            },
            {
                "title": "Core Implementation",
                "description": "Build the main functionality and core logic of the application.",
                "estimatedTime": "1-2 hours",
                "steps": [{"stepNumber": 1, "title": "Implement core logic", "description": "Build the primary features"}],
            },
            {
                "title": "UI & Frontend",
                "description": "Create the user interface and connect it to the backend services.",
                "estimatedTime": "1-2 hours",
                "steps": [{"stepNumber": 1, "title": "Build UI", "description": "Create the frontend interface"}],
            },
            {
                "title": "Testing & Deployment",
                "description": "Write tests, fix bugs, and prepare the project for deployment.",
                "estimatedTime": "1 hour",
                "steps": [{"stepNumber": 1, "title": "Test and deploy", "description": "Write tests and deploy the application"}],
            },
        ]
        return {
            "success": True,
            "milestones": fallback_milestones,
            "summary": req.readme_content[:300] if req.readme_content else "Project overview",
        }


@router.get("/", response_model=list[ProjectSummary])
def list_projects():
    """Return all projects as lightweight cards (no milestones)."""
    projects = data_service.load_projects()
    return [
        {
            "id": p["id"],
            "title": p["title"],
            "level": p["level"],
            "summary": p["summary"],
            "technology": p["technology"],
            "tags": p["tags"],
            "price": p["price"],
            "isOnSale": p.get("isOnSale", False),
            "originalPrice": p.get("originalPrice"),
        }
        for p in projects
    ]


@router.get("/{project_id}")
def get_project(project_id: str):
    """Return full project details including all milestones."""
    project = data_service.get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found")
    return project


@router.get("/{project_id}/overview", response_model=AIResponse)
def get_project_overview(project_id: str):
    """
    AI-generated overview of the project:
    what you'll build, what you'll learn, prerequisites, setup checklist, and roadmap.
    """
    project = data_service.get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found")

    content = gemini_service.get_project_overview(project)
    return {"project_id": project_id, "title": project["title"], "content": content}


@router.get("/{project_id}/quiz", response_model=ProjectQuizResponse)
def get_project_quiz(project_id: str, num_questions: int = 5):
    """
    AI-generated quiz for the full project.
    """
    if num_questions < 1 or num_questions > 20:
        raise HTTPException(status_code=400, detail="num_questions must be between 1 and 20")

    project = data_service.get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found")

    quiz = gemini_service.generate_project_quiz(project, num_questions)
    return {
        "project_id": project_id,
        "title": project["title"],
        "total_questions": len(quiz),
        "questions": quiz,  # Changed from quiz to questions
    }

# ──────────────────────────────────────────────
# Enhance Endpoints for Seller Portal Uploads
# ──────────────────────────────────────────────

class EnhanceReadmeReq(BaseModel):
    readme: str

class EnhanceSummaryReq(BaseModel):
    summary: str
    readme: str = ""

class EnhanceMilestonesReq(BaseModel):
    milestones: list
    readme: str = ""

@router.post("/enhance-readme")
def enhance_readme(req: EnhanceReadmeReq):
    try:
        content = gemini_service.enhance_readme(req.readme)
        return {"success": True, "content": content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/enhance-summary")
def enhance_summary(req: EnhanceSummaryReq):
    try:
        content = gemini_service.enhance_summary(req.summary, req.readme)
        return {"success": True, "content": content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/enhance-milestones")
def enhance_milestones(req: EnhanceMilestonesReq):
    try:
        content = gemini_service.enhance_milestones(req.milestones, req.readme)
        return {"success": True, "content": content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class GenerateQuizReq(BaseModel):
    project: dict
    milestone_number: int
    milestone: dict
    num_questions: int = 5

@router.post("/generate-quiz")
def generate_quiz_endpoint(req: GenerateQuizReq):
    try:
        quiz = gemini_service.generate_milestone_quiz(
            req.project, req.milestone_number, req.milestone, req.num_questions
        )
        return {"success": True, "quiz": quiz}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
