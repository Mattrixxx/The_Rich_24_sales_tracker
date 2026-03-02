import type { Metadata } from "next"
import { Niramit } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/auth-provider"
import { AppShell } from "@/components/app-shell"

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
        <AuthProvider>
          <AppShell>
            {children}
          </AppShell>
        </AuthProvider>
      </body>
    </html>
  )
}
