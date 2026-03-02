"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Loader2, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else {
        router.push("/")
        router.refresh()
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-slate-800 bg-slate-900 text-white">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            The Rich24
          </CardTitle>
          <p className="text-slate-400 text-sm mt-1">Sales Tracker System</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-300">
                ชื่อผู้ใช้
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">
                รหัสผ่าน
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="รหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 bg-red-950/50 border border-red-800 rounded-md p-3 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                "เข้าสู่ระบบ"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
