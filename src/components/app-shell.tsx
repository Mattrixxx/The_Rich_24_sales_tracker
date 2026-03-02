"use client"

import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar"

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === "/login"

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
        {children}
      </main>
    </div>
  )
}
