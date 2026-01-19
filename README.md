# Legal Agent API

An AI-powered legal assistant capable of researching laws, drafting legal documents, and searching the web for real-time legal information. Built with Google ADK, FastAPI, Weaviate, and a Next.js Frontend.

**Now with persistent sessions, Dockerized backend, and a modern Web UI!**

## Features

- **RAG (Retrieval-Augmented Generation):** Retrieve relevant legal context from a Weaviate vector database (RTI, RERA, BNS).
- **Web Search:** Real-time search capabilities using Tavily API for up-to-date legal info (Supreme Court judgments).
- **Document Drafting:** Generate legal documents (e.g., RTI applications, Legal Notices) downloadable as `.docx`.
- **Persistent Sessions:** Chat history is saved to disk and preserved across server restarts.
- **Modern UI:** A responsive chat interface built with Next.js.

## Prerequisites

- **Docker & Docker Compose** (Recommended for Backend)
- **Node.js & Bun/npm** (For Frontend)
- **Ollama:** Installed and running locally (for embeddings).
  - Pull the embedding model: `ollama pull nomic-embed-text`
- **Keys:** OpenRouter, Weaviate, Tavily.

## Quick Start

### 1. Backend (Docker)

1.  **Configure Environment:**
    Create a `.env` file in the root directory:
    ```env
    OPENROUTER_API_KEY=your_key_here
    WEAVIATE_URL=your_weaviate_url
    WEAVIATE_API_KEY=your_weaviate_key
    TAVILY_API_KEY=your_tavily_key
    
    # Optional: For Gemini
    GEMINI_API_KEY=your_gemini_key_here
    LLM_PROVIDER=gemini  # Set to 'gemini' to use Google Gemini
    ```

2.  **Run with Docker Compose:**
    ```bash
    docker-compose up --build
    ```
    The Backend API will start at `http://localhost:8002`.

### 2. Frontend (Next.js)

1.  **Navigate to Frontend Directory:**
    ```bash
    cd legal_agent/frontend
    ```

2.  **Install Dependencies:**
    ```bash
    bun install  # or npm install
    ```

3.  **Run Development Server:**
    ```bash
    bun run dev  # or npm run dev
    ```
    The UI will be available at `http://localhost:3000`.

## Architecture

-   **Backend:** FastAPI server (`server.py`) handling chat logic, session management, and RAG.
-   **Agent Engine:** Google ADK agent (`legal_agent/agent.py`) running inside a persistent Runner (`legal_agent/runner.py`).
-   **Database:** Weaviate Cloud (Vector DB) for storing legal acts.
-   **Frontend:** Next.js application interacting with the Backend API.

## Usage

1.  Open the frontend at `http://localhost:3000`.
2.  Start chatting!
    *   *Ask questions:* "What is the punishment for Snatching under BNS?"
    *   *Draft documents:* "Draft a legal notice for my tenant."
    *   *Search web:* "Latest Supreme Court judgment on Privacy."
3.  Generated documents will be provided as downloadable links in the chat.

## Verification Scripts

Use the provided scripts in the root directory to test backend functionality directly:

-   `test_suite.py`: Comprehensive functionality test (Connectivity, RAG, Web Search).
-   `verify_chat.py`: Basic chat test.
-   `verify_session.py`: Tests session persistence.
