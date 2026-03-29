# คู่มือผู้ใช้งาน ZLineBot (TH)

## ภาพรวม
ZLineBot เป็นผู้ช่วยแชตคอมเมิร์ซสำหรับดูสินค้า จัดการตะกร้า สร้างออเดอร์ และส่งคำขอความเป็นส่วนตัวผ่าน LINE และ API

## คำสั่งใช้งานเร็ว
- ความต้องการสินค้า: `buy`, `price`, `มีอะไรบ้าง`, `ราคา`
- ดูสินค้า: `GET /products`
- เพิ่มตะกร้า: `POST /cart`
- สร้างออเดอร์: `POST /orders`

## เฮดเดอร์ที่ต้องส่ง
- `x-api-key: <TENANT_API_KEY>`
- `x-tenant-id: <tenant_id>`

## การใช้งาน API
### สินค้า
- `GET /products`
- `POST /products`

### ตะกร้า
- `GET /cart/:userId`
- `POST /cart`

### ออเดอร์
- `GET /orders`
- `POST /orders`
- `paymentMethod`: `promptpay` (QR) หรือ `stripe` (checkout URL)

## ความเป็นส่วนตัว / DSR
- `POST /privacy/consent`
- `GET /privacy/consent/:userId`
- `POST /privacy/dsr`
- ประเภท DSR: `access`, `delete`, `rectify`

## เส้นทางผู้ใช้ทั่วไป
1. ผู้ใช้ถามใน LINE
2. บอทแนะนำสินค้า
3. ผู้ใช้เพิ่มสินค้าลงตะกร้า
4. ผู้ใช้สร้างออเดอร์และชำระเงิน
5. ผู้ใช้ส่งคำขอความเป็นส่วนตัวได้

## การแก้ปัญหา
- Unauthorized: `x-api-key` ไม่ถูกต้องหรือไม่ได้ส่งมา
- ไม่พบสินค้า: tenant ที่เลือกยังไม่มีสินค้า
- LINE ไม่ตอบกลับ: ค่าคีย์หรือ signature ของ LINE ผิด
- Stripe URL เป็นค่าว่าง: ยังไม่ได้ตั้งค่า Stripe
