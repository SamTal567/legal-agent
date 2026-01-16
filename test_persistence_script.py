import requests
import json
import sys

BASE_URL = "http://localhost:8002"

def verify_persistence():
    print("1. Creating Session...")
    try:
        resp = requests.post(f"{BASE_URL}/session")
        if resp.status_code != 200:
            print(f"Failed to create session: {resp.text}")
            return
        session_id = resp.json()["session_id"]
        print(f"Session ID: {session_id}")
    except Exception as e:
        print(f"Connection error: {e}")
        return

    print("\n2. Sending Message 1 (Setting Context)...")
    msg1 = "My name is John Doe. Remember this."
    try:
        payload = {"message": msg1, "session_id": session_id}
        resp = requests.post(f"{BASE_URL}/chat", json=payload)
        print(f"Agent Replied: {resp.json().get('response')}")
    except Exception as e:
        print(f"Error: {e}")
        return

    print("\n3. Sending Message 2 (Querying Context)...")
    msg2 = "What is my name?"
    try:
        payload = {"message": msg2, "session_id": session_id}
        resp = requests.post(f"{BASE_URL}/chat", json=payload)
        response_text = resp.json().get('response', '')
        print(f"Agent Replied: {response_text}")

        if "John Doe" in response_text:
            print("\nSUCCESS: Agent remembered the name!")
        else:
            print("\nFAILURE: Agent did not remember the name.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    verify_persistence()
