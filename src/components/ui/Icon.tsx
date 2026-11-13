import {
  Map, FileImage, BadgeCheck, Coins, Store, BarChart3,
  Package, Sprout, Users, Link2,
  UserCheck, HardHat, Building2, LayoutDashboard, Recycle,
  MessageSquarePlus, ScanSearch, ClipboardList, Truck,
  ShieldCheck, Leaf, Search,
  Waves, Weight, Warehouse, CheckCircle, Scale,
  LucideProps,
} from 'lucide-react'

const icons: Record<string, React.FC<LucideProps>> = {
  Map, FileImage, BadgeCheck, Coins, Store, BarChart3,
  Package, Sprout, Users, Link2,
  UserCheck, HardHat, Building2, LayoutDashboard, Recycle,
  MessageSquarePlus, ScanSearch, ClipboardList, Truck,
  ShieldCheck, Leaf, Search,
  Waves, Weight, Warehouse, CheckCircle, Scale,
}

interface IconProps extends LucideProps {
  name: string
}

export default function Icon({ name, ...props }: IconProps) {
  const Component = icons[name]
  if (!Component) return null
  return <Component {...props} />
}
