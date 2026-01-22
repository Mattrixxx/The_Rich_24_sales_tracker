"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Users, Plus, Trash2, Loader2, Percent, UserPlus, Edit2 } from "lucide-react"

interface Employee {
  id: number
  name: string
  commissionRate: number
  commissionType: string
  commissionValue: number
  createdAt: string
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [name, setName] = useState("")
  const [commissionType, setCommissionType] = useState("percentage")
  const [commissionValue, setCommissionValue] = useState("5")
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const fetchEmployees = async () => {
    const res = await fetch("/api/employees")
    const data = await res.json()
    setEmployees(data)
    setPageLoading(false)
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  const handleEdit = (employee: Employee) => {
    setEditingId(employee.id)
    setName(employee.name)
    setCommissionType(employee.commissionType || "percentage")
    const value = employee.commissionType === "percentage" 
      ? (employee.commissionValue ?? employee.commissionRate) * 100
      : (employee.commissionValue ?? employee.commissionRate * 100)
    setCommissionValue(value.toString())
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setName("")
    setCommissionType("percentage")
    setCommissionValue("5")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const url = editingId ? `/api/employees/${editingId}` : "/api/employees"
    const method = editingId ? "PUT" : "POST"

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, commissionType, commissionValue }),
    })

    setName("")
    setCommissionType("percentage")
    setCommissionValue("5")
    setEditingId(null)
    setLoading(false)
    fetchEmployees()
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleteLoading(true)

    await fetch(`/api/employees/${deleteId}`, { method: "DELETE" })
    
    setDeleteLoading(false)
    setDeleteId(null)
    fetchEmployees()
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
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">จัดการพนักงาน</h1>
            <p className="text-sm text-muted-foreground">จัดการข้อมูลพนักงานและค่าคอมมิชชั่น</p>
          </div>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Users className="h-3 w-3" />
          {employees.length} คน
        </Badge>
      </div>

      <Card className="border-dashed border-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base md:text-lg">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              {editingId ? "แก้ไขข้อมูลพนักงาน" : "เพิ่มพนักงานใหม่"}
            </div>
            {editingId && (
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
            <div className="flex-1">
              <Label htmlFor="name">ชื่อพนักงาน</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ชื่อพนักงาน"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="commissionType">ประเภทค่าคอม</Label>
                <Select value={commissionType} onValueChange={setCommissionType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">คิดตามเปอร์เซ็นต์ (%)</SelectItem>
                    <SelectItem value="fixed">จำนวนเงินคงที่ (บาท)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="commissionValue" className="flex items-center gap-1">
                  {commissionType === "percentage" ? (
                    <>
                      <Percent className="h-3 w-3" />
                      ค่าคอมมิชชั่น (%)
                    </>
                  ) : (
                    "ค่าคอมมิชชั่น (บาท)"
                  )}
                </Label>
                <Input
                  id="commissionValue"
                  type="number"
                  step="0.1"
                  min="0"
                  max={commissionType === "percentage" ? "100" : undefined}
                  value={commissionValue}
                  onChange={(e) => setCommissionValue(e.target.value)}
                  placeholder={commissionType === "percentage" ? "5" : "50"}
                  required
                />
              </div>
            </div>
            
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {editingId ? "กำลังอัปเดต..." : "กำลังบันทึก..."}
                </>
              ) : (
                <>
                  {editingId ? (
                    <>
                      <Edit2 className="h-4 w-4 mr-2" />
                      อัปเดตข้อมูล
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      เพิ่มพนักงาน
                    </>
                  )}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Users className="h-5 w-5" />
            รายชื่อพนักงาน
            <Badge variant="secondary" className="ml-2">{employees.length} คน</Badge>
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>ชื่อพนักงาน</TableHead>
                  <TableHead className="text-right">อัตราคอมมิชชั่น</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {employee.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        {employee.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="gap-1">
                        {employee.commissionType === "percentage" ? (
                          <>
                            <Percent className="h-3 w-3" />
                            {((employee.commissionValue ?? employee.commissionRate) * 100).toFixed(1)}%
                          </>
                        ) : employee.commissionType === "fixed" ? (
                          <>฿{(employee.commissionValue ?? 0).toFixed(0)}/ออเดอร์</>
                        ) : (
                          <>
                            <Percent className="h-3 w-3" />
                            {(employee.commissionRate * 100).toFixed(1)}%
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary hover:text-primary hover:bg-primary/10"
                          onClick={() => handleEdit(employee)}
                        >
                          <Edit2 className="h-4 w-4" />
                          <span className="hidden sm:inline ml-1">แก้ไข</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteId(employee.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="hidden sm:inline ml-1">ลบ</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {employees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-12">
                      <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">ยังไม่มีพนักงาน</p>
                      <p className="text-sm">เริ่มต้นด้วยการเพิ่มพนักงานใหม่</p>
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
        title="ลบพนักงาน"
        description="คุณแน่ใจหรือไม่ที่จะลบพนักงานนี้? ข้อมูลที่เกี่ยวข้องทั้งหมดจะถูกลบด้วย"
        loading={deleteLoading}
      />
    </div>
  )
}
