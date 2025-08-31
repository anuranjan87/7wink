"use client"
import { Origami, Globe2Icon, LayoutDashboard, Loader2, X } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { copyTemplateToUser, getWebsiteTemplates } from "@/lib/website-actions"

interface PageProps {
  params: Promise<{
    username: string
  }>
}

// Template data
const templates = [
  {
    id: "1",
    imageSrc:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/MDczMjE0NTNhYWVkN2Q0ODAyZWUxY2Q4YjQxMzY4MjI.jpg-RtJL8JHAO7YC1XcO6N0JhCHjpTWhNC.jpeg",
    title: "Snow & Rainbow",
  },
  {
    id: "2",
    imageSrc: "https://49iw5aq3b5E3NyxK.public.blob.vercel-storage.com/ZmE1NjliZWZkNmUwZjEyMGRjNWFkYTM0Yjg0NzQ0NTA.jpg",
    title: "Elegant Craft",
  },
  {
    id: "3",
    imageSrc: "https://49iw5aq3b5e3nyxk.public.blob.vercel-storage.com/11234",
    title: "Retro Game",
  },
  {
    id: "4",
    imageSrc: "https://49iw5aq3b5e3nyxk.public.blob.vercel-storage.com/heloaos",
    title: "Milkshake",
  },

  {
    id: "5",
    imageSrc: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/MDczMjE0NTNhYWVkN2Q0ODAyZWUxY2Q4YjQxMzY4MjI.jpg-SPlffs5FV35NRJ216nX3x3RCV64fuh.jpeg",
    title: "Stokebury",
  },
]

export default function Page({ params }: PageProps) {
  const username = "aftlatuun"
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null)
  const [templateData, setTemplateData] = useState<any>(null)
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false)

  const createCombinedHtml = (templateData: any) => {
    if (!templateData || templateData.length === 0) return ""

    const data = templateData[0]
    let combinedHtml = data.code || ""

    // Ensure data.js is loaded before script.js
    // Replace <script src="data.js"></script> with inline data
    if (data.code_data) {
      combinedHtml = combinedHtml.replace('<script src="data.js"></script>', `<script>\n${data.code_data}\n</script>`)
    }

    // Replace <script src="script.js"></script> with inline script
    if (data.code_script) {
      combinedHtml = combinedHtml.replace(
        '<script src="script.js"></script>',
        `<script>\n${data.code_script}\n</script>`,
      )
    }

    return combinedHtml
  }

  const handlePreviewTemplate = async (templateId: string) => {
    setPreviewTemplateId(templateId)
    setShowPreviewModal(true)
    setIsLoadingTemplate(true)

    try {
      const data = await getWebsiteTemplates(Number(templateId))
      setTemplateData(data)
    } catch (error) {
      console.error("Failed to fetch template data:", error)
      alert("Failed to load template preview")
      setShowPreviewModal(false)
    } finally {
      setIsLoadingTemplate(false)
    }
  }

  const handleSelectTemplate = async (templateId: string) => {
    setIsNavigating(true)
    setSelectedTemplateId(templateId)

    await new Promise((resolve) => setTimeout(resolve, 300))
    try {
      const result = await copyTemplateToUser(Number(templateId), username)

      if (result?.success) {
        router.push(`/edit/${username}`)
      } else {
        alert(`⚠️ Failed to copy template: ${result?.error || "Unknown error"}`)
        setIsNavigating(false)
        setSelectedTemplateId(null)
      }
    } catch (error) {
      console.error("Failed to copy template:", error)
      alert("⚠️ Failed to copy template. Please try again.")
      setIsNavigating(false)
      setSelectedTemplateId(null)
    }
  }

  const handleConfirmEdit = () => {
    setShowConfirmModal(false)
    setShowPreviewModal(false)
    if (previewTemplateId) {
      handleSelectTemplate(previewTemplateId)
    }
  }

  function TemplateCard({ imageSrc, title, templateId }: { imageSrc: string; title: string; templateId: string }) {
    const [isHovered, setIsHovered] = useState(false)
    const isThisTemplateLoading = isNavigating && selectedTemplateId === templateId

    return (
      <div
        className={`relative w-full aspect-[4/3] rounded-lg overflow-hidden group cursor-pointer transition-all duration-300 ${
          isThisTemplateLoading ? "scale-105 ring-2 ring-white/50" : ""
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          src={imageSrc || "/placeholder.svg"}
          alt={title}
          fill
          className={`object-cover transition-all duration-300 group-hover:scale-105 ${
            isThisTemplateLoading ? "brightness-75" : ""
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
          <h3 className="text-white text-lg font-semibold hidden mb-2">{title}</h3>
          <Button
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-black hover:bg-gray-200 transition-all duration-300 ${
              isHovered || isThisTemplateLoading ? "opacity-100" : "opacity-0"
            } flex items-center gap-2 ${isThisTemplateLoading ? "bg-gray-200" : ""}`}
            aria-label={`Preview ${title} template`}
            onClick={() => handlePreviewTemplate(templateId)}
            disabled={isNavigating}
          >
            {isThisTemplateLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                LOADING...
              </>
            ) : (
              <>
                PREVIEW
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  function TemplateList() {
    return (
      <section className="py-16 px-4 bg-black" style={{ zoom: 0.9 }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-white text-4xl md:text-5xl font-extrabold tracking-tight text-center mb-12">
            Choose Template
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                imageSrc={template.imageSrc}
                title={template.title}
                templateId={template.id}
              />
            ))}
          </div>
        </div>
      </section>
    )
  }

  function PreviewModal() {
    if (!showPreviewModal) return null

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-70 flex items-center justify-center px-4">
        <div className="bg-gray-900 rounded-lg w-full h-full max-w-7xl max-h-[95vh] flex flex-col">
          {/* Navbar Strip */}
          <div className="flex items-center justify-between py-4 px-9 border-b border-gray-700 bg-gray-800 rounded-t-lg">
            <h2 className="text-white text-xl font-bold ">Template Preview</h2>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowConfirmModal(true)}
                className="bg-white text-black hover:bg-gray-200 flex items-center gap-2"
                disabled={isLoadingTemplate}
              >
                Edit This Template
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreviewModal(false)}
                className="text-white hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {isLoadingTemplate ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                  <span className="text-white">Loading template preview...</span>
                </div>
              </div>
            ) : templateData && templateData.length > 0 ? (
              <iframe
                srcDoc={createCombinedHtml(templateData)}
                className="w-full h-full border-0 bg-white"
                title="Template Preview"
                sandbox="allow-scripts allow-same-origin"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-white">No template data available</span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  function ConfirmModal() {
    if (!showConfirmModal) return null

    return (
      <div className="fixed z-100 inset-0 bg-black/90 backdrop-blur-sm z-60 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-lg p-8 max-w-md w-full border border-gray-700">
          <h3 className="text-white text-xl font-bold mb-4">Confirm Action</h3>
          <p className="text-gray-300 mb-6">
           The template will copy to your workspace for editing. Any existing live site will be replaced .
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              className="border-gray-600 text-black hover:bg-gray-200"
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmEdit} className="bg-white text-black hover:bg-gray-200">
              OK
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#030712] min-h-screen text-white">
      {isNavigating && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-white" />
            <span className="text-white font-medium">Loading editor...</span>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Left Sidebar */}
        <aside className="w-14 p-3 flex flex-col items-center gap-8 mt-9" style={{ zoom: 0.8 }}>
          <a
            href={`/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center"
          >
            <Globe2Icon color="grey" />
          </a>
          <a href={`/dashboard/${username}`} className="inline-flex items-center justify-center">
            <LayoutDashboard color="grey" />
          </a>
          <a href={`/templates`} className="inline-flex items-center justify-center">
            <Origami color="grey" />
          </a>
        </aside>

        {/* Main Content */}
        <main className="flex flex-1 items-center justify-center px-4 py-16" style={{ zoom: 0.8 }}>
          <div className="text-center max-w-5xl w-full">
            <h1 className="text-white text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-tight">
              Create your online presence. Your way.
            </h1>
            <p className="mt-8 text-lg md:text-xl text-white font-extrabold leading-relaxed max-w-4xl mx-auto">
              Choose a look that reflects who you are. Tell us what you do, and our AI will craft compelling content
              that is as sharp as your brand. The most powerful way to own your digital identity — starts here.
            </p>
          </div>
        </main>
      </div>

      {/* Template List Section */}
      <TemplateList />

      <PreviewModal />
      <ConfirmModal />
    </div>
  )
}
