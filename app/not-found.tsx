import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Website Not Found</CardTitle>
          <CardDescription>The website you're looking for doesn't exist or hasn't been created yet.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">This could happen if:</p>
          <ul className="text-sm text-gray-600 text-left space-y-1">
            <li>• The username doesn't exist in our database</li>
            <li>• The website hasn't been generated yet</li>
            <li>• There was an error loading the content</li>
          </ul>
          <div className="pt-4">
            <Button asChild>
              <Link href="/">Create a New Website</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
