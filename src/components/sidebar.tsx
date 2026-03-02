"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
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
  Sparkles,
  LogOut,
  UserCircle,
  ShieldCheck,
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

const adminMenuItems = [
  { href: "/users", label: "จัดการผู้ใช้", icon: ShieldCheck },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="default"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 shadow-lg"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-slate-900 to-slate-950 text-white min-h-screen p-4 transform transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="mb-6 mt-12 lg:mt-0">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              The Rich24
            </h1>
          </div>
          <p className="text-xs text-slate-400 text-center">Sales Tracker System</p>
        </div>

        <Separator className="bg-slate-700 mb-4" />

        {/* Navigation */}
        <nav className="space-y-1 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group",
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/25"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                )}
              >
                <Icon size={18} className={cn(
                  "transition-transform group-hover:scale-110",
                  isActive && "text-blue-200"
                )} />
                <span className="font-medium text-sm">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-200" />
                )}
              </Link>
            )
          })}

          {/* Admin-only section */}
          {session?.user?.role === "admin" && (
            <>
              <Separator className="bg-slate-700 my-2" />
              <p className="px-4 text-xs text-slate-500 uppercase tracking-wider mb-1">ผู้ดูแล</p>
              {adminMenuItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group",
                      isActive
                        ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-600/25"
                        : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                    )}
                  >
                    <Icon size={18} className={cn(
                      "transition-transform group-hover:scale-110",
                      isActive && "text-purple-200"
                    )} />
                    <span className="font-medium text-sm">{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-200" />
                    )}
                  </Link>
                )
              })}
            </>
          )}
        </nav>

        <Separator className="bg-slate-700 my-4" />

        {/* User info & logout */}
        {session?.user && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-2">
              <div className="p-1.5 bg-slate-700 rounded-full">
                <UserCircle className="h-4 w-4 text-slate-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{session.user.name}</p>
                <div className="flex items-center gap-1">
                  {session.user.role === "admin" ? (
                    <Badge className="text-xs px-1 py-0 bg-purple-600/30 text-purple-300 border-purple-600/40 gap-0.5">
                      <ShieldCheck className="h-2.5 w-2.5" />
                      Admin
                    </Badge>
                  ) : (
                    <Badge className="text-xs px-1 py-0 bg-blue-600/30 text-blue-300 border-blue-600/40">
                      User
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-red-950/30 gap-2 px-2"
            >
              <LogOut className="h-4 w-4" />
              ออกจากระบบ
            </Button>
          </div>
        )}

        <div className="text-center mt-2">
          <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">
            v1.0.0
          </Badge>
        </div>
      </div>
    </>
  )
}
