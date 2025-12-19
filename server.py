import os
import re
import uuid
import asyncio
import importlib
from dotenv import load_dotenv

# --- 0. ASYNCIO LOOP FIX (CRITICAL) ---
try:
    asyncio.get_event_loop()
except RuntimeError:
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

from contextlib import asynccontextmanager
from typing import Optional, List, Dict

from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# ... (patch omitted for brevity, it's fine)

# --- APP LIFESPAN ---
root_agent = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global root_agent
    try:
        print("Initialize Agent...")
        from legal_agent.agent import get_agent
        root_agent = get_agent()
        print("Agent Initialized.")
    except Exception as e:
        print(f"CRITICAL ERROR IN LIFESPAN: {e}")
        import traceback
        traceback.print_exc()
        raise
    yield
    print("Shutting down...")

# Google ADK imports
from google.adk.agents import InvocationContext, RunConfig
from google.adk.events import Event
from google.adk.sessions.base_session_service import BaseSessionService
from google.adk.sessions.session import Session
from google.genai import types

load_dotenv()

# --- PATCH GOOGLE ADK ---
try:
    targets = [
        "google.adk.sessions",
        "google.adk.session",
        "google.adk.types",
        "google.adk.agents.session"
    ]
    patched = False
    for target in targets:
        try:
            module = importlib.import_module(target)
            if hasattr(module, "Session"):
                SessionClass = getattr(module, "Session")
                if hasattr(SessionClass, "model_config"):
                    SessionClass.model_config["extra"] = "ignore"
                    patched = True
                elif hasattr(SessionClass, "Config"):
                    SessionClass.Config.extra = "ignore"
                    patched = True
                if patched:
                    print(f"SUCCESS: Patched {target}.Session to allow extra fields.")
                    break
        except ImportError:
            continue
except Exception as e:
    print(f"Patching warning: {e}")
# ------------------------

# --- SESSION SERVICE ---
# --- CONFIG ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "legal_agent", "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# --- SESSION SERVICE ---
# Switched to FilePersistence to save chats across restarts
from legal_agent.persistence import FileSessionService

session_storage_path = os.path.join(BASE_DIR, "legal_agent", "sessions")
session_service = FileSessionService(storage_dir=session_storage_path)

# --- APP LIFESPAN ---
# --- APP LIFESPAN ---
runner_instance = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global runner_instance
    try:
        print("Initialize Agent Runner...")
        # lazy import to avoid circular dep issues if any, ensuring env execution
        from legal_agent.runner import LegalAgentRunner
        
        # Initialize the singleton runner with our session service
        runner_instance = LegalAgentRunner.get_instance(session_service)
        print("Agent Runner Initialized.")
    except Exception as e:
        print(f"CRITICAL ERROR IN LIFESPAN: {e}")
        import traceback
        traceback.print_exc()
        raise
    yield
    print("Shutting down...")

app = FastAPI(title="Legal Agent API", lifespan=lifespan)

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- STATIC FILES ---
# Config moved to top
app.mount("/downloads", StaticFiles(directory=OUTPUT_DIR), name="downloads")

# --- MODELS ---
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    user_id: Optional[str] = "default_user"

class ChatResponse(BaseModel):
    response: str
    filename: Optional[str] = None
    session_id: str

class SessionResponse(BaseModel):
    session_id: str

# --- ENDPOINTS ---

@app.get("/")
async def health():
    return {"status": "ok", "service": "legal_agent"}

@app.post("/session", response_model=SessionResponse)
async def create_session_endpoint():
    session_id = await session_service.create_session("legal_agent", "default_user")
    return SessionResponse(session_id=session_id)

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        # 1. Get Session ID
        session_id = request.session_id
        if not session_id:
             session_id = await session_service.create_session("legal_agent", request.user_id)
        else:
             # Validate session exists
             sess = await session_service.get_session("legal_agent", request.user_id, session_id)
             if not sess:
                  session_id = await session_service.create_session("legal_agent", request.user_id)

        # 2. Execute Runner
        # The runner abstraction handles context, user content creation, and the event loop
        final_text = await runner_instance.run_chat(session_id, request.message, user_id=request.user_id)

        # 3. Extract File (Logic retained from original)
        filename = None
        # Explicit path check
        path_match = re.search(r'created at:\s*(.*?\.docx)', final_text, re.IGNORECASE)
        if path_match:
            filename = os.path.basename(path_match.group(1).strip())
        # Regex Draft Check
        if not filename:
            draft_match = re.search(r'Draft_[a-zA-Z0-9_-]+\.(docx|pdf)', final_text)
            if draft_match:
                 filename = draft_match.group(0)

        return ChatResponse(
            response=final_text,
            filename=filename,
            session_id=session_id
        )

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Use app object directly to avoid import confusion
    uvicorn.run(app, host="0.0.0.0", port=8002)
