import { useEffect, useState } from 'react'
import { Building2, ChevronLeft, ChevronRight, CircleHelp, Clock3, DoorOpen, Filter, MapPin, Pencil, Plus, Search, Shield, ShieldCheck, Trash2, Layers3 } from 'lucide-react'
import { statusClass, statusThai } from '../app-constants.js'
import { PageHeader, StatusBadge } from './shared-components.jsx'

// ตารางบริหารอุปกรณ์ พร้อมค้นหา กรอง แบ่งหน้า และ action ตามสิทธิ์ผู้ใช้
export function DevicesPage({ devices, allDevices, buildings, zones, search, setSearch, statusFilter, setStatusFilter, buildingFilter, setBuildingFilter, zoneFilter, setZoneFilter, canEdit, onAdd, onEdit, onDelete, onLocate }) {
  const [pageNo, setPageNo] = useState(1)
  const pageSize = 8; const pages = Math.max(1, Math.ceil(devices.length / pageSize))
  const current = devices.slice((pageNo - 1) * pageSize, pageNo * pageSize)
  // กลับไปหน้าแรกทุกครั้งที่เงื่อนไขกรองเปลี่ยน
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

// แสดงสรุปอาคารและ action เพิ่ม/แก้ไข/ลบตามสิทธิ์
export function BuildingsPage({ buildings, devices, canEdit, onAdd, onEdit, onDelete }) {
  return <>
    <PageHeader eyebrow="FACILITY MANAGEMENT" title="อาคารและชั้น" description="จัดการอาคาร จำนวนชั้น และดูสรุปอุปกรณ์ในแต่ละพื้นที่" action={canEdit && <button className="btn btn-primary" onClick={onAdd}><Plus size={16} /> เพิ่มอาคาร</button>} />
    <div className="building-cards">{buildings.map((b, i) => { const items = devices.filter((d) => d.building === b.id); const active = items.filter((d) => d.status === 'Active').length; return <article className="panel building-card" key={b.id}><div className={`building-card-art art-${i % 3}`}><div className="building-art-grid" /><Building2 size={34} /><span>{String(i + 1).padStart(2, '0')}</span><div className="building-card-actions">{canEdit && <><button onClick={() => onEdit(b)} aria-label="แก้ไข"><Pencil size={15} /></button><button onClick={() => onDelete(b)} aria-label="ลบ"><Trash2 size={15} /></button></>}</div></div><div className="building-card-content"><div className="eyebrow">{b.id}</div><h3>{b.name}</h3><p><MapPin size={14} />{b.address || 'ยังไม่ได้ระบุที่อยู่'}</p><div className="building-card-stats"><div><b>{b.floors}</b><span>ชั้น</span></div><div><b>{items.length}</b><span>อุปกรณ์</span></div><div><b className="text-green">{active}</b><span>ทำงานปกติ</span></div></div><div className="building-card-bar"><span style={{ width: `${items.length ? active / items.length * 100 : 0}%` }} /></div><div className="building-card-footer"><span><i className="pulse-dot" /> {items.length ? 'เชื่อมต่อแล้ว' : 'ยังไม่มีอุปกรณ์'}</span><span>อัปเดตล่าสุดวันนี้</span></div></div></article>})}
      {canEdit && <button className="add-building-card" onClick={onAdd}><span><Plus size={20} /></span><b>เพิ่มอาคารใหม่</b><small>เพิ่มอาคารและกำหนดจำนวนชั้น</small></button>}</div>
    <div className="table-note"><CircleHelp size={15} /> ไม่สามารถลบอาคารที่ยังมีอุปกรณ์ Access Control เชื่อมโยงอยู่ได้</div>
  </>
}

// แสดง Control Zone จำนวนอุปกรณ์ และสถานะการใช้งานของแต่ละ Zone
export function ZonesPage({ zones, devices, canEdit, onAdd, onEdit, onDelete }) {
  return <>
    <PageHeader eyebrow="ACCESS POLICIES" title="Control Zones" description="กำหนดเขตควบคุมและจัดกลุ่มอุปกรณ์ตามระดับความปลอดภัย" action={canEdit && <button className="btn btn-primary" onClick={onAdd}><Plus size={16} /> เพิ่ม Zone</button>} />
    <div className="zone-overview"><div className="panel zone-highlight"><div className="zone-shield"><Layers3 size={21} /></div><div><b>{zones.length} Control Zones</b><p>จำแนกพื้นที่ควบคุมในองค์กรของคุณ</p></div><div className="zone-dots">{zones.map((z) => <i key={z.id} style={{ background: z.color }} />)}</div></div><div className="panel zone-highlight"><div className="zone-shield zone-shield-blue"><Shield size={21} /></div><div><b>{devices.filter((d) => d.zone).length} อุปกรณ์ที่เชื่อมโยง</b><p>กระจายอยู่ตามเขตควบคุมต่าง ๆ</p></div></div></div>
    <div className="zone-grid">{zones.map((z) => { const items = devices.filter((d) => d.zone === z.id); const active = items.filter((d) => d.status === 'Active').length; return <article className="panel zone-card" key={z.id}><div className="zone-card-head"><span className="zone-color-block" style={{ background: `${z.color}18`, color: z.color, borderColor: `${z.color}40` }}><Layers3 size={19} /></span><div className="zone-card-actions">{canEdit && <><button onClick={() => onEdit(z)} aria-label="แก้ไข"><Pencil size={15} /></button><button onClick={() => onDelete(z)} aria-label="ลบ"><Trash2 size={15} /></button></>}</div></div><div className="eyebrow">{z.id}</div><h3>{z.name}</h3><p>{z.detail}</p><div className="zone-card-bottom"><span><DoorOpen size={14} />{items.length} อุปกรณ์</span><span className="zone-health"><i style={{ background: z.color }} />{active} Active</span></div><div className="zone-progress"><span style={{ background: z.color, width: `${items.length ? active / items.length * 100 : 0}%` }} /></div></article>})}</div>
  </>
}
