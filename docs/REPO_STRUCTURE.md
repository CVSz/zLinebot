# Repository Structure & Upgrade Readiness

เอกสารนี้สรุปโครงสร้าง repository เพื่อให้ onboarding ง่ายขึ้นและรองรับการอัปเกรดในอนาคตได้ดีขึ้น

## 1) โฟลเดอร์หลัก

- `app/` — Backend service หลัก (TypeScript/Express, LINE webhook, business services)
- `admin/` — Admin dashboard (React + Vite)
- `mobile/` — โค้ดตัวอย่าง/โมดูล mobile app
- `db/` — Schema SQL แยกตามโดเมน (identity, billing, privacy, risk, events ฯลฯ)
- `docs/` — คู่มือการใช้งานและ OpenAPI
- `docker/`, `k8s/`, `infra/`, `cloudflare/`, `cloud/` — Deployment และ infrastructure
- `ml/` — โมดูล ML simulation/training
- `scripts/` — automation scripts สำหรับ install/lint/deploy

> Note: เอกสาร `readme_en.md` และ `readme_th.md` ถูกย้ายไปที่ `docs/` แล้ว

## 2) จุดที่ควรยึดเป็นมาตรฐานก่อนอัปเกรด

1. **Environment contract เดียวกันทุก service**
   - กำหนดค่าที่ต้องมีใน `.env.example` ให้ครบ
   - เพิ่ม validation ของ env ในโค้ด (backend)

2. **Type-check และ lint ต้องรันได้โดยไม่พึ่ง dependency หนักเกินจำเป็น**
   - แยก optional runtime dependency ที่ต้องดาวน์โหลด binary ออกเป็น profile
   - CI ควรมีโหมด `fast-check` สำหรับตรวจคุณภาพโค้ดพื้นฐาน

3. **Security-first webhook handling**
   - ตรวจ signature ด้วย constant-time compare
   - บันทึก error จาก upstream API ให้ตรวจสอบได้

4. **เอกสารสถาปัตยกรรมเดียว**
   - อัปเดตไฟล์นี้ทุกครั้งที่เพิ่ม top-level directory
   - ระบุ owner/ทีมรับผิดชอบในโฟลเดอร์สำคัญ (ภายหลังอาจแยกเป็น CODEOWNERS)

## 3) รายการตรวจสอบก่อน release

- รัน lint/type-check/unit tests ให้ครบ
- ตรวจ schema migration กับสภาพแวดล้อม staging
- ตรวจ webhook signature/key rotation
- ตรวจเวอร์ชัน dependencies สำคัญ (`express`, `typescript`, `stripe`, `kafkajs`, `onnxruntime-node`)
- อัปเดตเอกสารใน `docs/` หากมี endpoint หรือ behavior เปลี่ยน
