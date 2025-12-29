"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import gsap from "gsap"

import { auth } from "../lib/Firebase"
import { onAuthStateChanged, signOut, User } from "firebase/auth"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Menu } from "lucide-react"

export default function Navbar() {
  const router = useRouter()
  const navRef = useRef<HTMLElement>(null)

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // AUTH STATE 
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  
  useEffect(() => {
    if (!navRef.current) return
    gsap.fromTo(
      navRef.current,
      { opacity: 0, x: -40 },
      { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" }
    )
  }, [])

  const handleLogout = async () => {
    await signOut(auth)
    router.push("/")
  }

  const userInitial =
    user?.displayName?.charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase()

  const NavLinks = () => (
    <>
      <Link href="/" className="nav-link">Home</Link>
      <Link href="/#features" className="nav-link">Features</Link>
      <Link href="/#how-it-works" className="nav-link">How it works</Link>
    </>
  )

  return (
    <header
      ref={navRef}
      className="w-full bg-[#f5f5f5] sticky top-0 z-50"
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

       {/* // LOGO */}
        <div
          className="text-xl font-semibold cursor-pointer"
          onClick={() => router.push("/")}
        >
          LegalAI
        </div>

        {/* // DESKTOP NAV LINKS */}
        <div className="hidden md:flex gap-10">
          <NavLinks />
        </div>

        {!loading && (
          <div className="flex items-center gap-3">

            {/* // DESKTOP USER MENU  */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="hidden md:flex h-9 w-9 items-center justify-center rounded-full bg-black text-white cursor-pointer">
                    {userInitial}
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push("/chat")}>
                    Ask LegalAI
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={handleLogout}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {!user && (
              <Button
                onClick={() => router.push("/auth")}
                className="hidden md:flex bg-black text-white"
              >
                Login
              </Button>
            )}

            {/* // MOBILE USER MENU  */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="md:hidden h-9 w-9 flex items-center justify-center rounded-full bg-black text-white cursor-pointer">
                    {userInitial}
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push("/chat")}>
                    Ask LegalAI
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={handleLogout}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* // MOBILE HAMBURGER MENU  */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="md:hidden cursor-pointer">
                  <Menu className="h-6 w-6" />
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="mt-2 w-40">
                <DropdownMenuItem onClick={() => router.push("/")}>
                  Home
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/#features")}>
                  Features
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/#how-it-works")}>
                  How it works
                </DropdownMenuItem>

                {!user && (
                  <DropdownMenuItem
                    className="font-medium"
                    onClick={() => router.push("/auth")}
                  >
                    Login
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        )}
      </nav>

      <style jsx>{`
        .nav-link {
          font-size: 14px;
          color: #14181e;
          transition: color 0.2s;
        }
        .nav-link:hover {
          color: black;
        }
      `}</style>
    </header>
  )
}
