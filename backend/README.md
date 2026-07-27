# Overhacked Backend
## Requirements

- Python 3.10–3.13 (required by crewai which doesn't support 3.14+ yet). The setup commands use 3.12 as an example, but any version in that range works.
- See `requirements.txt` for full dependencies.

## Setup
### 1. Clone the repository
```bash
git clone https://github.com/steph-xue/overhacked.git
cd backend
```

### 2. Create a virtual environment
> **Note:** On Windows, replace `python3.12` with `python` in the commands below.
```bash
python3.12 -m venv venv
source venv/bin/activate      # On Windows use: venv\Scripts\activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Set environment variables
Create a .env file in the root folder:
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

### 5. Run the server
```bash
uvicorn main:app --reload --port 8000
```
The server will start at: http://127.0.0.1:8000

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