import { getWebsiteContent, trackVisit } from "@/lib/website-actions"
import { notFound } from "next/navigation"
import IframeWithLinkHandler from "@/components/IframeWithLinkHandler"
import { headers } from "next/headers"

interface PageProps {
  params: {
    username: string
  }
}

export default async function UserWebsitePage({ params }: PageProps) {
  const { username } = await params

  try {
    const content = await getWebsiteContent(username)

    if (!content || !content.html) {
      return notFound()
    }

const headersList = await headers()
const forwardedFor = headersList.get("x-forwarded-for")
const realIp = headersList.get("x-real-ip")
const clientIp = forwardedFor?.split(",")[0] || realIp || "unknown"


    await trackVisit(username, clientIp)

    // Define the forceLink script
    const forceLinkScript = `
  <script>
    document.addEventListener("DOMContentLoaded", () => {
      const form = document.querySelector("form")
      if (form) {
        form.addEventListener("submit", (e) => {
          e.preventDefault()
          const email = form.querySelector("[name='email']")?.value || ""
          const message = form.querySelector("[name='your_message']")?.value || ""

          window.parent.postMessage({
            formData: { email, message },
            username: "${username}"
          }, "*")
        })
      }
    })
</script>
    `.trim()

    // Helper to safely inject scripts before </body>
    const injectIntoHtml = (html: string, injection: string): string => {
      return html.includes("</body>") ? html.replace("</body>", `${injection}\n</body>`) : html + injection
    }

    let finalHtml = content.html

    // Inject data script
    if (content.data) {
      finalHtml = injectIntoHtml(finalHtml, `<script>${content.data}</script>`)
    }

    // Inject main script logic
    if (content.script) {
      finalHtml = injectIntoHtml(finalHtml, `<script>${content.script}</script>`)
    }

    // Inject forceLink handler
    finalHtml = injectIntoHtml(finalHtml, forceLinkScript)

    return <IframeWithLinkHandler content={finalHtml} username={username} />
  } catch (error) {
    console.error("Error loading user website:", error)
    return notFound()
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { username } = await params

  return {
    title: `${username}'s Website`,
    description: `Website for ${username}`,
  }
}
