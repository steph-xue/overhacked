<h1 align="center">
  Overhacked!
</h1>

<h2 align="center">
  A cozy hackathon game where you talk to teammates, solve coding challenges, and race the clock to win together!
</h2>

<h3>NWHacks 2026</h3>
Devpost link: https://devpost.com/software/overhacked
<br>
<br>

https://github.com/user-attachments/assets/2e9fa9cf-fa4e-4b84-a2d3-502f0107b06f

<br>
  
<br>

## Inspiration
As CS students, attending hackathons is one of our favourite ways to meet new people, find like-minded collaborators, and bring a shippable MVP to life. That said, you might end up meeting some people who are a bit too preoccupied with other priorities, like studying, grinding LeetCode, or applying for internships (which, to be fair, is completely valid). With this in mind, we wanted to create a game that not only mimics a chaotic energy of a hackathon environment, but also gives players a fun way to brush up on their programming knowledge through a variety of mini-games. From object oriented programming (OOP) multiple-choice questions to interactive drag-and-drop challenges, Overhacked! has you covered.

<br>

## What It Does
The aim of the game for Overhacked! is simple: fill the progress bar by answering your fellow teammates' questions as quickly as possible. Each correct answer adds to your progress bar. Multiple choice questions will fill the progress bar by 25%, while the more challenging drag and drop questions will fill it by 50%. Players win by completely filling the progress bar, which triggers a congratulatory message and celebratory confetti animation to signify that “your MVP was fully shipped.” If time runs out before the bar is filled, the game will end with a game over dialog. While the demo features a 2-minute round, we eventually hope to expand the gameplay longer so that covers more concepts like full-stack development (frontend and backend), data structures and algorithms, systems design and many more. We would also like to include tailored feedback to help players identify areas for improvement. See below for planned future improvements!

<br>

## Features

### Landing Screen
- Welcomes the user to the application
<p align="center">
  <img src="assets/screenshots/landing-page.jpg" alt="landing" height="500"/>
</p>


<br>

## How We Built It
Overhacked was built using the following tech stack:

- **Phaser.js (Game engine):** A new tool for all members of our team, used to build the core game mechanics, scenes, player movement, and interactions.
- **Next.js, React.js, and TypeScript (Frontend & UI):** Next.js served as the framework for structuring the application, while React.js and TypeScript were used to build UI components and ensure type safety. This stack was utilized by many of our members previously in prior personal and hackathon projects, making it the ideal frontend tool for rapid development.
- **OpenAI + CrewAI (Agentic AI integration): We leveraged OpenAI’s large language models (LLMs) to generate dynamic content for our games, such as quiz questions and hints. CrewAI was used to create specialized AI agents for each mini-game. These agents serve two main purposes:
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
