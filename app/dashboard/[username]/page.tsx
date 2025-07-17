import { getVisitCount } from "@/lib/website-actions"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Edit, BarChart3 } from "lucide-react"
import Link from "next/link"

interface PageProps {
  params: {
    username: string
  }
}

export default async function DashboardPage({ params }: PageProps) {
  const { username } = params

  try {
    const visitCount = await getVisitCount(username)

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard for {username}</h1>
            <p className="text-gray-600">Monitor your website performance and manage content</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {/* Website Link Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Live Website
                </CardTitle>
                <CardDescription>Visit your published website</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={`/${username}`} target="_blank" rel="noopener noreferrer">
                    Visit /{username}
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Edit Website Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  Edit Website
                </CardTitle>
                <CardDescription>Modify your website code</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href={`/edit/${username}`}>Edit Code</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Analytics Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Total Visits
                </CardTitle>
                <CardDescription>Website visit analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-2xl font-bold text-gray-900">{visitCount}</span>
                  <span className="text-gray-600">visits</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your website efficiently</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Button asChild>
                <Link href={`/${username}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Live Site
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/edit/${username}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Website
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error loading dashboard:", error)
    notFound()
  }
}

// Generate metadata for the page
export async function generateMetadata({ params }: PageProps) {
  const { username } = params

  return {
    title: `${username}'s Dashboard`,
    description: `Dashboard for ${username}'s website`,
  }
}
