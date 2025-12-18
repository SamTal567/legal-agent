import urllib.request
import json
import time

BASE_URL = "http://127.0.0.1:8002"

def check_health():
    print(f"Checking {BASE_URL}/...")
    try:
        with urllib.request.urlopen(f"{BASE_URL}/") as response:
            print(f"Health Check: {response.read().decode()}")
    except Exception as e:
        print(f"Health Check Failed: {e}")

def create_session():
    print(f"Connecting to {BASE_URL}/session...")
    # Send empty JSON body to ensure POST works correctly
    req = urllib.request.Request(
        f"{BASE_URL}/session", 
        data=b"{}", 
        headers={"Content-Type": "application/json"}, 
        method="POST"
    )
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            return data["session_id"]
    except urllib.error.HTTPError as e:
        print(f"Session Create Failed: {e.code} {e.reason}")
        print(e.read().decode())
        raise

def chat(session_id, message, test_name):
    print(f"\n--- TEST: {test_name} ---")
    print(f"Query: {message}")
    
    payload = json.dumps({
        "message": message,
        "session_id": session_id
    }).encode("utf-8")
    
    req = urllib.request.Request(
        f"{BASE_URL}/chat", 
        data=payload, 
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    
    try:
        start_time = time.time()
        # Added timeout of 60 seconds
        with urllib.request.urlopen(req, timeout=60) as response:
            result = json.loads(response.read().decode())
            duration = time.time() - start_time
            
            print(f"Response ({duration:.2f}s):")
            print(result["response"][:500] + "..." if len(result["response"]) > 500 else result["response"])
            
            if result.get("filename"):
                print(f"File Generated: {result['filename']}")
            else:
                print("No file generated.")
            return result
    except TimeoutError:
        print("Request Timed Out (60s)")
        return None
    except urllib.error.HTTPError as e:
        print(f"Request Failed: {e.code}  {e.reason}")
        print(e.read().decode())
        return None
    except Exception as e:
        print(f"FAILED: {e}")
        return None

if __name__ == "__main__":
    check_health()
    session_id = create_session()
    print(f"Created Session: {session_id}")

    # 1. Connectivity Check
    chat(session_id, "Hello, who are you?", "Basic Connectivity")

    # 2. Web Search Test: Recent events/Case law
    chat(session_id, "Find the latest Supreme Court judgment on 'Right to Privacy' from 2024 or 2025.", "Web Search - Recent Judgment")

    # 3. RAG Test: Specific Act lookup
    chat(session_id, "What are the penalties for defamation under the Bharatiya Nyaya Sanhita (BNS)?", "RAG - Defamation Lookup")
    
    # 4. RAG + Search Hybrid (Optional check)
    chat(session_id, "Does the new BNS 2023 replace IPC entirely? search the web if needed", "Hybrid - BNS vs IPC")
