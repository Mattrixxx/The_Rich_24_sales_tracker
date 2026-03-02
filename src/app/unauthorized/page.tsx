"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ShieldOff, ArrowLeft } from "lucide-react"

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
      <div className="p-4 bg-red-100 rounded-full">
        <ShieldOff className="h-12 w-12 text-red-500" />
      </div>
      <h1 className="text-2xl font-bold text-gray-800">ไม่มีสิทธิ์เข้าใช้งาน</h1>
      <p className="text-gray-500 max-w-sm">
        หน้านี้สำหรับผู้ดูแลระบบเท่านั้น กรุณาติดต่อ Admin เพื่อขอสิทธิ์เพิ่มเติม
      </p>
      <Button variant="outline" onClick={() => router.back()} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        ย้อนกลับ
      </Button>
    </div>
  )
}
