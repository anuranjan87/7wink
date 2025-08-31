import { getVisitCount } from "@/lib/website-actions"
import { notFound } from "next/navigation"
import Chart from "@/components/chart"
import Enquiry from "@/components/enquiry"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface PageProps {
  params: {
    username: string
  }
}

export default async function DashboardPage({ params }: PageProps) {
  const { username } = params  // ✅ removed await

  try {
    const visitCount = await getVisitCount(username)
    console.log("ll")
    console.log(username)
        console.log("ll")


    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="bg-gradient-to-br from-slate-900 via-black to-slate-950 rounded-lg shadow-[0_6px_28px_rgb(0,0,0,0.4)] border border-slate-800 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Visit Analytics */}
              <div className="p-2">
                <div className="text-6xl font-bold text-white">{visitCount}</div>
                <p className="text-sm text-gray-400 mb-2">Total visitors</p>
              </div>
            </div>

            <div className="flex w-full mx-auto flex-col gap-6 items-center justify-center">
              <Tabs defaultValue="account" className="w-full">
                <TabsList className="grid w-1/5 mx-auto grid-cols-2 mb-7 bg-gray-900 border-gray-800">
                  <TabsTrigger
                    value="account"
                    className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-300"
                  >
                    Chart
                  </TabsTrigger>
                  <TabsTrigger
                    value="password"
                    className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-300"
                  >
                    Enquiry
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="account" className="opacity-99">
                  <Chart username={username} /> {/* ✅ fixed prop */}
                </TabsContent>
                <TabsContent value="password">
                  <Enquiry username={username}  />
                </TabsContent>
              </Tabs>
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
  const { username } = params  // ✅ removed await

  return {
    title: `${username}'s Dashboard`,
    description: `Dashboard for ${username}'s website`,
  }
}
