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
import { Users, Plus, Trash2, Loader2, Percent } from "lucide-react"

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
  const [pageLoading, setPageLoading] = useState(true)

  const fetchEmployees = async () => {
    const res = await fetch("/api/employees")
    const data = await res.json()
    setEmployees(data)
    setPageLoading(false)
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
        <Users className="h-8 w-8 text-primary" />
        <h1 className="text-2xl md:text-3xl font-bold">จัดการพนักงาน</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Plus className="h-5 w-5" />
            เพิ่มพนักงานใหม่
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 sm:items-end">
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
            <div className="w-full sm:w-40">
              <Label htmlFor="commissionRate" className="flex items-center gap-1">
                <Percent className="h-3 w-3" />
                ค่าคอมมิชชั่น (%)
              </Label>
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
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  เพิ่มพนักงาน
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
            รายชื่อพนักงาน ({employees.length} คน)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
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
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline ml-1">ลบ</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {employees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      ยังไม่มีพนักงาน
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
