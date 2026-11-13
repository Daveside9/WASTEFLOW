// Icon names map to lucide-react components — imported per-section

export const impactStats = [
  { value: '—', label: 'Verified Waste Collected',     icon: 'Weight' },
  { value: '—', label: 'Active Collection Hubs',       icon: 'Warehouse' },
  { value: '—', label: 'Cleanup Activities Completed', icon: 'CheckCircle' },
  { value: '—', label: 'Materials Directed to Reuse',  icon: 'Recycle' },
]

export const journeySteps = [
  { num: 1, icon: 'MessageSquarePlus', title: 'List',    desc: 'Sellers post waste they have collected or hold — photo, type, estimated weight, and general area.' },
  { num: 2, icon: 'ScanSearch',        title: 'Assess',  desc: 'AI-assisted categorization helps sort and prioritize listings for verification.' },
  { num: 3, icon: 'Scale',             title: 'Verify',  desc: 'A Weigher weighs the waste and confirms the valuation — a listing alone never counts as sold material.' },
  { num: 4, icon: 'Store',             title: 'Purchase',desc: 'Buyers browse verified material and purchase recovered resources for recycling.' },
  { num: 5, icon: 'Coins',             title: 'Reward',  desc: 'Blue Credits are calculated from the Weigher-verified weight using transparent, configured rules.' },
  { num: 6, icon: 'Leaf',              title: 'Reuse',   desc: 'Recovered materials connect to recyclers and processors through the Circular Marketplace.' },
  { num: 7, icon: 'BarChart3',         title: 'Impact',  desc: 'Verified kilograms, trades, and community participation are tracked end to end.' },
]

export const features = [
  {
    icon: 'Map',
    title: 'AI-Assisted Hotspot Map',
    desc: 'Interactive map showing reported waste locations, priority scores, and environmental context — clearly distinguishing observed, verified, and estimated data.',
  },
  {
    icon: 'FileImage',
    title: 'Easy Waste Reporting',
    desc: 'Submit observations with a photo, location pin, waste category, and quantity estimate. Works on mobile even on slower connections. GPS optional — manual entry always available.',
  },
  {
    icon: 'BadgeCheck',
    title: 'Verified Collection Records',
    desc: 'Every collection is weighed and confirmed by a Weigher, creating an auditable record. The system enforces the distinction between listed and verified material.',
  },
  {
    icon: 'Coins',
    title: 'Blue Credits Ledger',
    desc: 'Transparent incentive points calculated from Weigher-verified weight using transparent, configured rules. Full transaction history with rate disclosure on every entry.',
  },
  {
    icon: 'Store',
    title: 'Circular Marketplace',
    desc: 'Connects verified recovered materials — plastic, water hyacinth, and more — with potential buyers and recyclers. Traceable inventory with condition and availability status.',
  },
  {
    icon: 'BarChart3',
    title: 'Impact Dashboard',
    desc: 'Charts and metrics covering verified kilograms collected, hub activity, report-to-verification conversion, and community participation — all clearly labelled.',
  },
]

export const circularItems = [
  {
    icon: 'Package',
    title: 'Plastic Recovery',
    desc: 'Track plastic waste from coastal collection through Weigher verification to marketplace listing and recycler connection.',
  },
  {
    icon: 'Sprout',
    title: 'Aquatic Vegetation Management',
    desc: 'Responsible removal and management of invasive water hyacinth, with pathways to productive use where safe and feasible.',
  },
  {
    icon: 'Users',
    title: 'Community Participation',
    desc: 'Meaningful incentives and visible impact data keep coastal communities engaged in long-term cleanup efforts.',
  },
  {
    icon: 'Link2',
    title: 'Recycler Connections',
    desc: 'Verified material listings connect collection hubs directly with buyers and processors, reducing the gap between waste and value.',
  },
]

export const roles = [
  { icon: 'Package',  name: 'Seller',  desc: 'Source of waste — list the marine waste you have collected or hold, track your listings, and earn Blue Credits for verified material.' },
  { icon: 'Recycle',  name: 'Buyer',   desc: 'Recycling company or processor — browse verified recovered materials and purchase them for reuse.' },
  { icon: 'Scale',    name: 'Weigher', desc: 'Neutral third party — weigh waste, confirm its value, and turn a listing into verified material before it is sold.' },
]
