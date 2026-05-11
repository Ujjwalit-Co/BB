import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

_API_KEY = os.getenv("GEMINI_API_KEY")
_API_URL = (
    f"https://generativelanguage.googleapis.com/v1beta/models/"
    f"gemini-2.5-flash:generateContent?key={_API_KEY}"
)


# ──────────────────────────────────────────────
# Shared helper: builds compact project context
# ──────────────────────────────────────────────
def _build_project_context(project: dict, max_len: int = 400) -> str:
    """Build compact context string. Truncates to max_len chars."""
    title = project.get('title', 'Unknown')[:80]
    level = project.get('level', 'Intermediate')
    summary = project.get('summary', project.get('description', ''))[:max_len]
    tech = project.get('technology', project.get('techStack', []))
    tech_str = ', '.join(map(str, tech[:8])) if isinstance(tech, list) else str(tech)[:80]
    
    return f"Title:{title}\nLevel:{level}\nSummary:{summary}\nTech:{tech_str}"


def _call_gemini(prompt: str) -> str:
    if not _API_KEY:
        raise ValueError("GEMINI_API_KEY environment variable not set.")

    payload = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    headers = {"Content-Type": "application/json"}

    try:
        response = requests.post(_API_URL, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]
    except requests.exceptions.RequestException as e:
        error_msg = response.json().get("error", {}).get("message", str(e))
        raise ConnectionError(f"Gemini API request failed: {error_msg}") from e
    except (KeyError, IndexError, json.JSONDecodeError) as e:
        raise ValueError(f"Unexpected Gemini API response: {response.text}") from e


def _call_gemini_json(prompt: str):
    if not _API_KEY:
        raise ValueError("GEMINI_API_KEY environment variable not set.")

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 0.2, # Lower temperature for more stable JSON
        },
    }
    headers = {"Content-Type": "application/json"}

    try:
        response = requests.post(_API_URL, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        
        if not data.get("candidates") or not data["candidates"][0].get("content"):
            raise ValueError(f"Empty Gemini response: {response.text}")
            
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        
        # Robustly extract JSON from potential markdown wrappers
        if "```" in text:
            import re
            json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
            if json_match:
                text = json_match.group(1)
        
        # Clean up any potential control characters that JSON.parse might hate
        text = text.strip()
        
        try:
            return json.loads(text)
        except json.JSONDecodeError as je:
            # Last ditch effort: try to find the first [ or { and last ] or }
            start_idx = min(text.find('['), text.find('{')) if text.find('[') != -1 and text.find('{') != -1 else (text.find('[') if text.find('[') != -1 else text.find('{'))
            end_idx = max(text.rfind(']'), text.rfind('}'))
            if start_idx != -1 and end_idx != -1:
                try:
                    return json.loads(text[start_idx:end_idx+1])
                except:
                    pass
            raise je
            
    except requests.exceptions.RequestException as e:
        error_info = response.json() if 'response' in locals() and response.content else str(e)
        raise ConnectionError(f"Gemini API request failed: {error_info}") from e


def _normalize_quiz_questions(raw_data) -> list[dict]:
    """Resiliently normalize quiz data from various possible Gemini outputs."""
    questions = []
    
    # Extract the list of questions from whatever wrapper Gemini used
    if isinstance(raw_data, list):
        questions = raw_data
    elif isinstance(raw_data, dict):
        # Look for common list keys
        for key in ["questions", "quiz", "data", "mcqs"]:
            if isinstance(raw_data.get(key), list):
                questions = raw_data[key]
                break
        if not questions:
            # If still nothing, maybe the dict IS a single question? (rare but possible)
            if "question" in raw_data and "options" in raw_data:
                questions = [raw_data]
    
    if not isinstance(questions, list):
        return []

    normalized = []
    for item in questions:
        if not isinstance(item, dict):
            continue
            
        q_text = item.get("question")
        opts = item.get("options")
        # Try all variations of correct answer key
        raw_correct = item.get("correctAnswer")
        if raw_correct is None: raw_correct = item.get("correct_answer")
        if raw_correct is None: raw_correct = item.get("answer")
        
        expl = item.get("explanation", "")

        if not q_text or not isinstance(opts, list) or len(opts) < 2:
            continue

        # Clean options
        clean_opts = [str(o).strip() for o in opts if o is not None]
        if len(clean_opts) < 2: continue

        # Resolve correct answer to index
        correct_idx = 0
        if isinstance(raw_correct, int):
            correct_idx = raw_correct
        elif isinstance(raw_correct, str):
            # Try matching string to option content
            try:
                # Direct match
                if raw_correct in clean_opts:
                    correct_idx = clean_opts.index(raw_correct)
                else:
                    # Case-insensitive match
                    lower_correct = raw_correct.lower()
                    for i, opt in enumerate(clean_opts):
                        if opt.lower() == lower_correct:
                            correct_idx = i
                            break
                    else:
                        # Try parsing as number
                        parsed = int(raw_correct)
                        correct_idx = parsed
            except:
                correct_idx = 0 # Fallback
                
        # Bound check
        if correct_idx < 0 or correct_idx >= len(clean_opts):
            correct_idx = 0

        normalized.append({
            "question": str(q_text).strip(),
            "options": clean_opts,
            "correctAnswer": int(correct_idx),
            "explanation": str(expl).strip()
        })

    return normalized


# ──────────────────────────────────────────────
# 1. Project Overview
# ──────────────────────────────────────────────
def get_project_overview(project: dict) -> str:
    ctx = _build_project_context(project, max_len=500)
    milestones = project.get("milestones", [])
    ml_text = "\n".join(f"M{i+1}:{m['name']} - {m['description'][:100]}" for i, m in enumerate(milestones[:5]))
    
    prompt = f"""You are BrainBazaar's project-course mentor.
BrainBazaar helps learners become independent by rebuilding real student projects milestone by milestone.

Project:{ctx}
Milestones:{ml_text}

Task:Create comprehensive overview with sections:
## What You Will Build
## What You Will Learn  
## Prerequisites
## Setup Checklist
## Project Roadmap

Rules:
- Simple language for {project.get('level', 'Intermediate').lower()} level
- Practical, encouraging tone
- Markdown format only
""".strip()

    return _call_gemini(prompt)


# ──────────────────────────────────────────────
# 2. Milestone Step-by-Step Guide
# ──────────────────────────────────────────────
def get_milestone_guide(project: dict, milestone_number: int, milestone: dict) -> str:
    ctx = _build_project_context(project, max_len=400)
    total = len(project.get("milestones", []))
    
    prompt = f"""You are BrainBazaar's Socratic AI guide.
Mission: help the learner understand and rebuild this real project. Do not hand over final solutions.

Project:{ctx}
Milestone {milestone_number}/{total}:{milestone['name']}
Goal:{milestone['description']}

Task:Create detailed step-by-step guide with sections:
## Overview
## Why This Matters In The Real Project
## Step-by-Step Instructions
## Run It Locally / In The Lab
## How to Test
## Common Mistakes
## ✅ Done Checklist

Rules:
- Teach the journey, not a copy-paste solution
- Prefer project-specific files, capabilities, and commands over generic tutorial advice
- Numbered steps with small scaffold snippets only when necessary
- Assume previous milestones completed
- Include browser lab and local terminal options when relevant
- Top 3 pitfalls
- 5 checklist items
- Markdown format
""".strip()

    return _call_gemini(prompt)


# ──────────────────────────────────────────────
# 3. Hint (nudge without spoiling)
# ──────────────────────────────────────────────
def get_milestone_hint(project: dict, milestone_number: int, milestone: dict) -> str:
    ctx = _build_project_context(project, max_len=200)
    
    prompt = f"""You are BrainBazaar's Socratic AI guide.
Mission: help the learner understand and rebuild this real project. Do not hand over final solutions.

Project:{ctx}
Stuck:Milestone {milestone_number}:{milestone['name']}
Goal:{milestone['description']}

Task:Give ONE hint without revealing full solution.
Rules:
- 2-3 sentences max
- No code
- Encouraging tone
""".strip()

    return _call_gemini(prompt)


# ──────────────────────────────────────────────
# 4. Ask a Question (contextual Q&A)
# ──────────────────────────────────────────────
def ask_milestone_question(
    project: dict, milestone_number: int, milestone: dict, question: str, files: list = None, lab_mode: str = "browser"
) -> dict:
    ctx = _build_project_context(project, max_len=300)
    
    # Build file context with more generous limits
    user_code = ""
    if files:
        snippets = []
        for f in files[:6]:  # Up to 6 files
            name = f.get("name", "")[:40]
            content = f.get("content", "")[:1000]  # 1000 chars per file
            snippets.append(f"[{name}]:{content[:800]}...")
        user_code = "\n".join(snippets)
    
    env_hint = "browser" if lab_mode == "browser" else "local IDE"
    
    prompt = f"""You are BrainBazaar's Socratic AI guide.
Mission: help the learner understand and rebuild this real project. Do not hand over final solutions.

Project:{ctx}
Milestone {milestone_number}:{milestone['name']}
Goal:{milestone['description']}
Env:{env_hint}

User Question:{question}

{f"User Code:\n{user_code}" if user_code else ""}

Task:Answer as Socratic tutor. Output JSON:
{{
  "answer":"Brief practical guidance that explains the next thinking step and connects it to the real project capability.",
  "suggestedFiles":[{{"name":"file.ext","action":"create|edit","suggestedCode":"// Minimal scaffold only"}}],
  "suggestedCommands":["npm run dev"]
}}

Rules:
- Guide, don't solve. Ask one useful checking question when the learner is stuck
- Analyze user's code if provided and mention exact files when helpful
- If the project needs packages/backend/runtime, suggest WebContainer shell commands or local terminal commands
- Never suggest persisting node_modules, pycache, build output, secrets, or logs
- Brief, specific answer
- JSON only
""".strip()

    return _call_gemini_json(prompt)


# ──────────────────────────────────────────────
# 5. Milestone Completion Message
# ──────────────────────────────────────────────
def get_milestone_completion(project: dict, milestone_number: int, milestone: dict) -> str:
    total = len(project.get("milestones", []))
    is_last = milestone_number == total
    ctx = _build_project_context(project, max_len=200)

    prompt = f"""Project:{ctx}
Completed:M{milestone_number}/{total}:{milestone['name']}
Goal:{milestone['description']}
{"FINAL" if is_last else f"Next:M{milestone_number+1}"}

Task:Motivating response.
Rules:
- Congratulate (1 sentence)
- Summarize achievement (1-2 sentences)
- {"Project complete - suggest next steps" if is_last else f"Preview M{milestone_number+1}"}
- Warm, brief, markdown
""".strip()

    return _call_gemini(prompt)


# ──────────────────────────────────────────────
# 6. Step-Level Functions
# ──────────────────────────────────────────────
def explain_step_code(project: dict, milestone_number: int, step: dict) -> str:
    ctx = _build_project_context(project, max_len=200)
    
    # More generous code context
    code_info = ""
    if step.get("codeBlocks"):
        for cb in step["codeBlocks"][:4]:
            code = cb['code'][:1000] if len(cb['code']) > 1000 else cb['code']
            code_info += f"\n{cb['fileName']}({cb['language']}):{code}..."

    prompt = f"""Project:{ctx}
M{milestone_number} Step{step['stepNumber']}:{step['title']}
Goal:{step['description']}
Verify:{step['verificationSteps']}
{f"Code:{code_info}" if code_info else "Setup/CLI step"}

Task:Explain this step.
Rules:
- What + why it matters
- Key code parts (if any)
- How to verify
- Common issues
- Markdown, concise
""".strip()

    return _call_gemini(prompt)


def ask_step_question(project: dict, milestone_number: int, step: dict, question: str) -> str:
    ctx = _build_project_context(project, max_len=200)
    
    prompt = f"""Project:{ctx}
M{milestone_number} Step{step['stepNumber']}:{step['title']}
Goal:{step['description']}

Q:{question}

Task:Answer for this step only.
Rules:
- Practical, direct
- Code examples if relevant
- Browser IDE: suggest local terminal for backend
- Markdown, focused
""".strip()

    return _call_gemini(prompt)


def get_step_completion_message(
    project: dict, milestone_number: int, step: dict, total_steps: int
) -> str:
    ctx = _build_project_context(project, max_len=150)
    is_last = step["stepNumber"] == total_steps
    
    prompt = f"""Project:{ctx}
Completed:M{milestone_number} Step{step['stepNumber']}/{total_steps}:{step['title']}
Goal:{step['description']}
{"FINAL STEP" if is_last else f"Next:Step{step['stepNumber']+1}"}

Task:Encouraging response.
Rules:
- Celebrate (1 sentence)
- Summarize (1 sentence)
- {"Milestone complete - suggest next steps" if is_last else f"Preview Step{step['stepNumber']+1}"}
- Brief, warm, markdown
""".strip()

    return _call_gemini(prompt)


def generate_project_quiz(project: dict, num_questions: int = 5) -> list[dict]:
    ctx = _build_project_context(project, max_len=300)
    milestones = project.get("milestones", [])[:5]
    ml_text = "\n".join(f"M{i+1}:{m.get('name', m.get('title', ''))} - {m.get('description', '')[:80]}" for i, m in enumerate(milestones))
    
    prompt = f"""SYSTEM: You are an Elite Technical Assessor at a top-tier coding bootcamp.
PROJECT CONTEXT:
{ctx}
ROADMAP:
{ml_text}

TASK: Generate {num_questions} high-quality Multiple Choice Questions (MCQs) for a final project assessment.

THINKING PHASE:
1. Identify the core architectural patterns used in this project.
2. Pinpoint the most common mistakes beginners make when integrating these technologies.
3. Design questions that test "Why" decisions were made, not just "What" a syntax does.

OUTPUT REQUIREMENTS (JSON ONLY):
[
  {{
    "question": "A scenario-based question testing architectural integration.",
    "options": ["Plausible but wrong", "Correct architectural reason", "Syntax-correct but logically flawed", "Irrelevant distractor"],
    "correctAnswer": 1,
    "explanation": "Explain why the correct answer is the best choice and debunk the logic of common pitfalls."
  }}
]

STRICT RULES:
- Zero pre-amble.
- Exactly 4 options.
- correctAnswer MUST be a number (0-3).
- Focus on: Data flow, State management, API integration, and Security.
""".strip()

    raw_quiz = _call_gemini_json(prompt)
    normalized = _normalize_quiz_questions(raw_quiz)
    if not normalized:
        raise ValueError("Gemini returned invalid quiz format.")
    return normalized[:num_questions]


def generate_milestone_quiz(
    project: dict, milestone_number: int, milestone: dict, num_questions: int = 5
) -> list[dict]:
    ctx = _build_project_context(project, max_len=200)
    steps = milestone.get("steps", [])[:4]
    st_text = "\n".join(f"Step {s.get('stepNumber')}: {s.get('title', '')}" for s in steps)
    
    prompt = f"""SYSTEM: You are BrainBazaar's Socratic Technical Mentor.
BrainBazaar assessments verify that a student can independently explain and rebuild a real project capability.
PROJECT: {ctx}
MILESTONE {milestone_number}: {milestone.get('title', milestone.get('name', ''))}
GOAL: {milestone.get('description', '')}

STEPS COMPLETED:
{st_text if st_text else "General milestone objectives"}

TASK: Generate {num_questions} MCQs to verify conceptual mastery of THIS milestone and its real project capability.

THINKING PHASE:
1. What was the 'Aha!' moment in this specific milestone?
2. What technical debt or bugs would occur if a student skipped a step?
3. Create distractors based on those common 'shortcuts' students take.

OUTPUT REQUIREMENTS (JSON ONLY):
[
  {{
    "question": "Question targeting a specific challenge in the milestone.",
    "options": ["The 'shortcut' answer (wrong)", "The 'brute-force' answer (wrong)", "The 'best-practice' answer (correct)", "The 'outdated' answer (wrong)"],
    "correctAnswer": 2,
    "explanation": "Reinforce the 'Aha!' moment and best practice."
  }}
]

STRICT RULES:
- No conversational text, only the JSON array.
- correctAnswer MUST be a number (0-3).
- High technical accuracy.
- Prefer scenario questions about implementation choices, debugging, testing, and local/lab workflow.
""".strip()

    raw_quiz = _call_gemini_json(prompt)
    normalized = _normalize_quiz_questions(raw_quiz)
    if not normalized:
        raise ValueError("Gemini returned invalid quiz format.")
    return normalized[:num_questions]


# ──────────────────────────────────────────────
# 7. Enhancement Endpoints
# ──────────────────────────────────────────────
def enhance_readme(readme_content: str) -> str:
    prompt = f"""Task:Enhance README for learning project.
Rules:
- Add badges, prerequisites, clear instructions
- Professional, encouraging tone
- Markdown only

README:{readme_content[:3000]}
""".strip()
    return _call_gemini(prompt)


def enhance_summary(summary_content: str, context: str = "") -> str:
    prompt = f"""Task:Enhance summary. Concise, marketing-friendly.
Rules:
- Under 3 sentences
- No markdown

{f"Context:{context[:1000]}" if context else ""}
Summary:{summary_content}
""".strip()
    return _call_gemini(prompt)


def enhance_milestones(milestones: list, context: str = "") -> list:
    prompt = f"""Task:Enhance milestones. Keep structure.
Rules:
- 2-4 concrete steps per milestone
- Fix typos in name/description
- Add estimatedTime like "1-2 hours"
- Valid JSON array only

{f"Context:{context[:1000]}" if context else ""}
Milestones:{json.dumps(milestones)[:3500]}
""".strip()
    return _call_gemini_json(prompt)
