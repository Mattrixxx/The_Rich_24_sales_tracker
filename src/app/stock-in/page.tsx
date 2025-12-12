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
import { PackagePlus, Plus, Loader2, Package, DollarSign, ListOrdered } from "lucide-react"

interface Product {
  id: number
  name: string
  cost: number
  price: number
  stock: number
}

interface StockIn {
  id: number
  product: Product
  quantity: number
  costPerUnit: number
  totalCost: number
  note: string | null
  createdAt: string
}

export default function StockInPage() {
  const [stockIns, setStockIns] = useState<StockIn[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [productId, setProductId] = useState("")
  const [quantity, setQuantity] = useState("")
  const [costPerUnit, setCostPerUnit] = useState("")
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)

  const fetchData = async () => {
    const [stockInsRes, productsRes] = await Promise.all([
      fetch("/api/stock-in"),
      fetch("/api/products"),
    ])
    setStockIns(await stockInsRes.json())
    setProducts(await productsRes.json())
    setPageLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleProductChange = (id: string) => {
    setProductId(id)
    const product = products.find((p) => p.id === parseInt(id))
    if (product) {
      setCostPerUnit(product.cost.toString())
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    await fetch("/api/stock-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        quantity,
        costPerUnit,
        note,
      }),
    })

    setProductId("")
    setQuantity("")
    setCostPerUnit("")
    setNote("")
    setLoading(false)
    fetchData()
  }

  const totalStockValue = stockIns.reduce((sum, s) => sum + s.totalCost, 0)

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
        <PackagePlus className="h-8 w-8 text-primary" />
        <h1 className="text-2xl md:text-3xl font-bold">รับเข้าสินค้า</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Plus className="h-5 w-5" />
            บันทึกการรับเข้าสินค้า
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <Label htmlFor="product">สินค้า</Label>
              <Select
                id="product"
                value={productId}
                onChange={(e) => handleProductChange(e.target.value)}
                required
              >
                <option value="">เลือกสินค้า</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (คงเหลือ: {p.stock})
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="quantity">จำนวน</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="จำนวนที่รับเข้า"
                required
              />
            </div>
            <div>
              <Label htmlFor="costPerUnit">ต้นทุน/ชิ้น (บาท)</Label>
              <Input
                id="costPerUnit"
                type="number"
                step="0.01"
                value={costPerUnit}
                onChange={(e) => setCostPerUnit(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <Label htmlFor="note">หมายเหตุ</Label>
              <Input
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="หมายเหตุ (ถ้ามี)"
              />
            </div>
            <div className="flex items-end sm:col-span-2 lg:col-span-1">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <PackagePlus className="h-4 w-4 mr-2" />
                    รับเข้า
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              มูลค่ารับเข้าทั้งหมด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-blue-600">
              ฿{totalStockValue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
              <ListOrdered className="h-4 w-4" />
              จำนวนรายการรับเข้า
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{stockIns.length} รายการ</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Package className="h-5 w-5" />
            สต๊อกสินค้าปัจจุบัน
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>สินค้า</TableHead>
                  <TableHead className="text-right">คงเหลือ</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">ต้นทุนเฉลี่ย</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">ราคาขาย</TableHead>
                  <TableHead className="text-right hidden md:table-cell">มูลค่าสต๊อก</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-right">{product.stock}</TableCell>
                    <TableCell className="text-right hidden sm:table-cell">฿{product.cost.toFixed(2)}</TableCell>
                    <TableCell className="text-right hidden sm:table-cell">฿{product.price.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-medium hidden md:table-cell">
                      ฿{(product.stock * product.cost).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
                {products.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <PackagePlus className="h-5 w-5" />
            ประวัติการรับเข้าสินค้า ({stockIns.length} รายการ)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>วันที่</TableHead>
                  <TableHead>สินค้า</TableHead>
                  <TableHead className="text-right">จำนวน</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">ต้นทุน/ชิ้น</TableHead>
                  <TableHead className="text-right">รวม</TableHead>
                  <TableHead className="hidden md:table-cell">หมายเหตุ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockIns.map((stockIn) => (
                  <TableRow key={stockIn.id}>
                    <TableCell className="text-xs sm:text-sm">
                      {new Date(stockIn.createdAt).toLocaleDateString("th-TH")}
                    </TableCell>
                    <TableCell className="max-w-[80px] sm:max-w-none truncate">{stockIn.product.name}</TableCell>
                    <TableCell className="text-right">{stockIn.quantity}</TableCell>
                    <TableCell className="text-right hidden sm:table-cell">
                      ฿{stockIn.costPerUnit.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-xs sm:text-sm">
                      ฿{stockIn.totalCost.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden md:table-cell">
                      {stockIn.note || "-"}
                    </TableCell>
                  </TableRow>
                ))}
                {stockIns.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      <PackagePlus className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      ยังไม่มีประวัติการรับเข้า
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
