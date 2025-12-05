"use client"
import type React from "react"
import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Loader2, Send, CheckCircle, AlertCircle, Maximize2, SquarePlus,Plus, Save } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { updateWebsiteContent, generateCodeWithAI, generateCodeWithAIBlank } from "@/lib/website-actions"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { insertList } from "@/lib/insertlist"
import dynamic from "next/dynamic"
import { FullscreenPreviewModal, InsertButtonModal} from "@/components/modal"
import { motion, AnimatePresence } from "framer-motion"
import { LoadingCircle, SendIcon } from '@/components/icons'

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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [savedContent, setSavedContent] = useState({
    html: initialContent.html,
    script: initialContent.script,
    data: initialContent.data,
  })
  const [isManualEdit, setIsManualEdit] = useState(false)
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
  const [isCodeEditorMaximized, setIsCodeEditorMaximized] = useState(false)

  useEffect(() => {
    setCodeHtml(initialContent.html)
    setCodescript(initialContent.script)
    setCodedata(initialContent.data)
    setSavedContent({
      html: initialContent.html,
      script: initialContent.script,
      data: initialContent.data,
    })

    // Auto-update preview for initial load
    const safeHtml = initialContent.html || ""
    const safeScript = initialContent.script || ""
    const safeData = initialContent.data || ""

    let combinedHtml = safeHtml
    combinedHtml = combinedHtml.replace('<script src="data.js"></script>', `<script>\n${safeData}\n</script>`)
    combinedHtml = combinedHtml.replace('<script src="script.js"></script>', `<script>\n${safeScript}\n</script>`)
    setDebouncedContent(combinedHtml)
    setIsManualEdit(false)
  }, [initialContent])

  useEffect(() => {
    const hasChanges =
      codeHtml !== savedContent.html || codeScript !== savedContent.script || codeData !== savedContent.data

    setHasUnsavedChanges(hasChanges && isManualEdit)
  }, [codeHtml, codeScript, codeData, savedContent, isManualEdit])

  const updatePreviewImmediately = (html: string, script: string, data: string) => {
    captureScrollPosition()

    let combinedHtml = html || ""
    const safeScript = script || ""
    const safeData = data || ""

    combinedHtml = combinedHtml.replace('<script src="data.js"></script>', `<script>\n${safeData}\n</script>`)
    combinedHtml = combinedHtml.replace('<script src="script.js"></script>', `<script>\n${safeScript}\n</script>`)
    setDebouncedContent(combinedHtml)

    setSavedContent({
      html: html || "",
      script: safeScript,
      data: safeData,
    })
  }

  const handleSave = () => {
    updatePreviewImmediately(codeHtml, codeScript, codeData)
    setHasUnsavedChanges(false)
    setIsManualEdit(false)
  }

  const captureScrollPosition = () => {
    if (iframeRef.current?.contentWindow && !isRestoringScroll) {
      try {
        const { scrollX, scrollY } = iframeRef.current.contentWindow
        setScrollPosition({ x: scrollX, y: scrollY })
        console.log("[v0] Captured scroll position:", { x: scrollX, y: scrollY })
      } catch (error) {
        console.log("[v0] Could not capture scroll position:", error)
      }
    }
  }

  const restoreScrollPosition = () => {
    if (iframeRef.current?.contentWindow) {
      setIsRestoringScroll(true)

      const attemptRestore = (attempt = 1) => {
        try {
          iframeRef.current?.contentWindow?.scrollTo(scrollPosition.x, scrollPosition.y)
          console.log("[v0] Restored scroll position:", scrollPosition, `(attempt ${attempt})`)
        } catch (error) {
          console.log("[v0] Could not restore scroll position:", error)
        }

        if (attempt < 3) {
          setTimeout(() => attemptRestore(attempt + 1), attempt * 100)
        } else {
          setIsRestoringScroll(false)
        }
      }

      setTimeout(attemptRestore, 50)
    }
  }

  const handleIframeLoad = () => {
    if (iframeRef.current?.contentWindow) {
      try {
        const doc = iframeRef.current.contentWindow.document
        const script = doc.createElement("script")
        script.textContent = `
          let preservedScrollPosition = { x: ${scrollPosition.x}, y: ${scrollPosition.y} };
          
          const preserveScroll = () => {
            preservedScrollPosition = { x: window.scrollX, y: window.scrollY };
            window.parent.postMessage({ type: 'scrollUpdate', position: preservedScrollPosition }, '*');
          };
          
          const restoreScroll = () => {
            requestAnimationFrame(() => {
              window.scrollTo(preservedScrollPosition.x, preservedScrollPosition.y);
            });
          };
          
          const originalInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
          if (originalInnerHTML) {
            Object.defineProperty(Element.prototype, 'innerHTML', {
              set: function(value) {
                preserveScroll();
                originalInnerHTML.set.call(this, value);
                setTimeout(restoreScroll, 10);
              },
              get: originalInnerHTML.get
            });
          }
          
          const originalAppendChild = Element.prototype.appendChild;
          Element.prototype.appendChild = function(child) {
            preserveScroll();
            const result = originalAppendChild.call(this, child);
            setTimeout(restoreScroll, 10);
            return result;
          };
          
          const originalRemoveChild = Element.prototype.removeChild;
          Element.prototype.removeChild = function(child) {
            preserveScroll();
            const result = originalRemoveChild.call(this, child);
            setTimeout(restoreScroll, 10);
            return result;
          };
          
          const originalInsertBefore = Element.prototype.insertBefore;
          Element.prototype.insertBefore = function(newNode, referenceNode) {
            preserveScroll();
            const result = originalInsertBefore.call(this, newNode, referenceNode);
            setTimeout(restoreScroll, 10);
            return result;
          };
          
          const observer = new MutationObserver((mutations) => {
            let shouldRestore = false;
            mutations.forEach((mutation) => {
              if (mutation.type === 'childList' && (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)) {
                shouldRestore = true;
              }
            });
            if (shouldRestore) {
              setTimeout(restoreScroll, 20);
            }
          });
          
          window.addEventListener('load', () => {
            observer.observe(document.body, {
              childList: true,
              subtree: true,
              attributes: false
            });
            
            setTimeout(() => {
              window.scrollTo(preservedScrollPosition.x, preservedScrollPosition.y);
            }, 100);
          });
          
          let scrollTimeout;
          window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(preserveScroll, 100);
          });
        `
        doc.head.appendChild(script)
      } catch (error) {
        console.log("[v0] Could not inject scroll preservation script:", error)
      }
    }

    restoreScrollPosition()
  }

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe?.contentWindow) return

    const handleScroll = () => {
      if (!isRestoringScroll) {
        captureScrollPosition()
      }
    }

    const handleMessage = (event: any) => {
      if (event.data?.type === "scrollUpdate") {
        setScrollPosition(event.data.position)
      }
    }

    try {
      iframe.contentWindow.addEventListener("scroll", handleScroll)
      window.addEventListener("message", handleMessage)
      return () => {
        iframe.contentWindow?.removeEventListener("scroll", handleScroll)
        window.removeEventListener("message", handleMessage)
      }
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
          setCodeHtml(result.generatedCode)
          updatePreviewImmediately(result.generatedCode, codeScript, codeData)
        } else {
          setCodedata(result.generatedCode)
          updatePreviewImmediately(codeHtml, codeScript, result.generatedCode)
        }
        setAiPrompt("")
        setIsManualEdit(false) // AI changes don't require manual save
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

  const handleManualCodeChange = (setter: (value: string) => void) => (value: string) => {
    setter(value)
    setIsManualEdit(true)
  }

  let currentCode, currentSetCode, currentLanguage
  if (nerdMode) {
    switch (activeTab) {
      case "data.js":
        currentCode = codeData
        currentSetCode = handleManualCodeChange(setCodedata)
        currentLanguage = "javascript"
        break
      case "index.html":
        currentCode = codeHtml
        currentSetCode = handleManualCodeChange(setCodeHtml)
        currentLanguage = "html"
        break
      case "script.js":
        currentCode = codeScript
        currentSetCode = handleManualCodeChange(setCodescript)
        currentLanguage = "javascript"
        break
      default:
        currentCode = codeData
        currentSetCode = handleManualCodeChange(setCodedata)
        currentLanguage = "javascript"
    }
  } else {
    if (!initialContent?.data) {
      currentCode = codeHtml
      currentSetCode = handleManualCodeChange(setCodeHtml)
      currentLanguage = "html"
    } else {
      currentCode = codeData
      currentSetCode = handleManualCodeChange(setCodedata)
      currentLanguage = "javascript"
    }
  }

  return (
    <div className="flex flex-col">
      <div className="bg-[#181818] px-4 mt-2 rounded-xl" style={{ zoom: 0.9 }}>
        <div className="flex items-center shadow-2xl gap-1">
          <div className="flex-1 font-sans  text-white flex max-w-2xl mx-auto mt-1 rounded-xl border-2 border-dotted border-gray-700 shadow-2xl px-2 py-1 min-w-sm focus-within:border-gray-300">
            <input
              type="text"
              ref={inputRef}
              placeholder="Tell us your site idea — name, vibe, what it does..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isGenerating}
              className="flex-1 w-full px-6 py-2 placeholder:text-stone-400 placeholder:font-normal placeholder:tracking-wider bg-transparent border-none rounded-none rounded-l focus:outline-none focus:ring-0 caret-white text-teal-400 placeholder:opacity-100 focus:placeholder-opacity-0"
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
                    <LoadingCircle />
                    <span className="mx-auto text-sm font-semibold truncate whitespace-nowrap text-white px-2">
                      Generating...
                    </span>
                  </>
                ) :  (
          <SendIcon className={`h-4 w-4 ${aiPrompt.length === 0 ? "text-muted-foreground" : "text-primary-foreground"}`} />
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
      <AnimatePresence mode="wait">
  {message && (
    <motion.div
      key={message.text}
      layout   // 🔑 preserves smooth layout shifts
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 16,
        duration: 0.35,
      }}
      className="mt-2"
    >
      <Alert
        variant={message.type === "error" ? "destructive" : "default"}
        className="bg-black text-white border border-gray-800 rounded-xl shadow-lg flex items-center gap-2 p-3"
      >
        {message.type === "success" ? (
          <CheckCircle className="h-5 w-5 text-green-400" />
        ) : (
          <AlertCircle className="h-5 w-5 text-red-400" />
        )}
        <AlertDescription className="text-gray-200 tracking-wide">
          {message.text}
        </AlertDescription>
      </Alert>
    </motion.div>
  )}
</AnimatePresence>

      </div>
// Panel starts here
      <div className="-mt-2  flex h-[calc(100vh-120px)] gap-3">
        {/* Preview Panel */}
        <div className="flex-1 bg-[#030712] border-t border-gray-800 rounded-t-lg">
          <div className="px-4 py-1 flex justify-between">
            <h2 className="font-bold text-sm tracking-widest text-yellow-400">Preview</h2>
            <div className="flex items-center gap-1">
             

              
      <button onClick={() => setIsOpen(true)} style={{zoom: .9}} className="inline-flex items-center justify-center  align-middle select-none font-sans font-medium text-center transition-all ease-in disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed focus:shadow-none text-sm  px-2 shadow-sm bg-transparent relative text-stone-400 hover:bg-stone-700  duration-150  rounded-md  hover:shadow-none antialiased mr-3">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 mr-2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Insert More
      </button>
    

               <button onClick={() => setIsFullscreenOpen(true)} style={{zoom: .9}} className="inline-flex items-center justify-center border align-middle select-none font-sans font-medium text-center transition-all duration-300 ease-in disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed focus:shadow-none text-sm rounded-md  px-2 bg-transparent border-transparent text-stone-400 hover:bg-stone-700 hover:border-stone-100/5 shadow-none hover:shadow-none">
        <span>Maximize</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 ml-2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
        </svg>
      </button>

            
             
            </div>
          </div>
          <div className="h-full overflow-auto custom-scrollbar">
            <iframe
              ref={iframeRef}
              srcDoc={debouncedContent}
              onLoad={handleIframeLoad}
              className="w-full h-full  rounded-lg"
              title="Live Preview"
              sandbox="allow-scripts allow-same-origin"
              style={{ zoom: .7 }}
            />
          </div>
        </div>

        {/* Code Editor Panel */}
        <div className="flex-1 h-full relative">
          <div className="border-t border-gray-800 rounded-t-lg px-4 py-1 bg-[#030712]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                </div>
                {nerdMode && (
                  <div className="flex items-center gap-6 ml-4">
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
              <div className="items-center flex  -mr-1">


               <Label htmlFor="nerdmode" className="text-xs mr-2 font-sans font-medium text-serif text-stone-400">
                  Nerd Mode
                </Label>
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
                


                 <button onClick={() => setIsCodeEditorMaximized(true)} style={{zoom: .9}} className="inline-flex items-center justify-center border align-middle select-none font-sans font-medium text-center transition-all duration-300 ease-in disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed focus:shadow-none text-sm rounded-md  px-2 bg-transparent border-transparent text-stone-400 hover:bg-stone-700 hover:border-stone-100/5 shadow-none hover:shadow-none">
        <span>Maximize</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 ml-2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
        </svg>
      </button>
              </div>
            </div>
          </div>

          <div>
            <MonacoEditor
              height="calc(100vh - 120px)"
              language={currentLanguage}
              value={currentCode}
              onChange={(value) => currentSetCode(value || "")} // Fixed parameter usage
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

         {hasUnsavedChanges && (
  <button
    onClick={handleSave}
    className="absolute bottom-6 right-6
               min-w-[140px] px-6 py-3
               bg-white/10 
               backdrop-blur-xl 
               border border-white/30 
               hover:bg-white/20 
               text-white 
               text-sm font-[system-ui] font-semibold tracking-wide
               rounded-2xl
               shadow-lg
               transition-all duration-300 
               z-10 
               flex items-center justify-center
               hover:scale-105 hover:shadow-2xl
                overflow-hidden"
    title="Save changes to update preview"
  >
    <span className="relative z-10">Save</span>
    {/* Glow effect */}
    <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-400/30 to-emerald-500/30 opacity-0 hover:opacity-100 transition-opacity duration-500" />
  </button>
)}

        </div>
      </div>

    <FullscreenPreviewModal
  isOpen={isFullscreenOpen}
  onClose={() => setIsFullscreenOpen(false)}
  debouncedContent={debouncedContent}
  previewDevice={previewDevice}
  setPreviewDevice={setPreviewDevice}
  openEditor={() => setIsCodeEditorMaximized(true)}
  handleEditorMount={handleEditorMount}
  currentCode={currentCode}
  currentSetCode={currentSetCode}
  currentLanguage={currentLanguage}
  nerdMode={nerdMode}
  setNerdMode={setnerdMode}
  activeTab={activeTab}
  setActiveTab={setActiveTab}      // ✅ add this
  onSave={handleSave}
  hasUnsavedChanges={hasUnsavedChanges} // ✅ add this
/>


      <InsertButtonModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        selected={selected}
        setSelected={setSelected}
        onSubmit={handleInsertSubmit}
      />

 

    </div>
  )
}
