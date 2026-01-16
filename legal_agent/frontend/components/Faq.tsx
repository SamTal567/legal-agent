"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "What is LegalAI?",
    answer:
      "LegalAI is an AI-powered assistant that helps you draft legal documents, get answers, and stay informed about legal workflows."
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes! All your data is processed securely. We use encryption and best practices to ensure privacy."
  },
  {
    question: "Can I draft RTI applications?",
    answer:
      "Absolutely. You can draft RTI applications, legal notices, and other documents with structured AI guidance."
  },
  {
    question: "How do I get started?",
    answer:
      "Simply sign up, start a chat, and begin asking questions or drafting documents. The AI guides you step by step."
  }
]

export default function FAQ() {
  return (
    <section className="w-full bg-[#fffcfc] py-24 px-6">
     
      <div className="mx-auto max-w-3xl text-center">
        <h2
          className="text-4xl md:text-5xl font-medium font-dm-sans text-transparent"
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
          Frequently Asked Questions
        </h2>

        <p className="mt-4 text-lg text-[#444049] font-normal">
          Answers to common questions about LegalAI.
        </p>
      </div>

      
      <div className="mt-12 max-w-3xl mx-auto">
        <Accordion type="single" collapsible>
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border border-slate-200 rounded-xl mb-4 bg-white shadow-sm">
              <AccordionTrigger className="px-6 py-4 text-lg font-semibold font-dm-sans text-[#16101e]">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-slate-600 text-sm">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
