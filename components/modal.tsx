"use client"
import React from "react"
import { cn } from "@/lib/utils"
import { X, Monitor, Smartphone, Save, Clapperboard, Component, Fan, FlaskConical, IceCreamConeIcon, LoaderPinwheel, Rabbit, Snowflake, TentTree } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import dynamic from "next/dynamic"
import { useState, useEffect, useRef } from "react"


const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="h-8 w-8 animate-spin" />
    </div>
  ),
})

const screenVariants = {
  enter: { opacity: 0, x: 50 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
}

interface InsertItem {
  title: string
  code: string
}

const sampleInsertItems: InsertItem[] = [
  { title: "Contact Form", code: "<form>...</form>" },
  { title: "Call to Action", code: "<button>...</button>" },
  { title: "Newsletter Signup", code: "<div>...</div>" },
]



interface ModeSwitchProps {
  active: "preview" | "editor"
  onSwitch: (target: "preview" | "editor") => void
}

export function ModeSwitch({ active, onSwitch }: ModeSwitchProps) {
  return (
    <div className="flex items-center bg-white/10 rounded-md p-0.5">
      {/* Preview Button */}
      <button
        onClick={() => onSwitch("preview")}
        className={cn(
          "flex items-center gap-1 px-2 py-1 rounded text-xs transition-all",
          active === "preview"
            ? "bg-white text-black shadow-sm"
            : "text-white/50 hover:text-white hover:bg-white/10"
        )}
      >
        <TentTree className="w-3.5 h-3.5" />
        Preview
      </button>

      {/* Editor Button */}
      <button
        onClick={() => onSwitch("editor")}
        className={cn(
          "flex items-center gap-1 px-2 py-1 rounded text-xs transition-all",
          active === "editor"
            ? "bg-white text-black shadow-sm"
            : "text-white/50 hover:text-white hover:bg-white/10"
        )}
      >
        <Clapperboard className="w-3.5 h-3.5" />
        Editor
      </button>
    </div>
  );
}







interface FullscreenPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  debouncedContent: string
  previewDevice: "desktop" | "mobile"
  setPreviewDevice: (device: "desktop" | "mobile") => void
}



export function FullscreenPreviewModal({
  isOpen,
  onClose,
  debouncedContent,
  previewDevice,
  setPreviewDevice,
  openEditor,
}: FullscreenPreviewModalProps & { openEditor: () => void }) {
  
  const scrollPositionRef = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const [isRestoringScroll, setIsRestoringScroll] = useState(false)
      const iframeRef = useRef<any>(null)
   const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 })
 

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



  // 🟢 Restore scroll after iframe reloads
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

  // 🟢 Helper to capture scroll BEFORE saving or updating preview
  const captureScrollBeforeSave = () => {
    if (iframeRef.current?.contentWindow) {
      scrollPositionRef.current = {
        x: iframeRef.current.contentWindow.scrollX,
        y: iframeRef.current.contentWindow.scrollY,
      };
    }
  };

  return (
    <motion.div
      // ⬇ Keep mounted: toggle visibility instead of unmounting
      className={cn(
        "fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl transition-opacity duration-300",
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
    >
      <motion.div
        className="w-full h-full flex flex-col"
        initial={false}
        animate={isOpen ? { scale: 1, opacity: 1 } : { scale: 0.97, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* HEADER */}
        <div className="relative flex items-center justify-between px-3 py-2 bg-white/5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <h2 className="text-white text-sm font-bold ml-4 tracking-widest">Preview</h2>
            <div className="flex items-center bg-white/10 rounded-md p-0.5">
              <button
                onClick={() => setPreviewDevice("desktop")}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded text-xs transition-all",
                  previewDevice === "desktop"
                    ? "bg-white text-black shadow-sm"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                )}
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPreviewDevice("mobile")}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded text-xs transition-all",
                  previewDevice === "mobile"
                    ? "bg-white text-black shadow-sm"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                )}
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Mode Switch */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <ModeSwitch
              active="preview"
              onSwitch={(target) => {
                if (target === "editor") {
                  // just hide preview, don’t destroy iframe
                  onClose();
                  openEditor();
                }
              }}
            />
          </div>

          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PREVIEW */}
        <div className="flex-1 flex items-center justify-center px-9 py-2" style={{zoom: .9}}>
          <motion.div
            className={cn(
              "bg-white  shadow-xl overflow-hidden",
              previewDevice === "desktop" ? "w-full h-full max-w-7xl" : "w-[375px] h-[812px]"
            )}
            layout
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <iframe
              ref={iframeRef}
              srcDoc={debouncedContent}
              className="w-full h-full border-none"
              onLoad={handleIframeLoad}
              title="Fullscreen Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}











type CodeEditorMaximizeModalProps = {
  isOpen: boolean
  onClose: () => void
  nerdMode: boolean
  setNerdMode: (value: boolean) => void
  activeTab: string
  setActiveTab: (tab: string) => void
  currentCode: string
  currentSetCode: (code: string) => void
  currentLanguage: string
  hasUnsavedChanges: boolean
  onSave: () => void
  handleEditorMount: (editor: any, monaco: any) => void
}



export function CodeEditorMaximizeModal({
  isOpen,
  onClose,
  nerdMode,
  setNerdMode,
  activeTab,
  setActiveTab,
  currentCode,
  currentSetCode,
  currentLanguage,
  hasUnsavedChanges,
  onSave,
  handleEditorMount,
  openPreview,
}: CodeEditorMaximizeModalProps & { openPreview: () => void }) {
  return (
    <motion.div
      // ⬇ Keep mounted, just hide with opacity + pointer-events
      className={cn(
        "fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-xl transition-opacity duration-300",
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
      initial={false} // prevent remount animations
      animate={isOpen ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* HEADER */}
      <div className="relative flex items-center justify-between px-3 py-2 bg-white/5 border-b border-white/10">
        {/* Left: title + nerd tabs */}
        <div className="flex items-center gap-2">
          <h2 className="text-white text-sm font-bold ml-4 tracking-widest">Editor</h2>
          {nerdMode && (
            <div className="flex items-center gap-3 ml-4">
              {["index.html", "script.js", "data.js"].map((tabName) => (
                <button
                  key={tabName}
                  className={cn(
                    "px-3 text-xs rounded-md transition-colors font-mono",
                    activeTab === tabName
                      ? "bg-white/20 text-yellow-400"
                      : "text-gray-400 hover:bg-white/10 hover:text-white"
                  )}
                  onClick={() => setActiveTab(tabName)}
                >
                  {tabName}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Center: mode switch */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <ModeSwitch
            active="editor"
            onSwitch={(target) => {
              if (target === "preview") {
                // Don't unmount editor—just hide it
                onClose();
                openPreview();
              }
            }}
          />
        </div>

        {/* Right: nerd switch + close */}
        <div className="flex items-center gap-4">
          <Switch
            checked={nerdMode}
            onCheckedChange={(checked) => {
              setNerdMode(checked);
              if (!checked) setActiveTab("data.js");
            }}
            id="nerdmode-modal"
            className="h-4 w-10 data-[state=unchecked]:bg-gray-600 data-[state=checked]:bg-yellow-600"
          />
          <Label htmlFor="nerdmode-modal" className="text-xs text-gray-300 -px-2">
            Nerd Mode
          </Label>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* EDITOR */}
      <div className="flex-1 px-9 my-1  relative">
        <div className="w-full h-full bg-[#242424] rounded-lg overflow-hidden relative">
          <MonacoEditor
            height="calc(100vh - 40px)"
            language={currentLanguage}
            value={currentCode}
            onChange={(value) => currentSetCode(value || "")}
            theme="custom-dark"
            onMount={handleEditorMount}
            options={{
              fontFamily: "JetBrains Mono, monospace",
              fontLigatures: true,
              fontWeight: "300",
              lineHeight: 18,
              letterSpacing: 0.5,
              tabSize: 2,
              minimap: { enabled: false },
              fontSize: 12,
              scrollBeyondLastLine: false,
              lineNumbers: "on",
              padding: { top: 0, bottom: 0 },
            }}
          />

          {hasUnsavedChanges && (
            <button
              onClick={onSave}
              className="absolute top-5 right-[4rem] inline-flex items-center justify-center px-12 py-2 text-white text-sm font-medium rounded-lg bg-white/20 border border-white/50 backdrop-blur-sm hover:bg-white/30 transition-all duration-300"
            >
              Save
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
























interface InsertButtonModalProps {
  isOpen: boolean
  onClose: () => void
  selected: number | null
  setSelected: (index: number | null) => void
  onSubmit: () => void
}

export function InsertButtonModal({ isOpen, onClose, selected, setSelected, onSubmit }: InsertButtonModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              onClose()
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
                              {sampleInsertItems.map((item: InsertItem, index: number) => (
                                <React.Fragment key={item.title}>
                                  <div
                                    onClick={() => setSelected(index)}
                                    className="group text-sm text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                                  >
                                    <span className="font-mono">{item.title}</span>
                                  </div>
                                  {index < sampleInsertItems.length - 1 && <Separator className="my-1 bg-gray-200" />}
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
                    onClose()
                    setSelected(null)
                  }}
                  className="px-4 py-1 text-xs bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                >
                  Close
                </button>
                {selected !== null && (
                  <button
                    onClick={onSubmit}
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
  )
}