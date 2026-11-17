import {
  LayoutDashboard, Map, Shield, Building2, Layers3, FileSpreadsheet, ClipboardList, Users,
} from 'lucide-react'

export const navItems = [
  { id: 'dashboard', label: 'ภาพรวมระบบ', icon: LayoutDashboard, group: 'ภาพรวม' },
  { id: 'map', label: 'แผนผังอาคาร', icon: Map, group: 'ภาพรวม' },
  { id: 'devices', label: 'อุปกรณ์ Access Control', icon: Shield, group: 'จัดการระบบ', count: '10' },
  { id: 'buildings', label: 'อาคารและชั้น', icon: Building2, group: 'จัดการระบบ' },
  { id: 'zones', label: 'Control Zones', icon: Layers3, group: 'จัดการระบบ' },
  { id: 'reports', label: 'รายงานและส่งออก', icon: FileSpreadsheet, group: 'เครื่องมือ' },
  { id: 'audit', label: 'บันทึกกิจกรรม', icon: ClipboardList, group: 'เครื่องมือ' },
  { id: 'users', label: 'ผู้ใช้งาน', icon: Users, group: 'ตั้งค่า', admin: true },
]
export const statusClass = { Active: 'active', Inactive: 'inactive', Warning: 'warning', Unknown: 'unknown' }
export const statusThai = { Active: 'ทำงานปกติ', Inactive: 'ไม่ทำงาน', Warning: 'แจ้งเตือน', Unknown: 'ไม่ทราบสถานะ' }
export const colorList = ['#47c99a', '#f06b72', '#f1b84b', '#a0a9b8']
