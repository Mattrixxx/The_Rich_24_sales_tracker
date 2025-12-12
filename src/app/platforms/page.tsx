"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  createdAt: string
}

export default function PlatformsPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchPlatforms = async () => {
    const res = await fetch("/api/platforms")
    const data = await res.json()
    setPlatforms(data)
  }

  useEffect(() => {
    fetchPlatforms()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    await fetch("/api/platforms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })

    setName("")
    setLoading(false)
    fetchPlatforms()
  }

  const handleDelete = async (id: number) => {
    if (!confirm("ต้องการลบแพลตฟอร์มนี้?")) return

    await fetch(`/api/platforms/${id}`, { method: "DELETE" })
    fetchPlatforms()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">จัดการแพลตฟอร์ม</h1>

      <Card>
        <CardHeader>
          <CardTitle>เพิ่มแพลตฟอร์มใหม่</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="name">ชื่อแพลตฟอร์ม</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น Facebook, Shopee, Lazada, หน้าร้าน"
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "กำลังบันทึก..." : "เพิ่มแพลตฟอร์ม"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>รายการแพลตฟอร์ม ({platforms.length} แพลตฟอร์ม)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อแพลตฟอร์ม</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {platforms.map((platform) => (
                <TableRow key={platform.id}>
                  <TableCell className="font-medium">{platform.name}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(platform.id)}
                    >
                      ลบ
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {platforms.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground">
                    ยังไม่มีแพลตฟอร์ม
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
