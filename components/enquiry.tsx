"use client"
import { useEffect, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail } from "lucide-react"
import { getEnquiries } from "@/lib/website-actions"
import * as React from "react"
export interface Enquiry {
  id: number
  email: string | null
  message: string | null
  created_at: Date
}

export interface EnquiryProps {
  username: string
}

export default function Enquiry({ username }: EnquiryProps) {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null)

  React.useEffect(() => {
    
    async function fetchEnquiries() {
        
      const result = await getEnquiries(username)
      setEnquiries(result)
    }

    fetchEnquiries()
  }, [username])

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const messageDate = new Date(date)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const messageDay = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate())

    const timeString = messageDate.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })

    if (messageDay.getTime() === today.getTime()) {
      return `Today (${timeString})`
    } else if (messageDay.getTime() === today.getTime() - 86400000) {
      return `Yesterday (${timeString})`
    } else {
      const dayName = messageDate.toLocaleDateString("en-IN", { weekday: "long" })
      return `${dayName} (${timeString})`
    }
  }

  if (selectedEnquiry) {
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
            <div className="pb-4 border-b border-gray-800">
              <p className="text-sm text-gray-400">{formatTimestamp(selectedEnquiry.created_at)}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-400">From:</label>
                <p className="text-base mt-1 text-white">{selectedEnquiry.email || "No email provided"}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-400">Message:</label>
                <div className="mt-2 p-4 bg-gray-900 rounded-lg border border-gray-800">
                 <p
                className="text-base leading-relaxed whitespace-pre-wrap text-gray-100">
                {selectedEnquiry.message || "No message provided"}
              </p>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-black border border-gray-800  rounded-md">
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
    {enquiries.map((enquiry) => (
      <div
        key={enquiry.id}
        onClick={() => setSelectedEnquiry(enquiry)}
        className="p-4 hover:bg-gray-900 cursor-pointer transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
              <Mail className="h-4 w-4 text-gray-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate text-white">
                {enquiry.email || "No email"}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {enquiry.message || "No message"}
              </p>
            </div>
          </div>
          <div className="text-xs text-gray-500 flex-shrink-0 ml-4">
            {formatTimestamp(enquiry.created_at)}
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
