import { useState } from 'react'
import { Activity, AlertTriangle, Check, CircleHelp, Clock3, Download, LogOut, Shield, ShieldCheck, X, LockKeyhole, Eye } from 'lucide-react'
import { statusClass, statusThai } from '../app-constants.js'
import { PageHeader, StatusBadge } from './shared-components.jsx'
import { csvCell } from '../csv-utils.js'

// แสดงประวัติกิจกรรมล่าสุดที่บันทึกใน browser
export function AuditPage({ audit }) {
  return <>
    <PageHeader eyebrow="SYSTEM ACTIVITY" title="บันทึกกิจกรรม" description="ตรวจสอบประวัติการเปลี่ยนแปลงและกิจกรรมของผู้ใช้งาน" action={<span className="audit-retention"><ShieldCheck size={15} /> บันทึกล่าสุด {audit.length} รายการ</span>} />
    <section className="panel audit-panel"><div className="table-toolbar"><div className="table-title"><b>ประวัติการใช้งาน</b><span>เรียงตามเวลาล่าสุด</span></div><button className="btn btn-secondary" onClick={() => { const csv = ['เวลา,ผู้ใช้งาน,กิจกรรม,รายละเอียด', ...audit.map((a) => [a.time, a.user, a.action, a.detail].map(csvCell).join(','))].join('\r\n'); const u = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })); const el = document.createElement('a'); el.href = u; el.download = 'audit-log.csv'; el.click(); URL.revokeObjectURL(u) }}><Download size={15} /> ส่งออก CSV</button></div>
      <div className="audit-list">{audit.map((a, i) => <div className="audit-row" key={`${a.time}-${i}`}><div className="audit-icon"><Activity size={16} /></div><div className="audit-message"><b>{a.action}</b><p>{a.detail}</p></div><div className="audit-user"><span className="avatar avatar-tiny">{a.user.split(' ').map((s) => s[0]).join('').slice(0, 2)}</span>{a.user}</div><span className="audit-time"><Clock3 size={13} />{a.time}</span></div>)}{!audit.length && <div className="empty-state">ยังไม่มีบันทึกกิจกรรม</div>}</div>
    </section><div className="table-note"><LockKeyhole size={14} /> Audit Log จัดเก็บในเบราว์เซอร์นี้ · ข้อมูลจะอยู่จนกว่าจะล้างข้อมูลไซต์</div>
  </>
}

// แสดงบัญชีและบทบาทตัวอย่าง; ไม่ใช่การจัดการผู้ใช้จาก server
export function UsersPage({ user, onSignOut }) {
  const users = [{ name: 'System Admin', email: 'admin@sentinel.co.th', role: 'Admin', status: 'Active' }, { name: 'Security Viewer', email: 'viewer@sentinel.co.th', role: 'Viewer', status: 'Active' }]
  return <>
    <PageHeader eyebrow="ACCESS & PERMISSIONS" title="ผู้ใช้งานและสิทธิ์" description="บัญชีผู้ใช้และบทบาทการเข้าถึงระบบ" />
    <div className="users-role-grid"><div className="panel role-card"><div className="role-icon role-admin"><Shield size={19} /></div><div><b>ผู้ดูแลระบบ</b><p>จัดการอุปกรณ์ อาคาร Zone และส่งออกรายงานได้</p></div><span>ADMIN</span></div><div className="panel role-card"><div className="role-icon role-viewer"><Eye size={19} /></div><div><b>ผู้ชม</b><p>ดู Dashboard แผนผัง และรายงานได้อย่างเดียว</p></div><span>VIEWER</span></div></div>
    <section className="panel table-panel users-table"><div className="table-toolbar"><div className="table-title"><b>บัญชีผู้ใช้งาน</b><span>{users.length} บัญชีตัวอย่าง</span></div><span className="read-only-label"><LockKeyhole size={13} /> Demo Mode</span></div><div className="table-scroll"><table><thead><tr><th>ผู้ใช้งาน</th><th>บทบาท</th><th>สถานะ</th><th>การดำเนินการ</th></tr></thead><tbody>{users.map((u) => <tr key={u.email}><td><div className="user-table-cell"><span className="avatar">{u.name.split(' ').map((s) => s[0]).join('').slice(0, 2)}</span><span><b>{u.name}</b><small>{u.email}</small></span></div></td><td><span className={`role-pill ${u.role.toLowerCase()}`}>{u.role === 'Admin' ? 'ผู้ดูแลระบบ' : 'ผู้ชม'}</span></td><td><span className="status-badge status-active"><i />ใช้งาน</span></td><td>{user.email === u.email ? <button className="text-link" onClick={onSignOut}><LogOut size={14} /> ออกจากระบบ</button> : <span className="muted-text">เข้าสู่ระบบเพื่อสลับบัญชี</span>}</td></tr>)}</tbody></table></div></section>
    <div className="table-note"><CircleHelp size={15} /> ต้นแบบนี้ใช้บัญชีทดลองและเก็บข้อมูลในเครื่อง · การยืนยันตัวตนแบบ production ควรเชื่อมต่อ Backend และระบบจัดการ Identity</div>
  </>
}

// Modal กลางสำหรับฟอร์มอุปกรณ์ อาคาร Zone และโปรไฟล์ผู้ใช้
export function Modal({ modal, onClose, onSaveDevice, onSaveBuilding, onSaveZone, buildings, zones, devices, user, onSignOut }) {
  const isEdit = Boolean(modal.value)
  const [error, setError] = useState('')
  // แปลงฟอร์มอุปกรณ์เป็นข้อมูลตัวเลข/ข้อความและตรวจ Device ID ซ้ำก่อนส่งให้ App
  const submitDevice = (event) => {
    event.preventDefault(); const f = new FormData(event.currentTarget); const data = Object.fromEntries(f.entries())
    if (devices.some((d) => d.id === data.id && d.id !== modal.value?.id)) return setError('Device ID นี้มีอยู่แล้ว')
    data.x = Number(data.x); data.y = Number(data.y); onSaveDevice({ ...data, _oldId: modal.value?.id })
  }
  // อ่านและ normalize ค่าฟอร์มอาคารก่อนส่งให้ handler บันทึกข้อมูล
  const submitBuilding = (event) => { event.preventDefault(); const f = new FormData(event.currentTarget); onSaveBuilding({ id: modal.value?.id ?? String(f.get('id') || '').trim(), name: String(f.get('name')).trim(), floors: Number(f.get('floors')), address: String(f.get('address')).trim() }) }
  // อ่านค่าฟอร์ม Control Zone แล้วส่งต่อให้ handler บันทึก
  const submitZone = (event) => { event.preventDefault(); const f = new FormData(event.currentTarget); onSaveZone({ id: modal.value?.id ?? String(f.get('id') || '').trim(), name: String(f.get('name')).trim(), detail: String(f.get('detail')).trim(), color: String(f.get('color')) }) }
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
