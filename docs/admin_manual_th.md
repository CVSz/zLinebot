# คู่มือแอดมิน ZLineBot (TH)

## 1. ขอบเขตงานปฏิบัติการ
แอดมินดูแลการตั้งค่า tenant การเงิน compliance และการรับมือ incident

## 2. ช่องทางแอดมิน
- หน้าเว็บ dashboard (`admin/`) สำหรับ realtime metrics
- API สำคัญ:
  - `GET /admin/health`
  - `GET /admin/billing`
  - `POST /admin/audit/ledger-export`
  - `POST /privacy/consent`
  - `POST /privacy/dsr`

## 3. โมเดลการควบคุมสิทธิ์
- middleware ตรวจ `x-api-key`
- ใช้ `x-tenant-id` เพื่อกำหนด tenant
- ตั้ง schema เป็น `tenant_<id>, public`

## 4. Runbook ด้านบิล
1. ตรวจว่ามี invoice
2. ตรวจ header ของ tenant ให้ถูกต้อง
3. กระทบยอดข้อมูล order และ payment

## 5. Runbook ด้าน Privacy/Compliance
- บันทึกและตรวจสอบ consent
- ดำเนินการ DSR (`access`, `delete`, `rectify`)
- ส่งออก ledger สำหรับ audit

## 6. การเฝ้าระวังระบบ
- Health: `GET /health`
- Realtime metrics: `/ws`
- กลุ่มเหตุการณ์: message/order/payment

## 7. แนวทางรับมือ incident
- 401 พุ่ง: ตรวจ key rotation และ env
- 429 พุ่ง: ตรวจทราฟฟิกผิดปกติ/retry loop
- metrics หาย: ตรวจ Redis/event publish/websocket path

## 8. เช็กลิสต์ความปลอดภัย
- ห้ามเปิดเผย API key
- บังคับ TLS ที่ edge
- มี backup และซ้อม restore
- จำกัดการเข้าถึงระบบแอดมิน
