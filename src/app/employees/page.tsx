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

interface Employee {
  id: number
  name: string
  commissionRate: number
  createdAt: string
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [name, setName] = useState("")
  const [commissionRate, setCommissionRate] = useState("5")
  const [loading, setLoading] = useState(false)

  const fetchEmployees = async () => {
    const res = await fetch("/api/employees")
    const data = await res.json()
    setEmployees(data)
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, commissionRate }),
    })

    setName("")
    setCommissionRate("5")
    setLoading(false)
    fetchEmployees()
  }

  const handleDelete = async (id: number) => {
    if (!confirm("ต้องการลบพนักงานนี้?")) return

    await fetch(`/api/employees/${id}`, { method: "DELETE" })
    fetchEmployees()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">จัดการพนักงาน</h1>

      <Card>
        <CardHeader>
          <CardTitle>เพิ่มพนักงานใหม่</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-4 items-end">
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
            <div className="w-40">
              <Label htmlFor="commissionRate">ค่าคอมมิชชั่น (%)</Label>
              <Input
                id="commissionRate"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                placeholder="5"
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "กำลังบันทึก..." : "เพิ่มพนักงาน"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>รายชื่อพนักงาน ({employees.length} คน)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อพนักงาน</TableHead>
                <TableHead className="text-right">อัตราคอมมิชชั่น</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell className="text-right">
                    {(employee.commissionRate * 100).toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(employee.id)}
                    >
                      ลบ
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {employees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    ยังไม่มีพนักงาน
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
