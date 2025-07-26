"use client"

import { useEffect } from "react"

interface IframeWithLinkHandlerProps {
  content: string
}

export default function IframeWithLinkHandler({ content }: IframeWithLinkHandlerProps) {
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.openLink) {
        window.open(event.data.openLink, "_blank", "noopener,noreferrer")
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  return (
    <div className="w-full h-screen">
      <iframe
        srcDoc={content}
        className="w-full h-full border-0"
        title="Live Preview"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  )
}
