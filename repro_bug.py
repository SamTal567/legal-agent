import requests
import json

url = "http://localhost:8002/chat"
headers = {"Content-Type": "application/json"}
payload = {
    "message": "Please draft a legal notice for me. My name is Rahul Sharma and I live at Flat 101, MG Road, Pune. I need to send this notice to Amit Verma residing at Sector 45, Noida. The subject is Non-payment of rent for December 2025. The amount due is 25,000 rupees.",
    "session_id": "test-session-debug"
}

print("Sending request...")
try:
    response = requests.post(url, json=payload, headers=headers, timeout=60)
    print(f"Status: {response.status_code}")
    print(f"Body: {response.text}")
except Exception as e:
    print(f"Error: {e}")
