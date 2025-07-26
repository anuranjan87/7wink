"use client"

import { Origami, Globe2Icon, LayoutDashboard } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { ArrowRight } from "lucide-react"
import React from "react"

interface PageProps {
  params: Promise<{
    username: string
  }>
}

// Template data
const templates = [
  {
    id: "1",
    imageSrc: "https://49iw5aq3b5e3nyxk.public.blob.vercel-storage.com/MDczMjE0NTNhYWVkN2Q0ODAyZWUxY2Q4YjQxMzY4MjI.jpg",
    title: "Snow & Rainbow",
  },
  {
    id: "2",
    imageSrc: "https://49iw5AQ3b5E3NyxK.public.blob.vercel-storage.com/ZmE1NjliZWZkNmUwZjEyMGRjNWFkYTM0Yjg0NzQ0NTA.jpg",
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
]

// TemplateCard Component
function TemplateCard({ imageSrc, title }: { imageSrc: string; title: string }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="relative w-full aspect-[4/3] rounded-lg overflow-hidden group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Image
        src={imageSrc || "/placeholder.svg"}
        alt={title}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
        <h3 className="text-white text-lg font-semibold hidden mb-2">{title}</h3>
        <Button
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-black hover:bg-gray-200 transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          } flex items-center gap-2`}
          aria-label={`Use ${title} template`}
        >
          Use It
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

// TemplateList Component
function TemplateList() {
  return (
    <section className="py-16 px-4 bg-black" style={{ zoom: 0.9 }}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-white text-4xl md:text-5xl font-extrabold tracking-tight text-center mb-12">
          Choose Template
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {templates.map((template) => (
            <TemplateCard key={template.id} imageSrc={template.imageSrc} title={template.title} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Page({ params }: PageProps) {
  const { username } = React.use(params)

  return (
    <div className="bg-[#030712] min-h-screen text-white">
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
        <main className="flex flex-1 items-center justify-center px-4 py-16" style={{ zoom: 0.6 }}>
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
    </div>
  )
}
