import { Linkedin, Youtube } from "lucide-react"

export default function Footer() {
  return (
    <footer className="w-full bg-black text-white py-8">
      <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: Brand */}
        <div className="text-xl font-semibold font-dm-sans">
          LegalAI
        </div>

        {/* Right: Social Icons */}
        <div className="flex gap-6">
          {/* Twitter X logo */}
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-400 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6"
            >
              <path d="M23.362 12.435c0 6.337-5.127 11.465-11.465 11.465-2.27 0-4.385-.665-6.16-1.814l.862-2.862c1.495.648 3.173 1.006 4.914 1.006 5.242 0 9.51-4.268 9.51-9.51 0-.28-.014-.556-.04-.831l2.38-.175c.197.99.31 2.016.31 3.174zM1.575 0l4.003 12.65-4.003 12.647h2.875l1.913-6.044 1.914 6.044h2.876l-4.002-12.647 4.002-12.65H5.462L3.55 6.04 1.575 0z" />
            </svg>
          </a>

          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-400 transition-colors"
          >
            <Linkedin className="h-6 w-6" />
          </a>

          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-400 transition-colors"
          >
            <Youtube className="h-6 w-6" />
          </a>
        </div>
      </div>

      {/* Bottom: Copyright */}
      <div className="mt-6 text-center text-sm text-gray-400">
        
        &copy; {new Date().getFullYear()} LegalAI. All rights reserved.
      </div>
    </footer>
  )
}
