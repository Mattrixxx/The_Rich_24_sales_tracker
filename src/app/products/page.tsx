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
import { Package, Plus, Trash2, AlertTriangle, Loader2, TrendingUp } from "lucide-react"

interface CreatedByUser {
  id: number
  name: string
}

interface Product {
  id: number
  name: string
  cost: number
  price: number
  stock: number
  createdAt: string
  createdBy: CreatedByUser | null
  updatedBy: CreatedByUser | null
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [name, setName] = useState("")
  const [cost, setCost] = useState("")
  const [price, setPrice] = useState("")
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchProducts = async () => {
    const res = await fetch("/api/products")
    const data = await res.json()
    setProducts(data)
    setPageLoading(false)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, cost, price }),
    })

    setName("")
    setCost("")
    setPrice("")
    setLoading(false)
    fetchProducts()
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleteLoading(true)
    
    await fetch(`/api/products/${deleteId}`, { method: "DELETE" })
    
    setDeleteLoading(false)
    setDeleteId(null)
    fetchProducts()
  }

  // Calculate stats
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0)
  const totalValue = products.reduce((sum, p) => sum + (p.cost * p.stock), 0)
  const lowStockCount = products.filter(p => p.stock <= 5).length

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
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">จัดการสินค้า</h1>
            <p className="text-sm text-muted-foreground">เพิ่ม แก้ไข และจัดการสินค้าทั้งหมด</p>
          </div>
        </div>
        {lowStockCount > 0 && (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            สินค้าใกล้หมด {lowStockCount} รายการ
          </Badge>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm text-muted-foreground">สินค้าทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm text-muted-foreground">สต๊อกรวม</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalStock.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm text-muted-foreground">มูลค่าสต๊อก</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-primary">฿{totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-dashed border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Plus className="h-5 w-5" />
            เพิ่มสินค้าใหม่
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 md:items-end">
            <div className="flex-1">
              <Label htmlFor="name">ชื่อสินค้า</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ชื่อสินค้า"
                required
              />
            </div>
            <div className="grid grid-cols-2 md:flex gap-4">
              <div className="md:w-32">
                <Label htmlFor="cost">ต้นทุน (บาท)</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="md:w-32">
                <Label htmlFor="price">ราคาขาย (บาท)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full md:w-auto">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  เพิ่มสินค้า
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Package className="h-5 w-5" />
            รายการสินค้า
            <Badge variant="secondary" className="ml-2">{products.length} รายการ</Badge>
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>ชื่อสินค้า</TableHead>
                  <TableHead className="text-right">คงเหลือ</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">ต้นทุน</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">ราคาขาย</TableHead>
                  <TableHead className="text-right hidden md:table-cell">กำไร/ชิ้น</TableHead>
                  <TableHead className="hidden lg:table-cell text-muted-foreground">สร้างโดย</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {product.stock <= 5 ? (
                          <Badge variant="destructive" className="gap-1 text-xs">
                            <AlertTriangle className="h-3 w-3" />
                            ใกล้หมด
                          </Badge>
                        ) : null}
                        <span className="truncate max-w-[120px] sm:max-w-none">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={product.stock <= 5 ? "destructive" : "secondary"}>
                        {product.stock}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right hidden sm:table-cell text-muted-foreground">฿{product.cost.toFixed(2)}</TableCell>
                    <TableCell className="text-right hidden sm:table-cell font-medium">฿{product.price.toLocaleString()}</TableCell>
                    <TableCell className="text-right hidden md:table-cell">
                      <div className="flex items-center justify-end gap-1 text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        ฿{(product.price - product.cost).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {product.createdBy?.name || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteId(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline ml-1">ลบ</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {products.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                      <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">ยังไม่มีสินค้า</p>
                      <p className="text-sm">เริ่มต้นด้วยการเพิ่มสินค้าใหม่</p>
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
        title="ลบสินค้า"
        description="คุณแน่ใจหรือไม่ที่จะลบสินค้านี้? ข้อมูลที่เกี่ยวข้องทั้งหมดจะถูกลบด้วย"
        loading={deleteLoading}
      />
    </div>
  )
}
