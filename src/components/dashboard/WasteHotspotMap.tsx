import { useState, useEffect, useCallback, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  MapPin, Sparkles, RefreshCw,
  ChevronDown, ChevronUp, Navigation, Info, Plus, X,
  Wifi, WifiOff,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTrading } from '@/context/TradingContext'
import type { CreateListingInput, WasteType, WasteReport } from '@/context/TradingContext'
import { WASTE_LABELS } from '@/components/dashboard/CreateListingModal'
import { runWasteAIScan } from '@/services/wasteAI'
import type { AIWasteAlert, RiskLevel } from '@/services/wasteAI'

// ─── Fix Leaflet icon paths broken by Vite ───────────────────────────────────
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// ─── Custom marker icons ──────────────────────────────────────────────────────

function makeCircleIcon(color: string, pulse = false, size = 20) {
  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:${size + 12}px;height:${size + 12}px;display:flex;align-items:center;justify-content:center;">
        ${pulse ? `<div style="
          position:absolute;inset:0;border-radius:50%;
          background:${color};opacity:0.3;
          animation:wapulse 1.4s cubic-bezier(0,0,0.2,1) infinite;
        "></div>` : ''}
        <div style="
          width:${size}px;height:${size}px;border-radius:50%;
          background:${color};border:2.5px solid white;
          box-shadow:0 2px 10px rgba(0,0,0,0.5);
          position:relative;z-index:1;
        "></div>
      </div>
      <style>
        @keyframes wapulse {
          0% { transform:scale(0.8); opacity:0.4; }
          70% { transform:scale(2.2); opacity:0; }
          100% { transform:scale(0.8); opacity:0; }
        }
      </style>
    `,
    iconSize:    [size + 12, size + 12],
    iconAnchor:  [(size + 12) / 2, (size + 12) / 2],
    popupAnchor: [0, -(size / 2 + 6)],
  })
}

function makePinIcon(color: string) {
  return L.divIcon({
    className: '',
    html: `<svg viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:28px;height:36px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4))">
      <path d="M14 0C6.27 0 0 6.27 0 14c0 9.33 14 22 14 22S28 23.33 28 14C28 6.27 21.73 0 14 0z" fill="${color}"/>
      <circle cx="14" cy="14" r="6" fill="white" fill-opacity="0.9"/>
    </svg>`,
    iconSize:    [28, 36],
    iconAnchor:  [14, 36],
    popupAnchor: [0, -36],
  })
}

const RISK_COLORS: Record<RiskLevel, string> = {
  critical: '#EF4444',
  high:     '#F97316',
  medium:   '#F59E0B',
  low:      '#6EE7B7',
}
const RISK_LABELS: Record<RiskLevel, string> = {
  critical: 'Critical',
  high:     'High',
  medium:   'Medium',
  low:      'Low',
}

// ─── Nigeria bounds ───────────────────────────────────────────────────────────

const NIGERIA_CENTRE: [number, number] = [9.0820, 8.6753]
const NIGERIA_BOUNDS: [[number, number], [number, number]] = [
  [4.2406, 2.6917],
  [13.8659, 14.6800],
]

// ─── Map helpers ──────────────────────────────────────────────────────────────

function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => { map.flyTo([lat, lng], 13, { duration: 1.2 }) }, [lat, lng, map])
  return null
}

function PinDropHandler({ onPin }: { onPin: (lat: number, lng: number) => void }) {
  useMapEvents({ click(e) { onPin(e.latlng.lat, e.latlng.lng) } })
  return null
}

// ─── Report modal ─────────────────────────────────────────────────────────────

function ReportModal({
  lat, lng, onClose, onSubmit, onListInstead,
}: {
  lat: number; lng: number
  onClose: () => void
  onSubmit: (d: Omit<WasteReport, 'id' | 'createdAt' | 'resolved'>) => void
  onListInstead: (lat: number, lng: number) => void
}) {
  const { user } = useAuth()
  const [type,    setType]    = useState<WasteType>('plastic')
  const [desc,    setDesc]    = useState('')
  const [area,    setArea]    = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!area.trim()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    onSubmit({ reporterId: user!.id, reporterName: user!.fullName, lat, lng, wasteType: type, description: desc, locationArea: area })
    setLoading(false)
    onClose()
  }

  const inp = `w-full px-3.5 py-2.5 rounded-xl text-[13px] text-white bg-white/[0.06]
               border border-white/[0.09] focus:border-teal outline-none transition-all placeholder:text-white/25`

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-[400px] rounded-2xl border border-white/[0.08] overflow-hidden" style={{ background: '#0B2233' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div>
            <p className="text-[14.5px] font-bold text-white">Report Waste Location</p>
            <p className="text-[11px] text-white/35 mt-0.5">📍 {lat.toFixed(5)}, {lng.toFixed(5)}</p>
          </div>
          <button onClick={onClose} className="text-white/35 hover:text-white cursor-pointer"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="p-5 flex flex-col gap-4">
          <div>
            <p className="text-[11.5px] font-semibold text-white/40 uppercase tracking-wider mb-2">Waste type</p>
            <div className="grid grid-cols-3 gap-1.5">
              {(Object.entries(WASTE_LABELS) as [WasteType, string][]).map(([val, label]) => (
                <button key={val} type="button" onClick={() => setType(val)}
                  className={`py-2 rounded-xl border text-[11.5px] font-medium transition-all cursor-pointer
                              ${type === val ? 'border-teal bg-teal/15 text-teal-light' : 'border-white/[0.08] text-white/35 hover:border-white/20'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[11.5px] font-semibold text-white/40 block mb-1.5">Location name *</label>
            <input className={inp} placeholder="e.g. Apapa shoreline, Lagos" value={area} onChange={e => setArea(e.target.value)} required />
          </div>
          <div>
            <label className="text-[11.5px] font-semibold text-white/40 block mb-1.5">Description (optional)</label>
            <textarea rows={2} className={`${inp} resize-none`} placeholder="Rough quantity, condition…" value={desc} onChange={e => setDesc(e.target.value)} />
          </div>
          <div className="flex gap-2.5">
            <button type="submit" disabled={loading || !area.trim()}
              className="flex-1 py-3 rounded-xl bg-teal hover:bg-teal-dark disabled:opacity-40 text-white text-[13px] font-semibold shadow-teal flex items-center justify-center gap-2 transition-all cursor-pointer">
              {loading ? <><RefreshCw size={13} className="animate-spin" /> Reporting…</> : '📍 Submit Report'}
            </button>
            <button type="button" onClick={() => { onListInstead(lat, lng); onClose() }}
              className="flex-1 py-3 rounded-xl border border-teal/30 text-teal-light hover:bg-teal/10 text-[13px] font-semibold transition-all cursor-pointer">
              + List Instead
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Alert detail panel ───────────────────────────────────────────────────────

function AlertDetail({ alert, onClose, onList }: { alert: AIWasteAlert; onClose: () => void; onList: (a: AIWasteAlert) => void }) {
  const color = RISK_COLORS[alert.risk]
  return (
    <div className="border-t border-white/[0.06] bg-black/20 flex-shrink-0">
      <div className="flex items-start justify-between p-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full flex-shrink-0 animate-pulse" style={{ background: color }} />
          <p className="text-[13.5px] font-bold text-white leading-snug">{alert.name}</p>
        </div>
        <button onClick={onClose} className="text-white/30 hover:text-white cursor-pointer flex-shrink-0 ml-2"><X size={15} /></button>
      </div>
      <div className="px-4 pb-2 flex flex-wrap gap-2">
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: color }}>
          {RISK_LABELS[alert.risk]} Risk — {alert.score}/100
        </span>
        <span className="text-[11px] text-white/40 bg-white/[0.06] px-2 py-0.5 rounded-full capitalize">
          {alert.wasteType.replace('_', ' ')}
        </span>
        <span className="text-[11px] text-white/40 bg-white/[0.06] px-2 py-0.5 rounded-full">
          ~{alert.estimatedKg.toLocaleString()} kg
        </span>
        <span className="text-[11px] flex items-center gap-1 text-white/30">
          {alert.dataSource === 'live' ? <><Wifi size={10} className="text-teal-light" /> Live weather</> : <><WifiOff size={10} /> Offline estimate</>}
        </span>
      </div>
      {/* Weather */}
      <div className="px-4 pb-2 grid grid-cols-3 gap-2">
        {[
          { label: 'Rainfall',  value: `${alert.rainfall.toFixed(1)} mm` },
          { label: 'Wind',      value: `${alert.windSpeed.toFixed(0)} km/h ${alert.windDir}` },
          { label: 'Humidity',  value: `${alert.humidity}%` },
        ].map(s => (
          <div key={s.label} className="bg-white/[0.04] rounded-lg p-2 border border-white/[0.05]">
            <p className="text-[9.5px] text-white/25 uppercase tracking-wider">{s.label}</p>
            <p className="text-[12px] font-semibold text-white mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>
      {/* Reasons */}
      <div className="px-4 pb-3">
        <p className="text-[10.5px] text-white/25 uppercase tracking-wider mb-1.5">Why AI flagged this</p>
        <ul className="flex flex-col gap-1">
          {alert.reasons.map((r, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[11.5px] text-white/50">
              <span className="mt-1 w-1 h-1 rounded-full flex-shrink-0" style={{ background: color }} />
              {r}
            </li>
          ))}
        </ul>
      </div>
      <div className="px-4 pb-4">
        <button onClick={() => onList(alert)}
          className="w-full py-2.5 rounded-xl bg-teal hover:bg-teal-dark text-white text-[13px] font-semibold
                     shadow-teal transition-all cursor-pointer flex items-center justify-center gap-2">
          <Plus size={14} /> Create Listing from This Alert
        </button>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props { onCreateListing: (data: Partial<CreateListingInput>) => void }

export default function WasteHotspotMap({ onCreateListing }: Props) {
  const { listings, wasteReports, submitWasteReport } = useTrading()

  const [alerts,       setAlerts]       = useState<AIWasteAlert[]>([])
  const [scanning,     setScanning]     = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanTotal,    setScanTotal]    = useState(18)
  const [lastScan,     setLastScan]     = useState<string | null>(null)
  const [selectedAlert,setSelectedAlert]= useState<AIWasteAlert | null>(null)
  const [pinDropMode,  setPinDropMode]  = useState(false)
  const [droppedPin,   setDroppedPin]   = useState<{ lat: number; lng: number } | null>(null)
  const [flyTarget,    setFlyTarget]    = useState<{ lat: number; lng: number } | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [expanded,     setExpanded]     = useState(true)
  const [filterRisk,   setFilterRisk]   = useState<'all' | RiskLevel>('all')
  const hasScanned = useRef(false)

  // Auto-scan on first load
  useEffect(() => {
    if (hasScanned.current) return
    hasScanned.current = true
    doScan()
  }, [])

  const doScan = useCallback(async () => {
    setScanning(true)
    setScanProgress(0)
    try {
      const results = await runWasteAIScan((done, total) => {
        setScanProgress(done)
        setScanTotal(total)
      })
      setAlerts(results)
      setLastScan(new Date().toLocaleTimeString())
    } catch {
      // silently keep previous alerts
    } finally {
      setScanning(false)
    }
  }, [])

  const locateUser = useCallback(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude: lat, longitude: lng } = pos.coords
      if (lat >= 4.24 && lat <= 13.87 && lng >= 2.69 && lng <= 14.68) {
        setUserLocation({ lat, lng })
        setFlyTarget({ lat, lng })
      } else {
        setFlyTarget({ lat: 9.082, lng: 8.6753 })
      }
    }, () => {}, { timeout: 6000 })
  }, [])

  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (!pinDropMode) return
    setDroppedPin({ lat, lng })
    setPinDropMode(false)
  }, [pinDropMode])

  const handleListFromAlert = useCallback((a: AIWasteAlert) => {
    onCreateListing({
      wasteType:       a.wasteType as WasteType,
      estimatedWeight: Math.round(a.estimatedKg * 0.3),
      pricePerKg:      150,
      locationArea:    a.name,
      lat:             a.lat,
      lng:             a.lng,
      description:     `AI Alert — ${a.reasons[0]}. Weather: ${a.rainfall.toFixed(1)}mm rain, ${a.windSpeed.toFixed(0)}km/h wind.`,
    })
    setSelectedAlert(null)
  }, [onCreateListing])

  const mappedListings = listings.filter(l => l.lat && l.lng)
  const mappedReports  = wasteReports.filter(r => r.lat && r.lng)
  const criticalCount  = alerts.filter(a => a.risk === 'critical').length
  const highCount      = alerts.filter(a => a.risk === 'high').length
  const filteredAlerts = alerts.filter(a => filterRisk === 'all' || a.risk === filterRisk)

  return (
    <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{ background: '#071C2C' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-red-500/15 flex items-center justify-center">
            <Sparkles size={15} className="text-red-400" strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-[14px] font-bold text-white">AI Waste Detection Map</p>
            <p className="text-[11.5px] mt-0.5">
              {scanning
                ? <span className="text-teal-light">Scanning {scanProgress}/{scanTotal} locations…</span>
                : alerts.length > 0
                  ? <span>
                      {criticalCount > 0 && <span className="text-red-400 font-semibold">{criticalCount} critical </span>}
                      {highCount > 0 && <span className="text-orange-400 font-semibold">{highCount} high </span>}
                      <span className="text-white/35">waste alerts · {lastScan && `Updated ${lastScan}`}</span>
                    </span>
                  : <span className="text-white/35">Real-time weather-based AI detection</span>
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={doScan} disabled={scanning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25
                       text-red-400 text-[12px] font-semibold transition-all cursor-pointer
                       disabled:opacity-50 border border-red-500/25">
            <RefreshCw size={12} className={scanning ? 'animate-spin' : ''} />
            {scanning ? 'Scanning…' : 'Rescan'}
          </button>
          <button onClick={locateUser}
            className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] text-white/55
                       hover:text-white text-[12px] font-semibold transition-all cursor-pointer border border-white/[0.08]">
            <Navigation size={12} />
          </button>
          <button onClick={() => setExpanded(e => !e)} className="text-white/30 hover:text-white cursor-pointer">
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Scan progress bar */}
      {scanning && (
        <div className="h-1 bg-white/[0.06]">
          <div className="h-full bg-red-500 transition-all duration-300"
               style={{ width: `${scanTotal > 0 ? (scanProgress / scanTotal) * 100 : 0}%` }} />
        </div>
      )}

      {expanded && (
        <>
          {/* Toolbar */}
          <div className="flex items-center gap-3 px-5 py-2.5 border-b border-white/[0.06] bg-white/[0.02] flex-wrap">
            <button onClick={() => setPinDropMode(p => !p)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-[12px] font-semibold transition-all cursor-pointer
                          ${pinDropMode ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-teal/10 border-teal/25 text-teal-light hover:bg-teal/20'}`}>
              <MapPin size={12} /> {pinDropMode ? '✕ Cancel pin drop' : '📍 Report Waste Here'}
            </button>
            <div className="flex items-center gap-1.5">
              <Info size={11} className="text-white/20" />
              <span className="text-[11px] text-white/25">
                {pinDropMode ? 'Click the map to pin a waste location' : 'AI scans 18 Nigerian waterways using live weather data'}
              </span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row" style={{ minHeight: 500 }}>

            {/* Map */}
            <div className="flex-1 relative" style={{ minHeight: 400, height: 500 }}>
              <MapContainer
                center={NIGERIA_CENTRE}
                zoom={6}
                minZoom={6}
                maxZoom={17}
                maxBounds={NIGERIA_BOUNDS}
                maxBoundsViscosity={1.0}
                style={{ height: '100%', width: '100%' }}
                zoomControl
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {flyTarget && <FlyTo lat={flyTarget.lat} lng={flyTarget.lng} />}
                {pinDropMode && <PinDropHandler onPin={handleMapClick} />}

                {/* User location */}
                {userLocation && (
                  <Marker position={[userLocation.lat, userLocation.lng]} icon={makeCircleIcon('#6366F1', false, 14)}>
                    <Popup><div style={{ fontSize: 12, fontFamily: 'Inter,sans-serif' }}><strong>📍 Your Location</strong></div></Popup>
                  </Marker>
                )}

                {/* Dropped pin */}
                {droppedPin && (
                  <Marker position={[droppedPin.lat, droppedPin.lng]} icon={makePinIcon('#EF4444')}>
                    <Popup><div style={{ fontSize: 12, fontFamily: 'Inter,sans-serif' }}>New pin — fill in the report form</div></Popup>
                  </Marker>
                )}

                {/* ── AI WASTE ALERT DOTS ── */}
                {filteredAlerts.map(alert => {
                  const color = RISK_COLORS[alert.risk]
                  const pulse = alert.risk === 'critical' || alert.risk === 'high'
                  const size  = alert.risk === 'critical' ? 22
                              : alert.risk === 'high'     ? 18
                              : alert.risk === 'medium'   ? 14 : 10
                  return (
                    <div key={alert.id}>
                      {/* Radius circle showing affected area */}
                      <Circle
                        center={[alert.lat, alert.lng]}
                        radius={alert.risk === 'critical' ? 4000 : alert.risk === 'high' ? 2500 : 1200}
                        pathOptions={{
                          color,
                          fillColor:   color,
                          fillOpacity: alert.risk === 'critical' ? 0.12 : 0.07,
                          weight:      alert.risk === 'critical' ? 2 : 1,
                          dashArray:   alert.risk === 'critical' ? undefined : '4 4',
                        }}
                      />
                      <Marker
                        position={[alert.lat, alert.lng]}
                        icon={makeCircleIcon(color, pulse, size)}
                        eventHandlers={{
                          click: () => {
                            setSelectedAlert(prev => prev?.id === alert.id ? null : alert)
                            setFlyTarget({ lat: alert.lat, lng: alert.lng })
                          },
                        }}
                      >
                        <Popup>
                          <div style={{ minWidth: 200, fontFamily: 'Inter,sans-serif' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                              <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
                              <strong style={{ fontSize: 13 }}>{alert.name}</strong>
                            </div>
                            <p style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>
                              {alert.state} · {alert.wasteType.replace('_', ' ')} · ~{alert.estimatedKg.toLocaleString()} kg
                            </p>
                            <div style={{ fontSize: 11, color: '#555', marginBottom: 8 }}>
                              {alert.reasons[0]}
                            </div>
                            <div style={{ display: 'flex', gap: 6, fontSize: 11, marginBottom: 10 }}>
                              <span>🌧 {alert.rainfall.toFixed(1)}mm</span>
                              <span>💨 {alert.windSpeed.toFixed(0)}km/h</span>
                              <span>💧 {alert.humidity}%</span>
                            </div>
                            <button
                              onClick={() => handleListFromAlert(alert)}
                              style={{
                                width: '100%', padding: '7px 0',
                                background: color, color: 'white', border: 'none',
                                borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer',
                              }}
                            >
                              + List This Waste
                            </button>
                          </div>
                        </Popup>
                      </Marker>
                    </div>
                  )
                })}

                {/* Real listings */}
                {mappedListings.map(l => (
                  <Marker key={l.id} position={[l.lat!, l.lng!]} icon={makePinIcon(l.status === 'verified' ? '#22C55E' : '#0FA68E')}>
                    <Popup>
                      <div style={{ fontSize: 12, fontFamily: 'Inter,sans-serif' }}>
                        <strong>{WASTE_LABELS[l.wasteType]}</strong> — {l.estimatedWeight} kg<br />
                        <span style={{ color: '#888' }}>{l.locationArea} · {l.sourcerName}</span>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Community reports */}
                {mappedReports.map(r => (
                  <Marker key={r.id} position={[r.lat, r.lng]} icon={makeCircleIcon('#F59E0B', true, 14)}>
                    <Popup>
                      <div style={{ fontSize: 12, fontFamily: 'Inter,sans-serif' }}>
                        <strong>👥 Community Report</strong><br />
                        {WASTE_LABELS[r.wasteType]} · {r.locationArea}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>

              {/* Legend */}
              <div className="absolute bottom-3 left-3 z-[1000] bg-black/80 backdrop-blur-sm
                              rounded-xl px-3 py-2.5 border border-white/[0.10] flex flex-col gap-1.5">
                <p className="text-[9px] text-white/30 uppercase tracking-wider font-semibold mb-0.5">AI Alerts</p>
                {(['critical','high','medium','low'] as RiskLevel[]).map(r => (
                  <div key={r} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: RISK_COLORS[r] }} />
                    <span className="text-[10.5px] text-white/55 capitalize">{r}</span>
                  </div>
                ))}
                <div className="border-t border-white/[0.08] mt-0.5 pt-1.5 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-teal flex-shrink-0" />
                    <span className="text-[10.5px] text-white/40">My listing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400 flex-shrink-0" />
                    <span className="text-[10.5px] text-white/40">Report</span>
                  </div>
                </div>
              </div>

              {/* Pin drop hint */}
              {pinDropMode && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000]
                                bg-red-500/90 text-white text-[12px] font-semibold
                                px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                  <MapPin size={13} /> Click anywhere to drop a pin
                </div>
              )}
            </div>

            {/* Side panel */}
            <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 border-t lg:border-t-0 lg:border-l
                            border-white/[0.06] flex flex-col" style={{ maxHeight: 500 }}>

              {/* Filter tabs */}
              <div className="flex border-b border-white/[0.06] flex-shrink-0">
                {(['all', 'critical', 'high', 'medium', 'low'] as const).map(r => (
                  <button key={r} onClick={() => setFilterRisk(r)}
                    className={`flex-1 py-2 text-[10.5px] font-semibold capitalize transition-all cursor-pointer
                                ${filterRisk === r
                                  ? 'text-white border-b-2'
                                  : 'text-white/25 hover:text-white/50'}`}
                    style={filterRisk === r ? { borderColor: r === 'all' ? '#0FA68E' : RISK_COLORS[r as RiskLevel] } : {}}
                  >
                    {r === 'all' ? `All (${alerts.length})` : r}
                  </button>
                ))}
              </div>

              {/* Alert list */}
              <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
                {scanning && alerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8 gap-3">
                    <RefreshCw size={24} className="text-red-400 animate-spin" />
                    <p className="text-[12.5px] text-white/40">
                      AI scanning {scanProgress}/{scanTotal} Nigerian waterways…
                    </p>
                  </div>
                ) : filteredAlerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8">
                    <p className="text-[12.5px] text-white/25">No alerts for this filter</p>
                  </div>
                ) : (
                  filteredAlerts.map(alert => (
                    <button key={alert.id}
                      onClick={() => { setSelectedAlert(prev => prev?.id === alert.id ? null : alert); setFlyTarget({ lat: alert.lat, lng: alert.lng }) }}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer
                                  ${selectedAlert?.id === alert.id
                                    ? 'border-red-500/40 bg-red-500/[0.08]'
                                    : 'border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06]'}`}>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${alert.risk === 'critical' || alert.risk === 'high' ? 'animate-pulse' : ''}`}
                               style={{ background: RISK_COLORS[alert.risk] }} />
                          <p className="text-[12.5px] font-semibold text-white truncate">{alert.name}</p>
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white flex-shrink-0 capitalize"
                              style={{ background: RISK_COLORS[alert.risk] }}>
                          {alert.risk}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-white/35">
                        <span className="capitalize">{alert.wasteType.replace('_', ' ')}</span>
                        <span>·</span>
                        <span>~{alert.estimatedKg.toLocaleString()} kg</span>
                        <span>·</span>
                        <span>{alert.state}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-white/25">
                        <span>🌧 {alert.rainfall.toFixed(1)}mm</span>
                        <span>💨 {alert.windSpeed.toFixed(0)}km/h</span>
                        {alert.dataSource === 'live'
                          ? <span className="text-teal-light/70 flex items-center gap-0.5"><Wifi size={9} /> Live</span>
                          : <span className="text-white/20 flex items-center gap-0.5"><WifiOff size={9} /> Offline</span>
                        }
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Selected alert detail */}
              {selectedAlert && (
                <AlertDetail
                  alert={selectedAlert}
                  onClose={() => setSelectedAlert(null)}
                  onList={handleListFromAlert}
                />
              )}

              {!selectedAlert && (
                <div className="p-3 border-t border-white/[0.06] flex-shrink-0">
                  <button onClick={() => setPinDropMode(true)}
                    className="w-full py-2.5 rounded-xl bg-teal/10 hover:bg-teal/20 border border-teal/25
                               text-teal-light text-[12.5px] font-semibold cursor-pointer transition-all
                               flex items-center justify-center gap-2">
                    <MapPin size={13} /> Report Waste Manually
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {droppedPin && (
        <ReportModal
          lat={droppedPin.lat} lng={droppedPin.lng}
          onClose={() => setDroppedPin(null)}
          onSubmit={submitWasteReport}
          onListInstead={(lat, lng) => { onCreateListing({ lat, lng }); setDroppedPin(null) }}
        />
      )}
    </div>
  )
}
