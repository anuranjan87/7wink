"use client"
import React from "react"
import { cn } from "@/lib/utils"
import { X, Monitor, Smartphone, Save } from "lucide-react"
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
}: FullscreenPreviewModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
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
                onClick={onClose}
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

interface CodeEditorMaximizeModalProps {
  isOpen: boolean
  onClose: () => void
  nerdMode: boolean
  setNerdMode: (value: boolean) => void
  activeTab: string
  setActiveTab: (tab: string) => void
  currentCode: string
  currentSetCode: (value: string) => void
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
}: CodeEditorMaximizeModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl">
      <div className="w-full h-full flex flex-col">
        <div className="flex items-center justify-between p-6 bg-white/5 backdrop-blur-sm border-b border-white/10">
          <div className="flex items-center gap-4">
            <h2 className="text-white text-lg font-medium">Code Editor</h2>
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
                    className={cn(
                      "px-4 py-2 text-sm font-serif tracking-widest rounded-md transition-colors duration-200",
                      activeTab === tabName
                        ? "bg-white/20 text-yellow-400"
                        : "text-gray-400 hover:bg-white/10 hover:text-white",
                    )}
                    onClick={() => setActiveTab(tabName)}
                  >
                    {tabName}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={nerdMode}
                onCheckedChange={(checked) => {
                  setNerdMode(checked)
                  if (!checked) {
                    setActiveTab("data.js")
                  }
                }}
                id="nerdmode-modal"
                className="data-[state=unchecked]:bg-gray-600 data-[state=checked]:bg-yellow-600"
              />
              <Label htmlFor="nerdmode-modal" className="text-sm text-gray-300">
                Nerd Mode
              </Label>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 text-white/70 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 p-6 relative">
          <div className="w-full h-full bg-[#242424] rounded-xl overflow-hidden relative">
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
            {hasUnsavedChanges && (
              <button
                onClick={onSave}
                className="absolute bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 z-10 flex items-center justify-center"
                title="Save changes to update preview"
              >
                <Save className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
