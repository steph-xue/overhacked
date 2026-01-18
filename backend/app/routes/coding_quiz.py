from fastapi import APIRouter, HTTPException
from app.schemas import CodingQuizRequest, CodingQuizResponse
from dotenv import load_dotenv
import os
from langchain_openai import ChatOpenAI
from crewai import Agent, Process, Crew, Task
from crewai.knowledge.source.string_knowledge_source import StringKnowledgeSource
from typing import List
import json
import re

coding_quiz_router = APIRouter()

# Load environment variables
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Define the LLM
llm = ChatOpenAI(model_name="gpt-4o", temperature=0.5)

@coding_quiz_router.post("/coding_quiz", response_model=CodingQuizResponse)
async def ask_agent(request: CodingQuizRequest) -> CodingQuizResponse:
    language = request.language
    experience = request.experience
    username = request.username
    
    coding_quiz_agent = Agent(
        role=f"You are a specialist in computer science, and you are tasked with creating a coding quiz of {language} which is challenging but doable for a person who has {experience} years of experience in tech.",
        goal=f"Create ONE coding quiz which is of appropriate difficulty for a person who has {experience} years of experience in tech.",
        llm=llm,
        backstory="You're working on education in computer science and are familiar with Object-Oriented-Programming. At the same time, you're good at creating quizzes for students who are learning OOP.",
    )
    
    coding_quiz_task = Task(
        description=f"Create a coding quiz of {language} which is challenging but doable for a person who has {experience} years of experience in tech.",
        expected_output=f"""Always respond in **valid JSON only** with exactly two fields:
        1. "question": a string containing the quiz question.
        2. "answer": an array of strings, each string is one line of code or text, preserving all indentation, spaces, and formatting exactly.

        Example:
        {{
            "question": "Write a Java class Car with fields brand, model, year, constructor, and displayDetails method.",
            "answer": [
                "public class Car {{",
                "    // Fields (Attributes)",
                "    String brand;",
                "    String model;",
                "    int year;",
                "",
                "    // Constructor (special method to initialize objects)",
                "    public Car(String brand, String model, int year) {{",
                "        this.brand = brand;",
                "        this.model = model;",
                "        this.year = year;",
                "    }}",
                "",
        "    // Method (Behavior)",
        "    public void displayDetails() {{",
        "        System.out.println(\\"Brand: \\" + brand + \\", Model: \\" + model + \\", Year: \\" + year);",
        "    }}",
        "}}"
    ]
    }}

    Now create the quiz question and answer for {language} for a person with {experience} years of experience, following this JSON format exactly. Make sure that your questions are also varied.
    """,
        agent=coding_quiz_agent
    )
    
    coding_quiz_hints_agent = Agent(
        role=(
            f"You are an expert OOP mentor named OOP_professional helping {username}. "
            "You provide progressive hints for coding quiz questions without giving the final solution."
        ),
        goal=(
            "Given the quiz question and the expected answer style, produce 3–5 hints that guide the user "
            "toward the solution while preserving learning value."
        ),
        backstory=(
            "You are a senior software engineer and educator who specializes in Object-Oriented Programming. "
            "You scaffold learning: start conceptual, then point to structure, then common pitfalls."
        ),
        llm=llm,        
    )
    
    coding_quiz_hints_task = Task(
        description=(
            f"Create progressive hints for {username} to solve the coding quiz. "
            "Use the quiz question from context. Do NOT include any full code solution. "
            "Do NOT reveal the final answer or provide complete code blocks.\n\n"
            "Return ONLY valid JSON with this exact shape:\n"
            '{ "hints": [string, string, string] }\n\n'
            "Rules:\n"
            "- Provide 3 to 5 hints.\n"
            "- Hint 1: high-level OOP concept(s) involved.\n"
            "- Hint 2: suggest a class/method/field structure to consider.\n"
            "- Hint 3+: highlight common mistakes and edge cases.\n"
            "- Keep each hint 1–2 sentences.\n"
            "- Make sure each hint is less than 40 characters long.\n"
            "- No markdown, no backticks, no extra keys."
        ),
        expected_output='{"hints": ["...", "...", "..."]}',
        agent=coding_quiz_hints_agent,
        context=[coding_quiz_task],
    )
    
    coding_quiz_crew = Crew(
        name="coding_quiz_crew",
        agents=[coding_quiz_agent, coding_quiz_hints_agent],
        tasks=[coding_quiz_task, coding_quiz_hints_task],
        verbose=True,
        process=Process.sequential,
    )
    
    try:
        result = coding_quiz_crew.kickoff({"topic": "Create a coding quiz"})

        quiz_raw = result.tasks_output[0].raw
        
        # Removed hints for now
        hints_raw = result.tasks_output[1].raw

        # Strip code fences if the model adds them
        quiz_clean = re.sub(r"```json|```", "", quiz_raw).strip()        
        hints_clean = re.sub(r"```json|```", "", hints_raw).strip()

        quiz_data = json.loads(quiz_clean)
        hints_data = json.loads(hints_clean)

        return CodingQuizResponse(
            question=quiz_data["question"],
            answer=quiz_data["answer"],
            hints=hints_data.get("hints")
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))        

