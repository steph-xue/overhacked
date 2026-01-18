# Router lets you group endpoints together
from fastapi import APIRouter
# Allows us to define data to be expected, type for each field
from pydantic import BaseModel
from typing import Optional, List, Literal, Union

# This is the router for all NPC-related endpoints (NON-MENTOR ONLY)

router = APIRouter()

# For INTERACTING WITH THE NPC TEAMMATE ONLY
class NPCInteractRequest(BaseModel):
    session_id: str
    npc_name: str
    
# The MC Question response we get back from the NPC after the initial player interaction
class MCQResponse(BaseModel):
    question: str
    choices: List[str]
    answer: int

class MCQRequest(BaseModel):
    # session_id: str??
    username: str
    experience: int
    language: str

# The Drag and Drop Item structure
class DragDropItem(BaseModel):
    id: str
    text: str

# The Drag and Drop Question response we get back from the NPC after the initial player interaction
class DragDropResponse(BaseModel):
    question_type: Literal["drag_drop"]
    question_text: str
    items_to_drag: List[str]
    drop_zones: List[str]
    
# The response provided back from the NPC after the player completes the Drag and Drop question
class DragDrop_AnswerResponse(BaseModel):
    is_correct: bool
    correct_mapping: Optional[dict] = None
    explanation: Optional[str] = None

# The Debugging Question response we get back from the NPC after the initial player interaction
class DebuggingResponse(BaseModel):
    question_type: Literal["debug"]
    question_text: str
    code_snippet: str

# The response provided back from the NPC after the player submits their debugging solution
class Debugging_AnswerResponse(BaseModel):
    is_correct: bool
    corrected_code: Optional[str] = None
    explanation: Optional[str] = None