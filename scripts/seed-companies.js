/**
 * Script to seed companies for multi-company support.
 * - Upserts the first company "The Rich 24" (idempotent).
 * - Optionally creates a child company if a name is given.
 * - Grants all existing non-admin users access to "The Rich 24"
 *   (preserves their current access exactly).
 *
 * Run with: node scripts/seed-companies.js [childCompanyName]
 */

const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function main() {
  const childName = process.argv[2]

  const mainCompany = await prisma.company.upsert({
    where: { name: "The Rich 24" },
    update: {},
    create: { name: "The Rich 24" },
  })
  console.log(`✓ Company "${mainCompany.name}" (id: ${mainCompany.id})`)

  if (childName) {
    const child = await prisma.company.upsert({
      where: { name: childName },
      update: {},
      create: { name: childName },
    })
    console.log(`✓ Company "${child.name}" (id: ${child.id})`)
  }

  // Grant existing non-admin users access to the main company
  const users = await prisma.appUser.findMany({
    where: { role: { not: "admin" } },
    select: { id: true, username: true },
  })
  for (const user of users) {
    await prisma.userCompany.upsert({
      where: { userId_companyId: { userId: user.id, companyId: mainCompany.id } },
      update: {},
      create: { userId: user.id, companyId: mainCompany.id },
    })
    console.log(`✓ Granted "${user.username}" access to "${mainCompany.name}"`)
  }

  if (users.length === 0) {
    console.log("  (no non-admin users to grant access)")
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
