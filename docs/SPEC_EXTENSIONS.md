# Aquasource Hub — Spec Extensions
> Decisions made beyond the original v1.0 UI/UX Design Specification.

---

## 1. Added Role: Waste Sourcer

**Decision date:** October 2026
**Status:** Implemented in MVP

### Rationale
The original spec defines "Community Reporter" for casual waste sightings, and "Waste Collector" for those who pick up assigned waste. A gap exists for a semi-professional actor who **actively goes into the field** to locate, assess, and flag waste sites before a collector is assigned.

### Waste Sourcer capabilities
- View the hotspot map to plan sourcing routes
- Log sourcing visits with GPS, photographs, and quantity estimates
- Flag a location as "ready for collection" with evidence
- Be assigned to specific geographic zones by a coordinator
- Earn Blue Credits for sourcing visits that lead to verified collections

### Access control
Waste Sourcer accounts require coordinator approval before activation, to ensure field credibility and prevent false flagging.

---

## 2. Recycler: Individual vs Company

**Decision date:** October 2026
**Status:** Implemented in MVP

### Rationale
The original spec defines a single "Recycler or Buyer" role. In practice, both individual scrap traders and registered recycling companies use the same screens. Rather than creating two separate roles (which would duplicate permissions), the `recycler` role now includes an **optional company profile** collected at registration.

### Company profile fields (optional, shown when "Company / Organisation" is selected)
| Field | Required | Notes |
|---|---|---|
| Company name | Yes (if company) | Displayed on marketplace listings |
| Registration number | No | CAC number or equivalent |
| Processing capacity | No | e.g. "5 tonnes / month" |

### Behaviour
- Individual recyclers see the same screens as company recyclers
- Marketplace listings show "Company" badge when `isCompany = true`
- Administrators can filter marketplace by company/individual

---

## 3. Phase 2 — AI Seaport Waste Tracking Agent

**Decision date:** October 2026
**Status:** Planned — NOT in MVP

### The idea
An autonomous AI agent that monitors seaports and coastal waterways for marine waste accumulation and automatically updates the hotspot map with estimated waste locations — without requiring a human reporter to submit an observation first.

### Data sources to investigate
- **AIS vessel data** — track vessel movement near ports to correlate with waste deposit patterns
- **Tide and current models** — predict drift paths for floating plastic and water hyacinth
- **Wind forecast data** — already partially available via Open-Meteo (used in Phase 1 scoring)
- **Satellite imagery** — medium-term: Sentinel-2 or Planet Labs for coastal surface detection
- **Port authority reports** — where available via API or data partnership

### Design constraints
All agent-generated pins on the hotspot map **must**:
1. Be clearly labelled `AI Estimate — Unverified` with a distinct visual style
2. Show the data sources and confidence level used
3. Never be counted toward verified collection metrics
4. Be reviewed by a coordinator before a cleanup task is created from them

This extends — but does not replace — the existing rule-based hotspot scoring (Phase 1). The spec principle applies here with full force: *"A high-priority score must not be presented as proof that waste is physically present at the predicted location."*

### Suggested Phase 2 backend additions
- `POST /api/v1/hotspots/agent-report/` — agent submits an estimated hotspot
- `GET  /api/v1/hotspots/?source=agent` — filter map by agent-generated pins
- `POST /api/v1/hotspots/{id}/validate/` — coordinator reviews and confirms or dismisses

### When to build
After Phase 1 scoring has been live for at least 3 months and there is sufficient real observation data to measure prediction accuracy against. Do not build the agent before ground-truth validation data exists.
