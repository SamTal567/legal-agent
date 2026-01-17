"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/Firebase"

import Navbar from "@/components/Navbar"
import AppSidebar from "@/components/Sidebar"
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

import { ArrowUp, Loader2, Menu } from "lucide-react"

import { createSession, sendChatMessage } from "@/lib/api"
import { MessageBubble } from "@/components/MessageBubble"

/* ---------------- Mobile Sidebar Toggle ---------------- */
function MobileSidebarToggle() {
  const { toggleSidebar } = useSidebar()

  return (
    <div className="md:hidden px-3 pt-3">
      <Button variant="ghost" size="icon" onClick={toggleSidebar}>
        <Menu className="h-5 w-5" />
      </Button>
    </div>
  )
}

/* ---------------- Types ---------------- */
type ChatMessage = {
  id: string
  role: "user" | "ai"
  text: string
}

/* ---------------- Chat Page ---------------- */
export default function ChatPage() {
  const router = useRouter()
  const bottomRef = useRef<HTMLDivElement>(null)
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const [checkingAuth, setCheckingAuth] = useState(true)
  const [sessionId, setSessionId] = useState<string | null>(null)

  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)

  /* ---------------- Auth + Session ---------------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/auth")
        return
      }

      try {
        const data = await createSession()
        setSessionId(data.session_id)
      } catch (err) {
        console.error("Session creation failed", err)
      } finally {
        setCheckingAuth(false)
      }
    })

    return () => unsub()
  }, [router])

  /* ---------------- Auto Scroll ---------------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  /* ---------------- Typing Effect ---------------- */
  const typeAIResponse = (fullText: string) => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current)
    }

    const words = fullText.split(" ")
    let index = 0
    const aiMessageId = crypto.randomUUID()

    setMessages((prev) => [
      ...prev,
      { id: aiMessageId, role: "ai", text: "" },
    ])

    typingIntervalRef.current = setInterval(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? { ...msg, text: words.slice(0, index + 1).join(" ") }
            : msg
        )
      )

      index++

      if (index >= words.length) {
        clearInterval(typingIntervalRef.current!)
        typingIntervalRef.current = null
      }
    }, 35)
  }

  /* ---------------- Send Message ---------------- */
  const sendMessage = async () => {
    if (!input.trim() || !sessionId || loading) return

    const userText = input
    setInput("")
    setLoading(true)

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "user",
        text: userText,
      },
    ])

    try {
      const res = await sendChatMessage({
        message: userText,
        sessionId,
        userId: "default_user",
      })

      setLoading(false)
      typeAIResponse(res.response || "No response from LegalAI.")
    } catch (err) {
      console.error(err)
      setLoading(false)
      typeAIResponse("Something went wrong. Please try again.")
    }
  }

  /* ---------------- Auth Loading ---------------- */
  if (checkingAuth) {
    return (
      <div className="h-screen flex items-center justify-center">
        <span className="text-sm text-slate-500">
          Checking authentication…
        </span>
      </div>
    )
  }

  /* ---------------- UI ---------------- */
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="h-screen w-full bg-[#f5f5f5] overflow-hidden">
        <AppSidebar />

        <div className="flex h-full flex-col md:ml-[16rem]">
          <Navbar />

          <div className="flex flex-1 flex-col overflow-hidden">
            <MobileSidebarToggle />

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  role={msg.role}
                  text={msg.text}
                />
              ))}

              {loading && (
                <div className="bg-white border rounded-xl p-4 max-w-[75%] flex items-center gap-3">
                  <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
                  <span className="text-sm text-slate-600">
                    LegalAI is thinking...
                  </span>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t bg-[#f5f5f5] p-4">
              <div className="relative mx-auto max-w-3xl">
                <Textarea
                  rows={1}
                  disabled={!sessionId || loading}
                  placeholder="Ask LegalAI..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="pr-12 resize-none bg-white border-0 shadow-lg focus:ring-0"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                />

                <Button
                  size="icon"
                  disabled={!input.trim() || loading}
                  onClick={sendMessage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black text-white"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowUp className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
