"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2, Save, Sparkles, Send } from "lucide-react"
import { updateWebsiteContent, generateCodeWithAI } from "@/lib/website-actions"
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
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Update code when initialContent changes
  useEffect(() => {
    setCode(initialContent)
  }, [initialContent])

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

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      setMessage({
        type: "error",
        text: "Please enter a prompt for AI assistance",
      })
      return
    }

    setIsGenerating(true)
    setMessage(null)

    try {
      const result = await generateCodeWithAI(code, aiPrompt)
      if (result.success && result.generatedCode) {
        setCode(result.generatedCode)
        setAiPrompt("")
        setMessage({
          type: "success",
          text: "Code updated successfully with AI assistance!",
        })
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to generate code with AI",
        })
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "An unexpected error occurred while generating code",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleAIGenerate()
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
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* AI Prompt Section */}
      <div className="border-b bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="Describe what you want to change... (e.g., 'Make the background blue', 'Add a contact form', 'Change the title to Welcome')"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isGenerating}
              className="flex-1"
            />
            <Button onClick={handleAIGenerate} disabled={isGenerating || !aiPrompt.trim()} size="sm">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </div>
        {message && (
          <Alert variant={message.type === "error" ? "destructive" : "default"} className="mt-2">
            {message.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Editor and Preview */}
      <div className="flex flex-1">
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
                automaticLayout: false,
                scrollBeyondLastLine: false,
                folding: true,
                renderWhitespace: "selection",
                tabSize: 2,
              }}
              onMount={(editor) => {
                // Trigger initial layout after mount
                setTimeout(() => {
                  editor.layout()
                }, 100)
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
    </div>
  )
}
