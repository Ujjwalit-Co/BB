import json
import os
from typing import Optional
from bson import ObjectId

# MongoDB connection
try:
    import pymongo
    MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    DB_NAME = os.getenv("DB_NAME", "brainbazaar")
    
    client = pymongo.MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
    db = client[DB_NAME]
    projects_collection = db["projects"]
    MONGO_AVAILABLE = True
except Exception as e:
    print(f"MongoDB connection failed: {e}. Falling back to JSON file.")
    MONGO_AVAILABLE = False
    client = None
    db = None
    projects_collection = None

# Path to the data file — relative to this file's location (fallback)
DATA_PATH = os.path.join(os.path.dirname(__file__), "../data/demoProjects.json")


def _convert_mongo_doc(doc: dict) -> dict:
    """Convert MongoDB document to FastAPI-compatible format with field mapping."""
    if not doc:
        return None
    
    # Convert ObjectId to string
    if '_id' in doc:
        doc['id'] = str(doc['_id'])
    
    # Field name mapping for FastAPI compatibility
    field_mapping = {
        'complexity': 'level',
        'description': 'summary',
        'techStack': 'technology',
    }
    
    for old_key, new_key in field_mapping.items():
        if old_key in doc and new_key not in doc:
            doc[new_key] = doc[old_key]
    
    # Ensure milestones have proper structure
    if 'milestones' in doc:
        for idx, milestone in enumerate(doc['milestones']):
            # Add ID if missing
            if 'id' not in milestone:
                milestone['id'] = f"m{idx + 1}"
            # Map title to name
            if 'title' in milestone and 'name' not in milestone:
                milestone['name'] = milestone['title']
            # Ensure number exists
            if 'number' not in milestone:
                milestone['number'] = idx + 1
            
            # Process steps
            if 'steps' in milestone:
                for step_idx, step in enumerate(milestone['steps']):
                    # Add ID if missing
                    if 'id' not in step:
                        step['id'] = f"m{idx + 1}-s{step_idx + 1}"
                    # Ensure stepNumber exists
                    if 'stepNumber' not in step:
                        step['stepNumber'] = step_idx + 1
    
    return doc


def load_projects() -> list[dict]:
    """Load all projects from MongoDB or fallback to JSON."""
    if MONGO_AVAILABLE and projects_collection is not None:
        try:
            projects = list(projects_collection.find({"isPublished": True}))
            return [_convert_mongo_doc(p) for p in projects]
        except Exception as e:
            print(f"MongoDB query failed: {e}. Falling back to JSON.")
    
    # Fallback to JSON file
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def get_project_by_id(project_id: str) -> Optional[dict]:
    """Get project by ID (supports both MongoDB ObjectId and string IDs)."""
    if MONGO_AVAILABLE and projects_collection is not None:
        try:
            # Try as ObjectId first
            try:
                oid = ObjectId(project_id)
                project = projects_collection.find_one({"_id": oid, "isPublished": True})
            except:
                # If not valid ObjectId, try string match
                project = projects_collection.find_one({"_id": project_id, "isPublished": True})
            
            if project:
                return _convert_mongo_doc(project)
        except Exception as e:
            print(f"MongoDB query failed: {e}. Falling back to JSON.")
    
    # Fallback to JSON file
    for project in load_projects():
        if project.get("id") == project_id or project.get("_id") == project_id:
            return project
    return None


def get_milestone(project_id: str, milestone_number: int) -> Optional[dict]:
    """Get a specific milestone from a project."""
    project = get_project_by_id(project_id)
    if not project:
        return None
    
    milestones = project.get("milestones", [])
    
    # Try to find by number first
    for milestone in milestones:
        if milestone.get("number") == milestone_number:
            return milestone
    
    # Fallback to index-based (1-based to 0-based)
    index = milestone_number - 1
    if 0 <= index < len(milestones):
        return milestones[index]
    
    return None


def get_total_milestones(project_id: str) -> int:
    """Get total number of milestones in a project."""
    project = get_project_by_id(project_id)
    if not project:
        return 0
    return len(project.get("milestones", []))


def get_step(project_id: str, milestone_number: int, step_number: int) -> Optional[dict]:
    """Get a specific step from a milestone."""
    milestone = get_milestone(project_id, milestone_number)
    if not milestone:
        return None
    
    steps = milestone.get("steps", [])
    
    # Try to find by stepNumber first
    for step in steps:
        if step.get("stepNumber") == step_number:
            return step
    
    # Fallback to index-based (1-based to 0-based)
    index = step_number - 1
    if 0 <= index < len(steps):
        return steps[index]
    
    return None


def get_total_steps(project_id: str, milestone_number: int) -> int:
    """Get total number of steps in a milestone."""
    milestone = get_milestone(project_id, milestone_number)
    if not milestone:
        return 0
    return len(milestone.get("steps", []))


def list_steps(project_id: str, milestone_number: int) -> Optional[list[dict]]:
    """Get all steps in a milestone."""
    milestone = get_milestone(project_id, milestone_number)
    if not milestone:
        return None
    return milestone.get("steps", [])
