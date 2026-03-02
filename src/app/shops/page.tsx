"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Store, Plus, Edit, Trash2, Loader2, Save, X, AlertCircle, Globe } from "lucide-react"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"

interface Platform {
  id: number
  name: string
}

interface CreatedByUser {
  id: number
  name: string
}

interface Shop {
  id: number
  name: string
  platform: Platform
  createdAt: string
  createdBy: CreatedByUser | null
}

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([])
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [name, setName] = useState("")
  const [platformId, setPlatformId] = useState("")
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState("")
  const [editPlatformId, setEditPlatformId] = useState("")
  const [error, setError] = useState("")
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchData = async () => {
    const [shopsRes, platformsRes] = await Promise.all([
      fetch("/api/shops"),
      fetch("/api/platforms"),
    ])
    setShops(await shopsRes.json())
    setPlatforms(await platformsRes.json())
    setPageLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/shops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, platformId }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error || "เกิดข้อผิดพลาด")
      setLoading(false)
      return
    }

    setName("")
    setPlatformId("")
    setLoading(false)
    fetchData()
  }

  const handleEdit = (shop: Shop) => {
    setEditingId(shop.id)
    setEditName(shop.name)
    setEditPlatformId(shop.platform.id.toString())
  }

  const handleSaveEdit = async () => {
    if (!editingId) return
    setError("")

    const res = await fetch(`/api/shops/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, platformId: editPlatformId }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error || "เกิดข้อผิดพลาด")
      return
    }

    setEditingId(null)
    fetchData()
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleteLoading(true)

    await fetch(`/api/shops/${deleteId}`, { method: "DELETE" })
    setDeleteId(null)
    setDeleteLoading(false)
    fetchData()
  }

  // Group shops by platform
  const shopsByPlatform = shops.reduce((acc, shop) => {
    const platformName = shop.platform.name
    if (!acc[platformName]) {
      acc[platformName] = []
    }
    acc[platformName].push(shop)
    return acc
  }, {} as Record<string, Shop[]>)

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pt-12 lg:pt-0">
      <div className="flex items-center gap-3">
        <Store className="h-8 w-8 text-primary" />
        <h1 className="text-2xl md:text-3xl font-bold">จัดการร้านค้า</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Plus className="h-5 w-5" />
            เพิ่มร้านค้าใหม่
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            <div>
              <Label htmlFor="platform" className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                แพลตฟอร์ม
              </Label>
              <Select
                value={platformId}
                onValueChange={setPlatformId}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="เลือกแพลตฟอร์ม" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="name">ชื่อร้านค้า</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น: ร้าน A, ร้านหลัก"
                required
              />
            </div>
            <div className="flex items-end sm:col-span-2 md:col-span-1">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    กำลังเพิ่ม...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    เพิ่มร้านค้า
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Shops grouped by platform */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(shopsByPlatform).map(([platformName, platformShops]) => (
          <Card key={platformName}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Store className="h-5 w-5 text-primary" />
                {platformName}
                <span className="text-sm font-normal text-muted-foreground">
                  ({platformShops.length} ร้าน)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {platformShops.map((shop) => (
                  <div
                    key={shop.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-2 bg-gray-50 rounded gap-2"
                  >
                    {editingId === shop.id ? (
                      <div className="flex flex-col sm:flex-row gap-2 flex-1">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1"
                        />
                        <div className="flex gap-1">
                          <Button size="sm" onClick={handleSaveEdit}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingId(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium truncate block">{shop.name}</span>
                          {shop.createdBy && (
                            <span className="text-xs text-muted-foreground">สร้างโดย: {shop.createdBy.name}</span>
                          )}
                        </div>
                        <div className="flex gap-1 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(shop)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteId(shop.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {platformShops.length === 0 && (
                  <p className="text-muted-foreground text-center py-2">
                    ยังไม่มีร้านค้า
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {shops.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <Store className="h-12 w-12 mx-auto mb-2 opacity-50" />
              ยังไม่มีร้านค้า กรุณาเพิ่มร้านค้าใหม่
            </div>
          </CardContent>
        </Card>
      )}

      {/* All shops table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Store className="h-5 w-5" />
            รายการร้านค้าทั้งหมด ({shops.length} ร้าน)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>แพลตฟอร์ม</TableHead>
                  <TableHead>ชื่อร้านค้า</TableHead>
                  <TableHead className="hidden sm:table-cell">วันที่เพิ่ม</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shops.map((shop) => (
                  <TableRow key={shop.id}>
                    <TableCell>{shop.platform.name}</TableCell>
                    <TableCell className="font-medium">{shop.name}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {new Date(shop.createdAt).toLocaleDateString("th-TH")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(shop)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeleteId(shop.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {shops.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      <Store className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      ยังไม่มีร้านค้า
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
        title="ลบร้านค้า"
        description="คุณต้องการลบร้านค้านี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้"
        loading={deleteLoading}
      />
    </div>
  )
}
