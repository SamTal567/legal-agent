import requests
import sys

# Configuration
API_URL = "http://localhost:8000/chat"
DOWNLOAD_URL = "http://localhost:8000/downloads"

def chat_loop():
    print("\n" + "="*50)
    print("🤖 LEGAL AGENT CLI")
    print("Type 'quit' or 'exit' to stop.")
    print("="*50 + "\n")

    # Start the continuous loop
    while True:
        try:
            user_input = input("You: ").strip()
            if not user_input:
                continue
            
            if user_input.lower() in ["quit", "exit"]:
                print("\nGoodbye!")
                break

            # Send to your running FastAPI server
            print("Thinking...", end="\r")
            try:
                response = requests.post(API_URL, json={"message": user_input})
                response.raise_for_status()
                data = response.json()
            except requests.exceptions.ConnectionError:
                print("\n[!] Error: Is server.py running? connection failed.")
                continue

            # Print the Agent's reply
            print(f"\rAgent: {data['response']}\n")

            # Check if a document was generated
            if data.get("filename"):
                filename = data["filename"]
                print(f"📄 DOCUMENT READY: {filename}")
                print(f"⬇️  Download Link: {DOWNLOAD_URL}/{filename}")
                print("-" * 50 + "\n")

        except KeyboardInterrupt:
            print("\nGoodbye!")
            break
        except Exception as e:
            print(f"\n[!] Error: {e}")

if __name__ == "__main__":
    chat_loop()