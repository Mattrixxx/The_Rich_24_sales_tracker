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
import { Globe, Plus, Trash2, Loader2 } from "lucide-react"

interface Platform {
  id: number
  name: string
  createdAt: string
}

export default function PlatformsPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)

  const fetchPlatforms = async () => {
    const res = await fetch("/api/platforms")
    const data = await res.json()
    setPlatforms(data)
    setPageLoading(false)
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
        <Globe className="h-8 w-8 text-primary" />
        <h1 className="text-2xl md:text-3xl font-bold">จัดการแพลตฟอร์ม</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Plus className="h-5 w-5" />
            เพิ่มแพลตฟอร์มใหม่
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 sm:items-end">
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
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  เพิ่มแพลตฟอร์ม
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Globe className="h-5 w-5" />
            รายการแพลตฟอร์ม ({platforms.length} แพลตฟอร์ม)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
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
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline ml-1">ลบ</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {platforms.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                      <Globe className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      ยังไม่มีแพลตฟอร์ม
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
