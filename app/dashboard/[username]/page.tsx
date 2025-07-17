import { getVisitCount } from "@/lib/website-actions"
import { notFound } from "next/navigation"
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard for {username}</h1>
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Back to Home
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Website Link */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-blue-900 mb-2">Your Website</h2>
                <p className="text-blue-700 mb-4">Visit your live website</p>
                <Link
                  href={`/${username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Visit /{username}
                </Link>
              </div>

              {/* Edit Website */}
              <div className="bg-purple-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-purple-900 mb-2">Edit Website</h2>
                <p className="text-purple-700 mb-4">Modify your website code</p>
                <Link
                  href={`/edit/${username}`}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Edit Website
                </Link>
              </div>

              {/* Visit Analytics */}
              <div className="bg-green-50 rounded-lg p-6 md:col-span-2">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-lg font-semibold text-green-900">Total Visits</h2>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <p className="text-green-700 mb-2">Number of times your website has been visited</p>
                <div className="text-3xl font-bold text-green-900">{visitCount}</div>
              </div>
            </div>
          </div>
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
