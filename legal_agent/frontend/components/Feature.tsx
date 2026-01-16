"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

import {
  Scale,
  FileText,
  MessageSquare,
  ShieldCheck,
} from "lucide-react"
import { features } from "@/components/data/feature"
import Image from "next/image"

gsap.registerPlugin(ScrollTrigger)

const iconMap = {
  Scale,
  FileText,
  MessageSquare,
  ShieldCheck,
}

export default function Features() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement[]>([])

   
     // GSAP ANIMATION
  useEffect(() => {
    if (!sectionRef.current) return

    // Header animation
    gsap.fromTo(
      sectionRef.current.querySelector(".features-header"),
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

    // Cards animation
    gsap.fromTo(
      cardsRef.current,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
        },
      }
    )
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#fffcfc] py-24 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-6">
        
        <div className="features-header mx-auto max-w-2xl text-center">
          <h1
            className="text-4xl md:text-[65px] font-medium font-dm-sans text-transparent"
            style={{
              backgroundImage: `
                linear-gradient(
                  25deg,
                  var(--token-6396e7f2-0645-4f69-9a36-80e94f8ee015, #16101e) 0%,
                  rgba(22, 16, 30, 0.65) 100%
                )
              `,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            All Features in 1 tool
          </h1>

          <p className="mt-4 text-lg text-[#444049] font-normal">
            From instant legal answers to secure document drafting, everything you
            need to work smarter with law—powered by AI.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = iconMap[feature.icon]
            const hasImage = Boolean(feature.image)

            return (
              <div
                key={feature.id}
                ref={(el) => {
                  if (el) cardsRef.current[index] = el
                }}
                className="
                  rounded-2xl border border-slate-200 bg-[#fdfbfb]
                  p-6 transition-all duration-300
                  hover:-translate-y-1 hover:shadow-lg
                  overflow-hidden
                "
              >
                {/* // Card Content */}
                <div
                  className={`
                    flex flex-col gap-5
                    ${hasImage ? "lg:flex-row" : ""}
                  `}
                >
                 
                  {hasImage && (
                    <div className="w-full lg:w-[300px] shrink-0">
                      <Image
                        src={feature.image}
                        alt={feature.title}
                        width={300}
                        height={300}
                        className="
                          w-full h-56 lg:h-60
                          rounded-xl object-cover
                          border border-slate-200 bg-white
                        "
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                   
                    <div className="mb-4">
                      <div
                        className="flex h-16 w-16 items-center justify-center rounded-xl shadow-lg shadow-black/10"
                        style={{
                          background: `linear-gradient(
                            180deg,
                            var(--token-6396e7f2-0645-4f69-9a36-80e94f8ee015, rgb(0, 0, 0)) 0%,
                            var(--token-d4c0a0e6-8fba-45bc-8f6f-215e608cd0df, rgb(255, 255, 255)) 170%
                          )`,
                        }}
                      >
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                    </div>

                  
                    <h3 className="text-lg font-semibold text-[#16101e]">
                      {feature.title}
                    </h3>

                 
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
