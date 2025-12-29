import streamlit as st
import requests
import uuid
import json

# --- CONFIGURATION ---
API_BASE_URL = "http://localhost:8002"
CHAT_ENDPOINT = f"{API_BASE_URL}/chat"
DOWNLOAD_ENDPOINT = f"{API_BASE_URL}/downloads"

st.set_page_config(
    page_title="Legal Agent AI",
    page_icon="⚖️",
    layout="centered"
)

# --- SESSION STATE INITIALIZATION ---
if "session_id" not in st.session_state:
    st.session_state.session_id = str(uuid.uuid4())

if "messages" not in st.session_state:
    st.session_state.messages = []

# --- UI HEADER ---
st.title("⚖️ Legal Agent AI")
st.markdown("Your AI assistant for legal research and drafting.")

# --- SIDEBAR ---
with st.sidebar:
    st.header("Session Info")
    st.text(f"ID: {st.session_state.session_id}")
    if st.button("New Session"):
        st.session_state.session_id = str(uuid.uuid4())
        st.session_state.messages = []
        st.rerun()

# --- CHAT DISPLAY ---
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])
        # If there's a file attached to this message, show the download button
        if message.get("file_data"):
             st.download_button(
                label="⬇️ Download Generated Draft",
                data=message["file_data"],
                file_name=message["filename"],
                mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                key=message["msg_id"] # Unique key for the button
            )

# --- CHAT INPUT & LOGIC ---
if prompt := st.chat_input("Ask a legal question or request a draft..."):
    # 1. Add User Message to History
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    # 2. Call Backend
    with st.chat_message("assistant"):
        message_placeholder = st.empty()
        message_placeholder.markdown("Thinking...")
        
        payload = {
            "message": prompt,
            "session_id": st.session_state.session_id
        }

        try:
            response = requests.post(CHAT_ENDPOINT, json=payload)
            response.raise_for_status()
            data = response.json()
            
            agent_text = data.get("response", "No response text.")
            filename = data.get("filename")
            
            # Update chat text
            message_placeholder.markdown(agent_text)
            
            file_blob = None
            # 3. Handle File Download (if generated)
            if filename:
                try:
                    with st.spinner("Downloading generated document..."):
                         file_url = f"{DOWNLOAD_ENDPOINT}/{filename}"
                         file_resp = requests.get(file_url)
                         file_resp.raise_for_status()
                         file_blob = file_resp.content
                         
                         st.download_button(
                            label="⬇️ Download Generated Draft",
                            data=file_blob,
                            file_name=filename,
                            mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                            key=str(uuid.uuid4())
                        )
                except Exception as e:
                    st.error(f"Failed to fetch generated file: {e}")

            # 4. Save Assistant Message to History
            st.session_state.messages.append({
                "role": "assistant", 
                "content": agent_text,
                "filename": filename,
                "file_data": file_blob,
                "msg_id": str(uuid.uuid4())
            })

        except requests.exceptions.ConnectionError:
             message_placeholder.markdown("🚨 **Error:** Backend server is offline. Please make sure `server.py` is running.")
        except Exception as e:
             message_placeholder.markdown(f"🚨 **Error:** {str(e)}")
