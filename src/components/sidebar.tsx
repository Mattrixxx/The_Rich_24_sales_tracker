"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const menuItems = [
  { href: "/", label: "แดชบอร์ด", icon: "📊" },
  { href: "/products", label: "สินค้า", icon: "📦" },
  { href: "/stock-in", label: "รับเข้าสินค้า", icon: "📥" },
  { href: "/orders", label: "ออเดอร์", icon: "🛒" },
  { href: "/employees", label: "พนักงาน", icon: "👥" },
  { href: "/platforms", label: "แพลตฟอร์ม", icon: "🌐" },
  { href: "/shops", label: "ร้านค้า", icon: "🏪" },
  { href: "/expenses", label: "ค่าใช้จ่าย", icon: "💸" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-center">The Rich24</h1>
        <p className="text-sm text-slate-400 text-center">Sales Tracker</p>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              pathname === item.href
                ? "bg-slate-700 text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            )}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
