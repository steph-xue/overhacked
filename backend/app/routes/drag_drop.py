from fastapi import APIRouter, HTTPException
from app.schemas import DragDropGenerateRequest, DragDropQuestion, DragDropResponse
from dotenv import load_dotenv
import os
from langchain_openai import ChatOpenAI
from crewai import Agent, Process, Crew, Task
from crewai.knowledge.source.string_knowledge_source import StringKnowledgeSource
from typing import List
import json
import re

drag_drop_router = APIRouter()

# Load environment variables
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Define the LLM
llm = ChatOpenAI(model_name="gpt-4o", temperature=0.5)

@drag_drop_router.post("/drag_drop")
async def ask_agent(request: DragDropGenerateRequest) -> DragDropQuestion:
    language = request.language
    experience = request.experience
    username = request.username
    
    drag_drop_agent = Agent(
        role=f"""
        You are an expert software engineer and CS education with many years of experience. Create ONE interactive drag-and-drop "reorder the lines" challenge about {language}. It can flexibly 
        test OOP, design patterns, or LeetCode Easy reasoning. However, it should NOT syntax trivia.

        The drag-and-drop question should be challenging but doable for a person who has {experience} years of experience in tech. The difficulty must match the person's {experience} years of experience in computer science.    
        Return ONLY valid JSON (no markdown, no commentary).
        You can either use original code, OR, it can also be from common LeetCode Easy questions.
        To keep the drag-and-drop exercise short, please ensure that you do NOT exceed 15 lines of code.
        """,
        goal="""Return a single JSON object with:
            - type: "reorder"
            - prompt: string
            - lines: [{id: string, text: string}]
            - correct_order: [id, id, ...]
            """,
        llm=llm,
        backstory="You're a computer science educator and create high-quality programming puzzles that tests understanding, not just memorization.",
    )

    drag_drop_task = Task(
        description=f"""Create a drag-and-drop exercise of {language} which is challenging but doable for a person who has {experience} years of experience in tech.
        
        Constraints:
        - question_type MUST be exactly "drag_drop"
        - question_mode MUST be exactly "reorder"
        - The player must reorder lines of a code-like snippet that demonstrates
        OOP / design patterns / OOP-style reasoning (e.g., Strategy, Factory, composition, polymorphism) or LeetCode-style questions (Preferably, LeetCode Easy).
        - Do NOT ask the player to write code from scratch. This is ONLY reordering provided lines.
        - items_to_drag must be SHUFFLED (not already in correct order).
        - drop_zones must be sequential position labels like ["1","2","3",...], matching the number of items.
        - The code snippet should NOT exceed 15 lines.
        - Return ONLY valid JSON with the fields below. No markdown, no extra keys.
        """,

        expected_output="""
        {
            "question_type": "drag_drop",
            "question_mode": "reorder",
            "question_text": "string",
            "items_to_drag": ["string", "string", "..."],
            "drop_zones": ["1", "2", "..."],
            }
        }
        """,
        agent=drag_drop_agent
    )
    
    drag_drop_hints_agent = Agent(
        role=f"You are an expert in education and OOP and you'll provide hints to help {username} in case they struggle with the drag-and-drop exercise.",
        goal="Provide hints to help the user understand if they are stalling for more than 30 seconds on a specific line.",
        backstory="You're an experienced educator in computer science. You excel at breaking down complex concepts into understandable hints.",
        llm=llm,

    )
    drag_drop_hints_task = Task(
        description=f"Provide a series of hints to help {username} understand the concepts behind the drag-and-drop question. Start with lighter, more general hints, and gradually give more detailed or specific hints in later steps. Each hint should build on the previous ones and guide the user toward understanding without giving away the answer directly.",
        expected_output="""
        {
            "hints": string[]
        }
        """,
        agent=drag_drop_hints_agent,
        context=[drag_drop_task]
    )
    drag_and_drop_crew = Crew(
        name="drag_drop_crew",
        agents=[drag_drop_agent, drag_drop_hints_agent],
        tasks=[drag_drop_task, drag_drop_hints_task],
        verbose=True,
        process=Process.sequential
    )

    """
    Send a prompt to the AI agent and get a response.
    """
    try:
        # Call CrewAI API
        result = drag_and_drop_crew.kickoff({"topic": "Create ONE single drag-and-drop exercise."})
        print("Result from agent:")
        print(result)

        print("result raw")
        print(result.tasks_output[0].raw)
        # result.tasks is a list of task results in order
        quiz_task_result = result.tasks_output[0].raw  # multiple_quiz_task
        hints_task_result = result.tasks_output[1].raw  # multiple_quiz_hints_task

        # Clean and parse
        quiz_data = json.loads(re.sub(r"```json|```", "", quiz_task_result).strip())
        hints_data = json.loads(re.sub(r"```json|```", "", hints_task_result).strip())

        return DragDropQuestion(
            question_type="drag_drop",
            question_mode="reorder",
            question_text=quiz_data["question_text"],
            items_to_drag=quiz_data["items_to_drag"],
            drop_zones=quiz_data["drop_zones"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


