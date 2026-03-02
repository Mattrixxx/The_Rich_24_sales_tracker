import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("กรุณากรอก username และ password")
        }

        const user = await prisma.appUser.findUnique({
          where: { username: credentials.username },
        })

        if (!user) {
          throw new Error("ไม่พบผู้ใช้งาน")
        }

        if (!user.isActive) {
          throw new Error("บัญชีนี้ถูกปิดใช้งาน")
        }

        const isPasswordValid = await compare(credentials.password, user.password)
        if (!isPasswordValid) {
          throw new Error("รหัสผ่านไม่ถูกต้อง")
        }

        return {
          id: user.id.toString(),
          name: user.name,
          username: user.username,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = (user as any).username
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.username = token.username as string
        session.user.role = token.role as string
      }
      return session
    },
  },
}
