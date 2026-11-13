import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider }    from '@/context/AuthContext'
import { TradingProvider } from '@/context/TradingContext'
import { ThemeProvider }   from '@/context/ThemeContext'
import ProtectedRoute      from '@/components/auth/ProtectedRoute'

// Public pages
import LandingPage        from '@/pages/LandingPage'
import SignInPage         from '@/pages/SignInPage'
import RegisterPage       from '@/pages/RegisterPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'

// Dashboard pages
import OverviewPage       from '@/pages/dashboard/OverviewPage'
import WasteMarketPage    from '@/pages/dashboard/WasteMarketPage'
import SettingsPage       from '@/pages/dashboard/SettingsPage'
import BlueCreditsPage    from '@/pages/dashboard/BlueCreditsPage'
import AdminDashboard     from '@/pages/admin/AdminDashboard'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TradingProvider>
          <BrowserRouter>
            <Routes>
              {/* ── Public ── */}
              <Route path="/"                element={<LandingPage />} />
              <Route path="/signin"          element={<SignInPage />} />
              <Route path="/register"        element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* ── Admin ── */}
              <Route path="/admin" element={
                <ProtectedRoute><AdminDashboard /></ProtectedRoute>
              }/>

              {/* ── Protected dashboard ── */}
              <Route path="/dashboard" element={
                <ProtectedRoute><OverviewPage /></ProtectedRoute>
              }/>
              <Route path="/dashboard/market" element={
                <ProtectedRoute><WasteMarketPage /></ProtectedRoute>
              }/>
              <Route path="/dashboard/settings" element={
                <ProtectedRoute><SettingsPage /></ProtectedRoute>
              }/>
              <Route path="/dashboard/credits" element={
                <ProtectedRoute><BlueCreditsPage /></ProtectedRoute>
              }/>

              {/* All other /dashboard/* → overview */}
              <Route path="/dashboard/*" element={
                <ProtectedRoute><OverviewPage /></ProtectedRoute>
              }/>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </TradingProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
