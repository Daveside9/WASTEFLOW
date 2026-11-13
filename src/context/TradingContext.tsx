import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { listingsApi, reportsApi, notifsApi } from '@/services/api'
import type { ApiListing, ApiReport, ApiNotification } from '@/services/api'

// ─── Types ────────────────────────────────────────────────────────────────────

export type WasteType = 'plastic' | 'water_hyacinth' | 'mixed' | 'metal' | 'other'

export type ListingStatus =
  | 'available'
  | 'verified'
  | 'reserved'
  | 'inspecting'
  | 'payment_pending'
  | 'completed'
  | 'cancelled'

export type TradeEventType =
  | 'listing_created'
  | 'interest_expressed'
  | 'meeting_scheduled'
  | 'inspection_confirmed'
  | 'weight_verified'
  | 'weight_agreed'
  | 'payment_escrowed'
  | 'payment_sent'
  | 'payment_received'
  | 'completed'
  | 'cancelled'

export interface TradeEvent {
  id:        string
  type:      TradeEventType
  actorId:   string
  actorName: string
  timestamp: string
  note?:     string
}

export interface WasteListing {
  id:                 string
  sourcerId:          string
  sourcerName:        string
  sourcerRegion:      string
  wasteType:          WasteType
  estimatedWeight:    number
  verifiedWeight?:    number
  verifiedTotal?:     number
  verifiedCondition?: string
  weigherNotes?:      string
  agreedWeight?:      number
  pricePerKg:         number
  totalPrice:         number
  agreedTotal?:       number
  description:        string
  locationArea:       string
  lat?:               number
  lng?:               number
  photos:             string[]
  status:             ListingStatus
  createdAt:          string
  weigherId?:         string
  weigherName?:       string
  verifiedAt?:        string
  buyerId?:           string
  buyerName?:         string
  meetingPoint?:      string
  meetingTime?:       string
  blueCreditsEarned?: number
  paymentMethod?:     string
  timeline:           TradeEvent[]
}

export interface WasteReport {
  id:           string
  reporterId:   string
  reporterName: string
  lat:          number
  lng:          number
  wasteType:    WasteType
  description:  string
  locationArea: string
  createdAt:    string
  resolved:     boolean
}

export interface Notification {
  id:         string
  forRole:    'seller' | 'buyer' | 'weigher' | 'all'
  type:       'new_listing' | 'interest' | 'meeting' | 'payment' | 'completed' | 'verified' | 'system'
  title:      string
  body:       string
  listingId?: string
  read:       boolean
  createdAt:  string
}

export interface CreateListingInput {
  sourcerId:       string
  sourcerName:     string
  sourcerRegion:   string
  wasteType:       WasteType
  estimatedWeight: number
  pricePerKg:      number
  description:     string
  locationArea:    string
  lat?:            number
  lng?:            number
  photos:          string[]
}

interface TradingContextValue {
  listings:      WasteListing[]
  wasteReports:  WasteReport[]
  notifications: Notification[]
  unreadCount:   number
  loading:       boolean
  refresh:       () => Promise<void>
  createListing:          (data: CreateListingInput) => Promise<void>
  cancelListing:          (id: string) => Promise<void>
  confirmPaymentReceived: (id: string) => Promise<void>
  expressInterest:        (id: string, buyerId: string, buyerName: string) => Promise<void>
  scheduleMeeting:        (id: string, point: string, time: string) => Promise<void>
  confirmInspection:      (id: string, agreedWeight: number) => Promise<void>
  confirmPaymentSent:     (id: string) => Promise<void>
  makePayment:            (id: string, method: string) => Promise<void>
  verifyListing:          (id: string, weigherId: string, weigherName: string, verifiedWeight: number, condition?: string, notes?: string) => Promise<void>
  submitWasteReport:      (data: Omit<WasteReport, 'id' | 'createdAt' | 'resolved'>) => Promise<void>
  markNotificationsRead:  () => Promise<void>
  getListingById:         (id: string) => WasteListing | undefined
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 10)
const now = () => new Date().toISOString()

/** True when token is a real Django JWT (3-part base64) */
function isRealToken(token: string | null): boolean {
  if (!token) return false
  return token.startsWith('eyJ') && token.split('.').length === 3
}

// ─── Mappers: Django snake_case → frontend camelCase ─────────────────────────

function mapListing(a: ApiListing): WasteListing {
  return {
    id:                String(a.id),
    sourcerId:         String(a.sourcer),
    sourcerName:       a.sourcer_name,
    sourcerRegion:     a.sourcer_region,
    wasteType:         a.waste_type as WasteType,
    estimatedWeight:   a.estimated_weight,
    verifiedWeight:    a.verified_weight    ?? undefined,
    verifiedTotal:     a.verified_total     ? parseFloat(a.verified_total)  : undefined,
    verifiedCondition: a.verified_condition || undefined,
    weigherNotes:      a.weigher_notes      || undefined,
    agreedWeight:      a.agreed_weight      ?? undefined,
    pricePerKg:        parseFloat(a.price_per_kg),
    totalPrice:        parseFloat(a.total_price),
    agreedTotal:       a.agreed_total       ? parseFloat(a.agreed_total)    : undefined,
    description:       a.description,
    locationArea:      a.location_area,
    lat:               a.lat               ?? undefined,
    lng:               a.lng               ?? undefined,
    photos:            [],
    status:            a.status as ListingStatus,
    createdAt:         a.created_at,
    weigherId:         a.weigher            ? String(a.weigher) : undefined,
    weigherName:       a.weigher_name       ?? undefined,
    verifiedAt:        a.verified_at        ?? undefined,
    buyerId:           a.buyer              ? String(a.buyer)   : undefined,
    buyerName:         a.buyer_name         ?? undefined,
    meetingPoint:      a.meeting_point      || undefined,
    meetingTime:       a.meeting_time       ?? undefined,
    blueCreditsEarned: a.blue_credits_earned ?? undefined,
    paymentMethod:     a.payment_method     || undefined,
    timeline: (a.timeline ?? []).map(e => ({
      id:        String(e.id),
      type:      e.event_type as TradeEventType,
      actorId:   '',
      actorName: e.actor_name ?? '',
      timestamp: e.timestamp,
      note:      e.note       || undefined,
    })),
  }
}

function mapReport(a: ApiReport): WasteReport {
  return {
    id:           String(a.id),
    reporterId:   String(a.reporter),
    reporterName: a.reporter_name,
    lat:          a.lat,
    lng:          a.lng,
    wasteType:    a.waste_type as WasteType,
    description:  a.description,
    locationArea: a.location_area,
    createdAt:    a.created_at,
    resolved:     a.resolved,
  }
}

function mapNotif(a: ApiNotification): Notification {
  return {
    id:        String(a.id),
    forRole:   a.for_role as Notification['forRole'],
    type:      a.notif_type as Notification['type'],
    title:     a.title,
    body:      a.body,
    listingId: a.listing   ? String(a.listing) : undefined,
    read:      a.read,
    createdAt: a.created_at,
  }
}

// ─── Local (demo) action engine ───────────────────────────────────────────────
// Applies trade actions to in-memory listings when no real backend is available.

function mkEvent(type: TradeEventType, actorId: string, actorName: string, note?: string): TradeEvent {
  return { id: uid(), type, actorId, actorName, timestamp: now(), note }
}

function applyLocalAction(
  listings: WasteListing[],
  id: string,
  action: string,
  body: Record<string, unknown>,
): WasteListing[] {
  return listings.map(l => {
    if (l.id !== id) return l
    switch (action) {
      case 'verify': {
        const vw    = Number(body.verified_weight ?? 0)
        const vt    = vw * l.pricePerKg
        const actor = String(body.weigherName ?? 'Weigher')
        return {
          ...l,
          status:            'verified',
          verifiedWeight:    vw,
          verifiedTotal:     vt,
          verifiedCondition: String(body.condition ?? 'clean'),
          weigherNotes:      String(body.notes    ?? ''),
          weigherId:         String(body.weigherId ?? ''),
          weigherName:       actor,
          verifiedAt:        now(),
          timeline: [...l.timeline, mkEvent('weight_verified', String(body.weigherId ?? ''), actor,
            `Verified ${vw}kg (${body.condition ?? 'clean'}) — ₦${vt.toLocaleString()}`)],
        }
      }
      case 'interest': {
        const buyer = String(body.buyerName ?? 'Buyer')
        return {
          ...l,
          status:   'reserved',
          buyerId:  String(body.buyerId ?? ''),
          buyerName: buyer,
          timeline: [...l.timeline, mkEvent('interest_expressed', String(body.buyerId ?? ''), buyer)],
        }
      }
      case 'schedule': {
        const point = String(body.meeting_point ?? '')
        const time  = String(body.meeting_time  ?? '')
        return {
          ...l,
          meetingPoint: point,
          meetingTime:  time,
          timeline: [...l.timeline, mkEvent('meeting_scheduled', l.buyerId ?? '', l.buyerName ?? '',
            `${point} @ ${time}`)],
        }
      }
      case 'inspect': {
        const aw  = Number(body.agreed_weight ?? l.estimatedWeight)
        const at_ = aw * l.pricePerKg
        return {
          ...l,
          status:       'payment_pending',
          agreedWeight: aw,
          agreedTotal:  at_,
          timeline: [...l.timeline, mkEvent('weight_agreed', l.buyerId ?? '', l.buyerName ?? '',
            `Agreed ${aw}kg — ₦${at_.toLocaleString()}`)],
        }
      }
      case 'pay': {
        const method = String(body.method ?? 'Card')
        const total  = l.agreedTotal ?? l.verifiedTotal ?? l.totalPrice
        return {
          ...l,
          paymentMethod: method,
          timeline: [...l.timeline, mkEvent('payment_escrowed', l.buyerId ?? '', l.buyerName ?? '',
            `₦${total.toLocaleString()} paid via ${method} — held in escrow`)],
        }
      }
      case 'confirm': {
        const naira = l.agreedTotal ?? l.verifiedTotal ?? l.totalPrice
        return {
          ...l,
          status:            'completed',
          blueCreditsEarned: naira,
          timeline: [
            ...l.timeline,
            mkEvent('payment_received', l.sourcerId, l.sourcerName),
            mkEvent('completed',        l.sourcerId, l.sourcerName,
              `₦${naira.toLocaleString()} earned — ${naira.toLocaleString()} Blue Credits awarded`),
          ],
        }
      }
      case 'cancel':
        return {
          ...l,
          status:   'cancelled',
          timeline: [...l.timeline, mkEvent('cancelled', l.sourcerId, l.sourcerName)],
        }
      default:
        return l
    }
  })
}

// ─── Context ──────────────────────────────────────────────────────────────────

const TradingContext = createContext<TradingContextValue | null>(null)

export function TradingProvider({ children }: { children: React.ReactNode }) {
  const [listings,      setListings]      = useState<WasteListing[]>([])
  const [wasteReports,  setWasteReports]  = useState<WasteReport[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading,       setLoading]       = useState(true)

  // ── Fetch all data ────────────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    setLoading(true)
    const token = localStorage.getItem('wflow_token')

    if (isRealToken(token)) {
      // ── Backend mode ──
      try {
        const [rawListings, rawReports, rawNotifs] = await Promise.all([
          listingsApi.list(),
          reportsApi.list(),
          notifsApi.list(),
        ])
        setListings(rawListings.map(mapListing))
        setWasteReports(rawReports.map(mapReport))
        setNotifications(rawNotifs.map(mapNotif))
        setLoading(false)
        return
      } catch (err) {
        console.warn('Backend fetch failed, falling back to cache:', err)
      }
    }

    // ── Demo / offline mode ──
    try {
      const ls = localStorage.getItem('wflow_listings')
      const lr = localStorage.getItem('wflow_waste_reports')
      const ln = localStorage.getItem('wflow_notifications')
      if (ls) setListings(JSON.parse(ls))
      if (lr) setWasteReports(JSON.parse(lr))
      if (ln) setNotifications(JSON.parse(ln))
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  // ── Helper: backend action OR local state mutation ─────────────────────────
  const act = useCallback(async (
    id: string,
    action: string,
    body: Record<string, unknown> = {},
  ) => {
    const token = localStorage.getItem('wflow_token')
    if (isRealToken(token)) {
      await listingsApi.action(id, action, body)
      await refresh()
    } else {
      setListings(prev => {
        const next = applyLocalAction(prev, id, action, body)
        localStorage.setItem('wflow_listings', JSON.stringify(next))
        return next
      })
    }
  }, [refresh])

  // ── SELLER: Create listing ────────────────────────────────────────────────
  const createListing = useCallback(async (data: CreateListingInput) => {
    const token = localStorage.getItem('wflow_token')
    if (isRealToken(token)) {
      await listingsApi.create({
        waste_type:       data.wasteType,
        estimated_weight: data.estimatedWeight,
        price_per_kg:     data.pricePerKg,
        description:      data.description,
        location_area:    data.locationArea,
        lat:              data.lat,
        lng:              data.lng,
      })
      await refresh()
      return
    }

    // Demo mode
    const listing: WasteListing = {
      id:              uid(),
      sourcerId:       data.sourcerId,
      sourcerName:     data.sourcerName,
      sourcerRegion:   data.sourcerRegion,
      wasteType:       data.wasteType,
      estimatedWeight: data.estimatedWeight,
      pricePerKg:      data.pricePerKg,
      totalPrice:      data.estimatedWeight * data.pricePerKg,
      description:     data.description,
      locationArea:    data.locationArea,
      lat:             data.lat,
      lng:             data.lng,
      photos:          [],
      status:          'available',
      createdAt:       now(),
      timeline: [mkEvent('listing_created', data.sourcerId, data.sourcerName)],
    }
    setListings(prev => {
      const next = [listing, ...prev]
      localStorage.setItem('wflow_listings', JSON.stringify(next))
      return next
    })
    const notifs: Notification[] = [
      {
        id: uid(), forRole: 'weigher', type: 'new_listing',
        title: '🚨 New Waste Needs Verification',
        body: `${data.sourcerName} posted ${data.estimatedWeight} kg of ${data.wasteType.replace('_',' ')} in ${data.locationArea}.`,
        listingId: listing.id, read: false, createdAt: now(),
      },
      {
        id: uid(), forRole: 'seller', type: 'system',
        title: '✅ Listing Posted',
        body: `Your ${data.estimatedWeight} kg of ${data.wasteType.replace('_',' ')} has been listed and sent to a Weigher.`,
        listingId: listing.id, read: false, createdAt: now(),
      },
    ]
    setNotifications(prev => {
      const next = [...notifs, ...prev]
      localStorage.setItem('wflow_notifications', JSON.stringify(next))
      return next
    })
  }, [refresh])

  // ── SELLER: Cancel ────────────────────────────────────────────────────────
  const cancelListing = useCallback(async (id: string) => {
    await act(id, 'cancel')
  }, [act])

  // ── SELLER: Confirm payment received ──────────────────────────────────────
  const confirmPaymentReceived = useCallback(async (id: string) => {
    await act(id, 'confirm')
  }, [act])

  // ── WEIGHER: Verify ───────────────────────────────────────────────────────
  const verifyListing = useCallback(async (
    id: string, weigherId: string, weigherName: string,
    verifiedWeight: number, condition = 'clean', notes = '',
  ) => {
    await act(id, 'verify', { verified_weight: verifiedWeight, condition, notes, weigherId, weigherName })
  }, [act])

  // ── BUYER: Express interest ───────────────────────────────────────────────
  const expressInterest = useCallback(async (id: string, buyerId: string, buyerName: string) => {
    await act(id, 'interest', { buyerId, buyerName })
  }, [act])

  // ── BUYER: Schedule meeting ───────────────────────────────────────────────
  const scheduleMeeting = useCallback(async (id: string, point: string, time: string) => {
    await act(id, 'schedule', { meeting_point: point, meeting_time: time })
  }, [act])

  // ── BUYER: Confirm inspection ─────────────────────────────────────────────
  const confirmInspection = useCallback(async (id: string, agreedWeight: number) => {
    await act(id, 'inspect', { agreed_weight: agreedWeight })
  }, [act])

  // ── BUYER: Confirm payment sent (legacy) ──────────────────────────────────
  const confirmPaymentSent = useCallback(async (id: string) => {
    await act(id, 'pay', { method: 'Manual Transfer' })
  }, [act])

  // ── BUYER: Pay in-app ─────────────────────────────────────────────────────
  const makePayment = useCallback(async (id: string, method: string) => {
    await act(id, 'pay', { method })
  }, [act])

  // ── Community report ──────────────────────────────────────────────────────
  const submitWasteReport = useCallback(async (
    data: Omit<WasteReport, 'id' | 'createdAt' | 'resolved'>,
  ) => {
    const token = localStorage.getItem('wflow_token')
    if (isRealToken(token)) {
      await reportsApi.create({
        lat:           data.lat,
        lng:           data.lng,
        waste_type:    data.wasteType,
        description:   data.description,
        location_area: data.locationArea,
      })
      await refresh()
      return
    }
    // Demo mode
    const report: WasteReport = { ...data, id: uid(), createdAt: now(), resolved: false }
    setWasteReports(prev => {
      const next = [report, ...prev]
      localStorage.setItem('wflow_waste_reports', JSON.stringify(next))
      return next
    })
  }, [refresh])

  // ── Notifications ─────────────────────────────────────────────────────────
  const markNotificationsRead = useCallback(async () => {
    const token = localStorage.getItem('wflow_token')
    if (isRealToken(token)) {
      try { await notifsApi.markRead() } catch { /* ignore */ }
    }
    setNotifications(prev => {
      const next = prev.map(n => ({ ...n, read: true }))
      localStorage.setItem('wflow_notifications', JSON.stringify(next))
      return next
    })
  }, [])

  const getListingById = useCallback(
    (id: string) => listings.find(l => l.id === id),
    [listings],
  )

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <TradingContext.Provider value={{
      listings, wasteReports, notifications, unreadCount, loading, refresh,
      createListing, cancelListing, confirmPaymentReceived,
      expressInterest, scheduleMeeting, confirmInspection,
      confirmPaymentSent, makePayment,
      verifyListing, submitWasteReport,
      markNotificationsRead, getListingById,
    }}>
      {children}
    </TradingContext.Provider>
  )
}

export function useTrading() {
  const ctx = useContext(TradingContext)
  if (!ctx) throw new Error('useTrading must be used within <TradingProvider>')
  return ctx
}
