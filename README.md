# Your go-to Data Analyst!
A context-aware conversational agent designed to query analytical dashboards and generate structured insights in real time. The system supports multiple user interaction modes and inference capabilities while maintaining low latency, contextual accuracy, and optimized UX for decision-making scenarios.

### Play with it ->
https://sugar-bot.vercel.app

### Check hosted backend code -> 

https://github.com/Manyolo1/sugarBot_backend

---
## System Overview

The assistant allows users to query dashboard data conversationally and retrieve precise, context-rich summaries or arithmetic insights (e.g., cost-per-kg, supplier comparison, growth trends).
It’s designed for multi-context environments,such as procurement, finance, and operations—where team members require quick, accurate insights without navigating deeply nested dashboards.

The architecture emphasizes:
- Stateless reasoning per session (short-term memory only)
- Prompt-mode flexibility (detailed vs. concise)
- Explicit inference control to separate data summarization from reasoning-heavy computation

---
## Architecture
![Frontend](https://img.shields.io/badge/Frontend-ReactJS-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Agent Framework](https://img.shields.io/badge/Agent_Framework-LangChain-1C3C3C?style=for-the-badge&logo=chainlink&logoColor=white)
![LLM](https://img.shields.io/badge/LLM-Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Language](https://img.shields.io/badge/Language-Python-3776AB?style=for-the-badge&logo=python&logoColor=white)


## High-Level Flow

### User Interaction (React):
Users query the assistant via a chat interface (bottom-right floating widget).

Two modes available:

- Detailed Mode: Generates structured, verbose insights for reports or presentations.
- To-the-Point Mode: Returns concise summaries for rapid decision-making.

Users can upload XLSX files for ad-hoc data analysis.

### Backend Processing (FastAPI):

- Handles file parsing, validation, and session-based memory instantiation.
- Implements  endpoints that interacts with LangChain pipelines.
- Integrates an explicit “stop generation” endpoint to terminate LLM calls mid-response for UX control.

### Agent Layer (LangChain + Gemini 2.5):

- Routes user inputs through structured prompt templates.
- Switches between two prompt chains:

Summary Chain → Contextual data summarization
Inference Chain → Logical/arithmetic reasoning (activated via “Inference” button)

- Session memory maintained via ephemeral LangChain memory objects (short-term only).

### LLM Reasoning (Gemini 2.5):
- Executes semantic reasoning and arithmetic inference on structured data.
- Ensures concise, business-appropriate tone by enforcing strict output templates.

---
## Implementation Highlights

### Short-Term Session Memory
- Designed intentionally without persistent context. Each session operates independently to reduce complexity, memory overhead, and cross-session leakage.
- Ideal for single-use business scenarios (e.g., reviewing one quarterly report).

### Prompt Engineering Strategy
- Toggle prompts adapt dynamically to user mode:
- Detailed Mode: Adds contextual expansion and comparative phrasing.
- To-the-Point Mode: Minimal token consumption, optimized for low-latency.

### Inference Control
The “Inference” button explicitly triggers higher reasoning depth (trend detection, arithmetic computation, correlation checks). This avoids unnecessary LLM computation for every query, optimizing cost and latency.

---

> manyolo. :)
