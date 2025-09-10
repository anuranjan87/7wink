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

function ModeSwitch({ active, onSwitch }: ModeSwitchProps) {
  return (
    <div className="flex items-center bg-white/10 rounded-md p-0.5">
      <button
        onClick={() => active !== "preview" && onSwitch("preview")}
        className={cn(
          "flex items-center gap-1 px-2 py-1 rounded text-xs transition-all",
          active === "preview"
            ? "bg-white text-black shadow-sm"
            : "text-white/50 hover:text-white hover:bg-white/10",
        )}
      >
        <TentTree className="w-3.5 h-3.5" />
        Preview
      </button>
      <button
        onClick={() => active !== "editor" && onSwitch("editor")}
        className={cn(
          "flex items-center gap-1 px-2 py-1 rounded text-xs transition-all",
          active === "editor"
            ? "bg-white text-black shadow-sm"
            : "text-white/50 hover:text-white hover:bg-white/10",
        )}
      >
        <Clapperboard className="w-3.5 h-3.5" />
        Editor
      </button>
    </div>
  )
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
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.div
            className="w-full h-full flex flex-col"
            initial={{ scale: 0.97, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.97, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* HEADER */}
           {/* HEADER */}
<div className="relative flex items-center justify-between px-3 py-2 bg-white/5 border-b border-white/10">
  {/* Left: title + device switch */}
  <div className="flex items-center gap-3">
    <h2 className="text-white text-sm font-bold ml-4 tracking-widest ">Preview</h2>
    <div className="flex items-center bg-white/10 rounded-md p-0.5">
      <button
        onClick={() => setPreviewDevice("desktop")}
        className={cn(
          "flex items-center gap-1 px-2 py-1 rounded text-xs transition-all",
          previewDevice === "desktop"
            ? "bg-white text-black shadow-sm"
            : "text-white/70 hover:text-white hover:bg-white/10",
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
            : "text-white/70 hover:text-white hover:bg-white/10",
        )}
      >
        <Smartphone className="w-3.5 h-3.5" />
        
      </button>
    </div>
  </div>

  {/* Center: mode switch */}
  <div className="absolute left-1/2 -translate-x-1/2">
    <ModeSwitch
      active="preview"
      onSwitch={(target) => {
        if (target === "editor") {
          onClose()
          openEditor()
        }
      }}
    />
  </div>

  {/* Right: close button */}
  <button
    onClick={onClose}
    className="flex items-center justify-center w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
  >
    <X className="w-4 h-4" />
  </button>
</div>


            {/* PREVIEW AREA */}
            <div className="flex-1 flex items-center justify-center px-3 py-2">
              <motion.div
                className={cn(
                  "bg-white rounded-lg shadow-xl overflow-hidden",
                  previewDevice === "desktop"
                    ? "w-full h-full max-w-7xl"
                    : "w-[375px] h-[812px]",
                )}
                layout
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
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
  )
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
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.div
            className="w-full h-full flex flex-col"
            initial={{ scale: 0.97, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.97, opacity: 0 }}
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
                          "px-3  text-xs rounded-md transition-colors font-mono",
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
                      onClose()
                      openPreview()
                    }
                  }}
                />
              </div>

              {/* Right: nerd switch + close button */}
              <div className="flex items-center gap-4">
                <Switch
                  checked={nerdMode}
                  onCheckedChange={(checked) => {
                    setNerdMode(checked)
                    if (!checked) setActiveTab("data.js")
                  }}
                  id="nerdmode-modal"
                  className="h-4 w-10  data-[state=unchecked]:bg-gray-600 data-[state=checked]:bg-yellow-600"
                />
                <Label
                  htmlFor="nerdmode-modal"
                  className="text-xs text-gray-300 -px-2"
                >
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
            <div className="flex-1 px-3 py-2 relative">
              <div className="w-full h-full bg-[#242424] rounded-lg overflow-hidden relative">
                <MonacoEditor
                  height="calc(100vh - 80px)" // adjusted for single header row
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
                    padding: { top: 6, bottom: 6 },
                  }}
                />

                {hasUnsavedChanges && (


      
          <button onClick={onSave} className=" absolute bottom-7 right-[4rem] inline-flex items-center justify-center  align-middle select-none font-sans  text-center px-12 py-2 text-white text-sm font-medium rounded-lg bg-white/2.5 border border-white/50 backdrop-blur-sm shadow-[inset_0_1px_0px_rgba(255,255,255,0.75),0_0_9px_rgba(0,0,0,0.2),0_3px_8px_rgba(0,0,0,0.15)] hover:bg-white/30 transition-all duration-300 before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-white/60 before:via-transparent before:to-transparent before:opacity-70 before:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-tl after:from-white/30 after:via-transparent after:to-transparent after:opacity-50 after:pointer-events-none  antialiased">Save</button>
        
      

                
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
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