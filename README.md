# Legal Agent API

An AI-powered legal assistant capable of researching laws, drafting legal documents, and searching the web for real-time legal information. Built with Google ADK, FastAPI, and Weaviate.

**Now with persistent sessions and Docker support!**

## Features

- **RAG (Retrieval-Augmented Generation):** Retrieve relevant legal context from a Weaviate vector database.
- **Web Search:** Real-time search capabilities using Tavily API for up-to-date legal info.
- **Document Drafting:** Generate legal documents (e.g., RTI applications, Legal Notices) when explicitly requested.
- **Persistent Sessions:** Chat history is saved to disk (`legal_agent/sessions`) and preserved across server restarts.
- **Dockerized:** Ready to run in any environment with `docker-compose`.
- **Robustness:** Includes timeouts for external APIs and loop prevention logic.

## Prerequisites

- **Docker & Docker Compose** (Recommended)
- **Ollama:** Installed and running locally (for embeddings).
  - Pull the embedding model: `ollama pull nomic-embed-text`
- **Keys:** OpenRouter, Weaviate, Tavily.

## Quick Start (Docker)

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd legal-agent
    ```

2.  **Configure Environment:**
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

3.  **Run with Docker Compose:**
    ```bash
    docker-compose up --build
    ```
    The server will start at `http://localhost:8002`.

## Manual Installation

If you prefer running without Docker:

1.  **Create venv:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # or .\venv\Scripts\activate on Windows
    ```

2.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Run Server:**
    ```bash
    python server.py
    ```

## Usage

### API Documentation (Swagger UI)

Visit **http://localhost:8002/docs** to interact with the API endpoints:

-   `GET /`: Health check.
-   `POST /session`: Create a new chat session.
-   `POST /chat`: Send a message to the agent.
    -   **Payload:** `{"message": "Query", "session_id": "optional-uuid", "user_id": "optional-user"}`
    -   If a `session_id` is provided, the agent loads previous context.
-   `GET /downloads/{filename}`: Download generated documents.

### Verification Scripts

Use the provided scripts to test functionality:

-   `verify_chat.py`: Basic chat test.
-   `verify_session.py`: Tests session persistence (memory).

### Frontend (Streamlit UI)

To use the new chat interface:

1.  **Install Streamlit:**
    ```bash
    pip install streamlit
    ```

2.  **Run the UI:**
    ```bash
    streamlit run ui.py
    ```
    This will open the application in your browser at `http://localhost:8501`.

## Project Structure

-   `legal_agent/`: Core logic.
    -   `agent.py`: Agent definition (Lazy loaded).
    -   `runner.py`: Persistent Runner execution layer.
    -   `persistence.py`: File-based session storage logic.
    -   `tools/`: RAG, Search, and Document Generation tools.
-   `server.py`: FastAPI server.
-   `Dockerfile` & `docker-compose.yml`: Containerization logic.

## Notes

-   **Ollama Embeddings:** Ensure your Ollama instance is accessible to the container (if using Docker, you might need to use `host.docker.internal` in your code if you change the embedding configuration).
-   **Anti-Hang:** The server uses `LegalAgentRunner` to manage the ADK lifecycle, preventing infinite loops and ensuring timely responses.
