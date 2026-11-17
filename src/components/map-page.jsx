import { useEffect, useRef, useState } from 'react'
import { Building2, Check, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, DoorOpen, FileText, Map, MapPin, Pencil, Plus, Search, Upload, X, ZoomIn, ZoomOut, RotateCcw, PanelLeftOpen, LocateFixed } from 'lucide-react'
import { statusClass, statusThai } from '../app-constants.js'
import { PageHeader, StatusBadge } from './shared-components.jsx'

// แสดง floor plan และ marker; ส่งงานบันทึก/ลากกลับไปยัง state handlers ใน App
export function MapPage({ buildings, selectedBuilding, setSelectedBuilding, selectedFloor, setSelectedFloor, plan, floorDevices, allFloorDevices, zones, selectedDevice, setSelectedDevice, mapSearch, setMapSearch, zoom, setZoom, offset, setOffset, mapRef, dragging, positionDraft, onSavePosition, onCancelPosition, onUpload, fileInput, onFile, onMarkerDown, onMapDown, onMapMove, onMapUp, onPlace, onDropDevice, canEdit, onDeviceEdit, onAdd, onBeginPlace, onLocate }) {
  const activeBuilding = buildings.find((b) => b.id === selectedBuilding) || buildings[0]
  const [dragOver, setDragOver] = useState(false)
  const [railOpen, setRailOpen] = useState(true)
  const mapCanvasRef = useRef(null)
  const floors = Array.from({ length: activeBuilding?.floors || 1 }, (_, i) => String(i + 1))
  const pendingPosition = positionDraft && allFloorDevices.some((device) => device.id === positionDraft.id) ? positionDraft : null
  // ใช้ non-passive wheel listener เพื่อบล็อก browser zoom เมื่อผู้ใช้ Ctrl/Command + scroll
  useEffect(() => {
    const canvas = mapCanvasRef.current
    if (!canvas) return
    const handleWheel = (event) => {
      if (!event.ctrlKey && !event.metaKey) return
      event.preventDefault()
      setZoom((current) => Math.max(0.65, Math.min(2.2, +(current + (event.deltaY < 0 ? 0.1 : -0.1)).toFixed(2))))
    }
    canvas.addEventListener('wheel', handleWheel, { passive: false })
    return () => canvas.removeEventListener('wheel', handleWheel)
  }, [setZoom])
  // เมื่อเปลี่ยนอาคารหรือจำนวนชั้น ให้กลับชั้นที่เลือกเป็นชั้น 1 หากชั้นเดิมไม่มีแล้ว
  useEffect(() => { if (!floors.includes(selectedFloor)) setSelectedFloor('1') }, [activeBuilding?.id, activeBuilding?.floors])
  // ยกเลิก selection เมื่อเปลี่ยนอาคารหรือชั้นเพื่อไม่แสดงรายละเอียดผิดพื้นที่
  useEffect(() => { if (selectedDevice && (selectedDevice.building !== selectedBuilding || selectedDevice.floor !== selectedFloor)) setSelectedDevice(null) }, [selectedBuilding, selectedFloor])
  return <>
    <PageHeader eyebrow="SPATIAL DEVICE MANAGEMENT" title="แผนผังอาคาร" description="สำรวจและจัดการตำแหน่งอุปกรณ์ Access Control บนแผนผัง" action={<div className="map-header-actions"><span className="live-pill"><i className="pulse-dot" /> {allFloorDevices.length} อุปกรณ์บนชั้นนี้</span>{canEdit && <button className="btn btn-primary" onClick={onAdd}><Plus size={16} /> เพิ่มอุปกรณ์</button>}</div>} />
    <div className="map-layout">
      <section className="map-workspace panel">
        <div className="map-toolbar"><div className="map-selectors"><label><Building2 size={15} /><select value={selectedBuilding} onChange={(e) => setSelectedBuilding(e.target.value)}>{buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select><ChevronDown size={14} /></label><span className="selector-divider" /><button className="floor-prev" disabled={Number(selectedFloor) <= 1} onClick={() => setSelectedFloor(String(Math.max(1, Number(selectedFloor) - 1)))}><ChevronLeft size={15} /></button><label className="floor-selector"><span>ชั้น</span><select value={selectedFloor} onChange={(e) => setSelectedFloor(e.target.value)}>{floors.map((f) => <option key={f} value={f}>{f}</option>)}</select><ChevronDown size={13} /></label><button className="floor-next" disabled={Number(selectedFloor) >= floors.length} onClick={() => setSelectedFloor(String(Math.min(floors.length, Number(selectedFloor) + 1)))}><ChevronRight size={15} /></button></div><div className="map-tools"><span className="map-coordinates">X: — &nbsp; Y: —</span><button onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }) }} title="รีเซ็ตมุมมอง"><RotateCcw size={15} /></button><button onClick={() => setZoom(Math.min(2.2, +(zoom + 0.15).toFixed(2)))} title="ซูมเข้า"><ZoomIn size={16} /></button><button onClick={() => setZoom(Math.max(0.65, +(zoom - 0.15).toFixed(2)))} title="ซูมออก"><ZoomOut size={16} /></button><span className="zoom-label">{Math.round(zoom * 100)}%</span><button onClick={() => setRailOpen(!railOpen)} title="แสดง/ซ่อนรายการ"><PanelLeftOpen size={16} /></button></div></div>
        <div className="map-location-bar"><span><MapPin size={14} />{activeBuilding?.name} <ChevronRight size={13} /> ชั้น {selectedFloor}</span><span className="map-plan-name">{plan ? <><FileText size={13} />{plan.name}</> : 'ยังไม่มีแผนผัง'}</span></div>
        <div ref={mapCanvasRef} className={`map-canvas ${dragOver ? 'map-drag-over' : ''}`} onDragOver={(e) => { e.preventDefault(); setDragOver(true) }} onDragLeave={() => setDragOver(false)} onDrop={(e) => { e.preventDefault(); setDragOver(false); const file = e.dataTransfer.files?.[0]; if (file) onFile(file); else { const id = e.dataTransfer.getData('deviceId'); const device = allFloorDevices.find((d) => d.id === id); if (device) onDropDevice(e, device) } }} onPointerDown={(e) => { if (dragging?.place) onPlace(e); else if (!e.target.closest('.map-marker') && !e.target.closest('.map-legend') && !e.target.closest('.place-hint') && !e.target.closest('.floor-plan-pdf')) onMapDown(e) }} onPointerMove={onMapMove} onPointerUp={onMapUp} onClick={onPlace}>
          <div className="map-grid-pattern" />
          <div className="map-viewport">
            <div ref={mapRef} className="map-plan" style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }}>
              {plan ? plan.type === 'application/pdf' ? <iframe title="Floor Plan PDF" className="floor-plan-pdf" src={plan.data} /> : <img className="floor-plan-image" src={plan.data} alt={`Floor plan ${plan.name}`} draggable="false" /> : <FloorPlanIllustration />}
              <div className="plan-overlay">{floorDevices.filter((d) => !mapSearch || [d.id, d.name, d.door].some((v) => v.toLowerCase().includes(mapSearch.toLowerCase()))).map((d) => { const zone = zones.find((z) => z.id === d.zone); const selected = selectedDevice?.id === d.id; const preview = dragging?.id === d.id && !dragging.place ? dragging : positionDraft?.id === d.id ? positionDraft : null; return <button key={d.id} className={`map-marker marker-${statusClass[d.status]} ${selected ? 'marker-selected' : ''} ${preview ? 'marker-position-preview' : ''} ${mapSearch && [d.id, d.name, d.door].some((v) => v.toLowerCase().includes(mapSearch.toLowerCase())) ? 'marker-search-hit' : ''}`} style={{ left: `${preview?.x ?? d.x}%`, top: `${preview?.y ?? d.y}%`, '--zone-color': zone?.color || '#8995a5' }} onPointerDown={(e) => onMarkerDown(e, d)} onClick={(e) => { e.stopPropagation(); setSelectedDevice(d) }} title={`${d.id} — ${d.name}`}><span className="marker-pin"><DoorOpen size={15} /></span><span className="marker-label">{d.name}</span></button> })}</div>
              {!plan && <div className="plan-caption"><Building2 size={14} /> {activeBuilding?.name.toUpperCase()} <span>·</span> FLOOR {String(selectedFloor).padStart(2, '0')}</div>}
            </div>
          </div>
          {!plan && allFloorDevices.length === 0 && <div className="map-empty-info"><span className="empty-map-icon"><Map size={19} /></span><b>ยังไม่มีอุปกรณ์บนชั้นนี้</b><small>เพิ่มอุปกรณ์ หรือเลือกอุปกรณ์จากรายการด้านขวา</small></div>}
          {dragging?.place && <div className="place-hint"><LocateFixed size={14} /> คลิกบนแผนผังเพื่อวางอุปกรณ์</div>}
          <div className="map-legend"><span><i className="legend-green" />ปกติ</span><span><i className="legend-red" />ไม่ทำงาน</span><span><i className="legend-yellow" />แจ้งเตือน</span><span><i className="legend-gray" />ไม่ทราบ</span></div>
        </div>
        <input ref={fileInput} type="file" accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf" hidden onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = '' }} />
        <div className="map-footer"><span><CircleHelp size={14} /> ลากหมุดเพื่อปรับตำแหน่ง · Ctrl + scroll เพื่อซูม · ลากพื้นหลังเพื่อเลื่อน{pendingPosition && <b className="map-unsaved-label">มีตำแหน่งที่ยังไม่บันทึก</b>}</span><div className="map-footer-actions"><button onClick={() => setZoom(1)}>รีเซ็ตมุมมอง</button>{pendingPosition && canEdit && <><button className="map-cancel-position" onClick={onCancelPosition}>ยกเลิก</button><button className="map-save-position" onClick={onSavePosition}><Check size={13} /> บันทึกตำแหน่ง</button></>}</div></div>
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

// แผนผัง SVG ตัวอย่างที่แสดงเมื่อชั้นนั้นยังไม่มีไฟล์ floor plan
function FloorPlanIllustration() {
  return <svg className="floor-plan-svg" viewBox="0 0 1000 670" preserveAspectRatio="xMidYMid meet" aria-label="ตัวอย่างแผนผังชั้น"><defs><pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" fill="#33404d" /></pattern></defs><rect width="1000" height="670" fill="url(#dots)" />
    <rect x="150" y="95" width="700" height="480" rx="4" fill="#111922" stroke="#758392" strokeWidth="2" /><rect x="183" y="129" width="300" height="150" fill="#17232b" stroke="#526372" strokeWidth="2" /><rect x="518" y="129" width="297" height="150" fill="#17232b" stroke="#526372" strokeWidth="2" /><rect x="183" y="299" width="185" height="240" fill="#17232b" stroke="#526372" strokeWidth="2" /><rect x="403" y="299" width="412" height="240" fill="#17232b" stroke="#526372" strokeWidth="2" />
    <path d="M483 129V279M518 129v150M368 299v240M403 299v240M183 279h632M183 299h632M483 299h35M483 539h35" stroke="#8492a0" strokeWidth="2" fill="none" /><path d="M483 171a35 35 0 0 1 35 35M368 365a34 34 0 0 1 35 35M483 444a35 35 0 0 0 35-35" stroke="#47c99a" strokeWidth="1.5" fill="none" strokeDasharray="3 4" />
    <g fill="#758392" fontFamily="IBM Plex Sans Thai, sans-serif" fontSize="13"><text x="220" y="190">สำนักงานต้อนรับ</text><text x="220" y="212" fill="#556371" fontSize="10">RECEPTION · 01</text><text x="595" y="190">พื้นที่สำนักงาน</text><text x="595" y="212" fill="#556371" fontSize="10">OPEN OFFICE · 02</text><text x="225" y="385">ห้องประชุม</text><text x="225" y="407" fill="#556371" fontSize="10">MEETING ROOM · 03</text><text x="560" y="385">พื้นที่ส่วนกลาง</text><text x="560" y="407" fill="#556371" fontSize="10">COMMON AREA · 04</text><text x="463" y="346" fill="#47c99a" fontSize="10">CORRIDOR</text></g>
    <path d="M850 335h38m-10-10 10 10-10 10" stroke="#47c99a" strokeWidth="2" fill="none" /><text x="859" y="358" fill="#758392" fontSize="10">EXIT</text>
    <path d="M127 95h23M150 72v23M850 72v23M850 95h23M127 575h23M150 575v23M850 575v23M850 575h23" stroke="#47c99a" strokeWidth="2" opacity=".8" />
  </svg>
}
