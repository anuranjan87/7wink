"use client"

import type React from "react"

import { getWebsiteTemplates, applyTemplateToUserWebsite } from "@/lib/website-actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"

interface Template {
  id: number
  name: string
  code: string
}

export default function TemplatePage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [usernameInput, setUsernameInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoadingTemplates(true)
      const fetchedTemplates = await getWebsiteTemplates() as Template[]
      setTemplates(fetchedTemplates)
      setLoadingTemplates(false)
    }
    fetchTemplates()
  }, [])

  const handleCardClick = (template: Template) => {
    setSelectedTemplate(template)
    setMessage(null) // Clear any previous messages
  }

  const handleEditAndPublish = () => {
    if (selectedTemplate) {
      setIsDialogOpen(true)
      setUsernameInput("") // Clear previous input
      setMessage(null) // Clear messages in dialog
    }
  }

  const handleApplyTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!usernameInput.trim() || !selectedTemplate) {
      setMessage({ type: "error", text: "Please enter a username and select a template." })
      return
    }

    if (usernameInput.length > 10) {
      setMessage({ type: "error", text: "Username must be 10 characters or less." })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const result = await applyTemplateToUserWebsite(usernameInput, selectedTemplate.code)
      if (result.success) {
        setMessage({ type: "success", text: result.message || "Template applied successfully!" })
        setTimeout(() => {
          setIsDialogOpen(false)
          router.push(`/edit/${result.username}`)
        }, 1500)
      } else {
        setMessage({ type: "error", text: result.error || "Failed to apply template." })
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Choose a Website Template</h1>
        <p className="text-center text-gray-600 mb-8">Select a template to start building your personalized website.</p>

        {loadingTemplates ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-32 bg-gray-200 rounded-md"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center text-gray-500">No templates available.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedTemplate?.id === template.id
                    ? "border-blue-500 ring-2 ring-blue-500 shadow-lg"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleCardClick(template)}
              >
                <CardHeader>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription className="text-sm text-gray-500">
                    {template.code.substring(0, 150)}...
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className="w-full h-32 bg-gray-100 rounded-md overflow-hidden border border-gray-200 flex items-center justify-center text-gray-400 text-xs relative"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ctext x='50' y='50' fontFamily='Arial' fontSize='10' fill='%23ccc' textAnchor='middle' dominantBaseline='middle'%3EHTML Preview%3C/text%3E%3C/svg%3E")`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    <iframe
                      srcDoc={template.code}
                      className="w-full h-full border-0 scale-[0.3] origin-top-left"
                      title={`Preview of ${template.name}`}
                      sandbox="allow-scripts allow-same-origin"
                      style={{ transformOrigin: '0 0', width: '333%', height: '333%' }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedTemplate && (
          <div className="mt-8 text-center">
            <Button onClick={handleEditAndPublish} className="px-8 py-3 text-lg">
              Edit & Publish Selected Template
            </Button>
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Apply Template</DialogTitle>
              <DialogDescription>
                Enter a username for your new website. If the username already exists, its content will be updated.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleApplyTemplate} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input
                  id="username"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., mywebsite"
                  maxLength={10}
                  disabled={isLoading}
                />
              </div>
              {message && (
                <Alert variant={message.type === "error" ? "destructive" : "default"}>
                  {message.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <AlertDescription>{message.text}</AlertDescription>
                </Alert>
              )}
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    "Apply Template"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
