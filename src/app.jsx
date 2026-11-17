import { useEffect, useMemo, useRef, useState } from 'react'
import { Bell, Check, ChevronDown, ChevronRight, Menu, MoreHorizontal, Search, ShieldCheck, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { navItems, statusThai } from './app-constants.js'
import { csvCell } from './csv-utils.js'
import { Login } from './components/shared-components.jsx'
import { Dashboard } from './components/dashboard-page.jsx'
import { DevicesPage, BuildingsPage, ZonesPage } from './components/device-management-pages.jsx'
import { MapPage } from './components/map-page.jsx'
import { ReportsPage } from './components/reports-page.jsx'
import { AuditPage, UsersPage, Modal } from './components/admin-pages.jsx'
import { createExcelFile } from './excel-export.js'

// ข้อมูลตั้งต้นสำหรับทดลองในเครื่อง; เมื่อไม่มีข้อมูลใน localStorage ระบบจะใช้ชุดนี้
const initialBuildings = [
  { id: 'BKK-01', name: 'สำนักงานใหญ่', floors: 12, address: 'อาคารสยามทาวเวอร์, กรุงเทพฯ' },
  { id: 'BKK-02', name: 'อาคารปฏิบัติการ', floors: 8, address: 'ถนนพระราม 9, กรุงเทพฯ' },
  { id: 'CNX-01', name: 'ศูนย์เทคโนโลยีเชียงใหม่', floors: 5, address: 'อำเภอเมือง, เชียงใหม่' },
]
// สร้างเวลาตัวอย่างย้อนหลังสำหรับอุปกรณ์จำลอง ไม่ใช่เวลา telemetry จากอุปกรณ์จริง
const mockTime = (minutesAgo) => new Date(Date.now() - minutesAgo * 60_000).toLocaleString('sv-SE', { timeZone: 'Asia/Bangkok' }).replace('T', ' ')
const initialZones = [
  { id: 'Z-001', name: 'พื้นที่ส่วนกลาง', detail: 'พื้นที่ต้อนรับและส่วนกลาง', color: '#47c99a' },
  { id: 'Z-002', name: 'พื้นที่สำนักงาน', detail: 'พื้นที่ทำงานสำหรับพนักงาน', color: '#5e9cff' },
  { id: 'Z-003', name: 'พื้นที่ความปลอดภัยสูง', detail: 'ห้องเซิร์ฟเวอร์และห้องควบคุม', color: '#b18cff' },
  { id: 'Z-004', name: 'พื้นที่จำกัด', detail: 'ต้องได้รับอนุญาตพิเศษ', color: '#f1b84b' },
]
// ข้อมูล Access Control ตัวอย่าง; เปลี่ยนเป็นข้อมูลจาก API ก่อนใช้กับอุปกรณ์จริง
const initialDevices = [
  { id: 'AC-001', name: 'ประตูทางเข้าหลัก', type: 'เครื่องอ่านบัตร', building: 'BKK-01', floor: '1', door: 'Main Entrance', equipment: 'EQ-AC-1001', model: 'HID Signo 40', zone: 'Z-001', status: 'Active', x: 25, y: 33, updated: mockTime(3) },
  { id: 'AC-002', name: 'ประตูล็อบบี้ฝั่งตะวันตก', type: 'ชุดควบคุมประตู', building: 'BKK-01', floor: '1', door: 'West Lobby', equipment: 'EQ-AC-1002', model: 'HID Signo 20', zone: 'Z-001', status: 'Active', x: 72, y: 53, updated: mockTime(6) },
  { id: 'AC-003', name: 'ห้องเซิร์ฟเวอร์', type: 'เครื่องอ่านบัตร', building: 'BKK-01', floor: '5', door: 'Server Room 5A', equipment: 'EQ-AC-1003', model: 'HID Signo 40K', zone: 'Z-003', status: 'Warning', x: 54, y: 36, updated: mockTime(14) },
  { id: 'AC-004', name: 'ประตูสำนักงานชั้น 3', type: 'ชุดควบคุมประตู', building: 'BKK-01', floor: '3', door: 'Office East 3F', equipment: 'EQ-AC-1004', model: 'AXIS A1610', zone: 'Z-002', status: 'Inactive', x: 41, y: 63, updated: mockTime(48) },
  { id: 'AC-005', name: 'ประตูห้องประชุมใหญ่', type: 'เครื่องอ่านบัตร', building: 'BKK-01', floor: '4', door: 'Meeting Room A', equipment: 'EQ-AC-1005', model: 'HID Signo 20', zone: 'Z-002', status: 'Active', x: 64, y: 25, updated: mockTime(4) },
  { id: 'AC-006', name: 'ประตูคลังสินค้า', type: 'ชุดควบคุมประตู', building: 'BKK-02', floor: '1', door: 'Warehouse North', equipment: 'EQ-AC-2001', model: 'AXIS A1210', zone: 'Z-004', status: 'Inactive', x: 68, y: 58, updated: mockTime(90) },
  { id: 'AC-007', name: 'ทางเข้าห้องปฏิบัติการ', type: 'เครื่องอ่านบัตร', building: 'BKK-02', floor: '2', door: 'Lab Entrance', equipment: 'EQ-AC-2002', model: 'HID Signo 40', zone: 'Z-003', status: 'Active', x: 35, y: 44, updated: mockTime(7) },
  { id: 'AC-008', name: 'ประตูชั้น 2 ฝั่งเหนือ', type: 'ชุดควบคุมประตู', building: 'CNX-01', floor: '2', door: 'North Wing', equipment: 'EQ-AC-3001', model: 'HID Signo 20', zone: 'Z-002', status: 'Unknown', x: 51, y: 48, updated: mockTime(14 * 60) },
  { id: 'AC-009', name: 'ทางเข้าศูนย์ข้อมูล', type: 'เครื่องอ่านบัตร', building: 'BKK-01', floor: '5', door: 'Data Center', equipment: 'EQ-AC-1009', model: 'HID Signo 40K', zone: 'Z-003', status: 'Active', x: 79, y: 70, updated: mockTime(1) },
  { id: 'AC-010', name: 'ประตูทางเชื่อม', type: 'ชุดควบคุมประตู', building: 'BKK-02', floor: '1', door: 'Connector Gate', equipment: 'EQ-AC-2010', model: 'AXIS A1610', zone: 'Z-001', status: 'Warning', x: 22, y: 72, updated: mockTime(30) },
]




// Keep uploaded plans within localStorage's practical quota for this prototype.
const maxFloorPlanBytes = 1.5 * 1024 * 1024
// อ่านข้อมูลที่เก็บใน browser; ใช้ fallback เมื่อยังไม่มีข้อมูลหรือ JSON อ่านไม่ได้
const readStore = (key, fallback) => {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback } catch { return fallback }
}
// บันทึกข้อมูลเฉพาะ browser ปัจจุบัน; localStorage ไม่ซิงก์ข้ามเครื่องหรือผู้ใช้
const saveStore = (key, value) => localStorage.setItem(key, JSON.stringify(value))
// จัดรูปแบบ timestamp สำหรับประวัติกิจกรรมที่แสดงใน UI
const dateTime = () => new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })


/**
 * คอมโพเนนต์หลัก: เก็บ state ของระบบ, จัดการ CRUD/การนำเข้า-ส่งออก,
 * และเชื่อมข้อมูลไปยังหน้าต่าง ๆ ปัจจุบันใช้ localStorage สำหรับ prototype เท่านั้น
 */
function App() {
  const [user, setUser] = useState(() => readStore('ac_user', null))
  const [page, setPage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [buildings, setBuildings] = useState(() => readStore('ac_buildings', initialBuildings))
  const [zones, setZones] = useState(() => readStore('ac_zones', initialZones))
  const [devices, setDevices] = useState(() => readStore('ac_devices', initialDevices))
  const [plans, setPlans] = useState(() => readStore('ac_plans', {}))
  const [audit, setAudit] = useState(() => readStore('ac_audit', [{ action: 'เข้าสู่ระบบ', user: 'System Admin', detail: 'เริ่มต้นใช้งานระบบ', time: '11 พ.ย. 2568 08:00' }]))
  const plansRef = useRef(plans)
  const auditRef = useRef(audit)
  const [modal, setModal] = useState(null)
  const [search, setSearch] = useState('')
  const [globalSearch, setGlobalSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ทั้งหมด')
  const [buildingFilter, setBuildingFilter] = useState('ทั้งหมด')
  const [zoneFilter, setZoneFilter] = useState('ทั้งหมด')
  const [selectedBuilding, setSelectedBuilding] = useState('BKK-01')
  const [selectedFloor, setSelectedFloor] = useState('1')
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [mapSearch, setMapSearch] = useState('')
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(null)
  const [positionDraft, setPositionDraft] = useState(null)
  const [notice, setNotice] = useState('')
  const fileInput = useRef(null)
  const mapRef = useRef(null)
  const noticeTimer = useRef(null)

  // เพิ่มรายการกิจกรรมล่าสุด พร้อมผู้ใช้และเวลาปัจจุบัน (เก็บย้อนหลังสูงสุด 100 รายการ)
  const addAudit = (action, detail, actor = user?.name || 'System Admin') => {
    const entry = { action, user: actor, detail, time: dateTime() }
    const nextAudit = [entry, ...auditRef.current].slice(0, 100)
    if (!persistStore('ac_audit', nextAudit, 'ประวัติกิจกรรม')) return false
    auditRef.current = nextAudit
    setAudit(nextAudit)
    return true
  }
  const notifyAction = (message, auditSaved) => {
    notify(auditSaved ? message : `${message} แต่บันทึกประวัติกิจกรรมไม่สำเร็จ`)
  }
  // แสดง toast หนึ่งรายการในแต่ละครั้ง และล้าง timer เมื่อเปลี่ยนข้อความหรือ unmount
  const notify = (text) => {
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current)
    setNotice(text)
    noticeTimer.current = window.setTimeout(() => {
      setNotice('')
      noticeTimer.current = null
    }, 2800)
  }
  // แจ้งความล้มเหลวจาก quota/security settings แทนการปล่อย storage exception เงียบ ๆ
  const persistStore = (key, value, label) => {
    try {
      saveStore(key, value)
      return true
    } catch (error) {
      console.error(`Unable to save ${key}`, error)
      notify(`บันทึก${label}ไม่สำเร็จ พื้นที่จัดเก็บในเบราว์เซอร์อาจเต็ม`)
      return false
    }
  }
  useEffect(() => () => {
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current)
  }, [])
  // เปลี่ยน state หลังยืนยันว่า collection เขียนลง localStorage สำเร็จ
  const persistBuildings = (nextBuildings) => {
    if (!persistStore('ac_buildings', nextBuildings, 'อาคาร')) return false
    setBuildings(nextBuildings)
    return true
  }
  const persistZones = (nextZones) => {
    if (!persistStore('ac_zones', nextZones, 'Control Zone')) return false
    setZones(nextZones)
    return true
  }
  const persistPlans = (nextPlans) => {
    if (!persistStore('ac_plans', nextPlans, 'แผนผัง')) return false
    plansRef.current = nextPlans
    setPlans(nextPlans)
    return true
  }
  // บันทึกชุดอุปกรณ์ก่อนเปลี่ยน React state เพื่อไม่รายงานว่าสำเร็จหาก storage เขียนไม่ได้
  const persistDevices = (nextDevices) => {
    if (!persistStore('ac_devices', nextDevices, 'อุปกรณ์')) return false
    setDevices(nextDevices)
    return true
  }
  // สรุปจำนวนอุปกรณ์ตามสถานะใหม่เมื่อรายการอุปกรณ์เปลี่ยน
  const counts = useMemo(() => ({
    total: devices.length,
    Active: devices.filter((d) => d.status === 'Active').length,
    Inactive: devices.filter((d) => d.status === 'Inactive').length,
    Warning: devices.filter((d) => d.status === 'Warning').length,
    Unknown: devices.filter((d) => d.status === 'Unknown').length,
  }), [devices])
  const building = buildings.find((item) => item.id === selectedBuilding) || buildings[0]
  const floorDevices = useMemo(() => devices.filter((d) => d.building === selectedBuilding && d.floor === selectedFloor),
    [devices, selectedBuilding, selectedFloor])
  // กรองรายการในหน้าจัดการอุปกรณ์ตามคำค้น สถานะ อาคาร และ Control Zone
  const visibleDevices = useMemo(() => devices.filter((d) => {
    const q = search.toLowerCase()
    const matchesText = !q || [d.id, d.name, d.door, d.model, d.equipment].some((v) => v.toLowerCase().includes(q))
    return matchesText && (statusFilter === 'ทั้งหมด' || d.status === statusFilter) &&
      (buildingFilter === 'ทั้งหมด' || d.building === buildingFilter) && (zoneFilter === 'ทั้งหมด' || d.zone === zoneFilter)
  }), [devices, search, statusFilter, buildingFilter, zoneFilter])
  const mapFiltered = useMemo(() => {
    const query = mapSearch.toLowerCase()
    return floorDevices.filter((d) => !query || [d.id, d.name, d.door].some((v) => v.toLowerCase().includes(query)))
  }, [floorDevices, mapSearch])

  // ตรวจบัญชีตัวอย่างฝั่ง client; ห้ามใช้แทน Authentication จริงใน production
  const signIn = (event) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const email = String(data.get('email')).trim()
    const pass = String(data.get('password'))
    const accounts = [
      { name: 'System Admin', email: 'admin@sentinel.co.th', password: 'sentinel123', role: 'Admin' },
      { name: 'Security Viewer', email: 'viewer@sentinel.co.th', password: 'demo123', role: 'Viewer' },
    ]
    const account = accounts.find((item) => item.email === email.toLowerCase() && item.password === pass)
    if (!account) return notify('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
    const nextUser = { name: account.name, email: account.email, role: account.role }
    const sessionSaved = persistStore('ac_user', nextUser, 'session')
    setUser(nextUser)
    const auditSaved = addAudit('เข้าสู่ระบบ', 'เข้าสู่ระบบสำเร็จ', nextUser.name)
    if (sessionSaved) notifyAction(`ยินดีต้อนรับ ${nextUser.name}`, auditSaved)
  }
  // ออกจากระบบจำลองและล้างข้อมูล session ผู้ใช้จาก browser
  const signOut = () => { addAudit('ออกจากระบบ', 'ออกจากระบบ'); setUser(null); localStorage.removeItem('ac_user') }
  // เปลี่ยนหน้าและปิดเมนูมือถือ พร้อมล้างอุปกรณ์ที่เลือกไว้บนแผนผัง
  const changePage = (id) => { setPage(id); setMobileMenu(false); setSelectedDevice(null) }
  const canEdit = user?.role !== 'Viewer'

  // ตรวจอาคาร/ชั้นและบันทึกอุปกรณ์ใหม่หรือแก้ไข; พิกัดเดิมติดตามอุปกรณ์ผ่าน ID
  const saveDevice = (data) => {
    const assignedBuilding = buildings.find((item) => item.id === data.building)
    if (!assignedBuilding || Number(data.floor) < 1 || Number(data.floor) > assignedBuilding.floors) return notify('ชั้นที่ระบุต้องอยู่ภายในจำนวนชั้นของอาคาร')
    let nextDevices; let auditSaved
    if (data._oldId) {
      const { _oldId, ...next } = data
      if (devices.some((item) => item.id === data.id && item.id !== _oldId)) return notify('Device ID นี้มีอยู่แล้ว')
      if (!devices.some((item) => item.id === _oldId)) return notify('ไม่พบอุปกรณ์ที่ต้องการแก้ไข กรุณาเปิดรายการอีกครั้ง')
      nextDevices = devices.map((item) => item.id === _oldId ? { ...item, ...next, updated: dateTime() } : item)
      if (!persistDevices(nextDevices)) return
      setSelectedDevice((selected) => selected?.id === _oldId ? nextDevices.find((item) => item.id === data.id) : selected)
      setPositionDraft((draft) => draft?.id === _oldId ? null : draft)
      auditSaved = addAudit('แก้ไขอุปกรณ์', `${data.id} — ${data.name}`)
    } else {
      const { _oldId, ...next } = data
      nextDevices = [...devices, { ...next, x: Number.isFinite(Number(next.x)) ? Number(next.x) : 50, y: Number.isFinite(Number(next.y)) ? Number(next.y) : 50, updated: dateTime() }]
      if (!persistDevices(nextDevices)) return
      auditSaved = addAudit('เพิ่มอุปกรณ์', `${data.id} — ${data.name}`)
    }
    setModal(null); notifyAction('บันทึกข้อมูลอุปกรณ์แล้ว', auditSaved)
  }
  // ยืนยันและลบอุปกรณ์ พร้อมอัปเดต storage และ audit log
  const deleteDevice = (device) => {
    if (!window.confirm(`ยืนยันลบ ${device.id} — ${device.name}?`)) return
    if (!persistDevices(devices.filter((d) => d.id !== device.id))) return
    setPositionDraft((draft) => draft?.id === device.id ? null : draft)
    const auditSaved = addAudit('ลบอุปกรณ์', `${device.id} — ${device.name}`)
    setModal(null); notifyAction('ลบอุปกรณ์แล้ว', auditSaved)
  }
  // บันทึกอาคาร โดยห้ามลดจำนวนชั้นจนต่ำกว่าชั้นที่มีอุปกรณ์ติดตั้ง
  const saveBuilding = (data) => {
    const exists = buildings.some((item) => item.id === data.id)
    if (devices.some((device) => device.building === data.id && Number(device.floor) > data.floors)) return notify('ไม่สามารถลดจำนวนชั้นต่ำกว่าชั้นที่มีอุปกรณ์ติดตั้งอยู่')
    let auditSaved
    if (modal?.type === 'building' && modal.value) {
      const nextBuildings = buildings.map((b) => b.id === modal.value.id ? data : b)
      if (!persistBuildings(nextBuildings)) return
      auditSaved = addAudit('แก้ไขอาคาร', `${data.id} — ${data.name}`)
    } else if (exists) return notify('Building ID นี้มีอยู่แล้ว')
    else {
      if (!persistBuildings([...buildings, data])) return
      auditSaved = addAudit('เพิ่มอาคาร', `${data.id} — ${data.name}`)
    }
    setModal(null); notifyAction('บันทึกข้อมูลอาคารแล้ว', auditSaved)
  }
  // ลบอาคารได้เฉพาะเมื่อไม่มีอุปกรณ์เชื่อมโยง
  const deleteBuilding = (item) => {
    if (devices.some((d) => d.building === item.id)) return notify('ยังมีอุปกรณ์เชื่อมโยงกับอาคารนี้')
    if (!window.confirm(`ลบอาคาร ${item.name}?`)) return
    if (!persistBuildings(buildings.filter((b) => b.id !== item.id))) return
    notifyAction('ลบอาคารแล้ว', addAudit('ลบอาคาร', item.name))
  }
  // เพิ่มหรือแก้ไข Control Zone และป้องกัน ID ซ้ำในกรณีเพิ่มใหม่
  const saveZone = (data) => {
    let auditSaved
    if (modal?.value) {
      if (!persistZones(zones.map((z) => z.id === modal.value.id ? data : z))) return
      auditSaved = addAudit('แก้ไข Control Zone', data.name)
    }
    else {
      if (zones.some((z) => z.id === data.id)) return notify('Zone ID นี้มีอยู่แล้ว')
      if (!persistZones([...zones, data])) return
      auditSaved = addAudit('เพิ่ม Control Zone', data.name)
    }
    setModal(null); notifyAction('บันทึก Control Zone แล้ว', auditSaved)
  }
  // ลบ Zone ได้หลังย้ายอุปกรณ์ที่เชื่อมโยงออกแล้วเท่านั้น
  const deleteZone = (item) => {
    if (devices.some((d) => d.zone === item.id)) return notify('กรุณาย้ายอุปกรณ์ออกจาก Zone ก่อนลบ')
    if (!window.confirm(`ลบ ${item.name}?`)) return
    if (!persistZones(zones.filter((z) => z.id !== item.id))) return
    notifyAction('ลบ Zone แล้ว', addAudit('ลบ Control Zone', item.name))
  }
  // สร้างรายงานอุปกรณ์เป็น CSV โดย escape cell และใส่ BOM เพื่อรองรับภาษาไทย
  const exportCsv = () => {
    const rows = devices.map((d) => [d.id, d.name, d.type, buildings.find((b) => b.id === d.building)?.name || d.building, d.floor, d.door, d.equipment, d.model, zones.find((z) => z.id === d.zone)?.name || d.zone, statusThai[d.status], `${d.x}, ${d.y}`, d.updated])
    const csv = ['Device ID,Device Name,Device Type,Building,Floor,Door Name,Equipment No.,Model,Control Zone,Status,Location X/Y,Last Update', ...rows.map((row) => row.map(csvCell).join(','))].join('\r\n')
    downloadBlob('\ufeff' + csv, 'access-control-report.csv', 'text/csv;charset=utf-8')
    notifyAction('ส่งออก CSV สำเร็จ', addAudit('ส่งออกรายงาน CSV', `ส่งออก ${rows.length} รายการ`))
  }
  // สร้าง workbook Excel จากรายการอุปกรณ์ปัจจุบัน
  const exportExcel = () => {
    const columns = ['Device ID', 'Device Name', 'Device Type', 'Building', 'Floor', 'Door Name', 'Equipment No.', 'Model', 'Control Zone', 'Status', 'Location X', 'Location Y', 'Last Update']
    const rows = devices.map((d) => [d.id, d.name, d.type, buildings.find((b) => b.id === d.building)?.name || d.building, Number(d.floor), d.door, d.equipment, d.model, zones.find((z) => z.id === d.zone)?.name || d.zone, statusThai[d.status], d.x, d.y, d.updated])
    downloadBlob(createExcelFile(columns, rows), 'access-control-report.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    notifyAction('ส่งออก Excel สำเร็จ', addAudit('ส่งออกรายงาน Excel', `ส่งออก ${rows.length} รายการ`))
  }
  // สร้างไฟล์ดาวน์โหลดชั่วคราวจากข้อมูลในหน่วยความจำ
  const downloadBlob = (content, filename, type) => {
    const url = URL.createObjectURL(new Blob([content], { type })); const link = document.createElement('a')
    link.href = url; link.download = filename; link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  // เปิด print dialog ของ browser; ผู้ใช้เลือก Save as PDF เอง
  const exportPdf = () => { addAudit('พิมพ์รายงาน PDF', 'สร้างรายงานสำหรับบันทึกเป็น PDF'); window.print() }
  // อ่าน floor plan เป็น data URL แล้วเก็บแยกตามรหัสอาคารและชั้น
  const handleUpload = (file) => {
    if (!file) return
    if (!['image/png', 'image/jpeg', 'application/pdf'].includes(file.type)) return notify('รองรับเฉพาะไฟล์ PNG, JPG และ PDF')
    if (file.size > maxFloorPlanBytes) return notify('ไฟล์แผนผังต้องมีขนาดไม่เกิน 1.5 MB')
    if (file.size === 0) return notify('ไฟล์แผนผังว่างเปล่า กรุณาเลือกไฟล์ใหม่')
    const key = `${selectedBuilding}-${selectedFloor}`
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') return notify('อ่านไฟล์ไม่สำเร็จ กรุณาลองอีกครั้ง')
      const nextPlans = { ...plansRef.current, [key]: { name: file.name, type: file.type, data: reader.result } }
      if (!persistPlans(nextPlans)) return
      notifyAction('อัปโหลดแผนผังเรียบร้อยแล้ว', addAudit('อัปโหลดแผนผัง', `${building?.name || selectedBuilding} ชั้น ${selectedFloor}: ${file.name}`))
    }
    reader.onerror = () => notify('อ่านไฟล์ไม่สำเร็จ กรุณาลองอีกครั้ง')
    reader.readAsDataURL(file)
  }
  // จำกัดพิกัดหมุดให้อยู่ภายในขอบที่มองเห็นได้ของแผนผัง
  const clampDevicePosition = (x, y) => {
    return { x: Math.max(2, Math.min(98, x)), y: Math.max(3, Math.min(97, y)) }
  }
  // เริ่มลาก marker และจับ pointer เพื่อให้การลากไม่ขาดเมื่อ pointer ออกจากหมุด
  const startMarkerDrag = (event, device) => {
    if (!canEdit) { setSelectedDevice(device); return }
    event.preventDefault(); event.stopPropagation()
    if (positionDraft) return notify('กรุณาบันทึกหรือยกเลิกตำแหน่งที่ค้างอยู่ก่อน')
    if (mapRef.current) {
      event.currentTarget.setPointerCapture(event.pointerId)
      setDragging({ id: device.id, x: device.x, y: device.y, moved: false })
    }
    setSelectedDevice(device)
  }
  // คำนวณตำแหน่งร่างระหว่างลาก โดยยังไม่เขียนทับตำแหน่งที่บันทึกไว้
  const moveMarker = (event) => {
    if (!dragging || dragging.place || !mapRef.current) return
    const rect = mapRef.current.getBoundingClientRect()
    const position = clampDevicePosition(
      ((event.clientX - rect.left) / rect.width) * 100,
      ((event.clientY - rect.top) / rect.height) * 100)
    setDragging((current) => current && ({ ...current, ...position, moved: true }))
  }
  // จบการลากและคงตำแหน่งใหม่เป็น draft รอผู้ใช้กดยืนยัน
  const endMarkerDrag = () => {
    if (dragging?.moved) setPositionDraft({ id: dragging.id, x: dragging.x, y: dragging.y })
    setDragging(null)
  }
  // ยืนยันตำแหน่ง draft ลง localStorage ก่อนอัปเดต audit และแจ้งสำเร็จ
  const savePosition = () => {
    if (!positionDraft) return
    const device = devices.find((item) => item.id === positionDraft.id)
    if (!device) return notify('ไม่พบอุปกรณ์ที่ต้องการบันทึกตำแหน่ง กรุณาเปิดแผนผังอีกครั้ง')
    const position = clampDevicePosition(positionDraft.x, positionDraft.y)
    const nextDevices = devices.map((item) => item.id === device.id ? { ...item, ...position, updated: dateTime() } : item)
    if (!persistDevices(nextDevices)) return
    setPositionDraft(null)
    setSelectedDevice(nextDevices.find((item) => item.id === device.id))
    notifyAction('บันทึกตำแหน่งอุปกรณ์แล้ว', addAudit('ย้ายตำแหน่งอุปกรณ์', `${device.id} บน Floor Plan`))
  }
  // วางอุปกรณ์ที่เลือกลงจุดคลิกบนแผนผังเป็น draft
  const placeDeviceAt = (event) => {
    if (!dragging?.place || !mapRef.current) return
    const rect = mapRef.current.getBoundingClientRect()
    const position = clampDevicePosition(
      ((event.clientX - rect.left) / rect.width) * 100,
      ((event.clientY - rect.top) / rect.height) * 100)
    setPositionDraft({ id: dragging.id, ...position })
    setDragging(null); notify('ตรวจสอบตำแหน่งแล้วกด “บันทึกตำแหน่ง” เพื่อยืนยัน')
  }
  // จัดการการลากอุปกรณ์จากรายการด้านข้างมาวางบนแผนผังเป็น draft
  const dropDeviceAt = (event, device) => {
    if (positionDraft) return notify('กรุณาบันทึกหรือยกเลิกตำแหน่งที่ค้างอยู่ก่อน')
    if (!mapRef.current) return
    const rect = mapRef.current.getBoundingClientRect()
    const position = clampDevicePosition(
      ((event.clientX - rect.left) / rect.width) * 100,
      ((event.clientY - rect.top) / rect.height) * 100)
    setPositionDraft({ id: device.id, ...position })
    setDragging(null); notify('ตรวจสอบตำแหน่งแล้วกด “บันทึกตำแหน่ง” เพื่อยืนยัน')
  }
  // เริ่มลากพื้นหลังเพื่อเลื่อนมุมมอง โดยไม่เริ่ม pan ขณะลาก marker
  const beginPan = (event) => {
    if (event.button !== 0 || dragging) return
    event.currentTarget.setPointerCapture(event.pointerId)
    setOffset((o) => ({ ...o, startX: event.clientX - o.x, startY: event.clientY - o.y, panning: true }))
  }
  // เลื่อนแผนผังหรือส่งการเคลื่อนที่ต่อให้ระบบลาก marker
  const movePan = (event) => {
    if (dragging) return moveMarker(event)
    if (offset.panning) setOffset((o) => ({ ...o, x: event.clientX - o.startX, y: event.clientY - o.startY }))
  }
  // จบการเลื่อนแผนผังและปิดสถานะลาก marker
  const endPan = () => { endMarkerDrag(); if (offset.panning) setOffset((o) => ({ ...o, panning: false })) }
  // เริ่มโหมดวางตำแหน่งจากรายการอุปกรณ์ด้านข้าง
  const beginPlace = (device) => {
    if (positionDraft) return notify('กรุณาบันทึกหรือยกเลิกตำแหน่งที่ค้างอยู่ก่อน')
    setSelectedDevice(device); setDragging({ id: device.id, place: true }); notify('คลิกตำแหน่งบนแผนผังเพื่อวางอุปกรณ์')
  }

  if (!user) return <Login onSubmit={signIn} notice={notice} />
  return (
    <div className="app-shell">
      {mobileMenu && <button className="mobile-backdrop" onClick={() => setMobileMenu(false)} aria-label="ปิดเมนู" />}
      <aside className={`sidebar ${sidebarOpen ? '' : 'sidebar-collapsed'} ${mobileMenu ? 'sidebar-mobile-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><ShieldCheck size={21} strokeWidth={2.2} /></div>
          {sidebarOpen && <div className="brand-copy"><b>sentinel<span>.</span></b><small>ACCESS CONTROL</small></div>}
          <button className="collapse-btn" aria-label="ย่อเมนู" onClick={() => setSidebarOpen(!sidebarOpen)}>{sidebarOpen ? <PanelLeftClose size={17} /> : <PanelLeftOpen size={17} />}</button>
        </div>
        <div className="workspace-switch"><span className="workspace-logo">A</span>{sidebarOpen && <><span className="workspace-text"><b>Acme Corporation</b><small>องค์กรของคุณ</small></span><ChevronDown size={15} /></>}</div>
        <nav className="side-nav">
          {['ภาพรวม', 'จัดการระบบ', 'เครื่องมือ', 'ตั้งค่า'].map((group) => (
            <section key={group} className="nav-group">
              {sidebarOpen && <div className="nav-heading">{group}</div>}
              {navItems.filter((n) => n.group === group && (!n.admin || user.role === 'Admin')).map(({ id, label, icon: Icon, count }) => (
                <button key={id} onClick={() => changePage(id)} className={`nav-item ${page === id ? 'nav-active' : ''}`} title={!sidebarOpen ? label : undefined}>
                  <Icon size={18} strokeWidth={1.8} /><span>{sidebarOpen && label}</span>{count && sidebarOpen && <small className="nav-count">{devices.length}</small>}
                </button>
              ))}
            </section>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="system-health"><span className="pulse-dot" />{sidebarOpen && <><span>ระบบทำงานปกติ</span><span className="health-label">OPERATIONAL</span></>}</div>
          <button className="user-card" onClick={() => setModal({ type: 'profile' })}>
            <div className="avatar">{user.name.split(' ').map((s) => s[0]).join('').slice(0, 2)}</div>
            {sidebarOpen && <div className="user-meta"><b>{user.name}</b><small>{user.role === 'Admin' ? 'ผู้ดูแลระบบ' : 'ผู้ชม'}</small></div>}
            {sidebarOpen && <MoreHorizontal size={17} />}
          </button>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left"><button className="mobile-menu-btn" aria-label="เปิดเมนู" onClick={() => setMobileMenu(true)}><Menu size={20} /></button><div className="breadcrumb"><span>Sentinel</span><ChevronRight size={14} /><b>{navItems.find((n) => n.id === page)?.label}</b></div></div>
          <div className="topbar-right">
            <label className="global-search"><Search size={16} /><input placeholder="ค้นหาอุปกรณ์, อาคาร..." value={globalSearch} onChange={(e) => setGlobalSearch(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && globalSearch.trim()) { setSearch(globalSearch); changePage('devices') } }} /><kbd>⌘ K</kbd></label>
            <span className="topbar-divider" />
            <button className="icon-btn notification-btn" aria-label="การแจ้งเตือน" onClick={() => changePage('dashboard')}><Bell size={18} /><i /></button>
            <button className="header-profile" onClick={signOut} title="ออกจากระบบ"><div className="avatar avatar-small">{user.name.split(' ').map((s) => s[0]).join('').slice(0, 2)}</div><ChevronDown size={14} /></button>
          </div>
        </header>
        <div className="page-content">
          {page === 'dashboard' && <Dashboard devices={devices} buildings={buildings} zones={zones} counts={counts} setPage={changePage} onSelect={(d) => { setSelectedBuilding(d.building); setSelectedFloor(d.floor); setSelectedDevice(d); changePage('map') }} />}
          {page === 'devices' && <DevicesPage devices={visibleDevices} allDevices={devices} buildings={buildings} zones={zones} search={search} setSearch={setSearch} statusFilter={statusFilter} setStatusFilter={setStatusFilter} buildingFilter={buildingFilter} setBuildingFilter={setBuildingFilter} zoneFilter={zoneFilter} setZoneFilter={setZoneFilter} canEdit={canEdit} onAdd={() => setModal({ type: 'device' })} onEdit={(d) => setModal({ type: 'device', value: d })} onDelete={deleteDevice} onLocate={(d) => { setSelectedBuilding(d.building); setSelectedFloor(d.floor); setSelectedDevice(d); changePage('map') }} />}
          {page === 'buildings' && <BuildingsPage buildings={buildings} devices={devices} canEdit={canEdit} onAdd={() => setModal({ type: 'building' })} onEdit={(b) => setModal({ type: 'building', value: b })} onDelete={deleteBuilding} />}
          {page === 'zones' && <ZonesPage zones={zones} devices={devices} canEdit={canEdit} onAdd={() => setModal({ type: 'zone' })} onEdit={(z) => setModal({ type: 'zone', value: z })} onDelete={deleteZone} />}
          {page === 'map' && <MapPage buildings={buildings} selectedBuilding={selectedBuilding} setSelectedBuilding={(id) => { setSelectedBuilding(id); setSelectedDevice(null) }} selectedFloor={selectedFloor} setSelectedFloor={setSelectedFloor} plan={plans[`${selectedBuilding}-${selectedFloor}`]} floorDevices={mapFiltered} allFloorDevices={floorDevices} zones={zones} selectedDevice={selectedDevice} setSelectedDevice={setSelectedDevice} mapSearch={mapSearch} setMapSearch={setMapSearch} zoom={zoom} setZoom={setZoom} offset={offset} setOffset={setOffset} mapRef={mapRef} dragging={dragging} positionDraft={positionDraft} onSavePosition={savePosition} onCancelPosition={() => setPositionDraft(null)} onUpload={() => fileInput.current?.click()} fileInput={fileInput} onFile={handleUpload} onMarkerDown={startMarkerDrag} onMapDown={beginPan} onMapMove={movePan} onMapUp={endPan} onPlace={placeDeviceAt} onDropDevice={dropDeviceAt} canEdit={canEdit} onDeviceEdit={(d) => setModal({ type: 'device', value: d })} onAdd={() => setModal({ type: 'device', preset: { building: selectedBuilding, floor: selectedFloor } })} onBeginPlace={beginPlace} onLocate={(d) => { setSelectedBuilding(d.building); setSelectedFloor(d.floor); setSelectedDevice(d) }} />}
          {page === 'reports' && <ReportsPage devices={devices} buildings={buildings} zones={zones} counts={counts} exportCsv={exportCsv} exportExcel={exportExcel} exportPdf={exportPdf} />}
          {page === 'audit' && <AuditPage audit={audit} />}
          {page === 'users' && <UsersPage user={user} onSignOut={signOut} />}
        </div>
        <footer className="app-footer" aria-label="ส่วนท้ายข้อมูล GISTDA">
          <div className="app-footer-brand">
            <span className="gistda-wordmark">GISTDA</span>
            <span className="app-footer-agency">สำนักงานพัฒนาเทคโนโลยีอวกาศและภูมิสารสนเทศ (องค์การมหาชน)</span>
          </div>
          <span className="app-footer-copyright">© {new Date().getFullYear()} GISTDA · ระบบ Access Control</span>
        </footer>
      </main>
      {modal && <Modal modal={modal} onClose={() => setModal(null)} onSaveDevice={saveDevice} onSaveBuilding={saveBuilding} onSaveZone={saveZone} buildings={buildings} zones={zones} devices={devices} user={user} onSignOut={signOut} />}
      {notice && <div className="toast"><Check size={16} />{notice}</div>}
    </div>
  )
}

export default App
