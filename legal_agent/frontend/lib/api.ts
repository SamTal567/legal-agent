const API_BASE = process.env.NEXT_PUBLIC_API_URl!

//  Create chat session
export async function createSession() {
  const res = await fetch(`http://localhost:8002/session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!res.ok) {
    throw new Error("Failed to create session")
  }

  return res.json() // { session_id: "..." }
}


//  Send chat message
export async function sendChatMessage({
  message,
  sessionId,
  userId,
}: {
  message: string
  sessionId: string
  userId?: string
}) {
  const res = await fetch(`http://localhost:8002/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      session_id: sessionId,
      user_id:  "default_user",
    }),
  })

  if (!res.ok) {
    throw new Error("Chat request failed")
  }

  return res.json()
}
