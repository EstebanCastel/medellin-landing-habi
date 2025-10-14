import type React from "react"
import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import GoogleAnalytics from "@/components/google-analytics"
import "./globals.css"

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
})

export const metadata: Metadata = {
  title: "Medellin-exp-sellers",
  description: "Compramos tu vivienda a tu medida",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${montserrat.variable} antialiased`}>
      <body className="font-montserrat">
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  )
}
