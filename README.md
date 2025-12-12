# The Rich24 Sales Tracker

ระบบจัดการยอดขายและบัญชีสำหรับบริษัท The Rich24

## ฟีเจอร์หลัก

- 📦 **จัดการสินค้า** - เพิ่ม แก้ไข ลบสินค้า พร้อมข้อมูลต้นทุนและราคาขาย
- 🛒 **บันทึกออเดอร์** - บันทึกการขายสินค้า ระบุพนักงาน แพลตฟอร์ม และคำนวณคอมมิชชั่นอัตโนมัติ
- 👥 **จัดการพนักงาน** - เพิ่มพนักงานพร้อมกำหนดอัตราคอมมิชชั่น
- 🌐 **จัดการแพลตฟอร์ม** - เพิ่มช่องทางการขาย เช่น Facebook, Shopee, Lazada
- 💸 **บันทึกค่าใช้จ่าย** - บันทึกค่าใช้จ่ายต่างๆ แยกตามหมวดหมู่
- 📊 **แดชบอร์ด** - แสดงสรุปยอดขาย ค่าใช้จ่าย และกำไร

## เทคโนโลยีที่ใช้

- **Frontend**: Next.js 14 with TypeScript
- **UI**: Shadcn/UI + Tailwind CSS
- **Database**: PostgreSQL (Docker)
- **ORM**: Prisma

## การติดตั้ง

### 1. ติดตั้ง Dependencies

```bash
npm install
```

### 2. เริ่ม Database (ต้องมี Docker)

```bash
docker-compose up -d
```

### 3. รัน Database Migration

```bash
npx prisma migrate dev
```

### 4. เริ่มต้น Development Server

```bash
npm run dev
```

เปิดเบราว์เซอร์ไปที่ [http://localhost:3000](http://localhost:3000)

## คำสั่งที่ใช้บ่อย

| คำสั่ง | คำอธิบาย |
|--------|----------|
| `npm run dev` | เริ่ม Development Server |
| `npm run build` | Build สำหรับ Production |
| `docker-compose up -d` | เริ่ม PostgreSQL Database |
| `docker-compose down` | หยุด PostgreSQL Database |
| `npx prisma migrate dev` | รัน Database Migration |
| `npx prisma studio` | เปิด Prisma Studio (Database GUI) |

## โครงสร้าง Database

### Product (สินค้า)
- `id`: รหัสสินค้า
- `name`: ชื่อสินค้า
- `cost`: ต้นทุน
- `price`: ราคาขาย

### Employee (พนักงาน)
- `id`: รหัสพนักงาน
- `name`: ชื่อพนักงาน
- `commissionRate`: อัตราคอมมิชชั่น (0-1)

### Platform (แพลตฟอร์ม)
- `id`: รหัสแพลตฟอร์ม
- `name`: ชื่อแพลตฟอร์ม

### Order (ออเดอร์)
- `id`: รหัสออเดอร์
- `productId`: รหัสสินค้า
- `employeeId`: รหัสพนักงาน
- `platformId`: รหัสแพลตฟอร์ม
- `quantity`: จำนวน
- `unitPrice`: ราคาต่อชิ้น
- `totalPrice`: ราคารวม
- `commission`: ค่าคอมมิชชั่น

### Expense (ค่าใช้จ่าย)
- `id`: รหัสค่าใช้จ่าย
- `description`: รายละเอียด
- `amount`: จำนวนเงิน
- `category`: หมวดหมู่
- `date`: วันที่

## License

MIT
