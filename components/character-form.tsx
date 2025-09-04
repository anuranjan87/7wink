"use client"

import type React from "react"
import { useRouter } from "next/navigation"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle, ExternalLink, BarChart3 } from "lucide-react"
import { storeCharacter } from "@/lib/actions"
import Link from "next/link"

export function CharacterForm() {
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [createdName, setCreatedName] = useState<string | null>(null)

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setMessage({ type: "error", text: "Please enter a name" })
      return
    }

    if (name.length > 10) {
      setMessage({ type: "error", text: "Name must be 10 characters or less" })
      return
    }

    setIsLoading(true)
    setMessage(null)
    setCreatedName(null)

    try {
      const result = await storeCharacter(name)
      if (result.success) {
        setMessage({
          type: "success",
          text: result.message || `Name "${name}" stored successfully!`,
        })
        setCreatedName(name.toLowerCase())

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push(`/templates/${name.toLowerCase()}`)
        }, 1500)

        setName("")
      } else {
        setMessage({ type: "error", text: result.error || "Failed to store character" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="w-full max-w-md">
        <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-light text-white tracking-tight">Link prefix</CardTitle>
            <CardDescription className="text-zinc-400 font-light mt-2">
We’ll use it as your URL prefix.            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-zinc-300 font-medium text-sm">
                 https://7wink/..
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter a name (up to 10 characters)"
                  maxLength={10}
                  className="text-center text-lg bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:bg-zinc-800/70 focus:border-zinc-600 transition-all duration-200 rounded-xl h-12"
                  disabled={isLoading}
                />
              </div>

              {message && (
                <Alert
                  variant={message.type === "error" ? "destructive" : "default"}
                  className={`${
                    message.type === "error"
                      ? "bg-red-950/50 border-red-800/50 text-red-200"
                      : "bg-green-950/50 border-green-800/50 text-green-200"
                  } backdrop-blur-sm rounded-xl`}
                >
                  {message.type === "success" ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  )}
                  <AlertDescription className="font-light">{message.text}</AlertDescription>
                </Alert>
              )}

              {createdName && (
                <div className="space-y-3">
                  <Alert className="bg-blue-950/50 border-blue-800/50 text-blue-200 backdrop-blur-sm rounded-xl">
                    <ExternalLink className="h-4 w-4 text-blue-400" />
                    <AlertDescription className="font-light">
                      Website created! Visit{" "}
                      <Link
                        href={`/${createdName}`}
                        className="font-medium text-blue-300 hover:text-blue-200 transition-colors underline decoration-blue-400/50 hover:decoration-blue-300"
                        target="_blank"
                      >
                        /{createdName}
                      </Link>{" "}
                      to see the generated website.
                    </AlertDescription>
                  </Alert>

                  <Alert className="bg-purple-950/50 border-purple-800/50 text-purple-200 backdrop-blur-sm rounded-xl">
                    <BarChart3 className="h-4 w-4 text-purple-400" />
                    <AlertDescription className="font-light">
                      View analytics at{" "}
                      <Link
                        href={`/dashboard/${createdName}`}
                        className="font-medium text-purple-300 hover:text-purple-200 transition-colors underline decoration-purple-400/50 hover:decoration-purple-300"
                        target="_blank"
                      >
                        /dashboard/{createdName}
                      </Link>{" "}
                      to track visits and performance.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-white text-black hover:bg-zinc-200 font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Storing Name...
                  </>
                ) : (
                  "Store Name"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
