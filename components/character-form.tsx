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
          router.push(`/edit/${name.toLowerCase()}`)
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
    <Card>
      <CardHeader>
        <CardTitle>Store Name</CardTitle>
        <CardDescription>Enter a name up to 10 characters to store in your Neon database</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a name (up to 10 characters)"
              maxLength={10}
              className="text-center text-lg"
              disabled={isLoading}
            />
          </div>

          {message && (
            <Alert variant={message.type === "error" ? "destructive" : "default"}>
              {message.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {createdName && (
            <div className="space-y-2">
              <Alert>
                <ExternalLink className="h-4 w-4" />
                <AlertDescription>
                  Website created! Visit{" "}
                  <Link href={`/${createdName}`} className="font-medium underline hover:no-underline" target="_blank">
                    /{createdName}
                  </Link>{" "}
                  to see the generated website.
                </AlertDescription>
              </Alert>

              <Alert>
                <BarChart3 className="h-4 w-4" />
                <AlertDescription>
                  View analytics at{" "}
                  <Link
                    href={`/dashboard/${createdName}`}
                    className="font-medium underline hover:no-underline"
                    target="_blank"
                  >
                    /dashboard/{createdName}
                  </Link>{" "}
                  to track visits and performance.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
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
  )
}
