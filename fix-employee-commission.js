const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixEmployeeCommissions() {
  try {
    // อัปเดตพนักงานทุกคนให้เป็น percentage และแปลงค่าให้ถูกต้อง
    const employees = await prisma.employee.findMany()
    
    for (const emp of employees) {
      // ถ้า commissionType เป็น "fixed" และ commissionValue > 1 
      // แสดงว่าน่าจะเป็น % ที่ต้องแปลงเป็น decimal
      if (emp.commissionType === 'fixed' && emp.commissionValue > 1) {
        await prisma.employee.update({
          where: { id: emp.id },
          data: {
            commissionType: 'percentage',
            commissionValue: emp.commissionValue / 100, // แปลง 5 -> 0.05
          }
        })
        console.log(`Fixed ${emp.name}: commissionType -> percentage, commissionValue -> ${emp.commissionValue / 100}`)
      }
      // ถ้า commissionType เป็น "fixed" แต่ค่าน้อยกว่า 1 (เช่น 0.05)
      // แสดงว่าเป็น % ที่อยู่ในรูป decimal แล้ว
      else if (emp.commissionType === 'fixed' && emp.commissionValue <= 1 && emp.commissionValue > 0) {
        await prisma.employee.update({
          where: { id: emp.id },
          data: {
            commissionType: 'percentage',
          }
        })
        console.log(`Fixed ${emp.name}: commissionType -> percentage`)
      }
    }
    
    console.log('✅ Fixed all employee commissions!')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixEmployeeCommissions()
