"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2, Save } from "lucide-react"
import { updateWebsiteContent } from "@/lib/website-actions"
import dynamic from "next/dynamic"

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  ),
})

interface CodeEditorProps {
  username: string
  initialContent: string
}

export function CodeEditor({ username, initialContent }: CodeEditorProps) {
  const [code, setCode] = useState(initialContent)
  const [isPublishing, setIsPublishing] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handlePublish = async () => {
    setIsPublishing(true)
    setMessage(null)

    try {
      const result = await updateWebsiteContent(username, code)
      if (result.success) {
        setMessage({
          type: "success",
          text: "Website published successfully!",
        })
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to publish website",
        })
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "An unexpected error occurred",
      })
    } finally {
      setIsPublishing(false)
    }
  }

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  return (
    <div className="flex h-[calc(100vh-80px)]">
      {/* Left side - Monaco Editor */}
      <div className="w-1/2 border-r bg-white">
        <div className="border-b px-4 py-3 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">HTML Editor</h2>
            <Button onClick={handlePublish} disabled={isPublishing} size="sm">
              {isPublishing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Publish
                </>
              )}
            </Button>
          </div>
          {message && (
            <Alert variant={message.type === "error" ? "destructive" : "default"} className="mt-2">
              {message.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}
        </div>
        <div className="h-full">
          <MonacoEditor
            height="100%"
            defaultLanguage="html"
            value={code}
            onChange={(value) => setCode(value || "")}
            theme="vs-light"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              wordWrap: "on",
              automaticLayout: true,
              scrollBeyondLastLine: false,
              folding: true,
              renderWhitespace: "selection",
              tabSize: 2,
            }}
          />
        </div>
      </div>

      {/* Right side - Live Preview */}
      <div className="w-1/2 bg-white">
        <div className="border-b px-4 py-3 bg-gray-50">
          <h2 className="font-semibold text-gray-900">Live Preview</h2>
        </div>
        <div className="h-full overflow-auto">
          <iframe
            srcDoc={code}
            className="w-full h-full border-0"
            title="Live Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>
    </div>
  )
}
