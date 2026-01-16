"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/Firebase"

import Navbar from "@/components/Navbar"
import AppSidebar from "@/components/Sidebar"

import {
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar"

import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

import { ArrowUp, Loader2, Menu } from "lucide-react"

import { createSession, sendChatMessage } from "@/lib/api"
import { MessageBubble } from "@/components/MessageBubble"

// Sidebar toggle for mobile
function MobileSidebarToggle() {
  const { toggleSidebar } = useSidebar()

  return (
    <div className="md:hidden px-3 pt-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
      >
        <Menu className="h-5 w-5" />
      </Button>
    </div>
  )
}

// Chat Page
export default function ChatPage() {
  const router = useRouter()
  const bottomRef = useRef<HTMLDivElement>(null)

  const [checkingAuth, setCheckingAuth] = useState(true)
  const [sessionId, setSessionId] = useState<string | null>(null)

  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<
    { role: "user" | "ai"; text: string }[]
  >([])

  const [loading, setLoading] = useState(false)

  // AUTH CHECK & SESSION CREATION
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
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

    return () => unsubscribe()
  }, [router])

  // SCROLL TO BOTTOM ON NEW MESSAGE
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  // WORD-BY-WORD TYPING EFFECT
  const typeAIResponse = (fullText: string) => {
    const words = fullText.split(" ")
    let index = 0

    setMessages((prev) => [...prev, { role: "ai", text: "" }])

    const interval = setInterval(() => {
      setMessages((prev) => {
        const updated = [...prev]
        const last = updated[updated.length - 1]

        if (last.role === "ai") {
          last.text += (index === 0 ? "" : " ") + words[index]
        }

        return updated
      })

      index++

      if (index >= words.length) {
        clearInterval(interval)
        setLoading(false)
      }
    }, 40)
  }

  // SEND MESSAGE
  const sendMessage = async () => {
    if (!input.trim() || !sessionId || loading) return

    const userText = input
    setInput("")
    setLoading(true)

    setMessages((prev) => [
      ...prev,
      { role: "user", text: userText },
    ])

    try {
      const res = await sendChatMessage({
        message: userText,
        sessionId,
        userId: "default_user",
      })

      typeAIResponse(res.response || "No response from LegalAI")
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Something went wrong." },
      ])
      setLoading(false)
    }
  }

  // AUTH CHECKING LOADING STATE
  if (checkingAuth) {
    return (
      <div className="h-screen flex items-center justify-center">
        <span className="text-sm text-slate-500">
          Checking authentication…
        </span>
      </div>
    )
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="h-screen w-full bg-[#f5f5f5] overflow-hidden">

        {/* SIDEBAR */}
        <AppSidebar />

        {/* MAIN CHAT AREA */}
        <div className="flex h-full flex-col md:ml-[16rem]">
          <Navbar />

          {/* CHAT CONTENT */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <MobileSidebarToggle />

            {/* MESSAGES AREA */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-4">
              {messages.map((msg, i) => (
                <MessageBubble
                  key={i}
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

            {/* INPUT AREA */}
            <div className="sticky bottom-0 border-t bg-[#f5f5f5] p-3 sm:p-4">
              <div className="relative mx-auto max-w-3xl">
                <Textarea
                  rows={1}
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
