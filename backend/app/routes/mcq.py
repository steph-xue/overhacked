from fastapi import APIRouter, HTTPException
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
    username = request.username
    multiple_quiz_agent = Agent(
        role=f"""
        You are a Computer Science educator with many years of experience as a software engineer on the side. Create a multiple-choice quiz that tests understanding of Object-Oriented Programming (OOP) concepts.

        First, determine whether {language} is a real, recognized object-oriented programming language.
        - If {language} is clearly a real object-oriented language (e.g. Java, Python, C++, C#, Ruby, JavaScript, TypeScript, Kotlin, Swift), write questions about OOP concepts (classes, objects, inheritance, encapsulation, polymorphism, abstraction, interfaces, constructors, access modifiers, method overloading vs. overriding, static vs. instance members, composition vs. inheritance, abstract classes, getters and setters, operator overloading, object equality, generics, etc.), using {language}'s specific syntax and terminology where relevant.
        - If {language} is clearly not object-oriented (e.g. a purely functional or procedural language like Haskell, C, or Assembly), or is not a real, recognized programming language at all, write the questions about Java instead, using Java's specific syntax and terminology, since {language} does not have real OOP syntax to build meaningful language-specific questions around.
        - If you are unsure whether {language} is object-oriented, or it only partially supports OOP, default to Java instead, using Java's specific syntax and terminology.

        Do not ask the user to write any code or solve programming exercises.

        Do not invent or assume keywords, syntax, or mechanisms that don't actually exist in {language}. If {language} doesn't have a specific keyword or built-in mechanism for an OOP concept, do not write a question that presumes one exists, and do not frame a general-purpose keyword as if it were dedicated to that concept. For example, Python has no dedicated inheritance keyword, "class Dog(Animal):" signals inheritance through the parenthesized base class, not through the "class" keyword itself, which is used to define every class, inheriting or not, so a question asking "which keyword is used for inheritance in Python" would be misleading even though "class" is technically real syntax. When a concept is expressed through syntax or structure rather than a distinct keyword, write the question about that syntax or structure directly instead of asking "which keyword".

        Before finalizing each question, verify that the choice marked as correct is factually accurate for {language} and that the other three choices are genuinely incorrect and clearly distinguishable from it. If more than one choice could reasonably be defended as correct, rewrite the question or the choices until exactly one is correct.

        Do not use "All of the above" or "None of the above" as choices.

        Across the 4 questions in the quiz, cover 4 different OOP concepts, drawing from a broad range (for example: encapsulation, inheritance, polymorphism, abstraction, interfaces, constructors, access modifiers, method overloading vs. overriding, static vs. instance members, composition vs. inheritance, abstract classes, getters and setters, operator overloading, object equality, generics) rather than repeatedly defaulting to the same handful of concepts.

        Keep the difficulty roughly consistent across all 4 questions, appropriate for a person who has {experience} years of experience in tech.
        """,
        goal=f"Create one multiple-choice question with 4 answer choices, clearly indicate the correct answer, verify the answer is factually correct and uniquely correct before finalizing, and ensure it tests trivia-level understanding of OOP concepts rather than coding skills.",
        llm=llm,
        backstory="You're working on education in computer science and are familiar with Object-Oriented-Programming. At the same time, you're good at creating quizzes for students who are learning OOP.",
    )
    multiple_quiz_task = Task(
        description=f"Create a list of 4 multiple choice quizzes testing 4 different Object-Oriented Programming concepts, specific to {language} if {language} is a real object-oriented language, or specific to Java otherwise, which is challenging but doable for a person who has {experience} years of experience in tech.",
        expected_output="""
        [{
            "question": string,
            "choices": string[], # Each choice should be less than 40 letters
            "answer": number # 0-based index into "choices" pointing at the single correct choice
        },
        {
            "question": string,
            "choices": string[], # Each choice should be less than 40 letters
            "answer": number # 0-based index into "choices" pointing at the single correct choice
        },
        {
            "question": string,
            "choices": string[], # Each choice should be less than 40 letters
            "answer": number # 0-based index into "choices" pointing at the single correct choice
        },
        {
            "question": string,
            "choices": string[], # Each choice should be less than 40 letters
            "answer": number # 0-based index into "choices" pointing at the single correct choice
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

        return MCQResponse(
            quizzes=quiz_data,
            hints=hints_data
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))