"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Building2, Plus, Trash2, Loader2, Pencil, Check, X } from "lucide-react"

interface Company {
  id: number
  name: string
}

export default function CompaniesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])
  const [currentId, setCurrentId] = useState<number | null>(null)
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState("")
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [editName, setEditName] = useState("")
  const [editLoading, setEditLoading] = useState(false)

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.replace("/unauthorized")
    }
  }, [status, session, router])

  const fetchCompanies = async () => {
    const res = await fetch("/api/companies")
    if (res.ok) {
      const data = await res.json()
      setCompanies(data.companies || [])
      setCurrentId(data.currentId)
    }
    setPageLoading(false)
  }

  useEffect(() => {
    fetchCompanies()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "เกิดข้อผิดพลาด")
    } else {
      setName("")
    }
    setLoading(false)
    fetchCompanies()
  }

  const handleRename = async (id: number) => {
    setEditLoading(true)
    setError("")
    const res = await fetch(`/api/companies/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName }),
    })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "เกิดข้อผิดพลาด")
    }
    setEditLoading(false)
    setEditId(null)
    fetchCompanies()
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleteLoading(true)
    setError("")

    const res = await fetch(`/api/companies/${deleteId}`, { method: "DELETE" })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "เกิดข้อผิดพลาด")
    }

    setDeleteLoading(false)
    setDeleteId(null)
    fetchCompanies()
  }

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pt-12 lg:pt-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">จัดการบริษัท</h1>
            <p className="text-sm text-muted-foreground">บริษัททั้งหมดในระบบ — ข้อมูลของแต่ละบริษัทแยกจากกัน</p>
          </div>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Building2 className="h-3 w-3" />
          {companies.length} บริษัท
        </Badge>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 text-destructive px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <Card className="border-dashed border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Plus className="h-5 w-5" />
            เพิ่มบริษัทใหม่
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 sm:items-end">
            <div className="flex-1">
              <Label htmlFor="name">ชื่อบริษัท</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น บริษัทลูกของ The Rich 24"
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  เพิ่มบริษัท
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Building2 className="h-5 w-5" />
            รายการบริษัท
            <Badge variant="secondary" className="ml-2">{companies.length} บริษัท</Badge>
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>ชื่อบริษัท</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">
                      {editId === company.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-8 max-w-xs"
                            autoFocus
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={editLoading}
                            onClick={() => handleRename(company.id)}
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditId(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-white" />
                          </div>
                          {company.name}
                          {company.id === currentId && (
                            <Badge variant="secondary" className="text-xs">บริษัทปัจจุบัน</Badge>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditId(company.id)
                          setEditName(company.name)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="hidden sm:inline ml-1">แก้ไข</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteId(company.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline ml-1">ลบ</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {companies.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground py-12">
                      <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">ยังไม่มีบริษัท</p>
                      <p className="text-sm">เริ่มต้นด้วยการเพิ่มบริษัทใหม่</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="ลบบริษัท"
        description="คุณแน่ใจหรือไม่ที่จะลบบริษัทนี้? ลบได้เฉพาะบริษัทที่ไม่มีข้อมูลเท่านั้น"
        loading={deleteLoading}
      />
    </div>
  )
}
