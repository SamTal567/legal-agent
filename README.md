# ⚖️ AI Legal Agent

![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen)
![Python](https://img.shields.io/badge/Python-3.12-blue?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009485?logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker&logoColor=white)
![Weaviate](https://img.shields.io/badge/Weaviate-Vector_DB-green?logo=weaviate&logoColor=white)

> **Democratizing legal access with Generative AI.**  
> Research laws, draft documents, and get real-time legal advice grounded in the Bharatiya Nyaya Sanhita (BNS) and other Indian acts.

![Hero Image](images/Screenshot%202026-01-19%20184105.png)

---

## 🚀 Overview

The **Legal Agent** is a sophisticated AI assistant designed to bridge the gap between complex legal jargon and the common man. It combines **RAG (Retrieval-Augmented Generation)** with **Real-Time Web Search** to provide accurate, context-aware legal assistance.

Whether you need to understand the punishment for "Snatching" under the new laws or draft a specialized Legal Notice, this agent has you covered.

---

## 🛠️ Tech Stack

### **Backend**
| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | ![FastAPI](https://img.shields.io/badge/-FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white) | High-performance Async API |
| **Agent Engine** | **Google ADK** | Structured reasoning & loop management |
| **Database** | ![Weaviate](https://img.shields.io/badge/-Weaviate-01A31C?style=flat-square&logo=weaviate&logoColor=white) | Vector Database for RAG (BNS, RTI, RERA) |
| **LLM** | ![OpenRouter](https://img.shields.io/badge/-OpenRouter-743EC7?style=flat-square) | Access to Gemini & other top-tier models |
| **Persistence** | **File-Based** | JSON storage for chat sessions & memory |

### **Frontend**
| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | ![Next.js](https://img.shields.io/badge/-Next.js-000000?style=flat-square&logo=next.js&logoColor=white) | React-based modern UI |
| **Styling** | ![Tailwind](https://img.shields.io/badge/-Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) | Responsive design |
| **Runtime** | ![Bun](https://img.shields.io/badge/-Bun-FBF0DF?style=flat-square&logo=bun&logoColor=black) | Fast JS runtime & package manager |

---

## 📂 Project Structure

```bash
legal-agent/
├── 🐳 docker-compose.yml       # Orchestration for Backend & Weaviate conn
├── 🐳 Dockerfile               # Backend container definition
├── 📄 requirements.txt         # Python dependencies
├── 📜 server.py                # FastAPI Entry Point
│
├── 📂 legal_agent/             # Core Logical Module
│   ├── 🧠 agent.py             # Google ADK Agent Definition
│   ├── 🏃 runner.py            # Event Loop & State Management
│   ├── 💾 persistence.py       # Session Storage Logic
│   │
│   ├── 🛠️ tools/               # Agent Capabilities
│   │   ├── retrieval.py        # RAG (Weaviate)
│   │   ├── tavily_search.py    # Web Search
│   │   └── doc_generator.py    # Document Drafting
│   │
│   └── 💻 frontend/            # Next.js Web Application
│       ├── app/                # App Router Pages
│       └── components/         # UI Components (ChatBubble, Input)
│
└── 📂 images/                  # Project Screenshots
```

---

## ✨ Features

### 1. 🔍 Contextual RAG
Uses **Weaviate** to index and retrieve granular legal sections from:
*   *Bharatiya Nyaya Sanhita (BNS) 2023*
*   *RTI Act 2005*
*   *RERA Act 2016*

### 2. 🌍 Live Web Search
Integrated with **Tavily API** to fetch post-knowledge-cutoff updates, such as the latest Supreme Court judgments from 2024-2025.

### 3. 📝 Automated Drafting
Can fill specialized legal templates to generate downloadable **.docx** files for:
*   *Legal Notices*
*   *RTI Applications*
*   *Consumer Complaints*

### 4. 🧠 Persistent Memory
Remembers user details (Name, Case ID) across sessions, allowing for continuous long-term consultation.

---

## ⚡ Quick Start

### 1. Backend (Docker)

**Prerequisites:** Docker, Ollama (`ollama pull nomic-embed-text`)

1.  **Configure `.env`**:
    ```env
    OPENROUTER_API_KEY=sk-or-...
    WEAVIATE_URL=https://...
    WEAVIATE_API_KEY=...
    TAVILY_API_KEY=tvly-...
    OLLAMA_BASE_URL=http://host.docker.internal:11434
    ```

2.  **Start Services**:
    ```bash
    docker-compose up --build
    ```
    *API running at `http://localhost:8002`*

### 2. Frontend (Next.js)

1.  **Install & Run**:
    ```bash
    cd legal_agent/frontend
    bun install
    bun run dev
    ```
    *UI running at `http://localhost:3000`*

---

## 📸 Screenshots

<div style="display: flex; gap: 10px;">
  <img src="images/Screenshot%202026-01-19%20183650.png" width="45%" />
  <img src="images/Screenshot%202026-01-19%20183623.png" width="45%" />
</div>

---

Made with ❤️ for the Hackathon.
