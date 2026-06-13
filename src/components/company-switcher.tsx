"use client"

import { useEffect, useState } from "react"
import { Building2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Company {
  id: number
  name: string
}

export function CompanySwitcher() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [currentId, setCurrentId] = useState<number | null>(null)
  const [switching, setSwitching] = useState(false)

  useEffect(() => {
    fetch("/api/companies")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setCompanies(data.companies || [])
          setCurrentId(data.currentId)
        }
      })
      .catch(() => {})
  }, [])

  const handleSwitch = async (value: string) => {
    const companyId = parseInt(value)
    if (companyId === currentId) return
    setSwitching(true)
    const res = await fetch("/api/company/switch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId }),
    })
    if (res.ok) {
      // ทุกหน้า fetch ข้อมูลใน useEffect — reload เพื่อให้ refetch ด้วยบริษัทใหม่ทั้งหมด
      window.location.reload()
    } else {
      setSwitching(false)
    }
  }

  if (companies.length === 0) return null

  const current = companies.find((c) => c.id === currentId)

  // มีบริษัทเดียว — แสดงเป็น label เฉยๆ ไม่ต้องมี dropdown
  if (companies.length === 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/60 text-slate-300">
        <Building2 className="h-4 w-4 shrink-0 text-blue-400" />
        <span className="text-sm font-medium truncate">{companies[0].name}</span>
      </div>
    )
  }

  return (
    <Select
      value={currentId ? String(currentId) : undefined}
      onValueChange={handleSwitch}
      disabled={switching}
    >
      <SelectTrigger className="h-9 bg-slate-800/60 border-slate-700 text-slate-200 focus:ring-blue-500 focus:ring-offset-slate-900">
        <div className="flex items-center gap-2 min-w-0">
          <Building2 className="h-4 w-4 shrink-0 text-blue-400" />
          <SelectValue placeholder="เลือกบริษัท">
            <span className="truncate">{current?.name || "เลือกบริษัท"}</span>
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {companies.map((company) => (
          <SelectItem key={company.id} value={String(company.id)}>
            {company.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
