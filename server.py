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
class InMemorySessionService(BaseSessionService):
    def __init__(self):
        self.sessions: Dict[str, Session] = {}

    async def create_session(self, app_name: str, user_id: str) -> str:
        s_id = str(uuid.uuid4())
        self.sessions[s_id] = Session(
            id=s_id,
            app_name=app_name,
            user_id=user_id,
            events=[]
        )
        return s_id

    async def get_session(self, app_name: str, user_id: str, session_id: str) -> Optional[Session]:
        return self.sessions.get(session_id)

    async def update_session(self, session: Session) -> None:
        self.sessions[session.id] = session

    async def delete_session(self, app_name: str, user_id: str, session_id: str) -> None:
        if session_id in self.sessions:
            del self.sessions[session_id]

    async def list_sessions(self, app_name: str, user_id: str) -> List[str]:
        return list(self.sessions.keys())

session_service = InMemorySessionService()

# --- APP LIFESPAN ---
root_agent = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global root_agent
    print("Initialize Agent...")
    from legal_agent.agent import get_agent
    root_agent = get_agent()
    print("Agent Initialized.")
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
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "legal_agent", "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)
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
        # 1. Get Session
        session_id = request.session_id
        if not session_id:
            session_id = await session_service.create_session("legal_agent", request.user_id)
        
        session = await session_service.get_session("legal_agent", request.user_id, session_id)
        if not session:
             # If explicit ID invalid, create new
             session_id = await session_service.create_session("legal_agent", request.user_id)
             session = await session_service.get_session("legal_agent", request.user_id, session_id)

        # 2. Setup Context
        ctx = InvocationContext(
            invocation_id=str(uuid.uuid4()),
            agent=root_agent,
            session=session,
            session_service=session_service,
            agent_states={},
            end_of_agents={},
            run_config=RunConfig(response_modalities=['text'])
        )

        # 3. Add User Input
        user_content = types.Content(
            role="user",
            parts=[types.Part(text=request.message)]
        )
        ctx.session.events.append(Event(
            id=str(uuid.uuid4()),
            author="user",
            invocation_id=ctx.invocation_id,
            content=user_content
        ))

        # 4. Run Agent
        final_text = ""
        iteration_count = 0
        MAX_ITERATIONS = 30
        
        print("DEBUG: Starting Agent Loop...")
        async for event in root_agent.run_async(ctx):
             iteration_count += 1
             # print(f"DEBUG: Event {iteration_count}: {event}") # (Optional: Uncomment specific logs if needed, but keeping it clean for now)
             
             if iteration_count >= MAX_ITERATIONS:
                 print(f"DEBUG: Forced termination after {MAX_ITERATIONS} events.")
                 final_text += "\n\n[System Error: The agent got stuck in a loop and was forcibly stopped. Please try a more specific query.]"
                 break

             if event.is_final_response() and event.content and event.content.parts:
                text_part = ''.join(p.text for p in event.content.parts if p.text)
                final_text += text_part

        # 5. Persist Session
        await session_service.update_session(ctx.session)

        # 6. Extract File
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
