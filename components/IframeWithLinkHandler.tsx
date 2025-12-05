"use client"

import { useEffect, useRef } from "react"
import { sendEnquiry } from "@/lib/website-actions"

interface IframeWithLinkHandlerProps {
  content: string
  username: string
}

export default function IframeWithLinkHandler({
  content,
  username,
}: IframeWithLinkHandlerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    async function handleMessage(event: MessageEvent) {
      if (!event.data) return

      // 🔗 External link handler
      if (event.data.openLink) {
        window.open(event.data.openLink, "_blank", "noopener,noreferrer")
        return
      }

      // ✅ ✅ ✅ FINAL FORM HANDLER
      if (event.data.formData) {
        const { email, message } = event.data.formData

        console.log("✅ FINAL MESSAGE RECEIVED:", message)

        const formData = new FormData()
        formData.append("email", email)
        formData.append("your_message", message)

        try {
          await sendEnquiry(username, formData)
          alert("✅ Form submitted successfully!")
        } catch (error) {
          alert("❌ Failed to submit form")
        }
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [username])

  return (
    <iframe
      ref={iframeRef}
      srcDoc={content}
      className="w-full h-screen border-0"
      sandbox="allow-scripts allow-forms allow-same-origin"
    />
  )
}
