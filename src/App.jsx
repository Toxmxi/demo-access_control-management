import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity, AlertTriangle, ArrowDownToLine, ArrowLeft, ArrowRight, Bell,
  Building2, Check, ChevronDown, ChevronLeft, ChevronRight, CircleHelp,
  Clock3, DoorOpen, Download, FileSpreadsheet, FileText, Filter, LayoutDashboard,
  LogOut, Map, MapPin, Menu, MoreHorizontal, Pencil, Plus, Search, Settings2,
  Shield, ShieldAlert, ShieldCheck, Trash2, Upload, Users, X, ZoomIn, ZoomOut,
  RotateCcw, PanelLeftClose, PanelLeftOpen, Layers3, LocateFixed, LockKeyhole,
  Eye, EyeOff, ClipboardList, Server, Wifi, CircleUserRound, ChevronUp,
} from 'lucide-react'
import { createExcelFile } from './exportExcel.js'

const initialBuildings = [
  { id: 'BKK-01', name: 'สำนักงานใหญ่', floors: 12, address: 'อาคารสยามทาวเวอร์, กรุงเทพฯ' },
  { id: 'BKK-02', name: 'อาคารปฏิบัติการ', floors: 8, address: 'ถนนพระราม 9, กรุงเทพฯ' },
  { id: 'CNX-01', name: 'ศูนย์เทคโนโลยีเชียงใหม่', floors: 5, address: 'อำเภอเมือง, เชียงใหม่' },
]
const mockTime = (minutesAgo) => new Date(Date.now() - minutesAgo * 60_000).toLocaleString('sv-SE', { timeZone: 'Asia/Bangkok' }).replace('T', ' ')
const initialZones = [
  { id: 'Z-001', name: 'พื้นที่ส่วนกลาง', detail: 'พื้นที่ต้อนรับและส่วนกลาง', color: '#47c99a' },
  { id: 'Z-002', name: 'พื้นที่สำนักงาน', detail: 'พื้นที่ทำงานสำหรับพนักงาน', color: '#5e9cff' },
  { id: 'Z-003', name: 'พื้นที่ความปลอดภัยสูง', detail: 'ห้องเซิร์ฟเวอร์และห้องควบคุม', color: '#b18cff' },
  { id: 'Z-004', name: 'พื้นที่จำกัด', detail: 'ต้องได้รับอนุญาตพิเศษ', color: '#f1b84b' },
]
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
const navItems = [
  { id: 'dashboard', label: 'ภาพรวมระบบ', icon: LayoutDashboard, group: 'ภาพรวม' },
  { id: 'map', label: 'แผนผังอาคาร', icon: Map, group: 'ภาพรวม' },
  { id: 'devices', label: 'อุปกรณ์ Access Control', icon: Shield, group: 'จัดการระบบ', count: '10' },
  { id: 'buildings', label: 'อาคารและชั้น', icon: Building2, group: 'จัดการระบบ' },
  { id: 'zones', label: 'Control Zones', icon: Layers3, group: 'จัดการระบบ' },
  { id: 'reports', label: 'รายงานและส่งออก', icon: FileSpreadsheet, group: 'เครื่องมือ' },
  { id: 'audit', label: 'บันทึกกิจกรรม', icon: ClipboardList, group: 'เครื่องมือ' },
  { id: 'users', label: 'ผู้ใช้งาน', icon: Users, group: 'ตั้งค่า', admin: true },
]
const statusClass = { Active: 'active', Inactive: 'inactive', Warning: 'warning', Unknown: 'unknown' }
const statusThai = { Active: 'ทำงานปกติ', Inactive: 'ไม่ทำงาน', Warning: 'แจ้งเตือน', Unknown: 'ไม่ทราบสถานะ' }
const colorList = ['#47c99a', '#f06b72', '#f1b84b', '#a0a9b8']
const readStore = (key, fallback) => {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback } catch { return fallback }
}
const saveStore = (key, value) => localStorage.setItem(key, JSON.stringify(value))
const dateTime = () => new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })
const csvCell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`

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
  const [notice, setNotice] = useState('')
  const fileInput = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => saveStore('ac_buildings', buildings), [buildings])
  useEffect(() => saveStore('ac_zones', zones), [zones])
  useEffect(() => saveStore('ac_devices', devices), [devices])
  useEffect(() => saveStore('ac_plans', plans), [plans])
  useEffect(() => saveStore('ac_audit', audit), [audit])

  const addAudit = (action, detail) => {
    const entry = { action, user: user?.name || 'System Admin', detail, time: dateTime() }
    setAudit((current) => [entry, ...current].slice(0, 100))
  }
  const notify = (text) => { setNotice(text); window.setTimeout(() => setNotice(''), 2800) }
  const counts = useMemo(() => ({
    total: devices.length,
    Active: devices.filter((d) => d.status === 'Active').length,
    Inactive: devices.filter((d) => d.status === 'Inactive').length,
    Warning: devices.filter((d) => d.status === 'Warning').length,
    Unknown: devices.filter((d) => d.status === 'Unknown').length,
  }), [devices])
  const building = buildings.find((item) => item.id === selectedBuilding) || buildings[0]
  const floorDevices = devices.filter((d) => d.building === selectedBuilding && d.floor === selectedFloor)
  const visibleDevices = useMemo(() => devices.filter((d) => {
    const q = search.toLowerCase()
    const matchesText = !q || [d.id, d.name, d.door, d.model, d.equipment].some((v) => v.toLowerCase().includes(q))
    return matchesText && (statusFilter === 'ทั้งหมด' || d.status === statusFilter) &&
      (buildingFilter === 'ทั้งหมด' || d.building === buildingFilter) && (zoneFilter === 'ทั้งหมด' || d.zone === zoneFilter)
  }), [devices, search, statusFilter, buildingFilter, zoneFilter])
  const mapFiltered = floorDevices.filter((d) => !mapSearch || [d.id, d.name, d.door].some((v) => v.toLowerCase().includes(mapSearch.toLowerCase())))

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
    setUser(nextUser); saveStore('ac_user', nextUser)
    const entry = { action: 'เข้าสู่ระบบ', user: nextUser.name, detail: 'เข้าสู่ระบบสำเร็จ', time: dateTime() }
    setAudit((current) => [entry, ...current]); notify(`ยินดีต้อนรับ ${nextUser.name}`)
  }
  const signOut = () => { addAudit('ออกจากระบบ', 'ออกจากระบบ'); setUser(null); localStorage.removeItem('ac_user') }
  const changePage = (id) => { setPage(id); setMobileMenu(false); setSelectedDevice(null) }
  const canEdit = user?.role !== 'Viewer'

  const saveDevice = (data) => {
    const assignedBuilding = buildings.find((item) => item.id === data.building)
    if (!assignedBuilding || Number(data.floor) < 1 || Number(data.floor) > assignedBuilding.floors) return notify('ชั้นที่ระบุต้องอยู่ภายในจำนวนชั้นของอาคาร')
    if (data._oldId) {
      const { _oldId, ...next } = data
      setDevices((items) => items.map((item) => item.id === _oldId ? { ...item, ...next, updated: dateTime() } : item))
      addAudit('แก้ไขอุปกรณ์', `${data.id} — ${data.name}`)
    } else {
      const { _oldId, ...next } = data
      setDevices((items) => [...items, { ...next, x: Number(next.x) || 50, y: Number(next.y) || 50, updated: dateTime() }])
      addAudit('เพิ่มอุปกรณ์', `${data.id} — ${data.name}`)
    }
    setModal(null); notify('บันทึกข้อมูลอุปกรณ์แล้ว')
  }
  const deleteDevice = (device) => {
    if (!window.confirm(`ยืนยันลบ ${device.id} — ${device.name}?`)) return
    setDevices((items) => items.filter((d) => d.id !== device.id)); addAudit('ลบอุปกรณ์', `${device.id} — ${device.name}`); setModal(null); notify('ลบอุปกรณ์แล้ว')
  }
  const saveBuilding = (data) => {
    const exists = buildings.some((item) => item.id === data.id)
    if (devices.some((device) => device.building === data.id && Number(device.floor) > data.floors)) return notify('ไม่สามารถลดจำนวนชั้นต่ำกว่าชั้นที่มีอุปกรณ์ติดตั้งอยู่')
    if (modal?.type === 'building' && modal.value) {
      setBuildings((items) => items.map((b) => b.id === modal.value.id ? data : b)); addAudit('แก้ไขอาคาร', `${data.id} — ${data.name}`)
    } else if (exists) return notify('Building ID นี้มีอยู่แล้ว')
    else { setBuildings((items) => [...items, data]); addAudit('เพิ่มอาคาร', `${data.id} — ${data.name}`) }
    setModal(null); notify('บันทึกข้อมูลอาคารแล้ว')
  }
  const deleteBuilding = (item) => {
    if (devices.some((d) => d.building === item.id)) return notify('ยังมีอุปกรณ์เชื่อมโยงกับอาคารนี้')
    if (!window.confirm(`ลบอาคาร ${item.name}?`)) return
    setBuildings((items) => items.filter((b) => b.id !== item.id)); addAudit('ลบอาคาร', item.name); notify('ลบอาคารแล้ว')
  }
  const saveZone = (data) => {
    if (modal?.value) { setZones((items) => items.map((z) => z.id === modal.value.id ? data : z)); addAudit('แก้ไข Control Zone', data.name) }
    else {
      if (zones.some((z) => z.id === data.id)) return notify('Zone ID นี้มีอยู่แล้ว')
      setZones((items) => [...items, data]); addAudit('เพิ่ม Control Zone', data.name)
    }
    setModal(null); notify('บันทึก Control Zone แล้ว')
  }
  const deleteZone = (item) => {
    if (devices.some((d) => d.zone === item.id)) return notify('กรุณาย้ายอุปกรณ์ออกจาก Zone ก่อนลบ')
    if (!window.confirm(`ลบ ${item.name}?`)) return
    setZones((items) => items.filter((z) => z.id !== item.id)); addAudit('ลบ Control Zone', item.name); notify('ลบ Zone แล้ว')
  }
  const exportCsv = () => {
    const rows = devices.map((d) => [d.id, d.name, d.type, buildings.find((b) => b.id === d.building)?.name || d.building, d.floor, d.door, d.equipment, d.model, zones.find((z) => z.id === d.zone)?.name || d.zone, statusThai[d.status], `${d.x}, ${d.y}`, d.updated])
    const csv = ['Device ID,Device Name,Device Type,Building,Floor,Door Name,Equipment No.,Model,Control Zone,Status,Location X/Y,Last Update', ...rows.map((row) => row.map(csvCell).join(','))].join('\r\n')
    downloadBlob('\ufeff' + csv, 'access-control-report.csv', 'text/csv;charset=utf-8')
    addAudit('ส่งออกรายงาน CSV', `ส่งออก ${rows.length} รายการ`); notify('ส่งออก CSV สำเร็จ')
  }
  const exportExcel = () => {
    const columns = ['Device ID', 'Device Name', 'Device Type', 'Building', 'Floor', 'Door Name', 'Equipment No.', 'Model', 'Control Zone', 'Status', 'Location X', 'Location Y', 'Last Update']
    const rows = devices.map((d) => [d.id, d.name, d.type, buildings.find((b) => b.id === d.building)?.name || d.building, Number(d.floor), d.door, d.equipment, d.model, zones.find((z) => z.id === d.zone)?.name || d.zone, statusThai[d.status], d.x, d.y, d.updated])
    downloadBlob(createExcelFile(columns, rows), 'access-control-report.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    addAudit('ส่งออกรายงาน Excel', `ส่งออก ${rows.length} รายการ`); notify('ส่งออก Excel สำเร็จ')
  }
  const downloadBlob = (content, filename, type) => {
    const url = URL.createObjectURL(new Blob([content], { type })); const link = document.createElement('a')
    link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url)
  }
  const exportPdf = () => { addAudit('พิมพ์รายงาน PDF', 'สร้างรายงานสำหรับบันทึกเป็น PDF'); window.print() }
  const handleUpload = (file) => {
    if (!file) return
    if (!['image/png', 'image/jpeg', 'application/pdf'].includes(file.type)) return notify('รองรับเฉพาะไฟล์ PNG, JPG และ PDF')
    const key = `${selectedBuilding}-${selectedFloor}`
    const reader = new FileReader()
    reader.onload = () => {
      setPlans((items) => ({ ...items, [key]: { name: file.name, type: file.type, data: reader.result } }))
      addAudit('อัปโหลดแผนผัง', `${building?.name || selectedBuilding} ชั้น ${selectedFloor}: ${file.name}`)
      notify('อัปโหลดแผนผังเรียบร้อยแล้ว')
    }
    reader.onerror = () => notify('อ่านไฟล์ไม่สำเร็จ กรุณาลองอีกครั้ง')
    reader.readAsDataURL(file)
  }
  const updateDevicePosition = (device, x, y) => {
    setDevices((items) => items.map((d) => d.id === device.id ? { ...d, x: Math.max(2, Math.min(98, x)), y: Math.max(3, Math.min(97, y)), updated: dateTime() } : d))
  }
  const startMarkerDrag = (event, device) => {
    if (!canEdit) { setSelectedDevice(device); return }
    event.preventDefault(); event.stopPropagation()
    const rect = mapRef.current?.getBoundingClientRect()
    if (rect) setDragging({ id: device.id, rect, moved: false })
    setSelectedDevice(device)
  }
  const moveMarker = (event) => {
    if (!dragging || !mapRef.current) return
    const rect = dragging.rect
    updateDevicePosition({ id: dragging.id }, ((event.clientX - rect.left) / rect.width) * 100, ((event.clientY - rect.top) / rect.height) * 100)
    if (!dragging.moved) setDragging((current) => current && ({ ...current, moved: true }))
  }
  const endMarkerDrag = () => {
    if (dragging) {
      if (dragging.moved) addAudit('ย้ายตำแหน่งอุปกรณ์', `${dragging.id} บน Floor Plan`)
      setDragging(null)
    }
  }
  const placeDeviceAt = (event) => {
    if (!dragging?.place || !mapRef.current) return
    const rect = mapRef.current.getBoundingClientRect()
    updateDevicePosition({ id: dragging.id }, ((event.clientX - rect.left) / rect.width) * 100, ((event.clientY - rect.top) / rect.height) * 100)
    setDragging(null); notify('วางตำแหน่งอุปกรณ์แล้ว')
  }
  const dropDeviceAt = (event, device) => {
    if (!mapRef.current) return
    const rect = mapRef.current.getBoundingClientRect()
    updateDevicePosition(device, ((event.clientX - rect.left) / rect.width) * 100, ((event.clientY - rect.top) / rect.height) * 100)
    setDragging(null); addAudit('ย้ายตำแหน่งอุปกรณ์', `${device.id} บน Floor Plan`); notify('วางตำแหน่งอุปกรณ์แล้ว')
  }
  const beginPan = (event) => {
    if (event.button !== 0 || dragging) return
    setOffset((o) => ({ ...o, startX: event.clientX - o.x, startY: event.clientY - o.y, panning: true }))
  }
  const movePan = (event) => {
    if (dragging) return moveMarker(event)
    if (offset.panning) setOffset((o) => ({ ...o, x: event.clientX - o.startX, y: event.clientY - o.startY }))
  }
  const endPan = () => { endMarkerDrag(); if (offset.panning) setOffset((o) => ({ ...o, panning: false })) }
  const beginPlace = (device) => { setSelectedDevice(device); setDragging({ id: device.id, place: true }); notify('คลิกตำแหน่งบนแผนผังเพื่อวางอุปกรณ์') }

  if (!user) return <Login onSubmit={signIn} />
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
          {page === 'map' && <MapPage buildings={buildings} selectedBuilding={selectedBuilding} setSelectedBuilding={(id) => { setSelectedBuilding(id); setSelectedDevice(null) }} selectedFloor={selectedFloor} setSelectedFloor={setSelectedFloor} plan={plans[`${selectedBuilding}-${selectedFloor}`]} floorDevices={mapFiltered} allFloorDevices={floorDevices} zones={zones} selectedDevice={selectedDevice} setSelectedDevice={setSelectedDevice} mapSearch={mapSearch} setMapSearch={setMapSearch} zoom={zoom} setZoom={setZoom} offset={offset} setOffset={setOffset} mapRef={mapRef} dragging={dragging} onUpload={() => fileInput.current?.click()} fileInput={fileInput} onFile={handleUpload} onMarkerDown={startMarkerDrag} onMapDown={beginPan} onMapMove={movePan} onMapUp={endPan} onPlace={placeDeviceAt} onDropDevice={dropDeviceAt} canEdit={canEdit} onDeviceEdit={(d) => setModal({ type: 'device', value: d })} onAdd={() => setModal({ type: 'device', preset: { building: selectedBuilding, floor: selectedFloor } })} onBeginPlace={beginPlace} onLocate={(d) => { setSelectedBuilding(d.building); setSelectedFloor(d.floor); setSelectedDevice(d) }} />}
          {page === 'reports' && <ReportsPage devices={devices} buildings={buildings} zones={zones} counts={counts} exportCsv={exportCsv} exportExcel={exportExcel} exportPdf={exportPdf} />}
          {page === 'audit' && <AuditPage audit={audit} />}
          {page === 'users' && <UsersPage user={user} onSignOut={signOut} />}
        </div>
      </main>
      {modal && <Modal modal={modal} onClose={() => setModal(null)} onSaveDevice={saveDevice} onSaveBuilding={saveBuilding} onSaveZone={saveZone} buildings={buildings} zones={zones} devices={devices} user={user} onSignOut={signOut} />}
      {notice && <div className="toast"><Check size={16} />{notice}</div>}
    </div>
  )
}

function Login({ onSubmit }) {
  const [show, setShow] = useState(false)
  return <main className="login-shell">
    <div className="login-visual">
      <div className="login-brand"><span className="brand-mark"><ShieldCheck size={22} /></span><b>sentinel<span>.</span></b></div>
      <div className="login-message"><div className="eyebrow"><span className="pulse-dot" /> SECURITY OPERATIONS PLATFORM</div><h1>ความปลอดภัย<br />เริ่มต้นที่<span>การควบคุม</span></h1><p>มองเห็นทุกประตู ทุกอาคาร<br />ในองค์กรของคุณ จากที่เดียว</p>
        <div className="login-preview"><div className="preview-top"><span><i className="green-dot" /> ระบบทำงานปกติ</span><span>LIVE MONITORING</span></div><div className="preview-map"><div className="preview-grid" /><i className="map-pip p1" /><i className="map-pip p2" /><i className="map-pip p3" /><i className="map-pip p4" /><div className="preview-map-label">BUILDING A · FLOOR 01</div></div><div className="preview-stats"><div><b>248</b><small>อุปกรณ์ทั้งหมด</small></div><div><b className="text-green">236</b><small>ทำงานปกติ</small></div><div><b className="text-red">04</b><small>ต้องตรวจสอบ</small></div></div></div>
      </div>
      <div className="login-visual-footer"><span>© 2025 SENTINEL SECURITY SYSTEMS</span><span>ENTERPRISE ACCESS MANAGEMENT</span></div>
    </div>
    <div className="login-form-side"><form onSubmit={onSubmit} className="login-form">
      <div className="login-form-icon"><LockKeyhole size={21} /></div><div className="eyebrow">WELCOME BACK</div><h2>เข้าสู่ระบบ</h2><p>กรอกข้อมูลเพื่อเข้าสู่ระบบจัดการความปลอดภัย</p>
      <label className="field-label">อีเมลผู้ใช้งาน</label><div className="input-wrap"><CircleUserRound size={17} /><input name="email" type="email" required placeholder="name@company.com" defaultValue="admin@sentinel.co.th" /></div>
      <label className="field-label">รหัสผ่าน</label><div className="input-wrap"><LockKeyhole size={17} /><input name="password" type={show ? 'text' : 'password'} required placeholder="กรอกรหัสผ่าน" defaultValue="sentinel123" /><button type="button" className="password-toggle" onClick={() => setShow(!show)}>{show ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
      <div className="login-options"><label><input type="checkbox" defaultChecked /> จดจำฉันไว้</label><a href="#help" onClick={(e) => { e.preventDefault(); alert('กรุณาติดต่อผู้ดูแลระบบเพื่อรีเซ็ตรหัสผ่าน') }}>ลืมรหัสผ่าน?</a></div>
      <button className="btn btn-primary login-submit" type="submit">เข้าสู่ระบบ <ArrowRight size={17} /></button>
      <div className="login-demo"><ShieldCheck size={15} /><span>บัญชีทดลอง: <b>admin@sentinel.co.th</b> / <b>sentinel123</b></span></div>
      <div className="login-demo viewer-demo"><Eye size={15} /><span>ทดลองสิทธิ์ Viewer: <b>viewer@sentinel.co.th</b> / <b>demo123</b></span></div>
    </form><div className="login-copyright">ระบบ Access Control Management <span>·</span> v1.0.0</div></div>
  </main>
}

function PageHeader({ eyebrow, title, description, action }) {
  return <div className="page-header"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</div>
}
function StatusBadge({ status }) { return <span className={`status-badge status-${statusClass[status]}`}><i />{statusThai[status] || status}</span> }
function Dashboard({ devices, buildings, zones, counts, setPage, onSelect }) {
  const statusData = ['Active', 'Inactive', 'Warning', 'Unknown'].map((key, i) => ({ name: statusThai[key], value: counts[key], color: colorList[i], key }))
  const chartData = [{ name: 'จ.', active: 32, issue: 3 }, { name: 'อ.', active: 35, issue: 2 }, { name: 'พ.', active: 34, issue: 4 }, { name: 'พฤ.', active: 38, issue: 3 }, { name: 'ศ.', active: 36, issue: 5 }, { name: 'ส.', active: 39, issue: 2 }, { name: 'อา.', active: 40, issue: 3 }]
  const inactive = devices.filter((d) => d.status === 'Inactive' || d.status === 'Warning').slice(0, 4)
  return <>
    <PageHeader eyebrow={new Date().toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()} title="ภาพรวมระบบ" description="ติดตามสถานะอุปกรณ์และความปลอดภัยของทุกอาคาร" action={<div className="live-pill"><i className="pulse-dot" /> LIVE MONITORING <span>อัปเดตล่าสุด 1 นาทีที่แล้ว</span></div>} />
    <div className="metric-grid">
      <MetricCard title="อุปกรณ์ทั้งหมด" value={counts.total} sub="จากทุกอาคาร" icon={Shield} tone="blue" trend="+2.4%" />
      <MetricCard title="ทำงานปกติ" value={counts.Active} sub={`${counts.total ? Math.round(counts.Active / counts.total * 100) : 0}% ของอุปกรณ์ทั้งหมด`} icon={ShieldCheck} tone="green" trend="ปกติ" />
      <MetricCard title="ไม่ทำงาน" value={counts.Inactive} sub="ต้องตรวจสอบทันที" icon={ShieldAlert} tone="red" trend={`${counts.Inactive} รายการ`} />
      <MetricCard title="แจ้งเตือน / ไม่ทราบ" value={counts.Warning + counts.Unknown} sub={`${counts.Warning} แจ้งเตือน · ${counts.Unknown} ไม่ทราบ`} icon={AlertTriangle} tone="amber" trend="ตรวจสอบ" />
    </div>
    <div className="dashboard-main-grid">
      <section className="panel trend-panel"><div className="panel-heading"><div><h3>กิจกรรมอุปกรณ์</h3><p>สรุปสถานะอุปกรณ์ในช่วง 7 วันที่ผ่านมา</p></div><button className="select-button">7 วันที่ผ่านมา <ChevronDown size={14} /></button></div>
        <div className="trend-legend"><span><i className="legend-green" />ทำงานปกติ</span><span><i className="legend-red" />พบปัญหา</span></div>
        <div className="chart-area"><ActivityChart data={chartData} /></div>
      </section>
      <section className="panel status-panel"><div className="panel-heading"><div><h3>สถานะอุปกรณ์</h3><p>สัดส่วนสถานะ ณ ปัจจุบัน</p></div><button className="icon-btn" onClick={() => setPage('devices')} aria-label="ดูอุปกรณ์"><MoreHorizontal size={19} /></button></div>
        <div className="donut-wrap"><StatusDonut data={statusData} total={counts.total} /><div className="donut-center"><b>{counts.total}</b><span>อุปกรณ์</span></div></div>
        <div className="status-legend">{statusData.map((item) => <div key={item.key}><span><i style={{ background: item.color }} />{item.name}</span><b>{item.value}<small>{counts.total ? ` ${Math.round(item.value / counts.total * 100)}%` : ' 0%'}</small></b></div>)}</div>
      </section>
    </div>
    <div className="dashboard-bottom-grid">
      <section className="panel inactive-panel"><div className="panel-heading"><div><h3>ต้องตรวจสอบ</h3><p>อุปกรณ์ที่มีสถานะผิดปกติล่าสุด</p></div><button className="text-link" onClick={() => { setPage('devices') }}>ดูทั้งหมด <ArrowRight size={14} /></button></div>
        <div className="problem-list">{inactive.length ? inactive.map((d) => <button className="problem-row" key={d.id} onClick={() => onSelect(d)}><div className={`problem-icon ${statusClass[d.status]}`}><DoorOpen size={17} /></div><div className="problem-main"><b>{d.name}</b><small>{d.id} <span>·</span> {buildings.find((b) => b.id === d.building)?.name} ชั้น {d.floor}</small></div><StatusBadge status={d.status} /><ChevronRight size={15} className="row-chevron" /></button>) : <div className="empty-state">ไม่มีอุปกรณ์ที่ต้องตรวจสอบ</div>}</div>
      </section>
      <section className="panel building-summary"><div className="panel-heading"><div><h3>สถานะตามอาคาร</h3><p>ภาพรวมอุปกรณ์แยกตามอาคาร</p></div><button className="text-link" onClick={() => setPage('buildings')}>อาคารทั้งหมด <ArrowRight size={14} /></button></div>
        <div className="building-list">{buildings.map((b) => { const items = devices.filter((d) => d.building === b.id); const active = items.filter((d) => d.status === 'Active').length; const ratio = items.length ? active / items.length * 100 : 0; return <button className="building-row" key={b.id} onClick={() => setPage('buildings')}><div className="building-avatar"><Building2 size={17} /></div><div className="building-info"><div><b>{b.name}</b><small>{b.id} <span>·</span> {b.floors} ชั้น</small></div><div className="building-count"><b>{items.length}</b><small>อุปกรณ์</small></div><div className="building-progress"><span style={{ width: `${ratio}%` }} /></div></div><ChevronRight size={15} className="row-chevron" /></button>})}</div>
      </section>
    </div>
    <div className="dashboard-footer"><span><i className="pulse-dot" /> All systems operational</span><span>ข้อมูลอัปเดตอัตโนมัติทุก 60 วินาที</span><span>โซนเวลา ICT · UTC+7</span></div>
  </>
}
function ActivityChart({ data }) {
  const left = 35; const right = 590; const top = 10; const bottom = 158; const max = 50
  const x = (index) => left + index * (right - left) / Math.max(data.length - 1, 1)
  const y = (value) => bottom - value / max * (bottom - top)
  const active = data.map((item, index) => ({ x: x(index), y: y(item.active), name: item.name, value: item.active }))
  const issues = data.map((item, index) => ({ x: x(index), y: y(item.issue), name: item.name, value: item.issue }))
  const line = (points) => points.map((point, index) => `${index ? 'L' : 'M'}${point.x},${point.y}`).join(' ')
  const area = `${line(active)} L${active[active.length - 1].x},${bottom} L${active[0].x},${bottom} Z`
  return <svg viewBox="0 0 600 195" preserveAspectRatio="none" role="img" aria-label="กราฟสรุปกิจกรรมอุปกรณ์ 7 วัน">
    <defs><linearGradient id="activeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#39c796" stopOpacity=".19" /><stop offset="100%" stopColor="#39c796" stopOpacity="0" /></linearGradient></defs>
    {[0, 10, 20, 30, 40, 50].map((value) => <g key={value}><line x1={left} x2={right} y1={y(value)} y2={y(value)} stroke="#202832" /><text x="22" y={y(value) + 3} textAnchor="end" fill="#778190" fontSize="9">{value}</text></g>)}
    <path d={area} fill="url(#activeFill)" /><path d={line(active)} fill="none" stroke="#44c99a" strokeWidth="2" vectorEffect="non-scaling-stroke" /><path d={line(issues)} fill="none" stroke="#f06b72" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    {data.map((item, index) => <g key={item.name}><circle cx={x(index)} cy={y(item.active)} r="3" fill="#44c99a"><title>{item.name}: ทำงานปกติ {item.active}</title></circle><circle cx={x(index)} cy={y(item.issue)} r="3" fill="#f06b72"><title>{item.name}: พบปัญหา {item.issue}</title></circle><text x={x(index)} y="182" textAnchor="middle" fill="#778190" fontSize="9">{item.name}</text></g>)}
  </svg>
}
function StatusDonut({ data, total }) {
  const radius = 62; const circumference = 2 * Math.PI * radius
  let offset = 0
  const segments = data.filter((item) => item.value > 0).map((item) => {
    const length = item.value / Math.max(total, 1) * circumference
    const segment = { ...item, length: Math.max(0, length - 4), offset }
    offset += length
    return segment
  })
  return <svg className="donut-chart" viewBox="0 0 190 190" role="img" aria-label="สัดส่วนสถานะอุปกรณ์">
    <circle cx="95" cy="95" r={radius} fill="none" stroke="#222d37" strokeWidth="16" />
    {segments.map((item) => <circle key={item.key} cx="95" cy="95" r={radius} fill="none" stroke={item.color} strokeWidth="16" strokeDasharray={`${item.length} ${circumference - item.length}`} strokeDashoffset={-item.offset} transform="rotate(-90 95 95)"><title>{item.name}: {item.value}</title></circle>)}
  </svg>
}
function MetricCard({ title, value, sub, icon: Icon, tone, trend }) {
  return <div className={`metric-card metric-${tone}`}><div className="metric-top"><span>{title}</span><span className="metric-icon"><Icon size={18} /></span></div><div className="metric-value">{String(value).padStart(2, '0')}<span className={`metric-trend trend-${tone}`}>{tone === 'green' ? <Check size={12} /> : tone === 'red' || tone === 'amber' ? <AlertTriangle size={12} /> : <Activity size={12} />}{trend}</span></div><div className="metric-sub">{sub}</div><div className="metric-accent" /></div>
}
function DevicesPage({ devices, allDevices, buildings, zones, search, setSearch, statusFilter, setStatusFilter, buildingFilter, setBuildingFilter, zoneFilter, setZoneFilter, canEdit, onAdd, onEdit, onDelete, onLocate }) {
  const [pageNo, setPageNo] = useState(1)
  const pageSize = 8; const pages = Math.max(1, Math.ceil(devices.length / pageSize))
  const current = devices.slice((pageNo - 1) * pageSize, pageNo * pageSize)
  useEffect(() => setPageNo(1), [search, statusFilter, buildingFilter, zoneFilter])
  return <>
    <PageHeader eyebrow="DEVICE INVENTORY" title="อุปกรณ์ Access Control" description="จัดการ ตรวจสอบ และติดตามสถานะอุปกรณ์ทั้งหมดในระบบ" action={canEdit && <button className="btn btn-primary" onClick={onAdd}><Plus size={16} /> เพิ่มอุปกรณ์</button>} />
    <div className="mini-metrics">{['Active', 'Inactive', 'Warning', 'Unknown'].map((s) => <button key={s} onClick={() => setStatusFilter(statusFilter === s ? 'ทั้งหมด' : s)} className={`mini-metric ${statusFilter === s ? 'mini-selected' : ''}`}><i className={`status-dot ${statusClass[s]}`} /><span>{statusThai[s]}</span><b>{allDevices.filter((d) => d.status === s).length}</b></button>)}</div>
    <section className="panel table-panel">
      <div className="table-toolbar"><div className="table-title"><b>รายการอุปกรณ์</b><span>{devices.length} รายการ</span></div><div className="table-filters"><label className="table-search"><Search size={15} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหาอุปกรณ์..." /></label><select value={buildingFilter} onChange={(e) => setBuildingFilter(e.target.value)}><option value="ทั้งหมด">ทุกอาคาร</option>{buildings.map((b) => <option value={b.id} key={b.id}>{b.name}</option>)}</select><select value={zoneFilter} onChange={(e) => setZoneFilter(e.target.value)}><option value="ทั้งหมด">ทุก Zone</option>{zones.map((z) => <option value={z.id} key={z.id}>{z.name}</option>)}</select><button className={`filter-button ${statusFilter !== 'ทั้งหมด' ? 'filter-active' : ''}`} onClick={() => setStatusFilter(statusFilter === 'ทั้งหมด' ? 'Inactive' : 'ทั้งหมด')}><Filter size={15} /><span>ตัวกรอง</span></button></div></div>
      <div className="table-scroll"><table><thead><tr><th>อุปกรณ์</th><th>อาคาร / ชั้น</th><th>Control Zone</th><th>สถานะ</th><th>อัปเดตล่าสุด</th><th></th></tr></thead><tbody>
        {current.map((d) => { const zone = zones.find((z) => z.id === d.zone); const building = buildings.find((b) => b.id === d.building); return <tr key={d.id}><td><button className="device-cell" onClick={() => onLocate(d)}><span className={`device-avatar ${statusClass[d.status]}`}><DoorOpen size={17} /></span><span><b>{d.name}</b><small>{d.id} <span>·</span> {d.model}</small></span></button></td><td><span className="cell-primary">{building?.name || d.building}</span><small className="cell-secondary">ชั้น {d.floor} · {d.door}</small></td><td><span className="zone-label"><i style={{ background: zone?.color || '#748094' }} />{zone?.name || '—'}</span></td><td><StatusBadge status={d.status} /></td><td className="updated-cell"><Clock3 size={13} />{d.updated}</td><td><div className="row-actions"><button title="ดูบนแผนผัง" onClick={() => onLocate(d)}><MapPin size={15} /></button>{canEdit && <><button title="แก้ไข" onClick={() => onEdit(d)}><Pencil size={15} /></button><button title="ลบ" className="delete-action" onClick={() => onDelete(d)}><Trash2 size={15} /></button></>}</div></td></tr> })}</tbody></table>
        {!current.length && <div className="empty-state">ไม่พบอุปกรณ์ที่ตรงกับเงื่อนไข</div>}
      </div>
      <div className="table-pagination"><span>แสดง <b>{devices.length ? (pageNo - 1) * pageSize + 1 : 0}–{Math.min(pageNo * pageSize, devices.length)}</b> จาก <b>{devices.length}</b> รายการ</span><div><button disabled={pageNo <= 1} onClick={() => setPageNo(pageNo - 1)}><ChevronLeft size={16} /> ก่อนหน้า</button><span className="page-number">{pageNo} / {pages}</span><button disabled={pageNo >= pages} onClick={() => setPageNo(pageNo + 1)}>ถัดไป <ChevronRight size={16} /></button></div></div>
    </section>
    <div className="table-note"><ShieldCheck size={15} /> ข้อมูลอุปกรณ์ถูกบันทึกในเครื่องนี้โดยอัตโนมัติ <span>·</span> {devices.length} / {allDevices.length} รายการที่แสดง</div>
  </>
}
function BuildingsPage({ buildings, devices, canEdit, onAdd, onEdit, onDelete }) {
  return <>
    <PageHeader eyebrow="FACILITY MANAGEMENT" title="อาคารและชั้น" description="จัดการอาคาร จำนวนชั้น และดูสรุปอุปกรณ์ในแต่ละพื้นที่" action={canEdit && <button className="btn btn-primary" onClick={onAdd}><Plus size={16} /> เพิ่มอาคาร</button>} />
    <div className="building-cards">{buildings.map((b, i) => { const items = devices.filter((d) => d.building === b.id); const active = items.filter((d) => d.status === 'Active').length; return <article className="panel building-card" key={b.id}><div className={`building-card-art art-${i % 3}`}><div className="building-art-grid" /><Building2 size={34} /><span>{String(i + 1).padStart(2, '0')}</span><div className="building-card-actions">{canEdit && <><button onClick={() => onEdit(b)} aria-label="แก้ไข"><Pencil size={15} /></button><button onClick={() => onDelete(b)} aria-label="ลบ"><Trash2 size={15} /></button></>}</div></div><div className="building-card-content"><div className="eyebrow">{b.id}</div><h3>{b.name}</h3><p><MapPin size={14} />{b.address || 'ยังไม่ได้ระบุที่อยู่'}</p><div className="building-card-stats"><div><b>{b.floors}</b><span>ชั้น</span></div><div><b>{items.length}</b><span>อุปกรณ์</span></div><div><b className="text-green">{active}</b><span>ทำงานปกติ</span></div></div><div className="building-card-bar"><span style={{ width: `${items.length ? active / items.length * 100 : 0}%` }} /></div><div className="building-card-footer"><span><i className="pulse-dot" /> {items.length ? 'เชื่อมต่อแล้ว' : 'ยังไม่มีอุปกรณ์'}</span><span>อัปเดตล่าสุดวันนี้</span></div></div></article>})}
      {canEdit && <button className="add-building-card" onClick={onAdd}><span><Plus size={20} /></span><b>เพิ่มอาคารใหม่</b><small>เพิ่มอาคารและกำหนดจำนวนชั้น</small></button>}</div>
    <div className="table-note"><CircleHelp size={15} /> ไม่สามารถลบอาคารที่ยังมีอุปกรณ์ Access Control เชื่อมโยงอยู่ได้</div>
  </>
}
function ZonesPage({ zones, devices, canEdit, onAdd, onEdit, onDelete }) {
  return <>
    <PageHeader eyebrow="ACCESS POLICIES" title="Control Zones" description="กำหนดเขตควบคุมและจัดกลุ่มอุปกรณ์ตามระดับความปลอดภัย" action={canEdit && <button className="btn btn-primary" onClick={onAdd}><Plus size={16} /> เพิ่ม Zone</button>} />
    <div className="zone-overview"><div className="panel zone-highlight"><div className="zone-shield"><Layers3 size={21} /></div><div><b>{zones.length} Control Zones</b><p>จำแนกพื้นที่ควบคุมในองค์กรของคุณ</p></div><div className="zone-dots">{zones.map((z) => <i key={z.id} style={{ background: z.color }} />)}</div></div><div className="panel zone-highlight"><div className="zone-shield zone-shield-blue"><Shield size={21} /></div><div><b>{devices.filter((d) => d.zone).length} อุปกรณ์ที่เชื่อมโยง</b><p>กระจายอยู่ตามเขตควบคุมต่าง ๆ</p></div></div></div>
    <div className="zone-grid">{zones.map((z) => { const items = devices.filter((d) => d.zone === z.id); const active = items.filter((d) => d.status === 'Active').length; return <article className="panel zone-card" key={z.id}><div className="zone-card-head"><span className="zone-color-block" style={{ background: `${z.color}18`, color: z.color, borderColor: `${z.color}40` }}><Layers3 size={19} /></span><div className="zone-card-actions">{canEdit && <><button onClick={() => onEdit(z)} aria-label="แก้ไข"><Pencil size={15} /></button><button onClick={() => onDelete(z)} aria-label="ลบ"><Trash2 size={15} /></button></>}</div></div><div className="eyebrow">{z.id}</div><h3>{z.name}</h3><p>{z.detail}</p><div className="zone-card-bottom"><span><DoorOpen size={14} />{items.length} อุปกรณ์</span><span className="zone-health"><i style={{ background: z.color }} />{active} Active</span></div><div className="zone-progress"><span style={{ background: z.color, width: `${items.length ? active / items.length * 100 : 0}%` }} /></div></article>})}</div>
  </>
}
function MapPage({ buildings, selectedBuilding, setSelectedBuilding, selectedFloor, setSelectedFloor, plan, floorDevices, allFloorDevices, zones, selectedDevice, setSelectedDevice, mapSearch, setMapSearch, zoom, setZoom, offset, setOffset, mapRef, dragging, onUpload, fileInput, onFile, onMarkerDown, onMapDown, onMapMove, onMapUp, onPlace, onDropDevice, canEdit, onDeviceEdit, onAdd, onBeginPlace, onLocate }) {
  const activeBuilding = buildings.find((b) => b.id === selectedBuilding) || buildings[0]
  const [dragOver, setDragOver] = useState(false)
  const [railOpen, setRailOpen] = useState(true)
  const floors = Array.from({ length: activeBuilding?.floors || 1 }, (_, i) => String(i + 1))
  useEffect(() => { if (!floors.includes(selectedFloor)) setSelectedFloor('1') }, [activeBuilding?.id, activeBuilding?.floors])
  useEffect(() => { if (selectedDevice && (selectedDevice.building !== selectedBuilding || selectedDevice.floor !== selectedFloor)) setSelectedDevice(null) }, [selectedBuilding, selectedFloor])
  return <>
    <PageHeader eyebrow="SPATIAL DEVICE MANAGEMENT" title="แผนผังอาคาร" description="สำรวจและจัดการตำแหน่งอุปกรณ์ Access Control บนแผนผัง" action={<div className="map-header-actions"><span className="live-pill"><i className="pulse-dot" /> {allFloorDevices.length} อุปกรณ์บนชั้นนี้</span>{canEdit && <button className="btn btn-primary" onClick={onAdd}><Plus size={16} /> เพิ่มอุปกรณ์</button>}</div>} />
    <div className="map-layout">
      <section className="map-workspace panel">
        <div className="map-toolbar"><div className="map-selectors"><label><Building2 size={15} /><select value={selectedBuilding} onChange={(e) => setSelectedBuilding(e.target.value)}>{buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select><ChevronDown size={14} /></label><span className="selector-divider" /><button className="floor-prev" disabled={Number(selectedFloor) <= 1} onClick={() => setSelectedFloor(String(Math.max(1, Number(selectedFloor) - 1)))}><ChevronLeft size={15} /></button><label className="floor-selector"><span>ชั้น</span><select value={selectedFloor} onChange={(e) => setSelectedFloor(e.target.value)}>{floors.map((f) => <option key={f} value={f}>{f}</option>)}</select><ChevronDown size={13} /></label><button className="floor-next" disabled={Number(selectedFloor) >= floors.length} onClick={() => setSelectedFloor(String(Math.min(floors.length, Number(selectedFloor) + 1)))}><ChevronRight size={15} /></button></div><div className="map-tools"><span className="map-coordinates">X: — &nbsp; Y: —</span><button onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }) }} title="รีเซ็ตมุมมอง"><RotateCcw size={15} /></button><button onClick={() => setZoom(Math.min(2.2, +(zoom + 0.15).toFixed(2)))} title="ซูมเข้า"><ZoomIn size={16} /></button><button onClick={() => setZoom(Math.max(0.65, +(zoom - 0.15).toFixed(2)))} title="ซูมออก"><ZoomOut size={16} /></button><span className="zoom-label">{Math.round(zoom * 100)}%</span><button onClick={() => setRailOpen(!railOpen)} title="แสดง/ซ่อนรายการ"><PanelLeftOpen size={16} /></button></div></div>
        <div className="map-location-bar"><span><MapPin size={14} />{activeBuilding?.name} <ChevronRight size={13} /> ชั้น {selectedFloor}</span><span className="map-plan-name">{plan ? <><FileText size={13} />{plan.name}</> : 'ยังไม่มีแผนผัง'}</span></div>
        <div className={`map-canvas ${dragOver ? 'map-drag-over' : ''}`} onDragOver={(e) => { e.preventDefault(); setDragOver(true) }} onDragLeave={() => setDragOver(false)} onDrop={(e) => { e.preventDefault(); setDragOver(false); const file = e.dataTransfer.files?.[0]; if (file) onFile(file); else { const id = e.dataTransfer.getData('deviceId'); const device = allFloorDevices.find((d) => d.id === id); if (device) onDropDevice(e, device) } }} onPointerDown={(e) => { if (dragging?.place) onPlace(e); else if (!e.target.closest('.map-marker') && !e.target.closest('.map-legend') && !e.target.closest('.place-hint') && !e.target.closest('.floor-plan-pdf')) onMapDown(e) }} onPointerMove={onMapMove} onPointerUp={onMapUp} onPointerLeave={onMapUp} onWheel={(e) => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); setZoom(Math.max(0.65, Math.min(2.2, +(zoom + (e.deltaY < 0 ? 0.1 : -0.1)).toFixed(2)))) } }} onClick={onPlace}>
          <div className="map-grid-pattern" />
          <div className="map-viewport">
            <div ref={mapRef} className="map-plan" style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }}>
              {plan ? plan.type === 'application/pdf' ? <iframe title="Floor Plan PDF" className="floor-plan-pdf" src={plan.data} /> : <img className="floor-plan-image" src={plan.data} alt={`Floor plan ${plan.name}`} draggable="false" /> : <FloorPlanIllustration />}
              <div className="plan-overlay">{floorDevices.filter((d) => !mapSearch || [d.id, d.name, d.door].some((v) => v.toLowerCase().includes(mapSearch.toLowerCase()))).map((d) => { const zone = zones.find((z) => z.id === d.zone); const selected = selectedDevice?.id === d.id; return <button key={d.id} className={`map-marker marker-${statusClass[d.status]} ${selected ? 'marker-selected' : ''} ${mapSearch && [d.id, d.name, d.door].some((v) => v.toLowerCase().includes(mapSearch.toLowerCase())) ? 'marker-search-hit' : ''}`} style={{ left: `${d.x}%`, top: `${d.y}%`, '--zone-color': zone?.color || '#8995a5' }} onPointerDown={(e) => onMarkerDown(e, d)} onClick={(e) => { e.stopPropagation(); setSelectedDevice(d) }} title={`${d.id} — ${d.name}`}><span className="marker-pin"><DoorOpen size={15} /></span><span className="marker-label">{d.name}</span></button> })}</div>
              {!plan && <div className="plan-caption"><Building2 size={14} /> {activeBuilding?.name.toUpperCase()} <span>·</span> FLOOR {String(selectedFloor).padStart(2, '0')}</div>}
            </div>
          </div>
          {!plan && allFloorDevices.length === 0 && <div className="map-empty-info"><span className="empty-map-icon"><Map size={19} /></span><b>ยังไม่มีอุปกรณ์บนชั้นนี้</b><small>เพิ่มอุปกรณ์ หรือเลือกอุปกรณ์จากรายการด้านขวา</small></div>}
          {dragging?.place && <div className="place-hint"><LocateFixed size={14} /> คลิกบนแผนผังเพื่อวางอุปกรณ์</div>}
          <div className="map-legend"><span><i className="legend-green" />ปกติ</span><span><i className="legend-red" />ไม่ทำงาน</span><span><i className="legend-yellow" />แจ้งเตือน</span><span><i className="legend-gray" />ไม่ทราบ</span></div>
        </div>
        <input ref={fileInput} type="file" accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf" hidden onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = '' }} />
        <div className="map-footer"><span><CircleHelp size={14} /> ลากหมุดเพื่อบันทึกตำแหน่ง · Ctrl + scroll เพื่อซูม · ลากพื้นหลังเพื่อเลื่อน</span><button onClick={() => setZoom(1)}>รีเซ็ตมุมมอง</button></div>
      </section>
      {railOpen && <aside className="map-rail">
        <section className="panel map-rail-panel"><div className="rail-heading"><div><h3>อุปกรณ์บนชั้นนี้</h3><p>{floorDevices.length} รายการ · {activeBuilding?.name}</p></div><button className="icon-btn" onClick={() => setRailOpen(false)}><X size={17} /></button></div>
          <label className="rail-search"><Search size={15} /><input placeholder="ค้นหาอุปกรณ์..." value={mapSearch} onChange={(e) => setMapSearch(e.target.value)} />{mapSearch && <button onClick={() => setMapSearch('')}><X size={13} /></button>}</label>
          <div className="map-device-list">{floorDevices.filter((d) => !mapSearch || [d.id, d.name, d.door].some((v) => v.toLowerCase().includes(mapSearch.toLowerCase()))).map((d) => <button className={`map-device-row ${selectedDevice?.id === d.id ? 'map-device-selected' : ''}`} key={d.id} onClick={() => { setSelectedDevice(d); setOffset({ x: 0, y: 0 }); setZoom(Math.max(zoom, 1)) }} draggable={canEdit} onDragStart={(e) => { e.dataTransfer.setData('deviceId', d.id); onBeginPlace(d) }}><span className={`device-avatar ${statusClass[d.status]}`}><DoorOpen size={15} /></span><span className="map-device-info"><b>{d.name}</b><small>{d.id} · {d.door}</small><small className="map-coord">X {Math.round(d.x)}% · Y {Math.round(d.y)}%</small></span><i className={`status-dot ${statusClass[d.status]}`} /></button>)}
            {!floorDevices.length && <div className="rail-empty"><Map size={20} /><span>ไม่มีอุปกรณ์บนชั้นนี้</span></div>}
            {floorDevices.length > 0 && !floorDevices.some((d) => !mapSearch || [d.id, d.name, d.door].some((v) => v.toLowerCase().includes(mapSearch.toLowerCase()))) && <div className="rail-empty"><Search size={18} /><span>ไม่พบอุปกรณ์ที่ค้นหา</span></div>}
          </div>
          <button className="upload-plan-btn" onClick={onUpload}><Upload size={15} />{plan ? 'เปลี่ยนแผนผัง' : 'อัปโหลดแผนผัง'}<span>PNG, JPG, PDF</span></button>
        </section>
        {selectedDevice && <section className="panel selected-device-panel"><div className="selected-device-head"><span className={`device-avatar ${statusClass[selectedDevice.status]}`}><DoorOpen size={16} /></span><div><b>{selectedDevice.name}</b><small>{selectedDevice.id}</small></div><button className="icon-btn" onClick={() => setSelectedDevice(null)}><X size={16} /></button></div><StatusBadge status={selectedDevice.status} /><div className="device-detail-list"><div><span>Door Name</span><b>{selectedDevice.door}</b></div><div><span>รุ่นอุปกรณ์</span><b>{selectedDevice.model}</b></div><div><span>Control Zone</span><b>{zones.find((z) => z.id === selectedDevice.zone)?.name || '—'}</b></div><div><span>พิกัด X / Y</span><b>{Math.round(selectedDevice.x)}% / {Math.round(selectedDevice.y)}%</b></div><div><span>อัปเดตล่าสุด</span><b>{selectedDevice.updated}</b></div></div>{canEdit && <div className="selected-actions"><button className="btn btn-secondary" onClick={() => onDeviceEdit(selectedDevice)}><Pencil size={14} /> แก้ไขข้อมูล</button><button className="btn btn-secondary" onClick={() => onBeginPlace(selectedDevice)}><LocateFixed size={14} /> วางตำแหน่ง</button></div>}</section>}
        <div className="map-rail-tip"><CircleHelp size={15} /><span><b>คำแนะนำ</b><br />ลากอุปกรณ์บนแผนผังเพื่อปรับตำแหน่ง หรือใช้ปุ่ม “วางตำแหน่ง”</span></div>
      </aside>}
    </div>
  </>
}
function FloorPlanIllustration() {
  return <svg className="floor-plan-svg" viewBox="0 0 1000 670" preserveAspectRatio="xMidYMid meet" aria-label="ตัวอย่างแผนผังชั้น"><defs><pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" fill="#33404d" /></pattern></defs><rect width="1000" height="670" fill="url(#dots)" />
    <rect x="150" y="95" width="700" height="480" rx="4" fill="#111922" stroke="#758392" strokeWidth="2" /><rect x="183" y="129" width="300" height="150" fill="#17232b" stroke="#526372" strokeWidth="2" /><rect x="518" y="129" width="297" height="150" fill="#17232b" stroke="#526372" strokeWidth="2" /><rect x="183" y="299" width="185" height="240" fill="#17232b" stroke="#526372" strokeWidth="2" /><rect x="403" y="299" width="412" height="240" fill="#17232b" stroke="#526372" strokeWidth="2" />
    <path d="M483 129V279M518 129v150M368 299v240M403 299v240M183 279h632M183 299h632M483 299h35M483 539h35" stroke="#8492a0" strokeWidth="2" fill="none" /><path d="M483 171a35 35 0 0 1 35 35M368 365a34 34 0 0 1 35 35M483 444a35 35 0 0 0 35-35" stroke="#47c99a" strokeWidth="1.5" fill="none" strokeDasharray="3 4" />
    <g fill="#758392" fontFamily="IBM Plex Sans Thai, sans-serif" fontSize="13"><text x="220" y="190">สำนักงานต้อนรับ</text><text x="220" y="212" fill="#556371" fontSize="10">RECEPTION · 01</text><text x="595" y="190">พื้นที่สำนักงาน</text><text x="595" y="212" fill="#556371" fontSize="10">OPEN OFFICE · 02</text><text x="225" y="385">ห้องประชุม</text><text x="225" y="407" fill="#556371" fontSize="10">MEETING ROOM · 03</text><text x="560" y="385">พื้นที่ส่วนกลาง</text><text x="560" y="407" fill="#556371" fontSize="10">COMMON AREA · 04</text><text x="463" y="346" fill="#47c99a" fontSize="10">CORRIDOR</text></g>
    <path d="M850 335h38m-10-10 10 10-10 10" stroke="#47c99a" strokeWidth="2" fill="none" /><text x="859" y="358" fill="#758392" fontSize="10">EXIT</text>
    <path d="M127 95h23M150 72v23M850 72v23M850 95h23M127 575h23M150 575v23M850 575v23M850 575h23" stroke="#47c99a" strokeWidth="2" opacity=".8" />
  </svg>
}
function ReportsPage({ devices, buildings, zones, counts, exportCsv, exportExcel, exportPdf }) {
  const [report, setReport] = useState('all')
  const byBuilding = buildings.map((b) => ({ name: b.name, items: devices.filter((d) => d.building === b.id) }))
  const byFloor = buildings.flatMap((b) => Array.from({ length: b.floors }, (_, index) => {
    const floor = String(index + 1)
    return { name: `${b.name} · ชั้น ${floor}`, items: devices.filter((d) => d.building === b.id && d.floor === floor) }
  }))
  const byZone = zones.map((z) => ({ name: z.name, color: z.color, items: devices.filter((d) => d.zone === z.id) }))
  return <>
    <PageHeader eyebrow="REPORTING & ANALYTICS" title="รายงานและส่งออก" description="สรุปข้อมูลระบบ Access Control และส่งออกรายงานตามต้องการ" action={<div className="report-actions"><button className="btn btn-secondary" onClick={exportPdf}><FileText size={16} /> PDF / พิมพ์</button><button className="btn btn-secondary" onClick={exportCsv}><Download size={16} /> CSV</button><button className="btn btn-primary" onClick={exportExcel}><FileSpreadsheet size={16} /> Excel</button></div>} />
    <div className="report-tabs">{[['all', 'ทั้งหมด'], ['status', 'ตามสถานะ'], ['building', 'ตามอาคาร'], ['floor', 'ตามชั้น'], ['zone', 'ตาม Control Zone']].map(([id, label]) => <button key={id} className={report === id ? 'report-tab-active' : ''} onClick={() => setReport(id)}>{label}</button>)}</div>
    <div className="metric-grid report-metrics"><MetricCard title="อุปกรณ์ทั้งหมด" value={counts.total} sub="รวมทุกอาคารและชั้น" icon={Shield} tone="blue" trend="100%" /><MetricCard title="ทำงานปกติ" value={counts.Active} sub="สถานะ Active" icon={ShieldCheck} tone="green" trend={`${counts.total ? Math.round(counts.Active / counts.total * 100) : 0}%`} /><MetricCard title="ไม่ทำงาน" value={counts.Inactive} sub="ต้องตรวจสอบ" icon={ShieldAlert} tone="red" trend="Attention" /><MetricCard title="แจ้งเตือน" value={counts.Warning} sub={`Unknown ${counts.Unknown} รายการ`} icon={AlertTriangle} tone="amber" trend="Monitor" /></div>
    {report === 'all' && <section className="panel report-summary"><div className="panel-heading"><div><h3>สรุปอุปกรณ์ทั้งหมด</h3><p>รายการอุปกรณ์ในระบบ ณ ปัจจุบัน</p></div><span className="report-date">สร้างเมื่อ {new Date().toLocaleDateString('th-TH')}</span></div><DevicesReportTable devices={devices} buildings={buildings} zones={zones} /></section>}
    {report === 'status' && <div className="report-status-grid">{['Active', 'Inactive', 'Warning', 'Unknown'].map((s) => <section className="panel report-status-card" key={s}><div><StatusBadge status={s} /><b>{counts[s]}</b></div><p>{counts.total ? Math.round(counts[s] / counts.total * 100) : 0}% ของอุปกรณ์ทั้งหมด</p><div className="report-bar"><span className={statusClass[s]} style={{ width: `${counts.total ? counts[s] / counts.total * 100 : 0}%` }} /></div><small>{devices.filter((d) => d.status === s).map((d) => d.id).join(' · ') || 'ไม่มีอุปกรณ์'}</small></section>)}</div>}
    {report === 'building' && <div className="report-group-list">{byBuilding.map((item) => <section className="panel report-group" key={item.name}><div className="report-group-title"><Building2 size={18} /><b>{item.name}</b><span>{item.items.length} อุปกรณ์</span><button onClick={exportExcel}><Download size={14} /> ส่งออก</button></div><ReportStatusBar items={item.items} counts={counts} /><div className="report-group-status">{['Active', 'Inactive', 'Warning', 'Unknown'].map((s) => <span key={s}><i className={`status-dot ${statusClass[s]}`} />{statusThai[s]} <b>{item.items.filter((d) => d.status === s).length}</b></span>)}</div></section>)}</div>}
    {report === 'floor' && <div className="report-group-list">{byFloor.filter((item) => item.items.length).map((item) => <section className="panel report-group" key={item.name}><div className="report-group-title"><MapPin size={17} /><b>{item.name}</b><span>{item.items.length} อุปกรณ์</span><button onClick={exportExcel}><Download size={14} /> ส่งออก</button></div><ReportStatusBar items={item.items} /><div className="report-group-status">{item.items.map((d) => <span key={d.id}><i className={`status-dot ${statusClass[d.status]}`} />{d.id} · {d.name}</span>)}</div></section>)}</div>}
    {report === 'zone' && <div className="report-group-list">{byZone.map((item) => <section className="panel report-group" key={item.name}><div className="report-group-title"><Layers3 size={18} style={{ color: item.color }} /><b>{item.name}</b><span>{item.items.length} อุปกรณ์</span><button onClick={exportExcel}><Download size={14} /> ส่งออก</button></div><ReportStatusBar items={item.items} counts={counts} /><div className="report-group-status">{item.items.length ? item.items.map((d) => <span key={d.id}><i className={`status-dot ${statusClass[d.status]}`} />{d.id} · {d.name}</span>) : <small>ไม่มีอุปกรณ์ใน Zone นี้</small>}</div></section>)}</div>}
    <div className="table-note"><FileText size={14} /> Export Excel รองรับข้อมูลภาษาไทย · PDF ใช้เมนูพิมพ์ของเบราว์เซอร์แล้วเลือก “Save as PDF”</div>
  </>
}
function ReportStatusBar({ items }) {
  const total = items.length || 1
  return <div className="report-stacked-bar">{['Active', 'Inactive', 'Warning', 'Unknown'].map((s) => <span key={s} className={statusClass[s]} style={{ width: `${items.filter((d) => d.status === s).length / total * 100}%` }} />)}</div>
}
function DevicesReportTable({ devices, buildings, zones }) {
  return <div className="table-scroll"><table><thead><tr><th>Device ID</th><th>ชื่ออุปกรณ์</th><th>อาคาร / ชั้น</th><th>Control Zone</th><th>สถานะ</th></tr></thead><tbody>{devices.map((d) => <tr key={d.id}><td className="mono-id">{d.id}</td><td className="cell-primary">{d.name}</td><td>{buildings.find((b) => b.id === d.building)?.name} · ชั้น {d.floor}</td><td><span className="zone-label"><i style={{ background: zones.find((z) => z.id === d.zone)?.color }} />{zones.find((z) => z.id === d.zone)?.name}</span></td><td><StatusBadge status={d.status} /></td></tr>)}</tbody></table></div>
}
function AuditPage({ audit }) {
  return <>
    <PageHeader eyebrow="SYSTEM ACTIVITY" title="บันทึกกิจกรรม" description="ตรวจสอบประวัติการเปลี่ยนแปลงและกิจกรรมของผู้ใช้งาน" action={<span className="audit-retention"><ShieldCheck size={15} /> บันทึกล่าสุด {audit.length} รายการ</span>} />
    <section className="panel audit-panel"><div className="table-toolbar"><div className="table-title"><b>ประวัติการใช้งาน</b><span>เรียงตามเวลาล่าสุด</span></div><button className="btn btn-secondary" onClick={() => { const csv = ['เวลา,ผู้ใช้งาน,กิจกรรม,รายละเอียด', ...audit.map((a) => [a.time, a.user, a.action, a.detail].map(csvCell).join(','))].join('\r\n'); const u = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })); const el = document.createElement('a'); el.href = u; el.download = 'audit-log.csv'; el.click(); URL.revokeObjectURL(u) }}><Download size={15} /> ส่งออก CSV</button></div>
      <div className="audit-list">{audit.map((a, i) => <div className="audit-row" key={`${a.time}-${i}`}><div className="audit-icon"><Activity size={16} /></div><div className="audit-message"><b>{a.action}</b><p>{a.detail}</p></div><div className="audit-user"><span className="avatar avatar-tiny">{a.user.split(' ').map((s) => s[0]).join('').slice(0, 2)}</span>{a.user}</div><span className="audit-time"><Clock3 size={13} />{a.time}</span></div>)}{!audit.length && <div className="empty-state">ยังไม่มีบันทึกกิจกรรม</div>}</div>
    </section><div className="table-note"><LockKeyhole size={14} /> Audit Log จัดเก็บในเบราว์เซอร์นี้ · ข้อมูลจะอยู่จนกว่าจะล้างข้อมูลไซต์</div>
  </>
}
function UsersPage({ user, onSignOut }) {
  const users = [{ name: 'System Admin', email: 'admin@sentinel.co.th', role: 'Admin', status: 'Active' }, { name: 'Security Viewer', email: 'viewer@sentinel.co.th', role: 'Viewer', status: 'Active' }]
  return <>
    <PageHeader eyebrow="ACCESS & PERMISSIONS" title="ผู้ใช้งานและสิทธิ์" description="บัญชีผู้ใช้และบทบาทการเข้าถึงระบบ" />
    <div className="users-role-grid"><div className="panel role-card"><div className="role-icon role-admin"><Shield size={19} /></div><div><b>ผู้ดูแลระบบ</b><p>จัดการอุปกรณ์ อาคาร Zone และส่งออกรายงานได้</p></div><span>ADMIN</span></div><div className="panel role-card"><div className="role-icon role-viewer"><Eye size={19} /></div><div><b>ผู้ชม</b><p>ดู Dashboard แผนผัง และรายงานได้อย่างเดียว</p></div><span>VIEWER</span></div></div>
    <section className="panel table-panel users-table"><div className="table-toolbar"><div className="table-title"><b>บัญชีผู้ใช้งาน</b><span>{users.length} บัญชีตัวอย่าง</span></div><span className="read-only-label"><LockKeyhole size={13} /> Demo Mode</span></div><div className="table-scroll"><table><thead><tr><th>ผู้ใช้งาน</th><th>บทบาท</th><th>สถานะ</th><th>การดำเนินการ</th></tr></thead><tbody>{users.map((u) => <tr key={u.email}><td><div className="user-table-cell"><span className="avatar">{u.name.split(' ').map((s) => s[0]).join('').slice(0, 2)}</span><span><b>{u.name}</b><small>{u.email}</small></span></div></td><td><span className={`role-pill ${u.role.toLowerCase()}`}>{u.role === 'Admin' ? 'ผู้ดูแลระบบ' : 'ผู้ชม'}</span></td><td><span className="status-badge status-active"><i />ใช้งาน</span></td><td>{user.email === u.email ? <button className="text-link" onClick={onSignOut}><LogOut size={14} /> ออกจากระบบ</button> : <span className="muted-text">เข้าสู่ระบบเพื่อสลับบัญชี</span>}</td></tr>)}</tbody></table></div></section>
    <div className="table-note"><CircleHelp size={15} /> ต้นแบบนี้ใช้บัญชีทดลองและเก็บข้อมูลในเครื่อง · การยืนยันตัวตนแบบ production ควรเชื่อมต่อ Backend และระบบจัดการ Identity</div>
  </>
}
function Modal({ modal, onClose, onSaveDevice, onSaveBuilding, onSaveZone, buildings, zones, devices, user, onSignOut }) {
  const isEdit = Boolean(modal.value)
  const [error, setError] = useState('')
  const submitDevice = (event) => {
    event.preventDefault(); const f = new FormData(event.currentTarget); const data = Object.fromEntries(f.entries())
    if (devices.some((d) => d.id === data.id && d.id !== modal.value?.id)) return setError('Device ID นี้มีอยู่แล้ว')
    data.x = Number(data.x); data.y = Number(data.y); onSaveDevice({ ...data, _oldId: modal.value?.id })
  }
  const submitBuilding = (event) => { event.preventDefault(); const f = new FormData(event.currentTarget); onSaveBuilding({ id: String(f.get('id')).trim(), name: String(f.get('name')).trim(), floors: Number(f.get('floors')), address: String(f.get('address')).trim() }) }
  const submitZone = (event) => { event.preventDefault(); const f = new FormData(event.currentTarget); onSaveZone({ id: String(f.get('id')).trim(), name: String(f.get('name')).trim(), detail: String(f.get('detail')).trim(), color: String(f.get('color')) }) }
  const title = modal.type === 'device' ? `${isEdit ? 'แก้ไข' : 'เพิ่ม'}อุปกรณ์` : modal.type === 'building' ? `${isEdit ? 'แก้ไข' : 'เพิ่ม'}อาคาร` : modal.type === 'zone' ? `${isEdit ? 'แก้ไข' : 'เพิ่ม'} Control Zone` : 'บัญชีผู้ใช้งาน'
  if (modal.type === 'profile') return <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}><section className="profile-popover"><button className="modal-close" onClick={onClose}><X size={17} /></button><span className="avatar avatar-large">{user.name.split(' ').map((s) => s[0]).join('').slice(0, 2)}</span><h3>{user.name}</h3><p>{user.email}</p><span className={`role-pill ${user.role.toLowerCase()}`}>{user.role === 'Admin' ? 'ผู้ดูแลระบบ' : 'ผู้ชม'}</span><button className="btn btn-secondary profile-logout" onClick={onSignOut}><LogOut size={15} /> ออกจากระบบ</button></section></div>
  return <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}><section className="modal-box">
    <div className="modal-header"><div><div className="eyebrow">SYSTEM CONFIGURATION</div><h2>{title}</h2></div><button className="icon-btn" onClick={onClose}><X size={19} /></button></div>
    {modal.type === 'device' && <form onSubmit={submitDevice}><div className="modal-body"><div className="form-grid">
      <label><span>Device ID <i>*</i></span><input name="id" required placeholder="เช่น AC-011" defaultValue={modal.value?.id} /></label><label><span>ชื่ออุปกรณ์ <i>*</i></span><input name="name" required placeholder="เช่น ประตูทางเข้าหลัก" defaultValue={modal.value?.name} /></label>
      <label><span>ประเภทอุปกรณ์</span><select name="type" defaultValue={modal.value?.type || 'เครื่องอ่านบัตร'}><option>เครื่องอ่านบัตร</option><option>ชุดควบคุมประตู</option><option>เครื่องสแกนใบหน้า</option><option>เครื่องสแกนลายนิ้วมือ</option></select></label><label><span>สถานะ</span><select name="status" defaultValue={modal.value?.status || 'Active'}>{Object.keys(statusThai).map((s) => <option value={s} key={s}>{statusThai[s]}</option>)}</select></label>
      <label><span>อาคาร <i>*</i></span><select name="building" required defaultValue={modal.value?.building || modal.preset?.building || buildings[0]?.id}>{buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label><label><span>ชั้น <i>*</i></span><input name="floor" type="number" min="1" required defaultValue={modal.value?.floor || modal.preset?.floor || '1'} /></label>
      <label><span>Door Name</span><input name="door" placeholder="Door / Room name" defaultValue={modal.value?.door} /></label><label><span>Equipment number</span><input name="equipment" placeholder="EQ-AC-0001" defaultValue={modal.value?.equipment} /></label>
      <label><span>รุ่นอุปกรณ์</span><input name="model" placeholder="ผู้ผลิตและรุ่น" defaultValue={modal.value?.model} /></label><label><span>Control Zone</span><select name="zone" defaultValue={modal.value?.zone || zones[0]?.id}>{zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}</select></label>
      <label><span>ตำแหน่ง X (%)</span><input name="x" type="number" min="0" max="100" defaultValue={modal.value?.x ?? 50} /></label><label><span>ตำแหน่ง Y (%)</span><input name="y" type="number" min="0" max="100" defaultValue={modal.value?.y ?? 50} /></label>
    </div>{error && <div className="form-error"><AlertTriangle size={14} />{error}</div>}<p className="form-footnote"><i>*</i> ข้อมูลตำแหน่งสามารถปรับภายหลังได้บนหน้าแผนผังอาคาร</p></div><div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={onClose}>ยกเลิก</button><button type="submit" className="btn btn-primary"><Check size={15} /> บันทึกข้อมูล</button></div></form>}
    {modal.type === 'building' && <form onSubmit={submitBuilding}><div className="modal-body"><div className="form-grid"><label><span>Building ID <i>*</i></span><input required name="id" disabled={isEdit} placeholder="เช่น BKK-03" defaultValue={modal.value?.id} /></label><label><span>ชื่ออาคาร <i>*</i></span><input required name="name" placeholder="ชื่ออาคาร" defaultValue={modal.value?.name} /></label><label><span>จำนวนชั้น <i>*</i></span><input required name="floors" type="number" min="1" max="200" defaultValue={modal.value?.floors || 1} /></label><label><span>ที่อยู่ / สถานที่</span><input name="address" placeholder="ที่ตั้งอาคาร" defaultValue={modal.value?.address} /></label></div><p className="form-footnote">ไม่สามารถลดจำนวนชั้นต่ำกว่าชั้นที่มีอุปกรณ์ติดตั้งอยู่</p></div><div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={onClose}>ยกเลิก</button><button className="btn btn-primary"><Check size={15} /> บันทึกอาคาร</button></div></form>}
    {modal.type === 'zone' && <form onSubmit={submitZone}><div className="modal-body"><div className="form-grid"><label><span>Zone ID <i>*</i></span><input required name="id" disabled={isEdit} placeholder="เช่น Z-005" defaultValue={modal.value?.id} /></label><label><span>ชื่อ Zone <i>*</i></span><input required name="name" placeholder="ชื่อเขตควบคุม" defaultValue={modal.value?.name} /></label><label className="form-full"><span>รายละเอียด</span><textarea name="detail" rows="3" placeholder="อธิบายพื้นที่หรือข้อกำหนดของเขตควบคุม" defaultValue={modal.value?.detail} /></label><label><span>สีประจำ Zone</span><div className="color-input"><input type="color" name="color" defaultValue={modal.value?.color || '#5e9cff'} /><span>เลือกสีเพื่อจำแนกเขตควบคุม</span></div></label></div></div><div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={onClose}>ยกเลิก</button><button className="btn btn-primary"><Check size={15} /> บันทึก Zone</button></div></form>}
  </section></div>
}

export default App
