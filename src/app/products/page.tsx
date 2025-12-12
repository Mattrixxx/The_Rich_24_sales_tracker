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
import { Package, Plus, Trash2, AlertTriangle, Loader2 } from "lucide-react"

interface Product {
  id: number
  name: string
  cost: number
  price: number
  stock: number
  createdAt: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [name, setName] = useState("")
  const [cost, setCost] = useState("")
  const [price, setPrice] = useState("")
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)

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

  const handleDelete = async (id: number) => {
    if (!confirm("ต้องการลบสินค้านี้?")) return

    await fetch(`/api/products/${id}`, { method: "DELETE" })
    fetchProducts()
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
        <Package className="h-8 w-8 text-primary" />
        <h1 className="text-2xl md:text-3xl font-bold">จัดการสินค้า</h1>
      </div>

      <Card>
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
            รายการสินค้า ({products.length} รายการ)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อสินค้า</TableHead>
                  <TableHead className="text-right">คงเหลือ</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">ต้นทุน</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">ราคาขาย</TableHead>
                  <TableHead className="text-right hidden md:table-cell">กำไร/ชิ้น</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {product.stock <= 5 && (
                          <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                        )}
                        <span className="truncate max-w-[120px] sm:max-w-none">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={product.stock <= 5 ? "text-red-600 font-bold" : ""}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell className="text-right hidden sm:table-cell">฿{product.cost.toFixed(2)}</TableCell>
                    <TableCell className="text-right hidden sm:table-cell">฿{product.price.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-green-600 hidden md:table-cell">
                      ฿{(product.price - product.cost).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline ml-1">ลบ</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {products.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      ยังไม่มีสินค้า
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
