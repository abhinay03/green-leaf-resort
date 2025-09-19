import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Suspense } from "react"
import { OfflineIndicator } from "@/components/offline-indicator"
import { ServiceWorkerRegistration } from "@/components/service-worker-registration"
import "./globals.css"

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#059669',
}

export const metadata: Metadata = {
  title: "The Green Leaf Resorts - Luxury Resort in Panshet",
  description:
    "Experience luxury in nature at The Green Leaf Resorts Panshet. Luxury cottages, Swiss tents, glamping, and premium amenities in scenic Maharashtra.",
  generator: "v0.app",
  manifest: "/manifest.json",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#059669" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          <ServiceWorkerRegistration />
          <OfflineIndicator />
          {children}
        </Suspense>
      </body>
    </html>
  )
}
