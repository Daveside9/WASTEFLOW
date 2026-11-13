# 🌊 WasteFlow

**AI-Assisted Marine Waste Management & Blue Circular Economy Platform**

> NIMASA-BEAP Hackathon Submission — Track 6: Blue Circular Economy
> Built with React, TypeScript, Tailwind CSS, Leaflet, Django REST Framework, and Open-Meteo

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [The Problem We Are Solving](#2-the-problem-we-are-solving)
3. [Our Solution](#3-our-solution)
4. [NIMASA-BEAP Alignment](#4-nimasa-beap-alignment)
5. [Role Model](#5-role-model)
6. [Core Features](#6-core-features)
7. [AI Waste Detection System](#7-ai-waste-detection-system)
8. [The Trade Flow](#8-the-trade-flow)
9. [Blue Credits System](#9-blue-credits-system)
10. [UI/UX Design System](#10-uiux-design-system)
11. [Technology Stack](#11-technology-stack)
12. [Project Structure](#12-project-structure)
13. [Getting Started](#13-getting-started)
14. [Backend Setup](#14-backend-setup)
15. [Environment & APIs](#15-environment--apis)
16. [Roadmap](#16-roadmap)
17. [Team](#17-team)

---

## 1. Project Overview

**WasteFlow** is a full-stack web platform that connects communities, waste collectors, independent weighers, and recycling companies to coordinate marine waste management across Nigerian coastal and inland waterway zones.

The platform combines:
- **Real-time AI waste detection** using live weather data from Open-Meteo
- **A structured 3-role marketplace** where waste flows from Seller → Weigher → Buyer
- **Blue Credits** — a transparent incentive system where 1 Blue Credit = ₦1 earned from verified trades
- **In-app escrow payments** — buyers pay through the platform, funds held securely until seller confirms
- **A live Leaflet map** locked to Nigeria showing AI-scored waste hotspots across 18 monitored waterways
- **A Django REST Framework backend** with a full admin dashboard for platform management
- **Role-specific dashboards** tailored to each participant's responsibilities

---

## 2. The Problem We Are Solving

Marine plastic waste and invasive aquatic vegetation (particularly water hyacinth) are disrupting navigation, fishing, aquatic ecosystems, and coastal livelihoods across Nigeria's waterways — including the Niger Delta, Lagos Lagoon, Bonny River, Cross River, and Badagry Creek.

Community cleanup efforts consistently face:

- **No visibility** into where waste is currently accumulating
- **No coordination layer** between collectors and buyers
- **No verified record** of what was actually collected vs what was just reported
- **No incentive structure** to sustain community participation
- **No trusted payment mechanism** between strangers in a peer-to-peer marketplace
- **Weak connection** between collection points and recycling markets
- **No historical data** to identify recurring hotspots over time

---

## 3. Our Solution

WasteFlow provides a central digital platform where:

1. **AI scans 18 Nigerian waterways** using live weather data to predict where waste is likely accumulating right now
2. **Sellers** (waste collectors/community members) see AI alerts on a live map, go collect waste, and post listings
3. **Weighers** (independent verifiers) receive notifications, physically weigh the waste, and confirm its value
4. **Buyers** (recycling companies) browse only verified, weighed listings and pay through the app
5. **Escrow protection** holds the buyer's payment securely until the seller confirms receipt
6. The system awards **Blue Credits** equal to the naira value of the completed trade
7. Sellers can **withdraw Blue Credits** as cash via bank transfer, mobile money, or platform wallet

The core platform promise:
> Help communities identify where cleanup attention is needed, coordinate verified collection, and create a traceable — and paid — path from marine waste to productive reuse.

---

## 4. NIMASA-BEAP Alignment

**Programme:** Nigeria Maritime Administration and Safety Agency — Blue Economy Action Programme
**Track:** Track 6 — Blue Circular Economy

### How WasteFlow Addresses Track 6 Objectives

| BEAP Objective | WasteFlow Response |
|---|---|
| Promote circular economy principles in the maritime sector | Waste-to-resource marketplace connecting collectors to recyclers |
| Reduce marine pollution in Nigerian waters | AI-guided collection targeting highest-risk waterways |
| Create economic opportunities for coastal communities | Blue Credits + in-app payments + withdrawal to bank/mobile money |
| Improve data and evidence base for maritime governance | Verified collection records, hotspot history, Django admin dashboard |
| Leverage technology for blue economy | AI scoring engine + live weather API + GPS mapping + Django backend |
| Support SMEs and informal sector actors | Low-barrier mobile-friendly platform for community sellers |

### Targeted Nigerian Waterways (AI-Monitored)

Lagos Lagoon (Apapa, Ijora, Lekki, Epe) · Badagry Creek · Bonny River / Port Harcourt · Warri River / Escravos · Nun River / Brass River (Bayelsa) · Cross River / Calabar Port · Itu River (Akwa Ibom) · New Calabar River · Imo River Estuary · Ogun River · Ondo Coastline (Ilaje)

---

## 5. Role Model

WasteFlow uses a **3-role model** designed around the actual marketplace flow:

### Seller (Source of Waste)
Collects or locates marine waste and wants to sell it.

- Views AI waste alerts on the live map
- Reports waste locations via pin-drop
- Posts waste listings (type, weight, price, GPS)
- Tracks listings through the full pipeline
- Receives payment through the app + earns Blue Credits

### Weigher (Independent Verifier)
Neutral third party who physically weighs waste and confirms its value — the trust layer of the marketplace.

- Receives notifications when new listings are posted
- Physically weighs and verifies each listing
- Sets actual verified weight, condition (Clean / Moderate / Contaminated) and notes
- Triggers buyer notifications upon verification

### Buyer (Recycling Company)
Purchases verified waste for reuse or processing.

- Browses only Weigher-verified listings
- Expresses interest to reserve material
- Schedules physical inspection with the seller
- Confirms agreed weight at inspection
- Pays through the app (card, bank transfer, USSD, platform wallet)
- Funds held in escrow until seller confirms receipt

**Flow:** Seller lists → Weigher verifies → Buyer pays in-app → Escrow releases to Seller → Blue Credits awarded

---

## 6. Core Features

### AI Waste Detection Map
- Monitors 18 Nigerian coastal and waterway locations in real time
- Fetches live weather data (rainfall, wind, humidity) from Open-Meteo API
- Scores each location 0–100 using a rules-based AI engine
- Displays pulsing red/orange dots for critical and high-risk sites
- Radius circles show the estimated affected area
- One-tap listing creation pre-filled from any AI alert

### In-App Escrow Payment
- Buyers choose from: Debit/Credit Card, Bank Transfer, USSD, or WasteFlow Wallet
- Funds held securely in escrow on the platform
- Released to seller only after seller confirms receipt
- Full payment record in trade timeline

### Blue Credits
- 1 Blue Credit = ₦1 earned from the completed trade
- Full transaction history with pending/earned status
- Withdraw anytime: Bank Transfer, Mobile Money, or Platform Wallet
- Minimum withdrawal: 50 credits (₦500)

### Role-Specific Dashboards
- **Seller:** Stats, AI map, listings, Blue Credits balance
- **Weigher:** Verification queue, profile card, rating, achievement badges
- **Buyer:** Market browse, active trades, order history

### Django Admin Dashboard
- Full CRUD on all platform data
- Manage users, listings, trade events, reports, notifications
- Approve/suspend users
- Bulk delete or clear all data per category
- Colored status badges, search, filters, date hierarchy

### Settings
- Dark / Light mode
- Profile editing
- Notification preferences
- **Sign out & Clear Everything** — wipes all local data and signs out in one click

---

## 7. AI Waste Detection System

The AI engine (`src/services/wasteAI.ts`) runs on the frontend using the free Open-Meteo API.

**Step 1 — Fetch live weather** for each of 18 monitored coordinates:
```
https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}
  &current=precipitation,wind_speed_10m,wind_direction_10m,relative_humidity_2m
  &timezone=Africa/Lagos
```

**Step 2 — Score each location**

| Condition | Score |
|---|---|
| Rainfall > 10mm | +35 |
| Rainfall 3–10mm | +20 |
| Wind speed > 30 km/h | +25 |
| Onshore wind direction | +15 |
| Humidity > 85% | +8 |
| Known high-risk zone | +10 |
| Base score | +20 |

**Step 3 — Classify risk**

| Score | Risk | Colour |
|---|---|---|
| 75–100 | Critical | 🔴 Red (pulsing) |
| 55–74 | High | 🟠 Orange (pulsing) |
| 35–54 | Medium | 🟡 Amber |
| 0–34 | Low | 🟢 Teal |

A high score predicts where conditions favour accumulation — it does not confirm waste is present. The platform clearly labels all data as AI-predicted, live weather, community-reported, or weigher-verified.

---

## 8. The Trade Flow

```
1. AI SCAN          AI flags high-risk waterway → alert on Seller map
2. LIST             Seller posts listing (weight, price, GPS location)
3. VERIFY           Weigher physically weighs → confirms kg + condition
4. INTEREST         Buyer reserves the listing
5. MEETING          Buyer schedules inspection
6. INSPECT          Buyer confirms actual weight → agreed total calculated
7. PAY              Buyer pays in-app → funds go to escrow
8. CONFIRM          Seller confirms receipt → escrow releases → Blue Credits awarded
9. REUSE            Completed trade recorded; material enters circular supply chain
```

Every step is recorded in an auditable trade timeline. Notifications are role-targeted.

---

## 9. Blue Credits System

Blue Credits are WasteFlow's reward currency for verified waste collection.

| Fact | Value |
|---|---|
| Rate | 1 Blue Credit = ₦1 (equal to naira earned from the trade) |
| Earned when | Seller confirms payment received on a completed trade |
| Minimum withdrawal | 50 credits (₦500) |
| Withdrawal methods | Bank Transfer · Mobile Money · Platform Wallet |
| Processing time | Bank: 1–2 days · Mobile Money: Instant · Wallet: Instant |

Credits are shown in the Blue Credits dashboard alongside full transaction history (earned trades in green, pending trades in amber).

---

## 10. UI/UX Design System

### Colour Palette

| Name | Hex | Usage |
|---|---|---|
| Aquatic Teal | `#0FA68E` | Primary actions, active nav |
| Teal Light | `#13C2A8` | Highlights, links |
| Ocean Dark | `#071C2C` | App background (dark) |
| Sidebar Dark | `#040F18` | Sidebar (dark) |
| Deep Ocean | `#123B52` | Headings, brand |
| Amber | `#D97706` | Pending, caution |
| Red | `#EF4444` | Critical alerts |
| Green | `#22C55E` | Verified, completed |

### Themes
Full dark/light mode via CSS custom properties. Persists via localStorage.

### Responsive
Mobile (`< 768px`) · Tablet (`768–1024px`) · Desktop (`> 1024px`)

### Accessibility
WCAG 2.2 AA target · Keyboard navigable · `aria-label` on icon buttons · `role="alert"` on errors · Sufficient colour contrast

---

## 11. Technology Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 18 |
| Language | TypeScript 5 |
| Build tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| Routing | React Router v6 |
| Map | Leaflet + react-leaflet v4 (OpenStreetMap) |
| Weather API | Open-Meteo (free, no key required) |
| Icons | Lucide React |
| Backend | Python 3.14 + Django 5.2 |
| REST API | Django REST Framework 3.16 |
| Auth | JWT via djangorestframework-simplejwt |
| CORS | django-cors-headers |
| Database | SQLite (dev) → PostgreSQL (production) |
| Admin | Django Admin (custom) |

---

## 12. Project Structure

```
wasteflow/
├── src/
│   ├── App.tsx                        # Root routing
│   ├── context/
│   │   ├── AuthContext.tsx            # Auth — calls Django /api/auth/
│   │   ├── TradingContext.tsx         # Listings/trades — calls Django /api/listings/
│   │   └── ThemeContext.tsx
│   ├── services/
│   │   ├── api.ts                     # All Django API calls + type definitions
│   │   └── wasteAI.ts                 # AI scoring engine + Open-Meteo
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── SignInPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── dashboard/
│   │       ├── OverviewPage.tsx       # Role router
│   │       ├── SellerDashboard.tsx
│   │       ├── BuyerDashboard.tsx
│   │       ├── WeigherDashboard.tsx
│   │       ├── WasteMarketPage.tsx
│   │       ├── BlueCreditsPage.tsx    # Credits balance + withdrawal
│   │       └── SettingsPage.tsx
│   └── components/
│       ├── dashboard/
│       │   ├── DashboardShell.tsx
│       │   ├── WasteHotspotMap.tsx
│       │   ├── CreateListingModal.tsx
│       │   ├── VerifyListingModal.tsx
│       │   └── FlowTracker.tsx
│       └── auth/
│
└── backend/                           # Django backend
    ├── manage.py
    ├── requirements.txt
    ├── wasteflow_api/
    │   ├── settings.py
    │   └── urls.py
    ├── accounts/                      # Custom User model + JWT auth
    │   ├── models.py
    │   ├── serializers.py
    │   ├── views.py
    │   ├── urls.py
    │   └── admin.py
    └── listings/                      # Listings, reports, notifications
        ├── models.py
        ├── serializers.py
        ├── views.py
        ├── urls.py
        └── admin.py
```

---

## 13. Getting Started

### Prerequisites
- Node.js 18+ · npm 9+
- Python 3.10+

### Frontend

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Demo Login (without backend)

Select a role on the sign-in page and use any email + password. The app falls back to demo mode automatically if the backend is not running.

| Role | Access |
|---|---|
| **Seller** | AI map, listings, Blue Credits, withdrawals |
| **Weigher** | Verification queue, profile, achievements |
| **Buyer** | Verified market, in-app payments, order history |
| **Admin** | Select Admin role → redirects to `/admin` |

---

## 14. Backend Setup

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Apply migrations
py manage.py migrate

# Create admin superuser
py manage.py createsuperuser

# Start Django server
py manage.py runserver 8000
```

Django admin: [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)

### REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login/` | Login → returns JWT + user |
| POST | `/api/auth/register/` | Create account |
| GET | `/api/auth/me/` | Current user profile |
| GET | `/api/listings/` | All listings |
| POST | `/api/listings/` | Create listing |
| POST | `/api/listings/{id}/verify/` | Weigher verifies |
| POST | `/api/listings/{id}/interest/` | Buyer reserves |
| POST | `/api/listings/{id}/schedule/` | Schedule meeting |
| POST | `/api/listings/{id}/inspect/` | Confirm weight |
| POST | `/api/listings/{id}/pay/` | Buyer pays in-app |
| POST | `/api/listings/{id}/confirm/` | Seller confirms receipt |
| POST | `/api/listings/{id}/cancel/` | Cancel listing |
| GET | `/api/listings/reports/` | Waste reports |
| GET | `/api/listings/notifications/` | Notifications |

### Default Admin Credentials
- **Email:** `admin@wasteflow.com`
- **Password:** `admin123`
*(Change immediately in production)*

---

## 15. Environment & APIs

### Open-Meteo
- **URL:** `https://api.open-meteo.com/v1/forecast`
- **Cost:** Free, no API key required
- **Used for:** Live rainfall, wind, humidity per monitored waterway

No `.env` required for the prototype. For production:

```env
VITE_API_BASE_URL=https://your-backend.com/api
```

---

## 16. Roadmap

| Phase | Status |
|---|---|
| ✅ Phase 1 — UI Foundation | Complete |
| ✅ Phase 2 — Role Dashboards | Complete |
| ✅ Phase 3 — Full Trade Flow | Complete |
| ✅ Phase 4 — AI Detection (Open-Meteo) | Complete |
| ✅ Phase 5 — Django Backend + Admin | Complete |
| ✅ Phase 6 — In-App Escrow Payments | Complete |
| ✅ Phase 7 — Blue Credits + Withdrawal | Complete |
| 🔜 Phase 8 — PostgreSQL + Production Deploy | Planned |
| 🔜 Phase 9 — ML Model (scikit-learn) | Planned |
| 🔜 Phase 10 — Mobile App (PWA / React Native) | Planned |

---

## 17. Team

Built for the **NIMASA-BEAP Hackathon, Track 6 — Blue Circular Economy**

| | |
|---|---|
| **Project** | WasteFlow |
| **Programme** | NIMASA Blue Economy Action Programme (BEAP) |
| **Track** | Track 6 — Blue Circular Economy |
| **Stack** | React + TypeScript + Django REST Framework |
| **Status** | Functional prototype with live AI + real backend |

---

## Licence

Submitted as a hackathon prototype for NIMASA-BEAP Track 6. All rights reserved by the project team.

---

*"From marine waste to market — verified, traceable, and rewarded."*
