# Overhacked backend
## Requirements

- Python 3.10+
- See `requirements.txt` for full dependencies.

## Setup
### 1. Clone the repository
```bash
git clone https://github.com/steph-xue/overhacked.git
cd backend
```

### 2. Create a virtual environment
```bash
python -m venv venv
source venv/bin/activate  # Linux / macOS
venv\Scripts\activate     # Windows
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Set environment variables
Create a .env file in the backend folder:
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

### 5. Run the server
```bash
uvicorn main:app --reload  --port 8000
```
The server will start at: http://127.0.0.1:8000

## API Endpoints
### 1. Root (Test)
- `GET`
```bash
curl http://127.0.0.1:8000/
```

### 2. Generate Multiple Choice Question
- `POST` /mcq
#### Request body
```json
{
  "username": "Yuko",
  "experience": 2,
  "language": "Java"
}
```

### Response body
```json
{
  "question": "Which of the following is NOT a feature of Python classes?",
  "choices": [
    "Inheritance",
    "Encapsulation",
    "Polymorphism",
    "Compilation to bytecode"
  ],
  "answer": 3,
  "hints": [
    "Python classes support object-oriented programming features like inheritance, encapsulation, and polymorphism.",
    "Python code is interpreted and compiled to bytecode automatically, but 'compilation to bytecode' is not a feature of the class itself."
  ]
}
```
