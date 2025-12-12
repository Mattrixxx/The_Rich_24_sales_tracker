"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState } from "react"
import {
  LayoutDashboard,
  Package,
  PackagePlus,
  ShoppingCart,
  RotateCcw,
  Users,
  Globe,
  Store,
  Wallet,
  Menu,
  X,
} from "lucide-react"

const menuItems = [
  { href: "/", label: "แดชบอร์ด", icon: LayoutDashboard },
  { href: "/products", label: "สินค้า", icon: Package },
  { href: "/stock-in", label: "รับเข้าสินค้า", icon: PackagePlus },
  { href: "/orders", label: "ออเดอร์", icon: ShoppingCart },
  { href: "/returns", label: "สินค้าตีกลับ", icon: RotateCcw },
  { href: "/employees", label: "พนักงาน", icon: Users },
  { href: "/platforms", label: "แพลตฟอร์ม", icon: Globe },
  { href: "/shops", label: "ร้านค้า", icon: Store },
  { href: "/expenses", label: "ค่าใช้จ่าย", icon: Wallet },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-lg shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white min-h-screen p-4 transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="mb-8 mt-12 lg:mt-0">
          <h1 className="text-xl font-bold text-center">The Rich24</h1>
          <p className="text-sm text-slate-400 text-center">Sales Tracker</p>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  pathname === item.href
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white hover:translate-x-1"
                )}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}
