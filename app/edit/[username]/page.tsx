import { getWebsiteContent } from "@/lib/website-actions"
import { notFound } from "next/navigation"
import { CodeEditor } from "@/components/code-editor"
import  {Origami, Globe2Icon, LayoutDashboard, Link }  from "lucide-react";

interface PageProps {
  params: {
    username: string
  }
}

export default async function EditPage({ params }: PageProps) {
  const { username } = params

  try {
    const content = await getWebsiteContent(username)
    if (!content) {
      notFound()
    }

    return (
      <div className="flex h-screen bg-[#030712] relative">
        {/* Sidebar */}
        <aside className=" w-10 p-3 border-r border-transparent flex flex-col gap-8 my-4  ">
          <a
            href={`/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center "
          ><Globe2Icon color="grey"/>
           
          </a>
          <a
            href={`/dashboard/${username}`}
            className="inline-flex items-center justify-center "
          >
            <LayoutDashboard color="grey"/>
          </a>

           <a
            href={`/template`}
            className="inline-flex items-center justify-center "
          >
            <Origami color="grey" />
          </a>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-1">
          <CodeEditor username={username} initialContent={content} />
        </main>
      </div>
    )
  } catch (error) {
    console.error("Error loading edit page:", error)
    notFound()
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { username } = params

  return {
    title: `Edit ${username}'s Website`,
    description: `Edit the website for ${username}`,
  }
}
