# Endpoints to control the lifecycle of the game - Start to end

# Router lets you group endpoints together
from fastapi import APIRouter
# Allows us to define data to be expected, type for each field
from pydantic import BaseModel
from typing import Optional, List, Literal, Union

# Literal & Union are keywords: Literal = "this exact value", Union = "one of these types"

# This is the router for game lifecycle endpoints

router = APIRouter()

class StartGameRequest(BaseModel):
    player_name: str
    years_of_exp: int
    fav_language: str
    
    # Below will be an added feature for later - Not implemented yet
    fav_framework: Optional[str] = None
 
class StartGameResponse(BaseModel):
    session_id: int

# Don't know if we actually need this
class SingleAnswer(BaseModel):
    npc_name: str
    question_type: Literal["drag_drop", "mcq", "trivia", "debug"]
    response: Union[str, int, List[str]]
    
class EndGameRequest(BaseModel):
    session_id: int
    all_answers: List[SingleAnswer]

class EndGameResponse(BaseModel):
    session_id: int
    score: int
    summary: str
    
    # Below can be an added feature for later - Not implemented just yet
    reco_for_improvement: Optional[str] = None
