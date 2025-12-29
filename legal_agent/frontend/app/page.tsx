"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import Navbar from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import Image from "next/image"

import photo from "./B2MhwgpkS24BCxKZsBMvBvgQ8rg.jpg"
import Features from "@/components/Feature"
import HowItWorks from "@/components/HowitWorks"
import Footer from "@/components/Footer"
import FAQ from "@/components/Faq"
import { useRouter } from "next/navigation"

export default function Home() {
  const bgRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)
  const buttonsRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const router = useRouter()

  //  BACKGROUND GRADIENT ANIMATION
  useEffect(() => {
    if (!bgRef.current) return

    gsap.fromTo(
      bgRef.current,
      { opacity: 0.55, filter: "blur(0px)" },
      {
        opacity: 1,
        filter: "blur(14px)",
        duration: 6,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      }
    )
  }, [])

  //  ENTRY ANIMATION
  useEffect(() => {
    //  RESET STATE FIRST
    gsap.set(
      [headingRef.current, textRef.current, buttonsRef.current, imageRef.current],
      { opacity: 1 }
    )

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

    tl.from(headingRef.current, { opacity: 0, y: 30, duration: 0.8 })
      .from(textRef.current, { opacity: 0, y: 30, duration: 0.7 }, "-=0.4")
      .from(buttonsRef.current, { opacity: 0, y: 20, duration: 0.6 }, "-=0.3")
      .from(imageRef.current, { opacity: 0, y: 40, duration: 0.9 }, "-=0.2")

    return () => {
      tl.kill() //  cleanup when navigating away
    }
  }, [])

  return (
    <div className="min-h-screen w-full relative bg-[#f5f5f5]">
      <Navbar />

      <section className="relative h-[calc(100vh-4rem)] mt-2 w-full overflow-hidden">
        <div
          ref={bgRef}
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(
                900px 450px at 50% 35%,
                rgba(15, 23, 42, 0.12),
                transparent 70%
              )
            `,
          }}
        />

        <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
          <h1
            ref={headingRef}
            className="text-4xl md:text-5xl font-semibold text-transparent"
            style={{
              backgroundImage: `
                linear-gradient(
                  25deg,
                  #16101e 0%,
                  rgba(22,16,30,0.65) 100%
                )
              `,
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            AI-powered legal assistant
          </h1>

          <p ref={textRef} className="mt-4 max-w-xl text-lg text-slate-600">
            Ask legal questions, draft RTI applications, and get accurate legal insights.
          </p>

          <div ref={buttonsRef} className="mt-6 flex gap-4">
            <Button size="lg" onClick={() => router.push("/auth")}>
              Start Chat
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>

          <Image
            ref={imageRef}
            src={photo}
            alt="LegalAI Chat UI"
            className="mt-8 max-h-[55vh] w-auto rounded-xl shadow-2xl"
            priority
          />
        </div>
      </section>

      <Features />
      <HowItWorks />
      <FAQ />
      <Footer />
    </div>
  )
}
