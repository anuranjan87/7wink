"use client"
import type React from "react"
import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Loader2, Send, CheckCircle, AlertCircle, Maximize2, SquarePlus,Plus, Save, Undo2, Redo2, Image, Link, History, Fullscreen} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { updateWebsiteContent, generateCodeWithAI, generateCodeWithAIBlank, handleHistoryClick as fetchHistoryLogs } from "@/lib/website-actions"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { insertList } from "@/lib/insertlist"
import dynamic from "next/dynamic"
import { FullscreenPreviewModal, DraftView, HistoryView} from "@/components/modal"

import { motion, AnimatePresence } from "framer-motion"
import { LoadingCircle, SendIcon } from '@/components/icons'
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
// ✅ Define log type
export type LogType = {
  id: number;
  code: any;
  code_script: any;
  code_data: any;
  created_at: string;
};


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
    { token: "comment", foreground: "6B7280", fontStyle: "italic" },  // comments
    { token: "keyword", foreground: "F1C40F" },                        // const, function, return
    { token: "identifier", foreground: "DEA193" },                     // function names, variables
    { token: "number", foreground: "FFAB40" },                          // numbers
    { token: "string", foreground: "E6C76D" },                          // strings
    { token: "operator", foreground: "FFFFFF" },                        // operators like =, +, -, etc.
    { token: "delimiter", foreground: "D4D4D4" },                       // semicolons, brackets
    { token: "type", foreground: "4EC9B0" },                             // types like boolean, string
    { token: "function", foreground: "82AAFF" },                        // function declarations
    { token: "variable", foreground: "9CDCFE" },                        // general variables
    { token: "text", foreground: "D4D4D4" },                             // default text
  ],
  colors: {
    "editor.background": "#1E1E1E",
    "editor.foreground": "#D4D4D4",
    "editor.lineHighlightBackground": "#333842",
    "editorLineNumber.foreground": "#858585",
    "editorLineNumber.activeForeground": "#F1C40F",
    "editorCursor.foreground": "#F1C40F",
    "editor.selectionBackground": "#264F78",
    "editor.inactiveSelectionBackground": "#3A3D41",
  },
});


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
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop")
  const iframeRef = useRef<any>(null)
  const [isRestoringScroll, setIsRestoringScroll] = useState(false)
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 })
  const [debouncedContent, setDebouncedContent] = useState(initialContent.html)
  const [isCodeEditorMaximized, setIsCodeEditorMaximized] = useState(false)
  const [history, setHistory] = useState<string[]>([initialContent.html])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [isDraftOpen, setIsDraftOpen] = useState(false)
    const [isHistoryOpen, setIsHistoryOpen] = useState(false)
const [historyLogs, setHistoryLogs] = useState<LogType[] | null>(null);






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
combinedHtml = combinedHtml.replace('<script src="script.js"></script>', `<script type="text/babel">\n${safeScript}\n</script>`);


    setDebouncedContent(combinedHtml)
    setIsManualEdit(false)
    console.log(combinedHtml)
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
    combinedHtml = combinedHtml.replace('<script src="script.js"></script>', `<script type="text/babel">\n${safeScript}\n</script>`)
    setDebouncedContent(combinedHtml)

    setSavedContent({
      html: html || "",
      script: safeScript,
      data: safeData,
    })
  }

  //undo redo logic starts
const handleUndo = () => {
  if (historyIndex > 0) {
    const newIndex = historyIndex - 1
    setHistoryIndex(newIndex)
    const previous = history[newIndex]
    setCodeHtml(previous) // or split into data/script if you store separately
    setDebouncedContent(previous)
  }
}

const handleRedo = () => {
  if (historyIndex < history.length - 1) {
    const newIndex = historyIndex + 1
    setHistoryIndex(newIndex)
    const next = history[newIndex]
    setCodeHtml(next)
    setDebouncedContent(next)
  }
}



const fetchAndSetHistory = async (username: string) => {
  try {
    const logs = await fetchHistoryLogs(username); // fetch logs
console.log(alert);
    setHistoryLogs(logs); // set state here
  } catch (error) {
    console.error("Error fetching history:", error);
  }
};




const handleRestore = (log: LogType) => {
  // Update editor fields
  setCodeHtml(log.code || "");
  setCodescript(log.code_script || "");
  setCodedata(log.code_data || "");

  // Replace <script> placeholders and update preview
  let combinedHTML = (log.code || "")
    .replace('<script src="data.js"></script>', `<script>\n${log.code_data || ""}\n</script>`)
    .replace('<script src="script.js"></script>', `<script type="text/babel">\n${log.code_script || ""}\n</script>`);

  setDebouncedContent(combinedHTML);

  // Close modal
  setIsHistoryOpen(false);

  // Mark as manual change so user can save again
  setIsManualEdit(true);
};




 const handleSave = () => {
  const combinedHtml = codeHtml
    .replace('<script src="data.js"></script>', `<script>\n${codeData}\n</script>`)
    .replace('<script src="script.js"></script>', `<script type="text/babel">\n${codeScript}\n</script>`)

  // If we are in the middle of history (redo possible), discard future redo states
  const newHistory = history.slice(0, historyIndex + 1)
  newHistory.push(combinedHtml)
  setHistory(newHistory)
  setHistoryIndex(newHistory.length - 1)

  setDebouncedContent(combinedHtml)
  setSavedContent({
    html: codeHtml,
    script: codeScript,
    data: codeData,
  })
  setHasUnsavedChanges(false)
  setIsManualEdit(false)
}


// Ctrl+S / Cmd+S save shortcut
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault(); // Prevent browser's default save dialog
      handleSave();
    }
  };

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [handleSave]); // Ensure handleSave is in dependencies

// sroll logic starts
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
                        (() => {
                let scrollPos = { x: window.scrollX, y: window.scrollY };
                let scrollTimeout;

                // Save scroll position
                const saveScroll = () => {
                  scrollPos = { x: window.scrollX, y: window.scrollY };
                  window.parent?.postMessage({ type: "scrollUpdate", position: scrollPos }, "*");
                };

                // Restore scroll position
                const restoreScroll = () => {
                  requestAnimationFrame(() => {
                    window.scrollTo(scrollPos.x, scrollPos.y);
                  });
                };

                // Debounced scroll listener
                window.addEventListener("scroll", () => {
                  clearTimeout(scrollTimeout);
                  scrollTimeout = setTimeout(saveScroll, 100);
                });

                // Observe DOM changes (append/remove/etc.)
                const observer = new MutationObserver(() => {
                  // Restore after small delay to let layout settle
                  setTimeout(restoreScroll, 20);
                });

                window.addEventListener("load", () => {
                  observer.observe(document.body, { childList: true, subtree: true });
                  setTimeout(restoreScroll, 100); // initial restore
                });
              })();

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

// scroll logic ends

  

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

      const result = isBlank ? await generateCodeWithAIBlank(codeHtml, aiPrompt) : await generateCodeWithAI(codeData, aiPrompt)

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
  <div className="w-full px-4 mt-5" style={{ zoom: 0.9 }}>
  <div
    className="
      flex items-center gap-4 w-full rounded-xl 
      bg-black/40 border border-white/10 
      shadow-[0_0_25px_rgba(0,0,0,0.4),inset_0_0_15px_rgba(255,255,255,0.03)]
      backdrop-blur-md py-3 px-4
    "
  >
    {/* Publish */}
    <button
      onClick={handlePublish}
      className="
        flex items-center justify-center 
        text-yellow-400 tracking-wider 
        border border-yellow-400/70 
        px-6 py-1.5 rounded-md 
        text-sm font-semibold 
        hover:bg-yellow-400 hover:text-black 
        transition-all duration-150
      "
    >
      {isPublishing ? (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-yellow-300" />
          <span className="font-mono">Publishing...</span>
        </div>
      ) : (
        "Publish"
      )}
    </button>

    {/* Undo / Redo */}
    <div className="flex items-center gap-2 ml-4">
      <button
        onClick={handleUndo}
        disabled={historyIndex === 0}
        className={`
           rounded-md transition-all 
          ${historyIndex === 0 ? "text-gray-700" : "text-gray-300 hover:bg-white/10"}
        `}
      >
        <Undo2 className="w-4 h-4" />
      </button>

      <button
        onClick={handleRedo}
        disabled={historyIndex === history.length - 1}
        className={`
          p-2 rounded-md transition-all 
          ${historyIndex === history.length - 1 ? "text-gray-700" : "text-gray-300 hover:bg-white/10"}
        `}
      >
        <Redo2 className="w-4 h-4" />
      </button>



     <button
  type="button"
  onClick={() => setIsDraftOpen(true)}
  className="text-gray-300"
>
  <Fullscreen className="w-4 h-4 mr-3" />
</button>

 <button
  type="button"
  onClick={() => {
    setIsHistoryOpen(true);      // open the History panel
    fetchAndSetHistory(username); // fetch logs
  }}
  className="text-gray-300"
>
  <History className="w-4 h-4" />
</button>



    </div>

    {/* MAGIC INPUT — Right Aligned */}
    <div className="ml-auto" style={{ zoom: 0.7 }}>
      <Sheet>
        <SheetTrigger asChild>
          <button
            className="
              bg-yellow-600 text-black 
              font-bold text-sm px-4 py-1.5 
              rounded-md border-2 border-black
              hover:bg-yellow-700 transition-all
              shadow-[0_3px_0px_0px_rgba(0,0,0,0.8)]
              active:translate-y-[1px] active:shadow-none
            "
          >
            AI Assistant
          </button>
        </SheetTrigger>

        <SheetContent side="right" className="bg-black border-white/10 mt-3">
          <VisuallyHidden>
            <SheetTitle>Hidden</SheetTitle>
          </VisuallyHidden>
   
      <div
        className="
          items-center gap-2
          w-full max-w-2xl mx-auto mt-3 px-3 py-1
          rounded-xl
          border border-white/10
          bg-white/5 backdrop-blur-sm
          shadow-[inset_0_0_12px_rgba(255,255,255,0.06),0_4px_20px_rgba(0,0,0,0.6)]
          transition-all
          focus-within:border-white/25 
        "
      >
        {/* Input */}
        <input
          type="text"
          ref={inputRef}
          placeholder="Tell us your site idea — name, vibe, what it does..."
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={isGenerating}
          className="
            flex-1 w-full px-4 py-2
            bg-transparent text-teal-400 placeholder:text-stone-400
            tracking-wide
            border-none outline-none
            focus:ring-0 focus:placeholder-opacity-0
            caret-white
          "
        />

        {/* Image Tool */}
        <button
          type="button"
          className="
            flex items-center gap-1 py-2
            px-2 text-xs text-stone-400
            bg-black rounded-md
            hover:border-white/40 hover:bg-white/10
            transition-all
          "
        >
          <Image className="text-stone-400" height={16} />
          Image
        </button>

        {/* Send Button */}
        <button
          onClick={handleAIGenerate}
          disabled={isGenerating || !aiPrompt.trim()}
          type="button"
          className="
            relative flex items-center justify-center
            h-10 px-8 py-2
            bg-black text-white
            border-l border-black
            rounded-md
            active:scale-95
            transition-all duration-100
            disabled:opacity-50
          "
        >
          {isGenerating ? (
            <span className="flex items-center gap-2 whitespace-nowrap">
              <LoadingCircle />
              <span className="text-sm font-semibold">Generating...</span>
            </span>
          ) : (
            <SendIcon
              className={`h-4 w-4 ${
                aiPrompt.length === 0 ? "text-white/40" : "text-white"
              }`}
            />
          )}
        </button>
      </div>
    </SheetContent>
  </Sheet>
</div>


    





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
      <div className="-mt-0.5  flex h-[calc(100vh-120px)] gap-3">
        {/* Preview Panel */}
        <div className="flex-1 bg-[#030712] border-t border-gray-800 rounded-t-lg">
          <div className="px-4 py-1 flex justify-between">
              <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                </div>
            <div className="flex items-center gap-1">
      
               <button onClick={() => setIsFullscreenOpen(true)} style={{zoom: .9}} className="inline-flex items-center justify-center border align-middle select-none font-sans font-medium text-center transition-all duration-300 ease-in disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed focus:shadow-none text-sm rounded-md  px-2 bg-transparent border-transparent text-stone-400 hover:bg-stone-700 hover:border-stone-100/5 shadow-none hover:shadow-none">
        <span>Expand</span>
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
                          <h2 className="font-light text-xs tracking-widest text-left  text-yellow-400/80">Editor</h2>

                {nerdMode && (
                  <div className="flex items-center absolute left-1/2 -translate-x-1/2 gap-6  text-stone-400">
                    {["data.js", "index.html", "script.js"].map((tabName) => (
                      <button
                        key={tabName}
                        style={{ zoom: 0.8 }}
                        className={cn(
                          "px-3   text-xs font-serif tracking-widest rounded-md transition-colors duration-200",
                          activeTab === tabName ? "bg-[#242424] text-yellow-400" : "text-stone-400 hover:bg-[#242424]",
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
                  Dev Mode
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

                stickyScroll: {enabled: false}
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

    <DraftView
  isOpen={isDraftOpen}
  onClose={() => setIsDraftOpen(false)}
  debouncedContent={debouncedContent}
/>


<HistoryView
  isOpen={isHistoryOpen}
  onClose={() => setIsHistoryOpen(false)}
  debouncedContent={debouncedContent}
  historyLogs={historyLogs}
  onRestore={handleRestore}   // ✅ ADD THIS
/>




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


    </div>
  )
}
