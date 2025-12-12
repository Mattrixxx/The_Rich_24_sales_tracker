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
import { RotateCcw, Plus, Loader2, CheckCircle, XCircle, Package, DollarSign, AlertTriangle, Edit, Trash2, Save, X } from "lucide-react"

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
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pt-12 lg:pt-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <RotateCcw className="h-8 w-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">สินค้าตีกลับ</h1>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="w-full sm:w-auto">
          {showForm ? (
            <>
              <X className="h-4 w-4 mr-2" />
              ยกเลิก
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มรายการตีกลับ
            </>
          )}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-primary" />
              รายการตีกลับ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{totalReturns} รายการ</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-red-600" />
              มูลค่ารวม
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-red-600">฿{totalAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              คืนเข้าสต็อก
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-green-600">{totalReturnedToStock} ชิ้น</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span className="truncate">เสียหาย</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-orange-600">{totalDamaged} ชิ้น</div>
          </CardContent>
        </Card>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              {editingReturn ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {editingReturn ? "แก้ไขรายการตีกลับ" : "เพิ่มรายการตีกลับ"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
                    <option value="true">คืนเข้าสต็อก</option>
                    <option value="false">ไม่คืน (เสียหาย)</option>
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

              <div className="flex flex-col sm:flex-row gap-2">
                <Button type="submit" className="w-full sm:w-auto">
                  {editingReturn ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      บันทึก
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      เพิ่มรายการ
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} className="w-full sm:w-auto">
                  <X className="h-4 w-4 mr-2" />
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
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <RotateCcw className="h-5 w-5" />
            รายการสินค้าตีกลับ
          </CardTitle>
        </CardHeader>
        <CardContent>
          {returns.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <RotateCcw className="h-12 w-12 mx-auto mb-2 opacity-50" />
              ยังไม่มีรายการสินค้าตีกลับ
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>วันที่</TableHead>
                    <TableHead>สินค้า</TableHead>
                    <TableHead className="text-right">จำนวน</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">ยอดเงิน</TableHead>
                    <TableHead className="text-center hidden sm:table-cell">คืนสต็อก</TableHead>
                    <TableHead className="hidden md:table-cell">เหตุผล</TableHead>
                    <TableHead className="hidden lg:table-cell">หมายเหตุ</TableHead>
                    <TableHead className="text-right">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {returns.map((productReturn) => (
                    <TableRow key={productReturn.id}>
                      <TableCell className="text-xs sm:text-sm">
                        {new Date(productReturn.createdAt).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="font-medium">
                        <span className="truncate max-w-[100px] sm:max-w-none block">{productReturn.product.name}</span>
                      </TableCell>
                      <TableCell className="text-right">{productReturn.quantity}</TableCell>
                      <TableCell className="text-right text-red-600 font-semibold hidden sm:table-cell">
                        ฿{productReturn.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center hidden sm:table-cell">
                        {productReturn.returnToStock ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3" />
                            <span className="hidden md:inline">คืนแล้ว</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircle className="h-3 w-3" />
                            <span className="hidden md:inline">เสียหาย</span>
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{productReturn.reason || "-"}</TableCell>
                      <TableCell className="max-w-[200px] truncate hidden lg:table-cell">
                        {productReturn.note || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(productReturn)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(productReturn.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
