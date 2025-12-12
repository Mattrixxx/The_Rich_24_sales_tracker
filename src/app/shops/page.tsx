"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Platform {
  id: number
  name: string
}

interface Shop {
  id: number
  name: string
  platform: Platform
  createdAt: string
}

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([])
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [name, setName] = useState("")
  const [platformId, setPlatformId] = useState("")
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState("")
  const [editPlatformId, setEditPlatformId] = useState("")
  const [error, setError] = useState("")

  const fetchData = async () => {
    const [shopsRes, platformsRes] = await Promise.all([
      fetch("/api/shops"),
      fetch("/api/platforms"),
    ])
    setShops(await shopsRes.json())
    setPlatforms(await platformsRes.json())
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

  const handleDelete = async (id: number) => {
    if (!confirm("ต้องการลบร้านค้านี้?")) return

    await fetch(`/api/shops/${id}`, { method: "DELETE" })
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">จัดการร้านค้า</h1>

      <Card>
        <CardHeader>
          <CardTitle>เพิ่มร้านค้าใหม่</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="platform">แพลตฟอร์ม</Label>
              <Select
                id="platform"
                value={platformId}
                onChange={(e) => setPlatformId(e.target.value)}
                required
              >
                <option value="">เลือกแพลตฟอร์ม</option>
                {platforms.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
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
            <div className="flex items-end">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "กำลังเพิ่ม..." : "เพิ่มร้านค้า"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Shops grouped by platform */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(shopsByPlatform).map(([platformName, platformShops]) => (
          <Card key={platformName}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🏪 {platformName}
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
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    {editingId === shop.id ? (
                      <div className="flex gap-2 flex-1">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1"
                        />
                        <Button size="sm" onClick={handleSaveEdit}>
                          บันทึก
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingId(null)}
                        >
                          ยกเลิก
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className="font-medium">{shop.name}</span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(shop)}
                          >
                            แก้ไข
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(shop.id)}
                          >
                            ลบ
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
            <p className="text-center text-muted-foreground">
              ยังไม่มีร้านค้า กรุณาเพิ่มร้านค้าใหม่
            </p>
          </CardContent>
        </Card>
      )}

      {/* All shops table */}
      <Card>
        <CardHeader>
          <CardTitle>รายการร้านค้าทั้งหมด ({shops.length} ร้าน)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>แพลตฟอร์ม</TableHead>
                <TableHead>ชื่อร้านค้า</TableHead>
                <TableHead>วันที่เพิ่ม</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shops.map((shop) => (
                <TableRow key={shop.id}>
                  <TableCell>{shop.platform.name}</TableCell>
                  <TableCell className="font-medium">{shop.name}</TableCell>
                  <TableCell>
                    {new Date(shop.createdAt).toLocaleDateString("th-TH")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(shop)}
                      >
                        แก้ไข
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(shop.id)}
                      >
                        ลบ
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {shops.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    ยังไม่มีร้านค้า
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
