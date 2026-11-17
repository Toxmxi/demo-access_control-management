import { useState } from 'react'
import { AlertTriangle, Building2, Download, FileSpreadsheet, FileText, MapPin, Shield, ShieldAlert, ShieldCheck, Layers3 } from 'lucide-react'
import { statusClass, statusThai } from '../app-constants.js'
import { MetricCard, PageHeader, StatusBadge } from './shared-components.jsx'

// รวมรายงานและจัดกลุ่มข้อมูลตามสถานะ อาคาร ชั้น หรือ Control Zone
export function ReportsPage({ devices, buildings, zones, counts, exportCsv, exportExcel, exportPdf }) {
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

// แถบสัดส่วนสถานะของอุปกรณ์ในกลุ่มรายงานหนึ่งกลุ่ม
function ReportStatusBar({ items }) {
  const total = items.length || 1
  return <div className="report-stacked-bar">{['Active', 'Inactive', 'Warning', 'Unknown'].map((s) => <span key={s} className={statusClass[s]} style={{ width: `${items.filter((d) => d.status === s).length / total * 100}%` }} />)}</div>
}

// ตารางรายละเอียดอุปกรณ์ที่ใช้ซ้ำในรายงานทุกประเภท
function DevicesReportTable({ devices, buildings, zones }) {
  return <div className="table-scroll"><table><thead><tr><th>Device ID</th><th>ชื่ออุปกรณ์</th><th>อาคาร / ชั้น</th><th>Control Zone</th><th>สถานะ</th></tr></thead><tbody>{devices.map((d) => <tr key={d.id}><td className="mono-id">{d.id}</td><td className="cell-primary">{d.name}</td><td>{buildings.find((b) => b.id === d.building)?.name} · ชั้น {d.floor}</td><td><span className="zone-label"><i style={{ background: zones.find((z) => z.id === d.zone)?.color }} />{zones.find((z) => z.id === d.zone)?.name}</span></td><td><StatusBadge status={d.status} /></td></tr>)}</tbody></table></div>
}
