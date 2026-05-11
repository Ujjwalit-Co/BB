from pydantic import BaseModel
from typing import Optional, List


class CodeBlock(BaseModel):
    fileName: str
    language: str  # javascript, python, json, bash, sql, etc.
    code: str


class Step(BaseModel):
    stepNumber: int
    title: str
    description: str
    verificationSteps: str
    hints: str
    codeBlocks: List[CodeBlock] = []


class Milestone(BaseModel):
    name: str
    description: str
    steps: Optional[List[Step]] = None  # New structure with steps


class Project(BaseModel):
    id: str
    title: str
    level: str
    summary: str
    technology: List[str]
    tags: List[str]
    price: str
    isOnSale: Optional[bool] = False
    originalPrice: Optional[str] = None
    image: Optional[str] = None
    youtube: Optional[str] = None
    milestones: List[Milestone]
    contextReadmeLink: Optional[str] = None


class ProjectSummary(BaseModel):
    """Lightweight project card — no milestones, used for list view"""
    id: str
    title: str
    level: str
    summary: str
    technology: List[str]
    tags: List[str]
    price: str
    isOnSale: Optional[bool] = False
    originalPrice: Optional[str] = None


class AskRequestFile(BaseModel):
    name: str
    content: str
    language: Optional[str] = None

class AskRequest(BaseModel):
    question: str
    files: Optional[List[AskRequestFile]] = []
    lab_mode: Optional[str] = "browser"  # Indicates physical environment constraints
    project_context: Optional[dict] = None # Optional context for external projects


class AIResponse(BaseModel):
    project_id: str
    title: str
    content: str


class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correctAnswer: int  # Index of correct option (0-based)
    explanation: Optional[str] = None


class ProjectQuizResponse(BaseModel):
    project_id: str
    title: str
    total_questions: int
    questions: List[QuizQuestion]  # Changed from quiz to questions for consistency


class MilestoneQuizResponse(BaseModel):
    project_id: str
    milestone_number: int
    milestone_name: str
    total_questions: int
    questions: List[QuizQuestion]  # Changed from quiz to questions for consistency


class MilestoneAIResponse(BaseModel):
    project_id: str
    milestone_number: int
    milestone_name: str
    content: str


class StepResponse(BaseModel):
    project_id: str
    milestone_number: int
    step_number: int
    step_title: str
    step_description: str
    codeBlocks: List[CodeBlock]
    verificationSteps: str
    hints: str
    guidance: Optional[str] = None  # AI-generated explanation


class StepGuidanceResponse(BaseModel):
    project_id: str
    milestone_number: int
    step_number: int
    step_title: str
    content: str  # Markdown explanation from Gemini


class MilestoneAskResponse(BaseModel):
    """Milestone-level ask response (no step)"""
    project_id: str
    milestone_number: int
    question: str
    answer: str


class StepAskResponse(BaseModel):
    """Step-level ask response (with step)"""
    project_id: str
    milestone_number: int
    step_number: int
    question: str
    answer: str


class StepCompleteResponse(BaseModel):
    project_id: str
    milestone_number: int
    step_number: int
    message: str
    next_step_preview: Optional[str] = None


class CompletionResponse(BaseModel):
    project_id: str
    milestone_number: int
    message: str


class StructuredAIResponse(BaseModel):
    """Structured AI response with code suggestions for project-based learning"""
    project_id: str
    milestone_number: int
    question: str
    answer: str  # Brief explanation (2-3 sentences)
    suggestedFiles: Optional[List[dict]] = []  # Code changes to apply
    suggestedCommands: Optional[List[str]] = []  # Terminal commands to run
