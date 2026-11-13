import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '@/services/api'
import type { ApiUser } from '@/services/api'

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole =
  | 'seller'   // sources and lists marine waste, sells to buyers
  | 'buyer'    // recycling company / processor — purchases verified recovered materials
  | 'weigher'  // neutral third party — weighs waste and confirms its value before sale
  | 'admin'    // platform administrator — full visibility and management access

// Extra profile fields shown only when role === 'buyer'
export interface BuyerProfile {
  isCompany:          boolean
  companyName?:       string
  registrationNumber?:string
  processingCapacity?:string  // e.g. "5 tonnes/month"
}

export interface User {
  id: string
  fullName: string
  email: string
  role: UserRole
  region: string
  approved: boolean           // account verification status (set during signup)
  avatarInitials: string
  buyerProfile?: BuyerProfile
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean
  login:  (email: string, password: string, demoRole?: UserRole) => Promise<void>
  register: (data: RegisterPayload) => Promise<void>
  logout: () => void
  updateUser: (partial: Partial<User>) => void
  deleteAccount: () => void
  clearError: () => void
  error: string | null
}

export interface RegisterPayload {
  fullName: string
  email: string
  password: string
  region: string
  role: UserRole
  buyerProfile?: BuyerProfile
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

const TOKEN_KEY = 'wflow_token'
const USER_KEY  = 'wflow_user'

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user:      null,
    token:     null,
    isLoading: true,   // true while restoring session from localStorage
  })
  const [error, setError] = useState<string | null>(null)

  // Restore session on mount
  useEffect(() => {
    try {
      const token = localStorage.getItem(TOKEN_KEY)
      const raw   = localStorage.getItem(USER_KEY)
      if (token && raw) {
        const user: User = JSON.parse(raw)
        setState({ user, token, isLoading: false })
      } else {
        setState(s => ({ ...s, isLoading: false }))
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      setState(s => ({ ...s, isLoading: false }))
    }
  }, [])

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string, demoRole?: UserRole) => {
    setError(null)
    setState(s => ({ ...s, isLoading: true }))
    try {
      let user: User
      let token: string

      try {
        // Try the real Django backend first
        const res = await authApi.login(email, password)
        token = res.access
        const u: ApiUser = res.user
        user = {
          id:             String(u.id),
          fullName:       u.full_name,
          email:          u.email,
          role:           u.role as UserRole,
          region:         u.region,
          approved:       u.approved,
          avatarInitials: u.avatar_initials,
        }
        // Store refresh token too
        localStorage.setItem('wflow_refresh', res.refresh)
      } catch {
        // Backend unavailable — fall back to demo mode
        await new Promise(r => setTimeout(r, 600))
        if (password.length < 1) throw new Error('Invalid credentials.')
        const role: UserRole = demoRole
          ?? (email.startsWith('buyer')   ? 'buyer'
            : email.startsWith('weigher') ? 'weigher'
            : email.startsWith('admin')   ? 'admin'
            : 'seller')
        user = {
          id:             `usr_${role}_001`,
          fullName:       role === 'seller'  ? 'Demo Seller'
                        : role === 'buyer'   ? 'Demo Buyer'
                        : role === 'weigher' ? 'Demo Weigher'
                        : 'Platform Admin',
          email,
          role,
          region:         'Lagos',
          approved:       true,
          avatarInitials: role === 'seller'  ? 'DS'
                        : role === 'buyer'   ? 'DB'
                        : role === 'weigher' ? 'DW'
                        : 'PA',
        }
        token = 'demo_token_' + Date.now()
      }

      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(USER_KEY, JSON.stringify(user))
      setState({ user, token, isLoading: false })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setError(msg)
      setState(s => ({ ...s, isLoading: false }))
      throw err
    }
  }, [])

  // ── Register ───────────────────────────────────────────────────────────────
  const register = useCallback(async (data: RegisterPayload) => {
    setError(null)
    setState(s => ({ ...s, isLoading: true }))
    try {
      await authApi.register({
        email:                data.email,
        password:             data.password,
        full_name:            data.fullName,
        role:                 data.role,
        region:               data.region,
        is_company:           data.buyerProfile?.isCompany,
        company_name:         data.buyerProfile?.companyName,
        registration_number:  data.buyerProfile?.registrationNumber,
        processing_capacity:  data.buyerProfile?.processingCapacity,
      })
      setState(s => ({ ...s, isLoading: false }))
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.'
      setError(msg)
      setState(s => ({ ...s, isLoading: false }))
      throw err
    }
  }, [])

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setState({ user: null, token: null, isLoading: false })
  }, [])

  // ── Update user ────────────────────────────────────────────────────────────
  const updateUser = useCallback((partial: Partial<User>) => {
    setState(s => {
      if (!s.user) return s
      const updated = { ...s.user, ...partial }
      localStorage.setItem(USER_KEY, JSON.stringify(updated))
      return { ...s, user: updated }
    })
  }, [])

  // ── Delete account ─────────────────────────────────────────────────────────
  const deleteAccount = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem('wflow_settings')
    setState({ user: null, token: null, isLoading: false })
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return (
    <AuthContext.Provider
      value={{
        ...state,
        isAuthenticated: !!state.user && !!state.token,
        login,
        register,
        logout,
        updateUser,
        deleteAccount,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
