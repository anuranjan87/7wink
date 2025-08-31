"use client"
import React from "react"
import { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { cn } from "@/lib/utils"
import Split from "react-split"
import { Loader2, Send, CheckCircle, AlertCircle, Maximize2, X, Monitor, Smartphone, SquarePlus } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { updateWebsiteContent, generateCodeWithAI, generateCodeWithAIBlank } from "@/lib/website-actions"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { motion, AnimatePresence } from "framer-motion"
import { insertList, type InsertItem } from "@/lib/insertlist"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

const screenVariants = {
  enter: { opacity: 0, x: 50 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
}

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  ),
})

const handleEditorMount = (editor: any, monaco: any) => {
  if (!monaco?.editor) return
  monaco.editor.defineTheme("custom-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "9CA3AF", fontStyle: "italic" }, // softer gray
      { token: "tag", foreground: "FF79C6" },
      { token: "delimiter.html", foreground: "f2ecec" },
      { token: "attribute.name", foreground: "f2ecec" },
      { token: "attribute.value", foreground: "6fcaf2" },
      { token: "string", foreground: "E6C76D" }, // softer Apple-style yellow
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
  const container = editor.getContainerDomNode()
  container.style.borderRadius = "0.50rem"
  container.style.overflow = "hidden"
  container.style.border = "1px solid #454545"
}

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
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop")
  const iframeRef = useRef<any>(null)
  const [isRestoringScroll, setIsRestoringScroll] = useState(false)
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 })
  const [debouncedContent, setDebouncedContent] = useState(initialContent.html)

  useEffect(() => {
    setCodeHtml(initialContent.html)
    setCodescript(initialContent.script)
    setCodedata(initialContent.data)
  }, [initialContent])

  const captureScrollPosition = () => {
    if (iframeRef.current?.contentWindow && !isRestoringScroll) {
      try {
        const { scrollX, scrollY } = iframeRef.current.contentWindow
        setScrollPosition({ x: scrollX, y: scrollY })
      } catch (error) {
        console.log("[v0] Could not capture scroll position:", error)
      }
    }
  }

  const restoreScrollPosition = () => {
    if (iframeRef.current?.contentWindow) {
      setIsRestoringScroll(true)
      setTimeout(() => {
        try {
          iframeRef.current?.contentWindow?.scrollTo(scrollPosition.x, scrollPosition.y)
        } catch (error) {
          console.log("[v0] Could not restore scroll position:", error)
        }
        setIsRestoringScroll(false)
      }, 50)
    }
  }

  const handleIframeLoad = () => {
    restoreScrollPosition()
  }

  useEffect(() => {
    captureScrollPosition()

    const timer = setTimeout(() => {
      let combinedHtml = codeHtml
      combinedHtml = combinedHtml.replace('<script src="data.js"></script>', `<script>\n${codeData}\n</script>`)
      combinedHtml = combinedHtml.replace('<script src="script.js"></script>', `<script>\n${codeScript}\n</script>`)
      setDebouncedContent(combinedHtml)
    }, 300)

    return () => clearTimeout(timer)
  }, [codeHtml, codeScript, codeData])

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe?.contentWindow) return

    const handleScroll = () => {
      if (!isRestoringScroll) {
        captureScrollPosition()
      }
    }

    try {
      iframe.contentWindow.addEventListener("scroll", handleScroll)
      return () => iframe.contentWindow?.removeEventListener("scroll", handleScroll)
    } catch (error) {
      console.log("[v0] Could not add scroll listener:", error)
    }
  }, [debouncedContent, isRestoringScroll])

  const handleInsertSubmit = () => {
    if (selected === null) return

    const htmlString = insertList[selected].code

    setCodeHtml((prevHtml) => {
      const modalIdRegex = /<[^>]*id=["']modal_insert["'][^>]*>[\s\S]*?<\/[^>]+>/i

      if (modalIdRegex.test(prevHtml)) {
        return prevHtml.replace(modalIdRegex, htmlString)
      } else if (prevHtml.includes("</body>")) {
        return prevHtml.replace("</body>", `${htmlString}\n</body>`)
      } else {
        return prevHtml + htmlString
      }
    })

    setIsOpen(false)
    setSelected(null)
  }

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
      const isBlank = !initialContent?.data || initialContent.data.trim() === ""
      console.log("isBlank:", isBlank, "initialContent.data:", initialContent.data)

      const result = isBlank
        ? await generateCodeWithAIBlank(codeHtml, aiPrompt)
        : await generateCodeWithAI(codeData, aiPrompt)

      if (result.success && result.generatedCode) {
        if (isBlank) {
          setCodeHtml(result.generatedCode) // update HTML if blank
        } else {
          setCodedata(result.generatedCode) // update data if not blank
        }
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
        currentCode = codeData
        currentSetCode = setCodedata
        currentLanguage = "javascript"
    }
  } else {
    if (!initialContent?.data) {
      currentCode = codeHtml
      currentSetCode = setCodeHtml
      currentLanguage = "html"
    } else {
      currentCode = codeData
      currentSetCode = setCodedata
      currentLanguage = "javascript"
    }
  }

  return (
    <div className="flex flex-col ">
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
        <Split
          sizes={[50, 50]}
          minSize={100}
          gutterSize={10}
          direction="horizontal"
          className="flex w-full h-full hover:cursor-crosshair"
        >
          <div className=" h-[calc(100vh-120px)] bg-[#030712] border-t border-gray-300 rounded-t-lg">
            <div className="px-4 py-1 flex justify-between ">
              <h2 className="font-bold text-sm tracking-widest text-yellow-400">Preview</h2>
              <div className="flex items-center gap-2">
                <a
                  className="text-gray-400 px-3 rounded-sm border-gray-400 justify-center text-serif font-normal hover:cursor-pointer tracking-wider text-xs flex items-center gap-1"
                  onClick={() => setIsFullscreenOpen(true)}
                >
                  <Maximize2 className="w-3 h-3" />
                  Maximize
                </a>
                <a
                  className="text-gray-400 px-3 rounded-sm border-gray-400 justify-center text-serif font-normal hover:cursor-pointer tracking-wider text-xs flex items-center gap-1"
                  onClick={() => setIsOpen(true)}
                >
                  <SquarePlus className="w-3 h-3 " />Button
                </a>
              </div>
            </div>
            <div className="h-full overflow-auto custom-scrollbar">
              <iframe
                ref={iframeRef}
                srcDoc={debouncedContent}
                onLoad={handleIframeLoad}
                className="w-full h-full border border-{#181818} rounded-lg"
                title="Live Preview"
                sandbox="allow-scripts allow-same-origin"
                style={{ zoom: 0.8 }}
              />
            </div>
          </div>
          <div className=" h-full">
            <div className="border-t border-gray-300 rounded-t-lg px-4 py-1 bg-[#030712]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                  </div>
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

      <AnimatePresence>
        {isFullscreenOpen && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
          >
            <motion.div
              className="w-full h-full flex flex-col"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
            >
              <div className="flex items-center justify-between p-6 bg-white/5 backdrop-blur-sm border-b border-white/10">
                <div className="flex items-center gap-4">
                  <h2 className="text-white text-lg font-medium">Preview</h2>
                  <div className="flex items-center bg-white/10 rounded-lg p-1">
                    <button
                      onClick={() => setPreviewDevice("desktop")}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
                        previewDevice === "desktop"
                          ? "bg-white text-black shadow-sm"
                          : "text-white/70 hover:text-white hover:bg-white/10",
                      )}
                    >
                      <Monitor className="w-4 h-4" />
                      Desktop
                    </button>
                    <button
                      onClick={() => setPreviewDevice("mobile")}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
                        previewDevice === "mobile"
                          ? "bg-white text-black shadow-sm"
                          : "text-white/70 hover:text-white hover:bg-white/10",
                      )}
                    >
                      <Smartphone className="w-4 h-4" />
                      Mobile
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setIsFullscreenOpen(false)}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 text-white/70 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 flex items-center justify-center p-6">
                <motion.div
                  className={cn(
                    "bg-white rounded-xl shadow-2xl overflow-hidden",
                    previewDevice === "desktop" ? "w-full h-full max-w-7xl" : "w-[375px] h-[812px]",
                  )}
                  layout
                  transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
                >
                  <iframe
                    srcDoc={debouncedContent}
                    className="w-full h-full border-none"
                    title="Fullscreen Preview"
                    sandbox="allow-scripts allow-same-origin"
                  />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsOpen(false)
                setSelected(null)
              }}
            />
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative overflow-hidden">
                <h2 className="text-xl font-semibold mb-1">Insert Action Button</h2>
                <p className="text-xs text-gray-500 mb-4">Lead your visitors into cash-flowing conversations</p>
                <div className="relative min-h-[160px] overflow-y-auto">
                  <AnimatePresence mode="wait">
                    {selected === null ? (
                      <motion.div
                        key="list"
                        variants={screenVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="absolute w-full"
                      >
                        <div className="flex items-center justify-center w-full">
                          <ScrollArea className="h-96 w-64 rounded-xl border border-gray-200 bg-white shadow-lg">
                            <div className="p-6">
                              <div className="space-y-1">
                                {insertList.map((item: InsertItem, index: number) => (
                                  <React.Fragment key={item.title}>
                                    <div
                                      onClick={() => setSelected(index)}
                                      className="group text-sm text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                                    >
                                      <span className="font-mono">{item.title}</span>
                                    </div>
                                    {index < insertList.length - 1 && <Separator className="my-1 bg-gray-200" />}
                                  </React.Fragment>
                                ))}
                              </div>
                            </div>
                          </ScrollArea>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="content"
                        variants={screenVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="absolute w-full"
                      >
                        <div className="py-5 px-3 font-mono bg-gray-50 rounded-lg border border-gray-200 mt-12">
                          <p className="text-sm ">
                            Click Submit to confirm. Messages from visitors appear instantly on your dashboard.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  {selected !== null && (
                    <button
                      onClick={() => setSelected(null)}
                      className="px-4 py-1 text-xs bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                    >
                      Back
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsOpen(false)
                      setSelected(null)
                    }}
                    className="px-4 py-1 text-xs bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                  >
                    Close
                  </button>
                  {selected !== null && (
                    <button
                      onClick={handleInsertSubmit}
                      className="px-4 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Submit
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
