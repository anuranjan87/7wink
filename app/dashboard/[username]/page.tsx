import { getWebsiteContent, getVisitCount } from "@/lib/website-actions"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, Eye } from "lucide-react"

interface PageProps {
  params: {
    username: string
  }
}

export default async function UserDashboard({ params }: PageProps) {
  const { username } = params

  try {
    // Check if the website exists
    const content = await getWebsiteContent(username)
    if (!content) {
      notFound()
    }

    // Get visit count
    const visitCount = await getVisitCount(username)

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard for {username}</h1>
            <p className="text-gray-600">Monitor your website analytics and performance</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Website Link Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Your Website
                </CardTitle>
                <CardDescription>Visit your live website</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={`/${username}`} target="_blank">
                    Visit /{username}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Visit Analytics Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Website Analytics
                </CardTitle>
                <CardDescription>Track your website performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-600">Total Visits</span>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-gray-900">{visitCount}</span>
                  <span className="text-sm text-gray-500 ml-2">visits</span>
                </div>
              </CardContent>
            </Card>

            {/* Website Status Card */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Website Status</CardTitle>
                <CardDescription>Current status of your website</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Website is live and accessible</span>
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Website URL:</strong>{" "}
                    <Link href={`/${username}`} className="text-blue-600 hover:underline" target="_blank">
                      /{username}
                    </Link>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Created:</strong> Website and tracking are active
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error loading dashboard:", error)
    notFound()
  }
}

// Generate metadata for the dashboard
export async function generateMetadata({ params }: PageProps) {
  const { username } = params

  return {
    title: `${username}'s Dashboard`,
    description: `Analytics dashboard for ${username}'s website`,
  }
}
