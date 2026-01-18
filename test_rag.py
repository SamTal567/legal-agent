import urllib.request
import json
import time

BASE_URL = "http://127.0.0.1:8002"

def chat(session_id, message, test_name):
    print(f"\n==========================================")
    print(f"TEST: {test_name}")
    print(f"Query: {message}")
    print(f"==========================================")
    
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
        with urllib.request.urlopen(req, timeout=90) as response:
            result = json.loads(response.read().decode())
            duration = time.time() - start_time
            
            print(f"Time: {duration:.2f}s")
            response_text = result["response"]
            
            # Print a reasonable chunk of text
            preview_len = 800
            print(f"Response:\n{response_text[:preview_len]}")
            if len(response_text) > preview_len:
                print("...[truncated]...")
                
            return response_text
    except Exception as e:
        print(f"FAILED: {e}")
        return None

def create_session():
    req = urllib.request.Request(f"{BASE_URL}/session", data=b"{}", headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode())["session_id"]

if __name__ == "__main__":
    print("Initializing RAG Test...")
    try:
        session_id = create_session()
        print(f"Session ID: {session_id}")
        
        # 1. RTI Act Test
        # Looking for "48 hours" in context of life/liberty
        chat(session_id, 
             "Under the RTI Act, what is the time limit for providing information if it concerns the life or liberty of a person?", 
             "RTI - Life/Liberty Time Limit")

        # 2. RERA Test
        # Looking for "transfer of title" / "Section 17"
        chat(session_id, 
             "What are the promoter's obligations regarding proper conveyance of title under Section 17 of the Real Estate Act 2016?", 
             "RERA - Promoter Obligations")
             
        # 3. BNS Test
        # Looking for "Snatching" / "Section 304" (assuming BNS mapping)
        chat(session_id, 
             "What is the definition and punishment for 'Snatching' under the Bharatiya Nyaya Sanhita 2023?", 
             "BNS - Snatching")

        # 4. Consumer Protection Act (a2019-35)
        # Looking for "Product Liability" definition
        chat(session_id, 
             "How is 'product liability' defined under the new Consumer Protection Act 2019?", 
             "CPA 2019 - Product Liability")
             
    except Exception as e:
        print(f"Global Error: {e}")
