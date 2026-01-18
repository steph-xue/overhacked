# Router lets you group endpoints together
from fastapi import APIRouter
# Allows us to define data to be expected, type for each field
from pydantic import BaseModel
from typing import Optional, List, Literal, Union

# This is the router for mentor-related endpoints

# Initial interaction with the OOP specialist mentor
class getHelp_OOPSpecialist_Response(BaseModel):
    session_id: str
    mentor_name: str
    
# Initial interaction with the debugging specialist mentor
class getHelp_Debugging_Response(BaseModel):
    session_id: str
    mentor_name: str
