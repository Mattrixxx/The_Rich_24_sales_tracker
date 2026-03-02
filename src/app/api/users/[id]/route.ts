import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/session"
import { hash } from "bcryptjs"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    const body = await request.json()
    const { name, role, isActive, password } = body

    const updateData: any = { name, role, isActive }
    if (password) {
      updateData.password = await hash(password, 12)
    }

    const user = await prisma.appUser.update({
      where: { id: parseInt(params.id) },
      data: updateData,
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    return NextResponse.json(user)
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (error.message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    // Soft delete - just deactivate
    const user = await prisma.appUser.update({
      where: { id: parseInt(params.id) },
      data: { isActive: false },
      select: { id: true, username: true, isActive: true },
    })
    return NextResponse.json(user)
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (error.message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
