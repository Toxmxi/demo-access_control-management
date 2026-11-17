# Sentinel Access Control Dashboard

ต้นแบบเว็บจัดการ Access Control ด้วย React, Vite และ Tailwind CSS

## เริ่มใช้งาน

```bash
npm install
npm run dev
```

เปิด URL ที่ Vite แสดงใน Terminal

บน Windows PowerShell หาก Execution Policy บล็อก `npm.ps1` ให้ใช้:

```powershell
npm.cmd install
npm.cmd run dev
```

ตรวจสอบ production build ในเครื่องด้วย `npm.cmd run build`

## บัญชีทดลอง

- Admin: `admin@sentinel.co.th` / `sentinel123`
- Viewer: `viewer@sentinel.co.th` / `demo123`

Viewer ดูข้อมูลและรายงานได้ แต่ไม่มีสิทธิ์เพิ่ม แก้ไข หรือลบข้อมูล

## ฟังก์ชันในต้นแบบ

- Dashboard สรุปสถานะอุปกรณ์และข้อมูลแยกตามอาคาร
- จัดการอุปกรณ์ อาคาร และ Control Zone พร้อมค้นหาและกรองข้อมูล
- แผนผังอาคาร: อัปโหลด PNG, JPG หรือ PDF, วาง/ลากตำแหน่งอุปกรณ์, ค้นหา, ซูม และเลื่อนแผนผัง
- รายงานทั้งหมด แยกตามสถานะ อาคาร ชั้น และ Control Zone พร้อมส่งออก CSV, Excel และพิมพ์เป็น PDF
- บันทึก Audit Log และแยกสิทธิ์ Admin / Viewer

## ขอบเขตการจัดเก็บข้อมูล

ต้นแบบนี้เก็บข้อมูลและบัญชีทดลองใน `localStorage` ของเบราว์เซอร์ เพื่อให้ทดลองใช้งานได้โดยไม่ต้องตั้งค่าเซิร์ฟเวอร์ ข้อมูลจึงไม่แชร์ข้ามเครื่องหรือผู้ใช้ และการ Login ยังไม่ใช่ระบบยืนยันตัวตนที่ปลอดภัยสำหรับใช้งานจริง ก่อนนำขึ้น Production ควรเชื่อมต่อ API และฐานข้อมูลฝั่งเซิร์ฟเวอร์ พร้อมระบบ Authentication/Authorization และ Audit Log ที่ตรวจสอบย้อนหลังได้

ไฟล์ floor plan สำหรับ Local prototype จำกัดขนาดไม่เกิน 1.5 MB เพื่อช่วยป้องกัน browser storage เต็ม ไฟล์จะเก็บใน browser profile ปัจจุบันเท่านั้น

## Local development security

Vite dev/preview server bind กับ `127.0.0.1` และส่ง security headers (CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` และ `Permissions-Policy`) สำหรับการตรวจสอบบน Local เท่านั้น หากต้องการเปิดให้เครื่องอื่นเข้าถึง ให้ทบทวน network exposure และ firewall ก่อน ไม่ควรใช้ dev server เป็น production server

ก่อน deploy ต้องตั้ง security headers ที่ production web server/reverse proxy ด้วย เพราะ Vite build ไม่ได้ฝัง response headers เหล่านี้ไว้ในไฟล์ static นอกจากนี้ CSP อนุญาต Google Fonts และ data URL สำหรับ floor plan ตามฟังก์ชันของ prototype; ให้ทบทวน allowlist อีกครั้งเมื่อเปลี่ยนแหล่ง asset หรือเพิ่ม integration

## โครงสร้างโค้ดสำหรับผู้รับช่วงต่อ

- ไฟล์ใน `src/` ใช้ชื่อแบบ `kebab-case` เพื่อให้ค้นหาตามหน้าที่ได้สม่ำเสมอ
- `src/main.jsx` เป็น entry point มาตรฐานของ Vite สำหรับ mount React และโหลด stylesheet
- `src/app.jsx` เก็บ state หลักและ handlers สำหรับ CRUD, รายงาน และแผนผัง พร้อมประกอบหน้าและ layout หลัก
- `src/components/shared-components.jsx` เก็บคอมโพเนนต์ที่ใช้ซ้ำ เช่น Login, page header, status badge และ metric card
- `src/components/dashboard-page.jsx` เก็บหน้า Dashboard และกราฟ
- `src/components/device-management-pages.jsx` เก็บหน้าจัดการอุปกรณ์ อาคาร และ Control Zone
- `src/components/map-page.jsx` เก็บหน้าแผนผังและภาพประกอบ floor plan
- `src/components/reports-page.jsx` เก็บหน้ารายงานและตารางรายงาน
- `src/components/admin-pages.jsx` เก็บหน้า Audit Log, ผู้ใช้งาน และ modal
- `src/app-constants.js` เก็บ navigation และค่าคงที่ที่ใช้ร่วมกัน; `src/csv-utils.js` เก็บ helper สำหรับ CSV
- `src/excel-export.js` สร้างไฟล์ XLSX จากข้อมูลรายงาน
- `src/global-styles.css` และ `src/charts.css` กำหนดหน้าตาและ chart styles
- `vite.config.js`, `tailwind.config.js` และ `postcss.config.js` เป็นการตั้งค่าเครื่องมือ build/style

คอมเมนต์ใน source อธิบายหน้าที่ของ helpers, handlers และ components จุดสำคัญ ข้อมูลที่ขึ้นต้นด้วย `initial...` และกราฟแนวโน้มใน Dashboard เป็นข้อมูลจำลอง ตัวอักษร “LIVE MONITORING” ในปัจจุบันจึงเป็นเพียงสถานะตัวอย่าง ไม่ได้เชื่อมต่ออุปกรณ์หรือรับข้อมูลสด

## แนวทางก่อนเชื่อมต่อ Real-Time

1. สร้าง backend API และฐานข้อมูลเป็นแหล่งข้อมูลกลางสำหรับอุปกรณ์ อาคาร ชั้น floor plan, zones, users และ audit logs แทนการเขียน `localStorage` โดยตรง
2. เพิ่ม Authentication/Authorization ฝั่ง server และตรวจสิทธิ์ทุกคำสั่งแก้ไขหรือลบ; บัญชีทดลองใน `signIn` เป็น client-side เท่านั้น
3. กำหนด schema ของ telemetry เช่น device ID, status, timestamp และ event ID พร้อม validation, duplicate handling และนโยบายเมื่ออุปกรณ์ offline
4. เริ่มเชื่อมข้อมูลปกติผ่าน REST API แล้วเลือก WebSocket หรือ Server-Sent Events สำหรับสถานะ/เหตุการณ์ที่ต้องอัปเดตสด โดยให้ server เป็นผู้กระจาย event และมี reconnect/backoff กับการดึง snapshot กลับหลัง reconnect
5. ระบุสถานะ connection และเวลาที่ได้รับข้อมูลล่าสุดใน UI; เปลี่ยนข้อความ “LIVE MONITORING” ให้สะท้อนการเชื่อมต่อจริง และแยกสถานะจำลองออกจากสถานะอุปกรณ์จริง
6. เพิ่ม integration tests สำหรับสิทธิ์, การบันทึกตำแหน่ง, การ reconnect, event ซ้ำ/มาผิดลำดับ และบันทึก audit ก่อนเปิดใช้กับระบบจริง

ขณะนี้ให้พัฒนาและตรวจสอบบน Local ด้วย Vite (`npm.cmd run dev`) เท่านั้น ไม่มีการตั้งค่า backend, cloud service หรือ Real-Time connection ในโปรเจกต์ปัจจุบัน
