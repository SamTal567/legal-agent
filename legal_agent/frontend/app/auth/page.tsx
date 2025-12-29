"use client"

import { useState } from "react"
import LoginForm from "@/components/LoginForm"
import RegisterForm from "@/components/RegisterForm"

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login")

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        {mode === "login" ? (
          <>
            <LoginForm />
            <p className="mt-6 text-center text-sm text-slate-600">
              Don&apos;t have an account?{" "}
              <button
                onClick={() => setMode("register")}
                className="font-medium text-black hover:underline"
              >
                Register
              </button>
            </p>
          </>
        ) : (
          <>
            <RegisterForm />
            <p className="mt-6 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <button
                onClick={() => setMode("login")}
                className="font-medium text-black hover:underline"
              >
                Login
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
