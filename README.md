<h1 align="center">
  Overhacked!
</h1>

<h2 align="center">
  A cozy hackathon game where you talk to teammates, solve coding challenges, and race the clock to win together!
</h2>

---

<h3>NWHacks 2026</h3>
Devpost link: https://devpost.com/software/overhacked

---

https://github.com/user-attachments/assets/2e9fa9cf-fa4e-4b84-a2d3-502f0107b06f
  
<br>

## Inspiration
As CS students, attending hackathons is one of our favourite ways to meet new people, find like-minded collaborators, and bring a shippable MVP to life. That being said, you might end up meeting some people who are a bit too preoccupied with other priorities, like studying, grinding LeetCode, or applying for internships (which, to be fair, is completely valid). Inspired by the fast-paced gameplay of Overcooked where players race against the clock to complete as many dishes as possible, we wanted to capture the same gameplay in a hackathon-themed experience. We wanted to create a game that not only mimics a chaotic energy of a hackathon environment, but also gives players a fun way to brush up on their programming knowledge through a variety of mini-games. From object oriented programming (OOP) multiple-choice questions to interactive drag-and-drop challenges, Overhacked! has you covered.

<br>

## What It Does
The aim of the game for Overhacked! is simple: fill the progress bar by answering your fellow teammates' questions as quickly as possible. Each correct answer adds to your progress bar. Multiple choice questions will fill the progress bar by 25%, while the more challenging drag and drop questions will fill it by 50%. Players win by completely filling the progress bar, which triggers a congratulatory message and celebratory confetti animation to signify that “your MVP was fully shipped.” If time runs out before the bar is filled, the game will end with a game over dialog. While the demo features a 2-minute round, we eventually hope to expand the gameplay longer so that covers more concepts like full-stack development (frontend and backend), data structures and algorithms, systems design and many more. We would also like to include tailored feedback to help players identify areas for improvement. See below for planned future improvements!

<br>

## Features

### Landing Page
- Serves as the entry point to the game.
- Designed with a clean, simple UI to quickly guide users into gameplay.
<p align="center">
  <img src="frontend/public/screenshots/landing-page.png" alt="landing" height="400"/>
</p>

---

### User Form
- Players can fill out the user form with the following details:
  - Username - displayed above the player's character in-game.
  - Years of programming experience - used by the agentic AI to adjust minigame question difficulty.
  - Favourite programming language - used to tailor minigame question generation.
- This information is passed to the backend to power adaptive gameplay.
<p align="center">
  <img src="frontend/public/screenshots/user-form.png" alt="user-form" height="400"/>
</p>

---

### Game Scene
- Features a top-down 2D hackathon room map.
- Plays cute retro video game music upon entering the scene.
- The player can move freely in all four directions using the arrow keys.
- Includes collision handling for tables and walls, requiring players to navigate the room realistically.
- The player’s username is displayed above their character for personalization.
- A mentor instruction popup appears at the bottom right when the scene loads, explaining the objective of the game:
  - Talk to teammates to help them with coding problems and fill the progress bar before time runs out!
- A 2-minute countdown timer and progress bar are displayed at the top left.
  - The progress bar fills up green as questions are answered correctly.
- Teammates are placed throughout the game scene. When the player walks near one, a prompt appears letting them press E to interact and launch an object oriented programming (OOP) themed minigame. The two available minigames are:
  - Multiple Choice
  - Drag and Drop
<table align="center">
  <tr>
    <td>
      <img src="frontend/public/screenshots/game-scene.png" alt="game" width="500"/>
    </td>
    <td>
      <img src="frontend/public/screenshots/talk-with-team.png" alt="talk-with-team" width="500"/>
    </td>
  </tr>
</table>

---

### Mentor Popup Alerts
- Mentor alerts appear randomly throughout gameplay at the bottom right.
- These alerts provide guidance, encouragement, or hints when players may be stuck.
- Adds a layer of realism and support, simulating mentor check-ins during a real hackathon.
<p align="center">
  <img src="frontend/public/screenshots/mentor-popup.png" alt="mentor-popup" height="400"/>
</p>

---

### Minigame – Multiple Choice
- Displays a loading screen while the agentic AI generates a personalized question.
- Presents object oriented programming (OOP) themed multiple-choice coding questions.
- Each correct answer increases progress by 25%.
- Visual feedback is provided after submission:
  - Correct answers are highlighted in green.
  - Incorrect answers are highlighted in red.
- A mentor character on the right side is clickable and provides contextual hints.
- Both the questions and hints are generated dynamically by AI agents.
<table align="center">
  <tr>
    <td>
      <img src="frontend/public/screenshots/mutiple-choice1.png" alt="mutiple-choice1" width="500"/>
    </td>
    <td>
      <img src="frontend/public/screenshots/multiple-choice1-incorrect.png" alt="multiple-choice1-incorrect" width="500"/>
    </td>
  </tr>
</table>
<table align="center">
  <tr>
    <td>
      <img src="frontend/public/screenshots/mutiple-choice2.png" alt="mutiple-choice2" width="500"/>
    </td>
    <td>
      <img src="frontend/public/screenshots/multiple-choice2-correct.png" alt="multiple-choice2-correct" width="500"/>
    </td>
  </tr>
</table>

---

### Minigame – Drag and Drop
- Displays a loading screen while the agentic AI generates a personalized question.
- Presents object oriented programming (OOP) themed drag and drop questions, which is a more challenging, interactive minigame focused on code structure.
- Players must drag and drop lines of code into the correct order.
- Correctly completing this minigame increases progress by 50%.
- Visual feedback is provided after submission:
  - Correct solutions are highlighted in green.
  - Incorrect solutions are highlighted in red.
- A mentor character on the right side is clickable and provides contextual hints.
- Both the questions and hints are generated dynamically by AI agents.
<p align="center">
  <img src="frontend/public/screenshots/drag-and-drop.png" alt="drag-and-drop" height="400"/>
</p>
<table align="center">
  <tr>
    <td>
      <img src="frontend/public/screenshots/drag-and-drop-correct.png" alt="drag-and-drop-correct" width="500"/>
    </td>
    <td>
      <img src="frontend/public/screenshots/drag-and-drop-incorrect.png" alt="drag-and-drop-incorrect" width="500"/>
    </td>
  </tr>
</table>

---

### Victory Dialog
- Triggered when the player fills the progress bar before the 2-minute time limit.
- Displays a celebratory congratulations message.
- Includes a confetti animation to reward the player for winning the hackathon challenge.
<p align="center">
  <img src="frontend/public/screenshots/win.png" alt="win" height="500"/>
</p>

---

### Game Over Dialog
- Triggered when the 2-minute timer runs out before the progress bar is filled.
- Displays a game-over screen to indicate the hackathon challenge was not completed in time.
<p align="center">
  <img src="frontend/public/screenshots/game-over.png" alt="game-over" height="500"/>
</p>


<br>

## How We Built It
Overhacked!was built using the following tech stack:

- **Phaser.js (Game engine):** A new tool for all members of our team, used to build the core game mechanics, scenes, player movement, and interactions.
- **Next.js, React.js, and TypeScript (Frontend & UI):** Next.js served as the framework for structuring the application, while React.js and TypeScript were used to build UI components and ensure type safety. This stack was utilized by many of our members previously in prior personal and hackathon projects, making it the ideal frontend tool for rapid development.
- **OpenAI + CrewAI (Agentic AI integration):** We leveraged OpenAI’s large language models (LLMs) to generate dynamic content for our games, such as quiz questions and hints. CrewAI was used to create specialized AI agents for each mini-game. These agents serve two main purposes:
  - **Quiz Creator Agents:** Generate personalized quizzes based on the player's experience level and preferred programming language to adapt the mini-games to the player's level of skill.
  - **Hint Agents:** Provide contextual hints for each question, helping players understand concepts without giving away the answers directly.
- **FastAPI + Python (Backend API endpoints):** Used to handle backend logic and API communication, including GET and POST requests for returning prompted questions.

<br>

## Challenges We Ran Into
It was the first time using Phaser.js for everyone on the team. While some members focused primarily on UI or backend development, integrating the game frontend with the backend APIs was particularly challenging. On the frontend side, we learned how to design and structure Phaser scenes, manage sprite sheets and animations, implement player movement and collision handling, and coordinate interactive elements such as NPC proximity triggers and UI overlays within a real-time game loop. For the backend side, it was our first time using FastAPI, and there was a significant learning curve around defining clear schemas, naming them appropriately, and integrating them with agentic AI workflows. Overall, the project required close collaboration to align gameplay logic, UI state, and backend data flow into a cohesive experience.

<br>

## Accomplishments That We're Proud Of
We’re very proud that we were able to deliver a fully working MVP using several technologies that were completely new to our team. While the gameplay itself is intentionally straightforward, building it required a deep dive into core game mechanics such as scene management, player movement, collisions, state handling, and real-time UI updates. Beyond the game logic, we also learned how interactive UI components, AI-driven content, and backend APIs need to work together seamlessly to create an experience that feels responsive and immersive for the player. Integrating Phaser scenes with a modern React and Next.js frontend, while coordinating real-time interactions with AI-powered NPCs, pushed us to think carefully about architecture, performance, and user experience. Overall, this project was a valuable learning experience that challenged us to step outside our comfort zones, rapidly learn unfamiliar tools, and collaborate effectively under tight time constraints to turn an idea into a playable game.

<br>

## What We Learned
Through this project, we learned the fundamentals of 2D game design, including how to structure scenes, manage player movement and collisions, and design interactive gameplay loops. While this experience only scratched the surface of what Phaser.js has to offer, it gave us a strong foundation and a clear appreciation for the depth of the game engine. As a collaborative team effort, we also significantly improved our development workflows and teamwork. Working with Git and GitHub in a fast-paced environment helped us become more comfortable with branching strategies, pull requests, and resolving merge conflicts.

<br>

## What's Next For Overhacked!
Improved AI agents by adding a game "master" whom oversees the entire game, directing NPC agents to curate the difficulty of the questions depending on how quickly the player answers them/how many they answer correctly.
Figure out how to improve AI response latency, as there is still some prolonged loading time between NPC interaction with question generation.
Store each user's quiz results to better personalize content and optimize question difficulty, enabling players to learn more efficiently.
Add more real-life hackathon scenarios into the game that can affect the outcome (e.g. NPC dialogue, NPCs start to get tired/demotivated, NPCs getting distracted, Fixing bugs in real-time, Sudden typing tests, Disappearing members that the player needs to find, etc.).
As mentioned above: More subjects and topics to study from (e.g. Full stack development including front-end and backend, data structures and algorithms, systems design, etc.).
Data persistence with a database to store logged user data, alongside a leaderboard that shows the highest scores.
More animated elements to the UI to add greater engagement for the player!

<br>

## How to Run Locally (Frontend & Backend)

### 1. Prerequisites
Make sure you have the following installed:
- **Node.js (v18 or later)**: Used for running the Next.js frontend and managing JavaScript dependencies. Check the Node.js version using:
  ```bash
  node --version
  ```
- **Python (3.10 or later)**: Required for running the FastAPI backend and AI agents. Check the Python version using:
  ```bash
  python --version
  ```
- **Git**: Used to clone the repository. Check the Git version using:
  ```bash
  git --version
  ```

### 2. Clone the repository
Clone the repository and navigate into the project root directory by running:
```bash
git clone https://github.com/steph-xue/overhacked.git
cd overrhacked
```

### 3. Install frontend dependencies
From the project root, navigate to the frontend directory and install the dependencies using:
```bash
cd frontend
npm install
```

### 4. Start the frontend development server
Use the command:
```bash
npm run dev
```
Once started, the frontend will be available at:
```bash
http://localhost:3000
```

### 5. Navigate to the backend directory
From the project root, navigate to the backend directory by running:
```bash
cd backend
```

### 6. Virtual environment
Create and activate a Python virtual environment using:
```bash
python -m venv venv
source venv/bin/activate  # Linux / macOS
venv\Scripts\activate     # Windows
```

### 7. Install backend dependencies
Install all required Python packages by running:
```bash
pip install -r requirements.txt
```

### 8. Set backend environment variables
Create a .env file in the backend directory and add in the following:
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

### 5. Run the backend server
Launch the FastAPI backend server using Uvicorn using:
```bash
uvicorn main:app --reload  --port 8000
```
The server will start at: http://127.0.0.1:8000
