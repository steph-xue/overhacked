from fastapi import APIRouter, HTTPException
from app.schemas import MCQRequest, MCQResponse2
from dotenv import load_dotenv
import os
from langchain_openai import ChatOpenAI
from crewai import Agent, Process, Crew, Task
from crewai.knowledge.source.string_knowledge_source import StringKnowledgeSource
from typing import List
import json
import re

mcq2_router = APIRouter()

# Load environment variables
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Define the LLM
llm = ChatOpenAI(model_name="gpt-4o", temperature=0.5)

@mcq2_router.post("/mcq2")
async def ask_agent(request: MCQRequest) -> MCQResponse2:
    language = request.language
    experience = request.experience
    username = request.username
    multiple_quiz_agent = Agent(
        role=f"""
        You are a Computer Science educator with many years of experience as a software engineer on the side. Create a multiple-choice quiz about {language}. The topic must be randomized each time and it can include topics like OOP theory, DevOps, easy Data Structure and Algorithms, or assessing LeetCode time complexity. Do not ask the user to write any code or solve programming exercises.

        The quiz should be challenging but doable for a person who has {experience} years of experience in tech.
        """,
        goal=f"Create one multiple-choice question with 4 answer choices, clearly indicate the correct answer, and ensure it tests trivia-level understanding of concepts rather than coding skills.",
        llm=llm,
        backstory="You're working on education in computer science and are familiar with Object-Oriented-Programming. At the same time, you're good at creating quizzes for students who are learning OOP.",
    )
    multiple_quiz_task = Task(
        description=f"Create a list of multiple choice quizzes of {language} which is challenging but doable for a person who has {experience} years of experience in tech. Length of the list should be 4.",
        expected_output="""
        [{
            "question": string,
            "choices": string[], # Each choice should be less than 40 letters
            "answer": number
        }, 
        {
            "question": string,
            "choices": string[], # Each choice should be less than 40 letters
            "answer": number
        },
        {
            "question": string,
            "choices": string[], # Each choice should be less than 40 letters
            "answer": number
        },
        {
            "question": string,
            "choices": string[], # Each choice should be less than 40 letters
            "answer": number
        },
        ]
        """,
        agent=multiple_quiz_agent
    )
    multiple_quiz_hints_agent = Agent(
        role=f"You are an expert in CS education and you'll provide hints to help {username} in case they struggle with the quiz.",
        goal="Provide hints to help the user understand the concepts behind the quiz question.",
        backstory="You're an experienced educator in computer science. You excel at breaking down complex concepts into understandable hints.",
        llm=llm,
    )
    multiple_quiz_hints_task = Task(
        description=f"Provide a series of hints to help {username} understand the concepts behind the quiz question. Start with lighter, more general hints, and gradually give more detailed or specific hints in later steps. Each hint should build on the previous ones and guide the user toward understanding without giving away the answer directly.",
        expected_output="""
        [{
            "hints": ["hint 1", "hint 2", "hint 3"] # length should be always 3 # Each hint should be less than 100 letters
        }, 
        {
            "hints": ["hint 1", "hint 2", "hint 3"] # length should be always 3 # Each hint should be less than 100 letters
        },
        {
            "hints": ["hint 1", "hint 2", "hint 3"] # length should be always 3 # Each hint should be less than 100 letters
        },
        {
            "hints": ["hint 1", "hint 2", "hint 3"] # length should be always 3 # Each hint should be less than 100 letters
        },]
        """,
        agent=multiple_quiz_hints_agent,
        context=[multiple_quiz_task]
    )
    multiple_quiz_crew = Crew(
        name="multiple_quiz_crew",
        agents=[multiple_quiz_agent, multiple_quiz_hints_agent],
        tasks=[multiple_quiz_task, multiple_quiz_hints_task],
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

        print("result raw")
        print(result.tasks_output[0].raw)
        # result.tasks is a list of task results in order
        quiz_task_result = result.tasks_output[0].raw  # multiple_quiz_task
        hints_task_result = result.tasks_output[1].raw  # multiple_quiz_hints_task

        # Clean and parse
        quiz_data = json.loads(
            re.sub(r"```json|```", "", quiz_task_result).strip()
        )

        raw_hints_data = json.loads(
            re.sub(r"```json|```", "", hints_task_result).strip()
        )

        # Extract hints per quiz
        hints_data = [item["hints"] for item in raw_hints_data]

        if len(quiz_data) != len(hints_data):
            raise ValueError("Quiz count and hints count do not match")

        return MCQResponse2(
            quizzes=quiz_data,
            hints=hints_data
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))