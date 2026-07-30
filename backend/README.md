# Overhacked Backend
## Requirements
- Python 3.10–3.13 (required by crewai 1.8.1 which doesn't support Python 3.14+).
- See `requirements.txt` for full dependencies.

## Setup

**1. Clone the Repository**

This downloads a copy of the project to your computer and moves you into the backend folder.
```bash
git clone https://github.com/steph-xue/overhacked.git
cd overhacked/backend
```

**2. Create and Activate a Python Virtual Environment**
This keeps the project's dependencies separate from other Python projects on your machine.
```bash
python3 -m venv .venv       # On Windows use: python -m venv .venv
source .venv/bin/activate   # On Windows use: .venv\Scripts\activate
```

**3. Install the Dependencies**

This installs all dependencies the backend needs to run.
```bash
pip install -r requirements.txt
```

**4. Set Up Environment Variables**

Create a `.env` file in the backend folder with your OpenAI API key.
```bash
OPENAI_API_KEY=your_openai_api_key_here  # OpenAI API key
```

**5. Start the Development Server**

This runs the FastAPI backend developement server using Uvicorn.
```bash
uvicorn main:app --reload --port 8000
```
The server will be available at `http://127.0.0.1:8000`.

## API Endpoints
### 1. Root (Test)
- `GET`
```bash
curl http://127.0.0.1:8000/
```

### 2. Generate Multiple Choice Questions
- `POST` /mcq
#### Request body
```json
{
  "username": "Yuko",
  "experience": 2,
  "language": "Python"
}
```

#### Response body
```json
{
  "quizzes": [
    {
      "question": "Which of the following is NOT a feature of Python classes?",
      "choices": [
        "Inheritance",
        "Encapsulation",
        "Polymorphism",
        "Compilation to bytecode"
      ],
      "answer": 3
    }
  ],
  "hints": [
    [
      "Python classes support object-oriented programming features like inheritance, encapsulation, and polymorphism.",
      "Python code is interpreted and compiled to bytecode automatically, but 'compilation to bytecode' is not a feature of the class itself."
    ]
  ]
}
```
`quizzes` always contains 4 questions and `hints` always contains 4 matching hint arrays (trimmed to 1 above for brevity). If `language` isn't a recognized object-oriented language, the questions default to Java instead.

### 3. Generate Drag-and-Drop Question
- `POST` /coding_quiz
#### Request body
```json
{
  "username": "Yuko",
  "experience": 2,
  "language": "Java"
}
```

#### Response body
```json
{
  "question": "Arrange the lines to define a simple 'Car' class with a constructor and a method that displays its info.",
  "answer": [
    "public class Car {",
    "    String make;",
    "    String model;",
    "    public Car(String make, String model) {",
    "        this.make = make;",
    "        this.model = model;",
    "    }",
    "    public void displayInfo() {",
    "        System.out.println(make + \" \" + model);",
    "    }",
    "}"
  ],
  "hints": [
    "Start with the class definition.",
    "The constructor initializes instance fields.",
    "Methods are defined inside the class body."
  ]
}
```
`answer` is a single line of code per array element, meant to be shuffled and reordered by the player. If `language` isn't a recognized object-oriented language, the code defaults to Java instead.