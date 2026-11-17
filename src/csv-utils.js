// Escape เครื่องหมายคำพูดใน CSV เพื่อป้องกันค่าที่มี comma หรือ quote ทำให้คอลัมน์เพี้ยน
export const csvCell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`
