"use client"
import  ReactMarkdown from "react-markdown"
type MessageBubbleProps = {
  role: "user" | "ai"
  text: string
}

 
   // File download regex
const FILE_REGEX =
  /\b[\w\-]+\.(pdf|docx|doc|txt)\b/gi

export function MessageBubble({ role, text }: MessageBubbleProps) {
  const matches = text.match(FILE_REGEX)

  const handleDownload = (filename: string) => {
    const url = `http://localhost:8002/downloads/${filename}`

    // force download
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div
      className={`max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
        role === "user"
          ? "ml-auto bg-black text-white"
          : "mr-auto bg-white border"
      }`}
    >
      {/* // MESSAGE TEXT */}
       <ReactMarkdown
        children={text}
        // Plain text mode: render text only
        allowedElements={[]}       // no markdown elements
        unwrapDisallowed={true}    // unwrap to show text
      />

      {/* // FILE DOWNLOAD LINKS */}
      {matches && (
        <div className="mt-3 space-y-2">
          {matches.map((file, i) => (
            <button
              key={i}
              onClick={() => handleDownload(file)}
              className="block text-left text-blue-600 underline hover:text-blue-800"
            >
              📄 Download {file}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
