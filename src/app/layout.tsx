import type { Metadata } from "next"
import { Niramit } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/sidebar"

const niramit = Niramit({ 
  weight: ["200", "300", "400", "500", "600", "700"],
  subsets: ["latin", "thai"],
})

export const metadata: Metadata = {
  title: "The Rich24 Sales Tracker",
  description: "ระบบจัดการยอดขายและบัญชี",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body className={niramit.className}>
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
