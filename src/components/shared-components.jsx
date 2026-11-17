import { useState } from 'react'
import { Activity, AlertTriangle, ArrowRight, Check, ShieldCheck, LockKeyhole, Eye, EyeOff, CircleUserRound } from 'lucide-react'
import { statusClass, statusThai } from '../app-constants.js'

// หน้าลงชื่อเข้าใช้สำหรับบัญชีทดลอง และส่งค่าฟอร์มให้ handler ของ App
export function Login({ onSubmit, notice }) {
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
    {notice && <div className="toast" role="alert"><AlertTriangle size={16} />{notice}</div>}
  </main>
}

// หัวหน้ามาตรฐานสำหรับชื่อหน้า คำอธิบาย และปุ่ม action เสริม
export function PageHeader({ eyebrow, title, description, action }) {
  return <div className="page-header"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</div>
}

// แปลงสถานะอุปกรณ์เป็น badge สีและข้อความภาษาไทย
export function StatusBadge({ status }) { return <span className={`status-badge status-${statusClass[status]}`}><i />{statusThai[status] || status}</span> }

// การ์ด KPI ที่ใช้ซ้ำใน Dashboard และหน้ารายงาน
export function MetricCard({ title, value, sub, icon: Icon, tone, trend }) {
  return <div className={`metric-card metric-${tone}`}><div className="metric-top"><span>{title}</span><span className="metric-icon"><Icon size={18} /></span></div><div className="metric-value">{String(value).padStart(2, '0')}<span className={`metric-trend trend-${tone}`}>{tone === 'green' ? <Check size={12} /> : tone === 'red' || tone === 'amber' ? <AlertTriangle size={12} /> : <Activity size={12} />}{trend}</span></div><div className="metric-sub">{sub}</div><div className="metric-accent" /></div>
}
