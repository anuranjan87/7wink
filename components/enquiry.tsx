"use client"

import { useEffect, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail } from "lucide-react"
import { getEnquiries } from "@/lib/website-actions"
import * as React from "react"

interface Enquiry {
  id: any
  email: string | null
  message: string | null
  created_at: string
}


export interface EnquiryProps {
  username: string
}

export default function Enquiry({ username }: EnquiryProps) {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null)

  useEffect(() => {
    async function fetchEnquiries() {
      const result = await getEnquiries(username)
      setEnquiries(result)
    }
    fetchEnquiries()
  }, [username])

  const formatTimestamp = (date: string) => {
    const now = new Date()
    const messageDate = new Date(date)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const msgDay = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate())

    const timeString = messageDate.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })

    if (msgDay.getTime() === today.getTime()) return `Today (${timeString})`
    if (msgDay.getTime() === today.getTime() - 86400000) return `Yesterday (${timeString})`

    const dayName = messageDate.toLocaleDateString("en-IN", { weekday: "long" })
    return `${dayName} (${timeString})`
  }

  const renderEntry = (entry: any) => {
    if (!entry) return "No data"

    if (typeof entry === "string") return entry

    return (
      <div className="space-y-2">
        {Object.entries(entry).map(([key, value]) => (
          <div key={key}>
            <p className="text-sm text-gray-400">{key}:</p>

            {Array.isArray(value) ? (
              <ul className="list-disc ml-5 text-gray-100">
                {value.map((v, i) => (
                  <li key={i}>{String(v)}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-100">{String(value)}</p>
            )}
          </div>
        ))}
      </div>
    )
  }

  // ************** SINGLE ENQUIRY VIEW **************
  if (selectedEnquiry) {
const entry = selectedEnquiry

    return (
      <div className="h-screen flex flex-col bg-black">
        <div className="flex items-center gap-4 p-4 border-b border-gray-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedEnquiry(null)}
            className="flex items-center gap-2 text-white hover:bg-gray-800 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="flex-1 p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <p className="text-sm text-gray-400">
              {formatTimestamp(selectedEnquiry.created_at)}
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-400">From:</label>
                <p className="text-base mt-1 text-white">
                  {entry?.email || "No email"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-400">Details:</label>
                <div className="mt-2 p-4 bg-gray-900 rounded-lg border border-gray-800">
                  {renderEntry(entry)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ************** LIST VIEW **************
  return (
    <div className="h-screen flex flex-col bg-black border border-gray-800 rounded-md">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-semibold text-white">Enquiries</h1>
        <p className="text-sm text-gray-400 mt-1">
          {enquiries.length} {enquiries.length === 1 ? "enquiry" : "enquiries"}
        </p>
      </div>

      <div className="flex-1">
        {enquiries.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Mail className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-lg font-medium text-white">No enquiries found</p>
              <p className="text-sm text-gray-400">New enquiries will appear here</p>
            </div>
          </div>
        ) : (
          <ScrollArea className="max-h-80 overflow-y-auto">
            <div className="divide-y divide-gray-800">
              {enquiries.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedEnquiry(item)}
                  className="p-4 hover:bg-gray-900 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                        <Mail className="h-4 w-4 text-gray-300" />
                      </div>

                      <div className="flex-1 min-w-0">
                       <p className="font-medium text-sm truncate text-white">
  {item.email || "No email"}
</p>
<p className="text-xs text-gray-400 truncate">
  {item.message || "No message"}
</p>

                      </div>
                    </div>

                    <div className="text-xs text-gray-500 flex-shrink-0 ml-4">
                      {formatTimestamp(item.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  )
}
