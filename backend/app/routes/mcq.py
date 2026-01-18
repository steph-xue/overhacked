from fastapi import APIRouter
from app.schemas import MCQRequest, MCQResponse
from dotenv import load_dotenv
import os
from langchain_openai import ChatOpenAI
from crewai import Agent, Process, Crew, Task
from crewai.knowledge.source.string_knowledge_source import StringKnowledgeSource
from typing import List
import json
import re

mcq_router = APIRouter()

# Load environment variables
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Define the LLM
llm = ChatOpenAI(model_name="gpt-4o", temperature=0.5)

@mcq_router.post("/mcq")
async def ask_agent(request: MCQRequest) -> MCQResponse:
    language = request.language
    experience = request.experience
    multiple_quiz_agent = Agent(
        role=f"You are a specialist in OOP and create a multiple choice quiz of {language} which is challenging but doable for a person who has {experience} years of experience in tech.",
        goal=f"Create ONE multiple choice quiz which is appropriate difficulty for a person who has {experience} years of experience in tech.",
        llm=llm,
        backstory="You're working on education in computer science and are familiar with Object-Oriented-Programming. At the same time, you're good at creating quizzes for students who are learning OOP.",
    )
    multiple_quiz_task = Task(
        description=f"Create a multiple choice quiz of {language} which is challenging but doable for a person who has {experience} years of experience in tech.",
        expected_output="""
        {
            "question": string,
            "choices": string[],
            "answer": number
        }
        """,
        agent=multiple_quiz_agent
    )
    multiple_quiz_crew = Crew(
        name="multiple_quiz_crew",
        agents=[multiple_quiz_agent],
        tasks=[multiple_quiz_task],
        verbose=True,
        process=Process.sequential
    )

    """
    Send a prompt to the AI agent and get a response.
    """
    try:
        # Call CrewAI API
        result = multiple_quiz_crew.kickoff({"topic": "Create a multiple choice quiz"})
        print("Result from agent:")
        print(result)
        # Remove markdown fences if they exist
        cleaned = re.sub(r"```json|```", "", result.raw).strip()

        data = json.loads(cleaned)
        return MCQResponse(
            question=data["question"],
            choices=data["choices"],
            answer=data["answer"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))