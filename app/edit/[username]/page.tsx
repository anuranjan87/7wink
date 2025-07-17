import { getWebsiteContent } from "@/lib/website-actions"
import { notFound } from "next/navigation"
import { CodeEditor } from "@/components/code-editor"

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
      <div className="min-h-screen bg-gray-50">
        <div className="border-b bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit {username}'s Website</h1>
              <p className="text-sm text-gray-600">Make changes and see them live</p>
            </div>
            <div className="flex gap-2">
              <a
                href={`/${username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                View Live Site
              </a>
              <a
                href={`/dashboard/${username}`}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Dashboard
              </a>
            </div>
          </div>
        </div>
        <CodeEditor username={username} initialContent={content} />
      </div>
    )
  } catch (error) {
    console.error("Error loading edit page:", error)
    notFound()
  }
}

// Generate metadata for the page
export async function generateMetadata({ params }: PageProps) {
  const { username } = params

  return {
    title: `Edit ${username}'s Website`,
    description: `Edit the website for ${username}`,
  }
}
