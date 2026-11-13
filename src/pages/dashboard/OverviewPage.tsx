import { useAuth } from '@/context/AuthContext'
import SellerDashboard  from '@/pages/dashboard/SellerDashboard'
import BuyerDashboard   from '@/pages/dashboard/BuyerDashboard'
import WeigherDashboard from '@/pages/dashboard/WeigherDashboard'

// Thin role router: each role renders its own tailored dashboard (which owns
// its DashboardShell chrome), so this page no longer renders the shell itself.
export default function OverviewPage() {
  const { user } = useAuth()

  switch (user?.role) {
    case 'seller':  return <SellerDashboard />
    case 'buyer':   return <BuyerDashboard />
    case 'weigher': return <WeigherDashboard />
    default:        return <SellerDashboard />
  }
}
