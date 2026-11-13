// ─── Base config ─────────────────────────────────────────────────────────────

const BASE = 'http://127.0.0.1:8000/api'

function getToken(): string | null {
  return localStorage.getItem('wflow_token')
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  requiresAuth = true,   // set false for public endpoints
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  }
  // Only attach token when needed AND when a valid JWT exists
  if (requiresAuth && token && token.startsWith('eyJ')) {
    headers['Authorization'] = `Bearer ${token}`
  }
  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? JSON.stringify(err))
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    request<{ access: string; refresh: string; user: ApiUser }>(
      '/auth/login/',
      { method: 'POST', body: JSON.stringify({ email, password }) },
      false,   // public — no token needed
    ),

  register: (data: RegisterPayload) =>
    request<{ detail: string }>(
      '/auth/register/',
      { method: 'POST', body: JSON.stringify(data) },
      false,   // public — no token needed
    ),

  me: () => request<ApiUser>('/auth/me/'),

  updateMe: (data: Partial<ApiUser>) =>
    request<ApiUser>('/auth/me/', { method: 'PATCH', body: JSON.stringify(data) }),
}

// ─── Listings ─────────────────────────────────────────────────────────────────

export const listingsApi = {
  list: () =>
    request<ApiListing[]>('/listings/'),

  create: (data: CreateListingPayload) =>
    request<ApiListing>('/listings/', {
      method: 'POST',
      body:   JSON.stringify(data),
    }),

  action: (id: number | string, action: string, body: Record<string, unknown> = {}) =>
    request<ApiListing>(`/listings/${id}/${action}/`, {
      method: 'POST',
      body:   JSON.stringify(body),
    }),
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export const reportsApi = {
  list: () => request<ApiReport[]>('/listings/reports/'),

  create: (data: CreateReportPayload) =>
    request<ApiReport>('/listings/reports/', {
      method: 'POST',
      body:   JSON.stringify(data),
    }),
}

// ─── Notifications ────────────────────────────────────────────────────────────

export const notifsApi = {
  list:    () => request<ApiNotification[]>('/listings/notifications/'),
  markRead: () => request<{ detail: string }>('/listings/notifications/read/', { method: 'POST' }),
}

// ─── API types (snake_case from Django) ──────────────────────────────────────

export interface ApiUser {
  id:                   number
  email:                string
  full_name:            string
  role:                 'seller' | 'buyer' | 'weigher' | 'admin'
  region:               string
  approved:             boolean
  avatar_initials:      string
  is_company?:          boolean
  company_name?:        string
  registration_number?: string
  processing_capacity?: string
}

export interface ApiTradeEvent {
  id:         number
  event_type: string
  actor_name: string
  note:       string
  timestamp:  string
}

export interface ApiListing {
  id:                  number
  sourcer:             number
  sourcer_name:        string
  sourcer_region:      string
  waste_type:          string
  estimated_weight:    number
  verified_weight:     number | null
  agreed_weight:       number | null
  price_per_kg:        string
  total_price:         string
  verified_total:      string | null
  agreed_total:        string | null
  description:         string
  location_area:       string
  lat:                 number | null
  lng:                 number | null
  status:              string
  created_at:          string
  weigher:             number | null
  weigher_name:        string | null
  verified_condition:  string
  weigher_notes:       string
  verified_at:         string | null
  buyer:               number | null
  buyer_name:          string | null
  meeting_point:       string
  meeting_time:        string | null
  payment_method:      string
  blue_credits_earned: number | null
  timeline:            ApiTradeEvent[]
}

export interface ApiReport {
  id:            number
  reporter:      number
  reporter_name: string
  lat:           number
  lng:           number
  waste_type:    string
  description:   string
  location_area: string
  resolved:      boolean
  created_at:    string
}

export interface ApiNotification {
  id:         number
  for_role:   string
  notif_type: string
  title:      string
  body:       string
  listing:    number | null
  read:       boolean
  created_at: string
}

export interface RegisterPayload {
  email:                string
  password:             string
  full_name:            string
  role:                 string
  region:               string
  is_company?:          boolean
  company_name?:        string
  registration_number?: string
  processing_capacity?: string
}

export interface CreateListingPayload {
  waste_type:       string
  estimated_weight: number
  price_per_kg:     number
  description:      string
  location_area:    string
  lat?:             number
  lng?:             number
}

export interface CreateReportPayload {
  lat:           number
  lng:           number
  waste_type:    string
  description:   string
  location_area: string
}
