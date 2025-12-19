import os
import json
import uuid
from typing import List, Optional, Dict
from google.adk.sessions.base_session_service import BaseSessionService
from google.adk.sessions.session import Session

class FileSessionService(BaseSessionService):
    def __init__(self, storage_dir: str = "sessions"):
        self.storage_dir = storage_dir
        os.makedirs(self.storage_dir, exist_ok=True)
        self.cache: Dict[str, Session] = {}

    def _get_path(self, session_id: str) -> str:
        return os.path.join(self.storage_dir, f"{session_id}.json")

    async def create_session(self, app_name: str, user_id: str) -> str:
        session_id = str(uuid.uuid4())
        session = Session(
            id=session_id,
            app_name=app_name,
            user_id=user_id,
            events=[]
        )
        await self.update_session(session)
        return session_id

    async def get_session(self, app_name: str, user_id: str, session_id: str) -> Optional[Session]:
        # 1. Check Cache
        if session_id in self.cache:
            return self.cache[session_id]

        # 2. Check Disk
        path = self._get_path(session_id)
        if not os.path.exists(path):
            return None
        
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            # Deserialize
            try:
                session = Session.model_validate(data)
            except AttributeError:
                session = Session.parse_obj(data)
            
            # Update Cache
            self.cache[session_id] = session
            return session
        except Exception as e:
            print(f"Error loading session {session_id}: {e}")
            return None

    async def update_session(self, session: Session) -> None:
        print(f"DEBUG: Updating session {session.id} (Events: {len(session.events)})")
        # Update Cache
        self.cache[session.id] = session
        # Write to Disk
        await self.save_session(session.id)

    async def save_session(self, session_id: str) -> None:
        """Explicitly write cached session to disk."""
        if session_id not in self.cache:
            return
        
        session = self.cache[session_id]
        print(f"DEBUG: Persisting session {session.id} to disk.")
        path = self._get_path(session.id)
        with open(path, "w", encoding="utf-8") as f:
            try:
                f.write(session.model_dump_json())
            except AttributeError:
                f.write(session.json())

    async def delete_session(self, app_name: str, user_id: str, session_id: str) -> None:
        path = self._get_path(session_id)
        if os.path.exists(path):
            os.remove(path)

    async def list_sessions(self, app_name: str, user_id: str) -> List[str]:
        sessions = []
        for filename in os.listdir(self.storage_dir):
            if filename.endswith(".json"):
                 # Optional: Filter by user_id if we loaded the content, 
                 # but for simple listing we just return IDs.
                 sessions.append(filename[:-5])
        return sessions
