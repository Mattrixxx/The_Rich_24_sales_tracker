"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Pencil, UserX, UserCheck, ShieldCheck, User } from "lucide-react"

interface AppUser {
  id: number
  username: string
  name: string
  role: string
  isActive: boolean
  createdAt: string
}

export default function UsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<AppUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editUser, setEditUser] = useState<AppUser | null>(null)
  const [form, setForm] = useState({
    username: "",
    password: "",
    name: "",
    role: "user",
    isActive: true,
  })
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "loading") return
    if (!session) { router.push("/login"); return }
    if (session.user.role !== "admin") { router.push("/"); return }
    fetchUsers()
  }, [session, status])

  const fetchUsers = async () => {
    const res = await fetch("/api/users")
    if (res.ok) {
      const data = await res.json()
      setUsers(data)
    }
    setIsLoading(false)
  }

  const openCreate = () => {
    setEditUser(null)
    setForm({ username: "", password: "", name: "", role: "user", isActive: true })
    setError("")
    setShowDialog(true)
  }

  const openEdit = (user: AppUser) => {
    setEditUser(user)
    setForm({ username: user.username, password: "", name: user.name, role: user.role, isActive: user.isActive })
    setError("")
    setShowDialog(true)
  }

  const handleSave = async () => {
    setError("")
    const url = editUser ? `/api/users/${editUser.id}` : "/api/users"
    const method = editUser ? "PUT" : "POST"
    const body = editUser
      ? { name: form.name, role: form.role, isActive: form.isActive, ...(form.password ? { password: form.password } : {}) }
      : { username: form.username, password: form.password, name: form.name, role: form.role }

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || "เกิดข้อผิดพลาด"); return }
    setShowDialog(false)
    fetchUsers()
  }

  const toggleActive = async (user: AppUser) => {
    await fetch(`/api/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: user.name, role: user.role, isActive: !user.isActive }),
    })
    fetchUsers()
  }

  if (status === "loading" || isLoading) {
    return <div className="text-center py-20 text-gray-500">กำลังโหลด...</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการผู้ใช้งาน</h1>
          <p className="text-gray-500 text-sm mt-1">เฉพาะผู้ดูแลระบบเท่านั้น</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          เพิ่มผู้ใช้ใหม่
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">ชื่อ</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Username</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">สิทธิ์</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">สถานะ</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">วันที่สร้าง</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 text-gray-600">{user.username}</td>
                  <td className="px-6 py-4">
                    {user.role === "admin" ? (
                      <Badge className="bg-purple-100 text-purple-700 border-purple-200 gap-1">
                        <ShieldCheck className="h-3 w-3" /> Admin
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200 gap-1">
                        <User className="h-3 w-3" /> User
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={user.isActive ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}>
                      {user.isActive ? "ใช้งาน" : "ปิดใช้งาน"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(user.createdAt).toLocaleDateString("th-TH")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => openEdit(user)} className="gap-1">
                        <Pencil className="h-3 w-3" />
                        แก้ไข
                      </Button>
                      {user.id !== parseInt(session?.user?.id || "0") && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleActive(user)}
                          className={user.isActive ? "gap-1 text-red-600 hover:text-red-700" : "gap-1 text-green-600 hover:text-green-700"}
                        >
                          {user.isActive ? <UserX className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                          {user.isActive ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editUser ? "แก้ไขผู้ใช้งาน" : "เพิ่มผู้ใช้งานใหม่"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>ชื่อ-นามสกุล</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="ชื่อผู้ใช้งาน"
              />
            </div>
            {!editUser && (
              <div className="space-y-2">
                <Label>Username</Label>
                <Input
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="username"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>{editUser ? "รหัสผ่านใหม่ (เว้นว่างหากไม่เปลี่ยน)" : "รหัสผ่าน"}</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="รหัสผ่าน"
              />
            </div>
            <div className="space-y-2">
              <Label>สิทธิ์การใช้งาน</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User - ใช้งานทั่วไป</SelectItem>
                  <SelectItem value="admin">Admin - ผู้ดูแลระบบ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>ยกเลิก</Button>
            <Button onClick={handleSave}>{editUser ? "บันทึก" : "เพิ่มผู้ใช้"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
