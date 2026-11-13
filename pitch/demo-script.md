# WasteFlow — Demo Script
**NIMASA-BEAP Hackathon · Track 6 · Blue Circular Economy**
*Target length: 3–4 minutes*

---

## Before You Start

Have these tabs open and ready:
- `http://localhost:5173` — the app
- Sign-in page ready to go
- No other tabs visible

Keep your browser at **full screen**. Use **dark mode** — it looks sharper on camera.

---

## OPENING (15 seconds)

> *"Nigeria has over 850 km of coastline and thousands of km of inland waterways — and right now, they're full of plastic waste and water hyacinth that nobody can coordinate to clean up.*
>
> *WasteFlow changes that. It's an AI-assisted marine waste marketplace that connects community collectors, independent weighers, and recycling companies into one trusted, incentivised platform.*
>
> *Let me show you how it works."*

---

## SCENE 1 — The AI Map (45 seconds)

**Action:** Open the app. Sign in as **Seller**.

> *"The moment a Seller logs in, they see this — a live AI waste detection map locked to Nigeria."*

**Action:** Point to the pulsing red/orange dots on the map.

> *"These pulsing red dots are AI alerts. Right now, the system is fetching live weather data — real rainfall, wind speed, and humidity — from 18 Nigerian waterway locations. Lagos Lagoon, Bonny River, Badagry Creek, Cross River... and scoring each one for waste accumulation risk."*

**Action:** Click a red dot on the map.

> *"I'll click this critical alert. The AI explains exactly why it flagged this location — heavy rainfall washing waste into the waterway, strong onshore wind. It gives me an estimated quantity. And right here — one tap — I can create a listing directly from this alert."*

---

## SCENE 2 — Seller Posts a Listing (30 seconds)

**Action:** Click **"Create Listing from This Alert"**. Show the pre-filled form.

> *"The listing form is pre-filled — location, waste type, estimated weight — all pulled from the AI alert. I adjust the weight to what I can actually collect, set my price per kg, and post it."*

**Action:** Submit the listing.

> *"The listing is live. And the moment it posts — the Weigher gets a notification."*

---

## SCENE 3 — Weigher Verifies (40 seconds)

**Action:** Sign out. Sign in as **Weigher**.

> *"Now I'm the Weigher — the independent trust layer in this platform. No buyer ever sees unverified waste. I'm the gatekeeper."*

**Action:** Point to the verification queue with the pulsing new listing. Click **"Verify"**.

> *"I've received a notification. The listing is in my queue. I physically go to the location, weigh the material, and enter the actual weight here."*

**Action:** Enter a verified weight. Click next. Select condition. Add a note. Confirm.

> *"I set the material condition — clean, moderate, or contaminated — add any notes, and confirm. The listing is now verified. Its value is locked. And buyers are automatically notified."*

---

## SCENE 4 — Buyer Purchases (40 seconds)

**Action:** Sign out. Sign in as **Buyer**.

> *"Now I'm the Buyer — a recycling company. Watch what I see."*

**Action:** Point to the dashboard — only verified listings visible.

> *"I only see verified listings. Nothing unverified ever reaches me. Every listing shows the Weigher's confirmed weight, the material condition, and the price."*

**Action:** Open a verified listing. Click **"Express Interest & Reserve"**.

> *"I express interest. The material is reserved for me. I schedule a physical inspection — pick a meeting point and time. I inspect the material, confirm the actual weight, and the agreed total is calculated automatically."*

**Action:** Show the trade timeline in the modal.

> *"Every step is recorded in an auditable trade timeline — who did what, when, and for how much."*

**Action:** Click **"Confirm Payment Sent"**.

> *"I confirm payment. The seller confirms receipt — and the trade is complete."*

---

## SCENE 5 — Blue Credits & Close (30 seconds)

**Action:** Sign back in as **Seller**. Show the Blue Credits stat card.

> *"Back as the Seller — Blue Credits have been awarded. Five credits per verified kilogram collected. Transparent, traceable, auditable."*

**Action:** Open Settings. Toggle dark/light mode briefly.

> *"The platform works on desktop and mobile, supports dark and light mode, and is built to be accessible to coastal community members across Nigeria."*

---

## CLOSING (20 seconds)

> *"WasteFlow is the missing coordination layer for Nigeria's marine waste economy.*
>
> *AI detects where waste is. Sellers collect and list it. Weighers verify it. Buyers purchase it. Blue Credits reward the work. And the data builds a real evidence base for NIMASA and state agencies.*
>
> *From marine waste — to community value."*

---

## Tips

- **Speak to the problem first** — judges care more about the problem than the tech
- **Don't rush the Weigher step** — it's the most unique and differentiating part of the platform
- **Mention Open-Meteo** — the fact that the AI uses real live weather data (free, no API key) is impressive
- **Highlight the trust gap** — the Weigher role solving the buyer/seller trust problem is your strongest design insight
- **End on impact** — not features. "Marine waste to community value" is the line to land on

---

## Backup Talking Points (if asked)

**"How is this different from other waste apps?"**
> The Weigher role. No other platform has an independent verification layer that prevents fraud and creates trust between strangers. That's what makes the marketplace work.

**"Is the AI real or demo?"**
> The weather data is 100% live from Open-Meteo. The risk scoring is rules-based — not ML yet. But every verified collection record the platform generates will eventually train a real ML model. We're building the data pipeline now.

**"How do you scale this?"**
> The model is role-based and location-agnostic. We add more monitoring points, more states, more weighers. The AI gets smarter as collection data grows. The marketplace scales as more recyclers join.

**"What about payment integration?"**
> Blue Credits are the incentive layer now. Real money transfer via a payment provider (Flutterwave, Paystack) is the next phase once we have verified users on the backend.
