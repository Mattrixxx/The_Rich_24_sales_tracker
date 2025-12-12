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

interface Employee {
  id: number
  name: string
  commissionRate: number
}

interface Platform {
  id: number
  name: string
}

interface Shop {
  id: number
  name: string
  platform: Platform
}

interface OrderItem {
  id: number
  product: Product
  quantity: number
  unitPrice: number
  subtotal: number
}

interface Order {
  id: number
  employee: Employee
  platform: Platform
  shop: Shop | null
  items: OrderItem[]
  totalPrice: number
  commission: number
  note: string | null
  createdAt: string
}

interface CartItem {
  productId: string
  productName: string
  quantity: number
  stock: number
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [shops, setShops] = useState<Shop[]>([])

  const [employeeId, setEmployeeId] = useState("")
  const [platformId, setPlatformId] = useState("")
  const [shopId, setShopId] = useState("")
  const [totalPrice, setTotalPrice] = useState("")
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Cart for multiple products
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedProductId, setSelectedProductId] = useState("")
  const [selectedQuantity, setSelectedQuantity] = useState("1")

  const fetchData = async () => {
    const [ordersRes, productsRes, employeesRes, platformsRes, shopsRes] = await Promise.all([
      fetch("/api/orders"),
      fetch("/api/products"),
      fetch("/api/employees"),
      fetch("/api/platforms"),
      fetch("/api/shops"),
    ])

    setOrders(await ordersRes.json())
    setProducts(await productsRes.json())
    setEmployees(await employeesRes.json())
    setPlatforms(await platformsRes.json())
    setShops(await shopsRes.json())
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Filter shops by selected platform
  const filteredShops = shops.filter(
    (shop) => shop.platform.id === parseInt(platformId)
  )

  const addToCart = () => {
    if (!selectedProductId || !selectedQuantity) return

    const product = products.find((p) => p.id === parseInt(selectedProductId))
    if (!product) return

    const quantity = parseInt(selectedQuantity)
    if (quantity <= 0) return

    // Check if product already in cart
    const existingIndex = cart.findIndex((item) => item.productId === selectedProductId)
    if (existingIndex >= 0) {
      const newCart = [...cart]
      newCart[existingIndex].quantity += quantity
      setCart(newCart)
    } else {
      setCart([
        ...cart,
        {
          productId: selectedProductId,
          productName: product.name,
          quantity,
          stock: product.stock,
        },
      ])
    }

    setSelectedProductId("")
    setSelectedQuantity("1")
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId))
  }

  const updateCartQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCart(
      cart.map((item) =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cart.length === 0) {
      setError("กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ")
      return
    }
    
    setLoading(true)
    setError("")

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId,
        platformId,
        shopId: shopId || null,
        totalPrice,
        note,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      }),
    })

    const data = await res.json()
    
    if (!res.ok) {
      setError(data.error || "เกิดข้อผิดพลาด")
      setLoading(false)
      return
    }

    // Reset form
    setEmployeeId("")
    setPlatformId("")
    setShopId("")
    setTotalPrice("")
    setNote("")
    setCart([])
    setLoading(false)
    fetchData()
  }

  const handleDelete = async (id: number) => {
    if (!confirm("ต้องการลบออเดอร์นี้?")) return

    await fetch(`/api/orders/${id}`, { method: "DELETE" })
    fetchData()
  }

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0)
  const totalCommission = orders.reduce((sum, o) => sum + o.commission, 0)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">จัดการออเดอร์</h1>

      <Card>
        <CardHeader>
          <CardTitle>บันทึกออเดอร์ใหม่</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md">
                {error}
              </div>
            )}

            {/* Add product to cart */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold mb-3">เพิ่มสินค้า</h3>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="md:col-span-2">
                  <Label htmlFor="product">สินค้า</Label>
                  <Select
                    id="product"
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
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
                    value={selectedQuantity}
                    onChange={(e) => setSelectedQuantity(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button type="button" onClick={addToCart} variant="outline" className="w-full">
                    + เพิ่มสินค้า
                  </Button>
                </div>
              </div>
            </div>

            {/* Cart items */}
            {cart.length > 0 && (
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">รายการสินค้าในออเดอร์</h3>
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between bg-white p-2 rounded border"
                    >
                      <span className="font-medium">{item.productName}</span>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="w-10 text-center">{item.quantity}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                        >
                          +
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeFromCart(item.productId)}
                        >
                          ลบ
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order details */}
            <div className="grid gap-4 md:grid-cols-6">
              <div>
                <Label htmlFor="employee">พนักงาน</Label>
                <Select
                  id="employee"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  required
                >
                  <option value="">เลือกพนักงาน</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="platform">แพลตฟอร์ม</Label>
                <Select
                  id="platform"
                  value={platformId}
                  onChange={(e) => {
                    setPlatformId(e.target.value)
                    setShopId("") // Reset shop when platform changes
                  }}
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
                <Label htmlFor="shop">ร้านค้า</Label>
                <Select
                  id="shop"
                  value={shopId}
                  onChange={(e) => setShopId(e.target.value)}
                  disabled={!platformId}
                >
                  <option value="">เลือกร้านค้า (ถ้ามี)</option>
                  {filteredShops.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="totalPrice">ราคารวมทั้งออเดอร์ (บาท)</Label>
                <Input
                  id="totalPrice"
                  type="number"
                  step="0.01"
                  value={totalPrice}
                  onChange={(e) => setTotalPrice(e.target.value)}
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
                <Button type="submit" disabled={loading || cart.length === 0} className="w-full">
                  {loading ? "กำลังบันทึก..." : "บันทึกออเดอร์"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">ยอดขายรวม</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ฿{totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">ค่าคอมมิชชั่นรวม</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ฿{totalCommission.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายการออเดอร์ ({orders.length} รายการ)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>วันที่</TableHead>
                <TableHead>สินค้า</TableHead>
                <TableHead>พนักงาน</TableHead>
                <TableHead>แพลตฟอร์ม</TableHead>
                <TableHead>ร้านค้า</TableHead>
                <TableHead className="text-right">รวม</TableHead>
                <TableHead className="text-right">คอมมิชชั่น</TableHead>
                <TableHead>หมายเหตุ</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString("th-TH")}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {order.items.map((item) => (
                        <div key={item.id} className="text-sm">
                          {item.product.name} x{item.quantity}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{order.employee.name}</TableCell>
                  <TableCell>{order.platform.name}</TableCell>
                  <TableCell>{order.shop?.name || "-"}</TableCell>
                  <TableCell className="text-right font-medium">
                    ฿{order.totalPrice.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-blue-600">
                    ฿{order.commission.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {order.note || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(order.id)}
                    >
                      ลบ
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    ยังไม่มีออเดอร์
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
