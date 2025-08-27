"use client"
import type React from "react"
import { useState, useEffect, useMemo, useRef } from "react"
import dynamic from "next/dynamic"
import { cn } from "@/lib/utils"
import { toast } from "sonner" // Changed from "@/components/ui/toast" and "./ui/use-toast"
import Split from "react-split"
import { Loader2, Send, CheckCircle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { updateWebsiteContent, generateCodeWithAI } from "@/lib/website-actions"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  ),
})

// Theme definition
const handleEditorMount = (editor: any, monaco: any) => {
  if (!monaco?.editor) return
  // Apply custom theme
  monaco.editor.defineTheme("custom-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "tag", foreground: "FF79C6" },
      { token: "delimiter.html", foreground: "f2ecec" },
      { token: "attribute.name", foreground: "f2ecec" },
      { token: "attribute.value", foreground: "6fcaf2" },
      { token: "string", foreground: "F1FA8C" },
      { token: "text", foreground: "6fcaf2" },
    ],
    colors: {
      "editor.background": "#242424",
      "editor.foreground": "#F8F8F2",
      "editor.lineHighlightBackground": "#44475A",
      "editorLineNumber.foreground": "#6272A4",
      "editorLineNumber.activeForeground": "#F8F8F2",
    },
  })
  monaco.editor.setTheme("custom-dark")
  // Apply border-radius and overflow hidden to Monaco container
  const container = editor.getContainerDomNode()
  container.style.borderRadius = "0.50rem" // rounded-lg
  container.style.overflow = "hidden"
  container.style.border = "1px solid #454545"
}

// In CodeEditor.tsx
export interface CodeEditorProps {
  username: string
  initialContent: {
    html: string
    script: string
    data: string
  }
}

export function CodeEditor({ username, initialContent }: CodeEditorProps) {
  const [codeHtml, setCodeHtml] = useState(initialContent.html)
  const [codeScript, setCodescript] = useState(initialContent.script)
  const [codeData, setCodedata] = useState(initialContent.data)
  const [nerdMode, setnerdMode] = useState(false)
  const [activeTab, setActiveTab] = useState("data.js")
  const [isPublishing, setIsPublishing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  // Removed: const { toast } = useToast() // useToast is no longer needed with sonner

  // State to control if the toast should be disabled for the session
  const [disableToastForSession, setDisableToastForSession] = useState(false)

  // Load disableToastForSession from localStorage on mount
  useEffect(() => {
    const storedDisable = localStorage.getItem("disableNerdModeToast")
    if (storedDisable === "true") {
      setDisableToastForSession(true)
    }
  }, [])

 


  useEffect(() => {
    setCodeHtml(initialContent.html)
    setCodescript(initialContent.script)
    setCodedata(initialContent.data)
  }, [initialContent])

  const handlePublish = async () => {
    setIsPublishing(true)
    setMessage(null)
    try {
      const result = await updateWebsiteContent(username, codeHtml, codeScript, codeData)
      if (result.success) {
        setMessage({ type: "success", text: "Website published successfully!" })
      } else {
        setMessage({ type: "error", text: result.error || "Failed to publish website" })
      }
    } catch {
      setMessage({ type: "error", text: "An unexpected error occurred" })
    } finally {
      setIsPublishing(false)
    }
  }

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      setMessage({ type: "error", text: "Please enter a prompt for AI assistance" })
      return
    }
    setIsGenerating(true)
    setMessage(null)
    try {
      const result = await generateCodeWithAI(codeData, aiPrompt)
      if (result.success && result.generatedCode) {
        setCodedata(result.generatedCode)
        setAiPrompt("")
        setMessage({ type: "success", text: "Code updated successfully with AI assistance!" })
      } else {
        setMessage({ type: "error", text: result.error || "Failed to generate code with AI" })
      }
    } catch {
      setMessage({ type: "error", text: "An unexpected error occurred while generating code" })
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

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const srcDocContent = useMemo(() => {
    // Replace external script tags with inline script content
    let combinedHtml = codeHtml
    // Ensure data.js is loaded before script.js
    // Replace <script src="data.js"></script> with inline data
    combinedHtml = combinedHtml.replace('<script src="data.js"></script>', `<script>\n${codeData}\n</script>`)
    // Replace <script src="script.js"></script> with inline script
    combinedHtml = combinedHtml.replace('<script src="script.js"></script>', `<script>\n${codeScript}\n</script>`)
    return combinedHtml
  }, [codeHtml, codeScript, codeData])

  useEffect(() => {
    // Step 2: Focus the input on mount
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, []) // Empty dependency array means this runs once on mount

  // Determine current editor props based on state
  let currentCode, currentSetCode, currentLanguage
  if (nerdMode) {
    switch (activeTab) {
      case "data.js":
        currentCode = codeData
        currentSetCode = setCodedata
        currentLanguage = "javascript"
        break
      case "index.html":
        currentCode = codeHtml
        currentSetCode = setCodeHtml
        currentLanguage = "html"
        break
      case "script.js":
        currentCode = codeScript
        currentSetCode = setCodescript
        currentLanguage = "javascript"
        break
      default:
        // Fallback, should ideally not happen if activeTab is managed correctly
        currentCode = codeData
        currentSetCode = setCodedata
        currentLanguage = "javascript"
    }
  } else {
    // When nerd mode is off, always show codeData
    currentCode = codeData
    currentSetCode = setCodedata
    currentLanguage = "javascript"
  }

  return (
    <div className="flex flex-col ">
      {/* AI Prompt Section */}
      <div className="bg-[#181818] px-4 mt-1 rounded-xl" style={{ zoom: 0.9 }}>
        <div className="flex items-center gap-1">
          <div className="flex-1 flex max-w-2xl mx-auto mt-1 rounded border-2 border-dotted border-gray-700 shadow-2xl px-2 py-1 min-w-sm focus-within:border-gray-300">
            <input
              type="text"
              ref={inputRef}
              placeholder="Pitch yourself like you are on Shark Tank..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isGenerating}
              className="flex-1 w-full px-6 py-2 bg-transparent border-none rounded-none rounded-l focus:outline-none focus:ring-0 caret-white text-teal-400 placeholder:opacity-100 focus:placeholder-opacity-0"
            />
            <button
              onClick={handleAIGenerate}
              disabled={isGenerating || !aiPrompt.trim()}
              type="button"
              className="relative w-full md:w-auto px-6 py-2 overflow-hidden text-white transition-all duration-100 bg-black border-l border-black rounded-none rounded-r active:scale-95 will-change-transform disabled:opacity-50"
            >
              <span className="flex items-center transition-all opacity-1">
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span className="mx-auto text-sm font-semibold truncate whitespace-nowrap text-white">
                      Generating...
                    </span>
                  </>
                ) : (
                  <Send className="mr-2 h-4 w-4 " />
                )}
              </span>
            </button>
          </div>
          <a onClick={handlePublish} className="flex items-center text-blue-400 cursor-pointer">
            {isPublishing ? (
              <>
                <Loader2 className="mr-2.5 h-4 w-4 animate-spin text-yellow-400" />
                <div className="text-yellow-400 text-sm font-mono mr-1 ">Publishing...</div>
              </>
            ) : (
              <>
                <div className="text-yellow-400 text-sm border py-1 px-8 border-yellow-400 rounded-sm font-serif mr-4 tracking-widest underline-offset-2">
                  Publish
                </div>
              </>
            )}
          </a>
        </div>
        {message && (
          <Alert variant={message.type === "error" ? "destructive" : "default"} className="mt-2">
            {message.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}
      </div>
      <div className="mt-4">
        {/* SplitPane: Preview | Editor */}
        <Split
          sizes={[50, 50]}
          minSize={100}
          gutterSize={10}
          direction="horizontal"
          className="flex w-full h-full hover:cursor-crosshair"
        >
          {/* Left side - Live Preview */}
          <div className=" h-[calc(100vh-120px)] bg-[#030712] border-t border-gray-300 rounded-t-lg">
            <div className="px-4 py-1 flex justify-between ">
              <h2 className="font-bold text-sm tracking-widest text-yellow-400">Preview</h2>{" "}
              <a className="text-gray-500 justify-end mr-3 text-serif font-normal hover:cursor-pointer tracking-wide text-xs ">
                Read Me
              </a>
            </div>
            <div className="h-full overflow-auto custom-scrollbar">
              <iframe
                srcDoc={srcDocContent}
                className="w-full h-full border border-{#181818} rounded-lg"
                title="Live Preview"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>
          {/* Right side - Monaco Editor */}
          <div className=" h-full">
            <div className="border-t border-gray-300 rounded-t-lg px-4 py-1 bg-[#030712]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                  </div>
                  {/* Tabs, conditionally rendered */}
                  {nerdMode && (
                    <div className="flex items-center gap-4 ml-4">
                      {["data.js", "index.html", "script.js"].map((tabName) => (
                        <button
                          key={tabName}
                          style={{ zoom: 0.8 }}
                          className={cn(
                            "px-7 py-1 text-xs font-serif tracking-widest rounded-md transition-colors duration-200",
                            activeTab === tabName ? "bg-[#242424] text-yellow-400" : "text-gray-400 hover:bg-[#242424]",
                          )}
                          onClick={() => setActiveTab(tabName)}
                        >
                          {tabName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="items-center flex my-0.5 -mr-1">
                  <Switch
                    checked={nerdMode}
                    onCheckedChange={(checked) => {
                      setnerdMode(checked)
                      if (!checked) {
                        // If turning off nerd mode, reset to default view (codeData)
                        setActiveTab("data.js")
                      }
                    }}
                    id="nerdmode"
                    style={{ zoom: 0.5 }}
                    className="mr-4 data-[state=unchecked]:bg-gray-600 data-[state=checked]:bg-yellow-600"
                  />
                  <Label htmlFor="nerdmode" className="text-xs tracking-wide font-normal text-serif text-gray-500">
                    Nerd Mode
                  </Label>
                </div>
              </div>
            </div>
            <div>
              <MonacoEditor
                height="calc(100vh - 120px)"
                language={currentLanguage}
                value={currentCode}
                onChange={(value) => currentSetCode(value || "")}
                theme="custom-dark"
                onMount={(editor, monaco) => {
                  handleEditorMount(editor, monaco)
                }}
                options={{
                  fontFamily: " ",
                  fontLigatures: true,
                  fontWeight: "200",
                  lineHeight: 17,
                  letterSpacing: 0.8,
                  tabSize: 2,
                  minimap: { enabled: false },
                  fontSize: 12,
                  scrollBeyondLastLine: false,
                  lineNumbers: "on",
                  padding: { top: 10, bottom: 10 },
                }}
              />
            </div>
          </div>
        </Split>
      </div>
    </div>
  )
}
