import { getWebsiteContent, trackVisit } from "@/lib/website-actions"
import { notFound } from "next/navigation"

interface PageProps {
  params: {
    username: string
  }
}

export default async function UserWebsitePage({ params }: PageProps) {
  const { username } = params

  try {
    const content = await getWebsiteContent(username)

    if (!content) {
      notFound()
    }

    // Track the visit automatically
    await trackVisit(username)

    return <div dangerouslySetInnerHTML={{ __html: content }} style={{ minHeight: "100vh" }} />
  } catch (error) {
    console.error("Error loading website:", error)
    notFound()
  }
}

// Generate metadata for the page
export async function generateMetadata({ params }: PageProps) {
  const { username } = params

  return {
    title: `${username}'s Website`,
    description: `Personal website for ${username}`,
  }
}
