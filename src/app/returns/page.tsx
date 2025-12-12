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
  price: number
  stock: number
}

interface ProductReturn {
  id: number
  product: Product
  productId: number
  quantity: number
  amount: number
  returnToStock: boolean
  reason: string | null
  note: string | null
  createdAt: string
}

export default function ReturnsPage() {
  const [returns, setReturns] = useState<ProductReturn[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingReturn, setEditingReturn] = useState<ProductReturn | null>(null)

  // Form state
  const [productId, setProductId] = useState("")
  const [quantity, setQuantity] = useState("")
  const [amount, setAmount] = useState("")
  const [returnToStock, setReturnToStock] = useState("true")
  const [reason, setReason] = useState("")
  const [note, setNote] = useState("")

  const fetchReturns = async () => {
    try {
      const res = await fetch("/api/returns")
      const data = await res.json()
      setReturns(data)
    } catch (error) {
      console.error("Failed to fetch returns:", error)
    }
    setLoading(false)
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products")
      const data = await res.json()
      setProducts(data)
    } catch (error) {
      console.error("Failed to fetch products:", error)
    }
  }

  useEffect(() => {
    fetchReturns()
    fetchProducts()
  }, [])

  const resetForm = () => {
    setProductId("")
    setQuantity("")
    setAmount("")
    setReturnToStock("true")
    setReason("")
    setNote("")
    setEditingReturn(null)
    setShowForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const payload = {
      productId: parseInt(productId),
      quantity: parseInt(quantity),
      amount: parseFloat(amount),
      returnToStock: returnToStock === "true",
      reason: reason || null,
      note: note || null,
    }

    try {
      if (editingReturn) {
        await fetch(`/api/returns/${editingReturn.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      } else {
        await fetch("/api/returns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      }
      resetForm()
      fetchReturns()
      fetchProducts() // Refresh product stock
    } catch (error) {
      console.error("Failed to save return:", error)
    }
  }

  const handleEdit = (productReturn: ProductReturn) => {
    setEditingReturn(productReturn)
    setProductId(productReturn.productId.toString())
    setQuantity(productReturn.quantity.toString())
    setAmount(productReturn.amount.toString())
    setReturnToStock(productReturn.returnToStock ? "true" : "false")
    setReason(productReturn.reason || "")
    setNote(productReturn.note || "")
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("ต้องการลบรายการตีกลับนี้หรือไม่?")) return

    try {
      await fetch(`/api/returns/${id}`, { method: "DELETE" })
      fetchReturns()
      fetchProducts() // Refresh product stock
    } catch (error) {
      console.error("Failed to delete return:", error)
    }
  }

  // Calculate totals
  const totalReturns = returns.length
  const totalAmount = returns.reduce((sum, r) => sum + r.amount, 0)
  const totalReturnedToStock = returns.filter(r => r.returnToStock).reduce((sum, r) => sum + r.quantity, 0)
  const totalDamaged = returns.filter(r => !r.returnToStock).reduce((sum, r) => sum + r.quantity, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">กำลังโหลดข้อมูล...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">🔄 สินค้าตีกลับ</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "ยกเลิก" : "➕ เพิ่มรายการตีกลับ"}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">รายการตีกลับ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReturns} รายการ</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">มูลค่ารวม</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">฿{totalAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">คืนเข้าสต็อก</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalReturnedToStock} ชิ้น</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">เสียหาย (ไม่คืนสต็อก)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{totalDamaged} ชิ้น</div>
          </CardContent>
        </Card>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingReturn ? "แก้ไขรายการตีกลับ" : "เพิ่มรายการตีกลับ"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="productId">สินค้า *</Label>
                  <Select
                    id="productId"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    required
                  >
                    <option value="">เลือกสินค้า</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} (สต็อก: {product.stock})
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">จำนวน (ชิ้น) *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="จำนวนชิ้น"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">ยอดเงิน (บาท) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="ยอดเงินที่ต้องคืน/เสีย"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="returnToStock">คืนเข้าสต็อก *</Label>
                  <Select
                    id="returnToStock"
                    value={returnToStock}
                    onChange={(e) => setReturnToStock(e.target.value)}
                    required
                  >
                    <option value="true">✅ คืนเข้าสต็อก</option>
                    <option value="false">❌ ไม่คืน (เสียหาย)</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">เหตุผล</Label>
                  <Select
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  >
                    <option value="">เลือกเหตุผล</option>
                    <option value="ลูกค้าเปลี่ยนใจ">ลูกค้าเปลี่ยนใจ</option>
                    <option value="สินค้าไม่ตรงปก">สินค้าไม่ตรงปก</option>
                    <option value="สินค้าชำรุด">สินค้าชำรุด</option>
                    <option value="ส่งผิดสินค้า">ส่งผิดสินค้า</option>
                    <option value="ลูกค้าปฏิเสธรับ">ลูกค้าปฏิเสธรับ</option>
                    <option value="ที่อยู่ไม่ถูกต้อง">ที่อยู่ไม่ถูกต้อง</option>
                    <option value="สินค้าเสียหายระหว่างขนส่ง">สินค้าเสียหายระหว่างขนส่ง</option>
                    <option value="อื่นๆ">อื่นๆ</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">หมายเหตุ</Label>
                  <Input
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="รายละเอียดเพิ่มเติม"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingReturn ? "💾 บันทึก" : "➕ เพิ่มรายการ"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  ยกเลิก
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Returns Table */}
      <Card>
        <CardHeader>
          <CardTitle>รายการสินค้าตีกลับ</CardTitle>
        </CardHeader>
        <CardContent>
          {returns.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              ยังไม่มีรายการสินค้าตีกลับ
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>วันที่</TableHead>
                  <TableHead>สินค้า</TableHead>
                  <TableHead className="text-right">จำนวน</TableHead>
                  <TableHead className="text-right">ยอดเงิน</TableHead>
                  <TableHead className="text-center">คืนสต็อก</TableHead>
                  <TableHead>เหตุผล</TableHead>
                  <TableHead>หมายเหตุ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {returns.map((productReturn) => (
                  <TableRow key={productReturn.id}>
                    <TableCell>
                      {new Date(productReturn.createdAt).toLocaleDateString("th-TH", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="font-medium">{productReturn.product.name}</TableCell>
                    <TableCell className="text-right">{productReturn.quantity} ชิ้น</TableCell>
                    <TableCell className="text-right text-red-600 font-semibold">
                      ฿{productReturn.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      {productReturn.returnToStock ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✅ คืนแล้ว
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          ❌ เสียหาย
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{productReturn.reason || "-"}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {productReturn.note || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(productReturn)}
                        >
                          ✏️
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(productReturn.id)}
                        >
                          🗑️
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
