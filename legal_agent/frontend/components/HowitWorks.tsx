"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Image from "next/image"
import image from "../app/maxresdefault.webp"

gsap.registerPlugin(ScrollTrigger)

export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null)

  /* -------------------------------
     GSAP SCROLL ANIMATION
  -------------------------------- */
  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".how-title",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        }
      )

      gsap.fromTo(
        ".how-subtitle",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        }
      )

      gsap.fromTo(
        ".how-image",
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
          },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="
        relative w-full py-24
        flex flex-col items-center
        bg-[#fffefe]
        px-6 overflow-hidden
      "
    >
    
      <h2
        className="how-title text-4xl md:text-5xl font-medium font-dm-sans text-transparent text-center"
        style={{
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundImage: `linear-gradient(
            25deg,
            var(--token-6396e7f2-0645-4f69-9a36-80e94f8ee015, #16101e) 0%,
            rgba(22,16,30,0.65) 100%
          )`,
        }}
      >
        How It Works
      </h2>

      
      <p className="how-subtitle mt-4 max-w-2xl text-center text-lg text-[#444049] font-normal">
        Understand how our AI-powered legal assistant helps you draft documents,
        get answers, and stay secure in minutes.
      </p>

      
      <div className="how-image mt-12 w-full max-w-4xl">
        <Image
          src={image}
          alt="How it works illustration"
          className="
            w-full h-auto
            rounded-xl shadow-2xl
            object-cover
          "
          priority
        />
      </div>
    </section>
  )
}
