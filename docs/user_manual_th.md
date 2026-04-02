> **Documentation Update (2026-04-02):** For the latest repository-wide feature analysis, see `docs/FEATURE_DEEP_IMPACT_DIVE_2026-04.md`.

# คู่มือผู้ใช้งาน ZLineBot (TH)

## 1. ภาพรวมระบบ
ZLineBot รองรับการซื้อขายผ่านแชต LINE และการใช้งานเชิง API

## 2. ความสามารถของผู้ใช้
- ดูสินค้า (`GET /products`)
- เพิ่มสินค้าเข้าตะกร้า (`POST /cart`)
- ดูตะกร้า (`GET /cart/:userId`)
- สร้างออเดอร์ (`POST /orders`)
- จัดการ consent และ DSR ด้านความเป็นส่วนตัว

## 3. เฮดเดอร์ที่ต้องส่ง
- `x-api-key: <TENANT_API_KEY>`
- `x-tenant-id: <tenant_id>`

## 4. ขั้นตอนสินค้าและตะกร้า
1. เรียกดูรายการสินค้า
2. เลือกสินค้าและจำนวน
3. เพิ่มลงตะกร้า
4. ตรวจสอบตะกร้าก่อนชำระเงิน

## 5. ขั้นตอนออเดอร์และการชำระเงิน
- สร้างออเดอร์ด้วย `paymentMethod`:
  - `promptpay` (QR)
  - `stripe` (checkout URL เมื่อกำหนดค่าแล้ว)

## 6. การใช้งานผ่าน LINE
- คำอย่าง `buy`, `price`, `มีอะไรบ้าง`, `ราคา` จะกระตุ้นเส้นทางแนะนำสินค้า
- บอทตอบข้อความแบบกระชับและแนะนำสินค้า

## 7. Privacy และ DSR
- `POST /privacy/consent`
- `GET /privacy/consent/:userId`
- `POST /privacy/dsr`
- ประเภท DSR: `access`, `delete`, `rectify`

## 8. เมตริกเรียลไทม์ (สำหรับดูผล)
สามารถดูได้จาก dashboard แอดมินหรือสตรีม `/ws` (`messages`, `orders`, `payments`)

## 9. การแก้ปัญหา
- 401 Unauthorized: `x-api-key` ไม่ถูกต้อง
- ไม่พบสินค้า: tenant ไม่มีข้อมูลสินค้า
- LINE ไม่ตอบ: คีย์/ลายเซ็นผิด
- Stripe URL ว่าง: ยังไม่ได้ตั้งค่า Stripe
