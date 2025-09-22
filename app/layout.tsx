import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner" // Import sonner's Toaster
import { ClerkProvider } from '@clerk/nextjs'


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "7WINK",
  description: "Create with 7WINK",
  generator: "7WINK",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
    <html lang="en">
    <body className={inter.className}>
       <main>{children}</main>
        <Toaster /> {/* Render sonner's Toaster component here */}
      </body>
    </html>
    </ClerkProvider>

  )
}
