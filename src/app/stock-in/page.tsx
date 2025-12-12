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

  const fetchData = async () => {
    const [stockInsRes, productsRes] = await Promise.all([
      fetch("/api/stock-in"),
      fetch("/api/products"),
    ])
    setStockIns(await stockInsRes.json())
    setProducts(await productsRes.json())
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">รับเข้าสินค้า</h1>

      <Card>
        <CardHeader>
          <CardTitle>บันทึกการรับเข้าสินค้า</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-5">
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
            <div className="flex items-end">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "กำลังบันทึก..." : "รับเข้า"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">มูลค่ารับเข้าทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ฿{totalStockValue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">จำนวนรายการรับเข้า</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockIns.length} รายการ</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>สต๊อกสินค้าปัจจุบัน</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>สินค้า</TableHead>
                <TableHead className="text-right">คงเหลือ</TableHead>
                <TableHead className="text-right">ต้นทุนเฉลี่ย</TableHead>
                <TableHead className="text-right">ราคาขาย</TableHead>
                <TableHead className="text-right">มูลค่าสต๊อก</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-right">{product.stock} ชิ้น</TableCell>
                  <TableCell className="text-right">฿{product.cost.toFixed(2)}</TableCell>
                  <TableCell className="text-right">฿{product.price.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-medium">
                    ฿{(product.stock * product.cost).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    ยังไม่มีสินค้า
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ประวัติการรับเข้าสินค้า ({stockIns.length} รายการ)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>วันที่</TableHead>
                <TableHead>สินค้า</TableHead>
                <TableHead className="text-right">จำนวน</TableHead>
                <TableHead className="text-right">ต้นทุน/ชิ้น</TableHead>
                <TableHead className="text-right">รวม</TableHead>
                <TableHead>หมายเหตุ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockIns.map((stockIn) => (
                <TableRow key={stockIn.id}>
                  <TableCell>
                    {new Date(stockIn.createdAt).toLocaleDateString("th-TH")}
                  </TableCell>
                  <TableCell>{stockIn.product.name}</TableCell>
                  <TableCell className="text-right">{stockIn.quantity}</TableCell>
                  <TableCell className="text-right">
                    ฿{stockIn.costPerUnit.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ฿{stockIn.totalCost.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {stockIn.note || "-"}
                  </TableCell>
                </TableRow>
              ))}
              {stockIns.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    ยังไม่มีประวัติการรับเข้า
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
