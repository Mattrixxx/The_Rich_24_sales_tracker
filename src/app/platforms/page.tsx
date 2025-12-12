"use client"

import { useEffect, useState } from "react"
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
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

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

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleteLoading(true)

    await fetch(`/api/platforms/${deleteId}`, { method: "DELETE" })
    
    setDeleteLoading(false)
    setDeleteId(null)
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Globe className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">จัดการแพลตฟอร์ม</h1>
            <p className="text-sm text-muted-foreground">ช่องทางการขายทั้งหมด</p>
          </div>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Globe className="h-3 w-3" />
          {platforms.length} แพลตฟอร์ม
        </Badge>
      </div>

      <Card className="border-dashed border-2">
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
            รายการแพลตฟอร์ม
            <Badge variant="secondary" className="ml-2">{platforms.length} แพลตฟอร์ม</Badge>
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>ชื่อแพลตฟอร์ม</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {platforms.map((platform) => (
                  <TableRow key={platform.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <Globe className="h-4 w-4 text-white" />
                        </div>
                        {platform.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteId(platform.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline ml-1">ลบ</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {platforms.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground py-12">
                      <Globe className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">ยังไม่มีแพลตฟอร์ม</p>
                      <p className="text-sm">เริ่มต้นด้วยการเพิ่มแพลตฟอร์มใหม่</p>
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
        title="ลบแพลตฟอร์ม"
        description="คุณแน่ใจหรือไม่ที่จะลบแพลตฟอร์มนี้? ร้านค้าที่เกี่ยวข้องจะต้องถูกลบก่อน"
        loading={deleteLoading}
      />
    </div>
  )
}
