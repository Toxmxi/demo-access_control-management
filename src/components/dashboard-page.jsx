import { AlertTriangle, ArrowRight, Building2, ChevronDown, ChevronRight, DoorOpen, MoreHorizontal, Shield, ShieldAlert, ShieldCheck } from 'lucide-react'
import { statusClass, statusThai, colorList } from '../app-constants.js'
import { MetricCard, PageHeader, StatusBadge } from './shared-components.jsx'

// Dashboard แสดง KPI, กราฟ, สถานะ และรายการอุปกรณ์ที่ต้องตรวจสอบ
export function Dashboard({ devices, buildings, zones, counts, setPage, onSelect }) {
  const statusData = ['Active', 'Inactive', 'Warning', 'Unknown'].map((key, i) => ({ name: statusThai[key], value: counts[key], color: colorList[i], key }))
  // ข้อมูลแนวโน้มนี้ยังเป็นค่าตัวอย่าง; เชื่อม API/telemetry ก่อนเรียกว่า real-time
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

// วาดกราฟเส้น SVG จากข้อมูลรายวันโดยไม่พึ่ง charting library เพิ่มเติม
function ActivityChart({ data }) {
  const left = 35; const right = 590; const top = 10; const bottom = 158; const max = 50
  // แปลง index ของข้อมูลเป็นตำแหน่งแนวนอนใน SVG
  const x = (index) => left + index * (right - left) / Math.max(data.length - 1, 1)
  // แปลงค่าข้อมูลเป็นตำแหน่งแนวตั้งใน SVG
  const y = (value) => bottom - value / max * (bottom - top)
  const active = data.map((item, index) => ({ x: x(index), y: y(item.active), name: item.name, value: item.active }))
  const issues = data.map((item, index) => ({ x: x(index), y: y(item.issue), name: item.name, value: item.issue }))
  // สร้าง SVG path ผ่านจุดข้อมูลตามลำดับ
  const line = (points) => points.map((point, index) => `${index ? 'L' : 'M'}${point.x},${point.y}`).join(' ')
  const area = `${line(active)} L${active[active.length - 1].x},${bottom} L${active[0].x},${bottom} Z`
  return <svg viewBox="0 0 600 195" preserveAspectRatio="none" role="img" aria-label="กราฟสรุปกิจกรรมอุปกรณ์ 7 วัน">
    <defs><linearGradient id="activeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#39c796" stopOpacity=".19" /><stop offset="100%" stopColor="#39c796" stopOpacity="0" /></linearGradient></defs>
    {[0, 10, 20, 30, 40, 50].map((value) => <g key={value}><line x1={left} x2={right} y1={y(value)} y2={y(value)} stroke="#202832" /><text x="22" y={y(value) + 3} textAnchor="end" fill="#778190" fontSize="9">{value}</text></g>)}
    <path d={area} fill="url(#activeFill)" /><path d={line(active)} fill="none" stroke="#44c99a" strokeWidth="2" vectorEffect="non-scaling-stroke" /><path d={line(issues)} fill="none" stroke="#f06b72" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    {data.map((item, index) => <g key={item.name}><circle cx={x(index)} cy={y(item.active)} r="3" fill="#44c99a"><title>{item.name}: ทำงานปกติ {item.active}</title></circle><circle cx={x(index)} cy={y(item.issue)} r="3" fill="#f06b72"><title>{item.name}: พบปัญหา {item.issue}</title></circle><text x={x(index)} y="182" textAnchor="middle" fill="#778190" fontSize="9">{item.name}</text></g>)}
  </svg>
}

// วาด donut chart สัดส่วนสถานะอุปกรณ์เป็น SVG
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
