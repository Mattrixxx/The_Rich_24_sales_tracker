"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  TrendingUp,
  DollarSign,
  Loader2,
  AlertCircle,
  Package,
  Users,
  Globe,
  Store,
  FileText,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
} from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

interface Employee {
  id: number;
  name: string;
  commissionRate: number;
}

interface Platform {
  id: number;
  name: string;
}

interface Shop {
  id: number;
  name: string;
  platform: Platform;
}

interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface Order {
  id: number;
  employee: Employee;
  platform: Platform;
  shop: Shop | null;
  items: OrderItem[];
  totalPrice: number;
  commission: number;
  note: string | null;
  createdAt: string;
  createdBy: { id: number; name: string } | null;
}

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  stock: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Default page size
  const [isWholesale, setIsWholesale] = useState(false); // For form only
  const [products, setProducts] = useState<Product[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  const [employeeId, setEmployeeId] = useState("");
  const [platformId, setPlatformId] = useState("");
  const [shopId, setShopId] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState("1");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [orderDate, setOrderDate] = useState<Date | undefined>(new Date());
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  const [filterEmployeeId, setFilterEmployeeId] = useState("");
  const [filterPlatformId, setFilterPlatformId] = useState("");
  const [filterShopId, setFilterShopId] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState<Date | undefined>(undefined);
  const [filterDateTo, setFilterDateTo] = useState<Date | undefined>(undefined);

  const formatDateLocal = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const fetchOrders = async (
    page = 1,
    filters?: {
      employeeId?: string;
      platformId?: string;
      shopId?: string;
      dateFrom?: string;
      dateTo?: string;
    }
  ) => {
    const params = new URLSearchParams({ page: String(page), limit: String(itemsPerPage) });
    const f = filters ?? {
      employeeId: filterEmployeeId,
      platformId: filterPlatformId,
      shopId: filterShopId,
      dateFrom: filterDateFrom ? formatDateLocal(filterDateFrom) : undefined,
      dateTo: filterDateTo ? formatDateLocal(filterDateTo) : undefined,
    };
    if (f.employeeId) params.set("employeeId", f.employeeId);
    if (f.platformId) params.set("platformId", f.platformId);
    if (f.shopId) params.set("shopId", f.shopId);
    if (f.dateFrom) params.set("dateFrom", f.dateFrom);
    if (f.dateTo) params.set("dateTo", f.dateTo);

    const ordersRes = await fetch(`/api/orders?${params}`);
    const ordersJson = await ordersRes.json();
    setOrders(ordersJson.orders || []);
    setTotalOrders(ordersJson.total || 0);
    setTotalPages(ordersJson.totalPages || 1);
    setCurrentPage(ordersJson.page || 1);
  };

  const fetchData = async (page = 1) => {
    setPageLoading(true);
    const [, productsRes, employeesRes, platformsRes, shopsRes] =
      await Promise.all([
        fetchOrders(page),
        fetch("/api/products"),
        fetch("/api/employees"),
        fetch("/api/platforms"),
        fetch("/api/shops"),
      ]);
    setProducts(await productsRes.json());
    setEmployees(await employeesRes.json());
    setPlatforms(await platformsRes.json());
    setShops(await shopsRes.json());
    setPageLoading(false);
  };

  const handleFilter = (page = 1) => {
    fetchOrders(page, {
      employeeId: filterEmployeeId,
      platformId: filterPlatformId,
      shopId: filterShopId,
      dateFrom: filterDateFrom ? formatDateLocal(filterDateFrom) : undefined,
      dateTo: filterDateTo ? formatDateLocal(filterDateTo) : undefined,
    });
  };

  const handleClearFilter = () => {
    setFilterEmployeeId("");
    setFilterPlatformId("");
    setFilterShopId("");
    setFilterDateFrom(undefined);
    setFilterDateTo(undefined);
    fetchOrders(1, {});
  };

  useEffect(() => {
    fetchData(1);
  }, []);

  // Filter shops by selected platform
  const filteredShops = shops.filter(
    (shop) => shop.platform.id === parseInt(platformId),
  );

  const addToCart = () => {
    if (!selectedProductId || !selectedQuantity) return;

    const product = products.find((p) => p.id === parseInt(selectedProductId));
    if (!product) return;

    const quantity = parseInt(selectedQuantity);
    if (quantity <= 0) return;

    // Check if product already in cart
    const existingIndex = cart.findIndex(
      (item) => item.productId === selectedProductId,
    );
    if (existingIndex >= 0) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += quantity;
      setCart(newCart);
    } else {
      setCart([
        ...cart,
        {
          productId: selectedProductId,
          productName: product.name,
          quantity,
          stock: product.stock,
        },
      ]);
    }

    setSelectedProductId("");
    setSelectedQuantity("1");
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const updateCartQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(
      cart.map((item) =>
        item.productId === productId
          ? { ...item, quantity: newQuantity }
          : item,
      ),
    );
  };

  const handleEdit = (order: Order) => {
    setEditingOrderId(order.id);
    setEmployeeId(order.employee.id.toString());
    setPlatformId(order.platform.id.toString());
    setShopId(order.shop?.id.toString() || "");
    setTotalPrice(order.totalPrice.toString());
    setNote(order.note || "");
    setOrderDate(new Date(order.createdAt));
    setCart(
      order.items.map((item) => ({
        productId: item.product.id.toString(),
        productName: item.product.name,
        quantity: item.quantity,
        stock: item.product.stock,
      })),
    );
    setIsWholesale(false); // No isWholesale in DB, reset to false
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingOrderId(null);
    setEmployeeId("");
    setPlatformId("");
    setShopId("");
    setTotalPrice("");
    setNote("");
    setCart([]);
    setOrderDate(new Date());
    setIsWholesale(false);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      setError("กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ");
      return;
    }

    setLoading(true);
    setError("");

    // Format date without timezone issues
    const formatDateLocal = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const url = editingOrderId
      ? `/api/orders/${editingOrderId}`
      : "/api/orders";
    const method = editingOrderId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId,
        platformId,
        shopId: shopId || null,
        totalPrice,
        note,
        orderDate: orderDate
          ? formatDateLocal(orderDate)
          : formatDateLocal(new Date()),
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        isWholesale,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "เกิดข้อผิดพลาด");
      setLoading(false);
      return;
    }

    // Reset form
    setEditingOrderId(null);
    setEmployeeId("");
    setPlatformId("");
    setShopId("");
    setTotalPrice("");
    setNote("");
    setCart([]);
    setOrderDate(new Date());
    setIsWholesale(false);
    setLoading(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);

    await fetch(`/api/orders/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    setDeleteLoading(false);
    fetchData();
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
  const totalCommission = orders.reduce((sum, o) => sum + o.commission, 0);

  // Reset to page 1 when orders change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [orders.length, currentPage, totalPages]);

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-12 lg:pt-0">
      <div className="flex items-center gap-3">
        <ShoppingCart className="h-8 w-8 text-primary" />
        <h1 className="text-2xl md:text-3xl font-bold">จัดการออเดอร์</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base md:text-lg">
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {editingOrderId ? "แก้ไขออเดอร์" : "บันทึกออเดอร์ใหม่"}
            </div>
            {editingOrderId && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
              >
                ยกเลิก
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md flex items-center gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Add product to cart */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Package className="h-4 w-4" />
                เพิ่มสินค้า
              </h3>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="product">สินค้า</Label>
                  <Select
                    value={selectedProductId}
                    onValueChange={setSelectedProductId}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="เลือกสินค้า" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.name} (คงเหลือ: {p.stock})
                        </SelectItem>
                      ))}
                    </SelectContent>
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
                  <Button
                    type="button"
                    onClick={addToCart}
                    variant="outline"
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    เพิ่มสินค้า
                  </Button>
                </div>
              </div>
            </div>

            {/* Cart items */}
            {cart.length > 0 && (
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  รายการสินค้าในออเดอร์ ({cart.length} รายการ)
                </h3>
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div
                      key={item.productId}
                      className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-2 rounded border gap-2"
                    >
                      <span className="font-medium truncate">
                        {item.productName}
                      </span>
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateCartQuantity(
                              item.productId,
                              item.quantity - 1,
                            )
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-10 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateCartQuantity(
                              item.productId,
                              item.quantity + 1,
                            )
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeFromCart(item.productId)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order details */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-6">
              <div>
                <Label htmlFor="employee" className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  พนักงาน
                </Label>
                <Select
                  value={employeeId}
                  onValueChange={setEmployeeId}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="เลือกพนักงาน" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((e) => (
                      <SelectItem key={e.id} value={e.id.toString()}>
                        {e.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="platform" className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                  แพลตฟอร์ม
                </Label>
                <Select
                  value={platformId}
                  onValueChange={(value) => {
                    setPlatformId(value);
                    setShopId(""); // Reset shop when platform changes
                  }}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="เลือกแพลตฟอร์ม" />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="shop" className="flex items-center gap-1.5">
                  <Store className="h-3.5 w-3.5 text-muted-foreground" />
                  ร้านค้า
                </Label>
                <Select
                  value={shopId}
                  onValueChange={setShopId}
                  disabled={!platformId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="เลือกร้านค้า (ถ้ามี)" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredShops.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label
                  htmlFor="totalPrice"
                  className="flex items-center gap-1.5"
                >
                  <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                  ราคารวม (บาท)
                </Label>
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
                <Label
                  htmlFor="orderDate"
                  className="flex items-center gap-1.5"
                >
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  วันที่
                </Label>
                <DatePicker
                  date={orderDate}
                  onDateChange={setOrderDate}
                  placeholder="เลือกวันที่"
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="note" className="flex items-center gap-1.5">
                  หมายเหตุ
                </Label>
                <Input
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="หมายเหตุ (ถ้ามี)"
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input
                  id="isWholesale"
                  type="checkbox"
                  checked={isWholesale}
                  onChange={(e) => setIsWholesale(e.target.checked)}
                  className="accent-blue-600 h-4 w-4"
                />
                <label
                  htmlFor="isWholesale"
                  className="cursor-pointer select-none"
                >
                  ราคาส่ง
                </label>
              </div>
              <div className="flex items-end">
                <Button
                  type="submit"
                  disabled={loading || cart.length === 0}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {editingOrderId ? "กำลังอัปเดต..." : "กำลังบันทึก..."}
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {editingOrderId ? "อัปเดตออเดอร์" : "บันทึกออเดอร์"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              ยอดขายรวม
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-green-600">
              ฿{totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              คอมมิชชั่นรวม
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-blue-600">
              ฿{totalCommission.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Filter className="h-5 w-5" />
            ตัวกรอง
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <Label className="text-xs text-muted-foreground">จากวันที่</Label>
              <DatePicker date={filterDateFrom} onDateChange={setFilterDateFrom} placeholder="เลือกวันที่" className="w-full" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">ถึงวันที่</Label>
              <DatePicker date={filterDateTo} onDateChange={setFilterDateTo} placeholder="เลือกวันที่" className="w-full" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">พนักงาน</Label>
              <Select value={filterEmployeeId} onValueChange={setFilterEmployeeId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="ทั้งหมด" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id.toString()}>{e.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">แพลตฟอร์ม</Label>
              <Select value={filterPlatformId} onValueChange={(v) => { setFilterPlatformId(v); setFilterShopId(""); }}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="ทั้งหมด" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">ร้านค้า</Label>
              <Select value={filterShopId} onValueChange={setFilterShopId} disabled={!filterPlatformId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="ทั้งหมด" />
                </SelectTrigger>
                <SelectContent>
                  {shops.filter((s) => s.platform.id === parseInt(filterPlatformId)).map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button onClick={() => handleFilter(1)}>
              <Filter className="h-4 w-4 mr-1" />
              กรอง
            </Button>
            <Button variant="outline" onClick={handleClearFilter}>
              <X className="h-4 w-4 mr-1" />
              ล้าง
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <ShoppingCart className="h-5 w-5" />
            รายการออเดอร์ ({totalOrders} รายการ)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>วันที่</TableHead>
                  <TableHead>สินค้า</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    พนักงาน
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    แพลตฟอร์ม
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    ร้านค้า
                  </TableHead>
                  <TableHead className="text-right">รวม</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">
                    คอมมิชชั่น
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    หมายเหตุ
                  </TableHead>
                  <TableHead className="hidden xl:table-cell text-muted-foreground">
                    สร้างโดย
                  </TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="text-xs sm:text-sm">
                      {new Date(order.createdAt).toLocaleDateString("th-TH")}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 max-w-[100px] sm:max-w-none">
                        {order.items.slice(0, 2).map((item) => (
                          <div
                            key={item.id}
                            className="text-xs sm:text-sm truncate"
                          >
                            {item.product.name} x{item.quantity}
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <button
                            onClick={() => setViewingOrder(order)}
                            className="text-xs text-primary hover:underline cursor-pointer"
                          >
                            +{order.items.length - 2} รายการ
                          </button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {order.employee.name}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {order.platform.name}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {order.shop?.name || "-"}
                    </TableCell>
                    <TableCell className="text-right font-medium text-xs sm:text-sm">
                      ฿{order.totalPrice.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-blue-600 hidden sm:table-cell">
                      ฿{order.commission.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 hidden lg:table-cell">
                      {order.note || "-"}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
                      {order.createdBy?.name || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(order)}
                        >
                          <FileText className="h-4 w-4" />
                          <span className="hidden sm:inline ml-1">แก้ไข</span>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteId(order.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="hidden sm:inline ml-1">ลบ</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {orders.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="text-center text-muted-foreground py-8"
                    >
                      <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      ยังไม่มีออเดอร์
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {orders.length > 0 && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
              <div className="text-sm text-muted-foreground">
                แสดง {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalOrders)} จาก {totalOrders} รายการ
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFilter(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">ก่อนหน้า</span>
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      if (page === 1 || page === totalPages) return true;
                      if (Math.abs(page - currentPage) <= 1) return true;
                      return false;
                    })
                    .map((page, index, array) => {
                      const prevPage = array[index - 1];
                      const showEllipsis = prevPage && page - prevPage > 1;
                      return (
                        <div key={page} className="flex items-center gap-1">
                          {showEllipsis && (
                            <span className="px-2 text-muted-foreground">
                              ...
                            </span>
                          )}
                          <Button
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleFilter(page)}
                            className="min-w-[2.5rem]"
                          >
                            {page}
                          </Button>
                        </div>
                      );
                    })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFilter(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <span className="hidden sm:inline">ถัดไป</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="ลบออเดอร์"
        description="คุณต้องการลบออเดอร์นี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้"
        loading={deleteLoading}
      />

      <Dialog
        open={viewingOrder !== null}
        onOpenChange={(open) => !open && setViewingOrder(null)}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              รายละเอียดออเดอร์
            </DialogTitle>
          </DialogHeader>
          {viewingOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">วันที่:</span>
                  <span className="ml-2 font-medium">
                    {new Date(viewingOrder.createdAt).toLocaleDateString(
                      "th-TH",
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">พนักงาน:</span>
                  <span className="ml-2 font-medium">
                    {viewingOrder.employee.name}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">แพลตฟอร์ม:</span>
                  <span className="ml-2 font-medium">
                    {viewingOrder.platform.name}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">ร้านค้า:</span>
                  <span className="ml-2 font-medium">
                    {viewingOrder.shop?.name || "-"}
                  </span>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  รายการสินค้า ({viewingOrder.items.length} รายการ)
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>สินค้า</TableHead>
                      <TableHead className="text-right">ราคา/ชิ้น</TableHead>
                      <TableHead className="text-right">จำนวน</TableHead>
                      <TableHead className="text-right">รวม</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewingOrder.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.product.name}
                        </TableCell>
                        <TableCell className="text-right">
                          ฿{item.unitPrice.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ฿{item.subtotal.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">ยอดรวมทั้งหมด:</span>
                  <span className="font-bold text-green-600">
                    ฿{viewingOrder.totalPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">คอมมิชชั่น:</span>
                  <span className="font-medium text-blue-600">
                    ฿{viewingOrder.commission.toLocaleString()}
                  </span>
                </div>
                {viewingOrder.note && (
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <span className="text-sm text-muted-foreground">
                      หมายเหตุ:{" "}
                    </span>
                    <span className="text-sm">{viewingOrder.note}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
