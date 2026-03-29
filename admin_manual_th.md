# คู่มือแอดมิน ZLineBot (TH)

## ขอบเขตงานแอดมิน
ดูแล tenant, การเงิน, compliance, observability และการรับมือ incident

## ช่องทางแอดมิน
- Dashboard: ดู metrics แบบเรียลไทม์จาก `/ws`
- Billing: `/admin/billing`
- API สำหรับแอดมิน:
  - `GET /admin/health`
  - `GET /admin/billing`
  - `POST /admin/audit/ledger-export`
  - `POST /privacy/consent`
  - `POST /privacy/dsr`

## การควบคุมสิทธิ์
- `x-api-key` ต้องตรงกับ `TENANT_API_KEY`
- tenant มาจาก `x-tenant-id` (ค่าเริ่มต้น `demo`)
- schema ที่ใช้งาน: `tenant_<id>, public`

## งานด้านบิล
1. ตรวจสอบว่ามีข้อมูลใบแจ้งหนี้
2. ตรวจสอบ header tenant/api-key จากฝั่งแอดมิน
3. กระทบยอดกับข้อมูล order/payment

## ออดิทและความเป็นส่วนตัว
- Ledger export: `POST /admin/audit/ledger-export`
- Consent endpoints
- DSR: `access`, `delete`, `rectify`

## การเฝ้าระวังระบบ
- Events: `message`, `order`, `payment`
- Health: `GET /health`
- Realtime metrics ทาง websocket ทุก 1 วินาที

## แนวทางรับมือเหตุขัดข้อง
- 401 พุ่ง: ตรวจคีย์/การตั้งค่า
- 429 พุ่ง: ตรวจ retry loop หรือทราฟฟิกผิดปกติ
- ไม่เห็น metrics: ตรวจ Redis, websocket route, event emission
