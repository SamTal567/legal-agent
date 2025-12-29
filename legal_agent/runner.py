from typing import Optional
import os
import logging
from google.adk import Runner
from google.adk.sessions.base_session_service import BaseSessionService
from google.genai import types

from legal_agent.agent import get_agent  # Import the factory function

logger = logging.getLogger(__name__)

class LegalAgentRunner:
    """
    Singleton wrapper for the ADK Runner to ensure persistent execution logic.
    """
    _instance = None
    
    def __init__(self, session_service: BaseSessionService):
        self.runner = Runner(
            agent=get_agent(),
            app_name="legal_agent",
            session_service=session_service
        )
        logger.info("LegalAgentRunner initialized with persistent Runner.")

    @classmethod
    def get_instance(cls, session_service: Optional[BaseSessionService] = None) -> "LegalAgentRunner":
        if cls._instance is None:
            if session_service is None:
                raise ValueError("Session service required for first initialization")
            cls._instance = cls(session_service)
        return cls._instance

    async def run_chat(self, session_id: str, user_message: str, user_id: str = "default_user") -> str:
        """
        Executes the agent for a given session and message using proper ADK Runner lifecycle.
        """
        logger.info(f"Runner executing for session {session_id}")
        
        # Create the user content object
        user_content = types.Content(
            role="user",
            parts=[types.Part(text=user_message)]
        )

        final_text = ""
        
        # Use the runner's run method which handles event loop and state management
        # Note: Runner.run is a synchronous generator in this version of ADK
        for event in self.runner.run(session_id=session_id, user_id=user_id, new_message=user_content):
            print(f"DEBUG Event: {event}")
            # Capture the model's text response chunks
            if event.is_final_response() and event.content and event.content.parts:
                text_part = ''.join(p.text for p in event.content.parts if p.text)
                final_text += text_part
        
        # Explicitly save session state to disk
        # (Assuming the session service is our custom FileSessionService)
        if hasattr(self.runner.session_service, "save_session"):
            await self.runner.session_service.save_session(session_id)
                
        return final_text
