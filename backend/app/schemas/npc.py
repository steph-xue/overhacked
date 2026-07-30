from pydantic import BaseModel, Field
from typing import Optional, List, Literal, Union

# Request to interact with an NPC teammate
class NPCInteractRequest(BaseModel):
    session_id: str
    npc_name: str

# Request for a multiple choice quiz question
class MCQRequest(BaseModel):
    username: str
    experience: int
    language: str

# Request for a coding quiz (drag-and-drop) question
class CodingQuizRequest(BaseModel):
    language: str = Field(..., examples=["Java", "Python", "C#"])
    experience: int = Field(..., ge=0, le=50, examples=[0, 2, 5])
    username: Optional[str] = Field(None, examples=["Sam"])  # Only used if personalization is desired

# Response containing a coding quiz question, its answer, and hints
class CodingQuizResponse(BaseModel):
    question: str
    answer: List[str]  # Each element is one line, preserving formatting
    hints: Optional[List[str]] = None  # Only included if hints were generated

# A single draggable line of code in a drag-and-drop question
class DragDropItem(BaseModel):
    id: Optional[str] = None
    text: str

# Request to generate a drag-and-drop question
class DragDropGenerateRequest(BaseModel):
    language: str
    experience: int
    username: Optional[str] = None
    question_mode: Literal["reorder"] = "reorder"

# Drag-and-drop question response returned by the NPC after the initial player interaction
class DragDropQuestion(BaseModel):
    question_type: Literal["drag_drop"]
    question_mode: Literal["reorder"]
    question_text: str
    items_to_drag: List[str]
    drop_zones: List[str]

# Debugging question response returned by the NPC after the initial player interaction
class DebuggingResponse(BaseModel):
    question_type: Literal["debug"]
    question_text: str
    code_snippet: str

# Response returned after the player submits their debugging solution
class Debugging_AnswerResponse(BaseModel):
    is_correct: bool
    corrected_code: Optional[str] = None
    explanation: Optional[str] = None

# A single multiple choice question with its answer choices
class MCQItem(BaseModel):
    question: str
    choices: List[str]
    answer: int

# Response containing multiple choice quiz questions and their hints
class MCQResponse(BaseModel):
    quizzes: List[MCQItem]
    hints: List[List[str]]