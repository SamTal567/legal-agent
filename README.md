# Legal Agent API

An AI-powered legal assistant capable of researching laws, drafting legal documents, and searching the web for real-time legal information. Built with Google ADK, FastAPI, and Weaviate.

## Features

- **RAG (Retrieval-Augmented Generation):** Retrieve relevant legal context from a Weaviate vector database.
- **Web Search:** Real-time search capabilities using Tavily API for up-to-date legal info.
- **Document Drafting:** Generate legal documents (e.g., RTI applications) when explicitly requested.
- **Session Management:** Persistent chat sessions with context retention.
- **API First:** Fully functional REST API built with FastAPI.

## Prerequisites

- **Python 3.10+**
- **Ollama:** Installed and running locally (for embeddings).
  - Pull the embedding model: `ollama pull nomic-embed-text`
- **Weaviate:** Cloud or local instance for vector storage.
- **Tavily API Key:** For web search functionality.
- **OpenRouter / OpenAI API Key:** For the underlying LLM.

## Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd illegal-agent
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    python -m venv venv
    # Windows
    .\venv\Scripts\activate
    # Linux/Mac
    source venv/bin/activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
    *Note: Ensure `tavily-python` is installed.*

4.  **Configuration:**
    Create a `.env` file in the root directory with the following variables:
    ```env
    OPENROUTER_API_KEY=your_key_here
    WEAVIATE_URL=your_weaviate_url
    WEAVIATE_API_KEY=your_weaviate_key
    TAVILY_API_KEY=your_tavily_key
    ```

## Usage

### 1. Start the Server

Run the FastAPI server:

```bash
python server.py
```
The server will start at `http://0.0.0.0:8002`.

### 2. API Documentation (Swagger UI)

Visit **http://localhost:8002/docs** to interact with the API endpoints:

-   `GET /`: Health check.
-   `POST /session`: Create a new chat session.
-   `POST /chat`: Send a message to the agent.
-   `GET /downloads/{filename}`: Download generated documents.

### 3. Running Tests

To verify the agent's functionality (RAG, Web Search, etc.):

```bash
python test_suite.py
```

## Project Structure

-   `legal_agent/`: Contains the agent logic and tools.
    -   `agent.py`: Main agent definition and instructions.
    -   `tools/retrieval.py`: Weaviate RAG implementation.
    -   `tools/tavily_search.py`: Web search tool.
-   `server.py`: FastAPI application server.
-   `test_suite.py`: Automated integration tests.

## Notes

-   **Ollama Embeddings:** The project uses `nomic-embed-text` via Ollama for embedding queries. Ensure Ollama is running (`ollama serve`).
-   **Loop Prevention:** The server includes a safety mechanism to terminate agent execution if it exceeds 30 steps to prevent infinite loops.
