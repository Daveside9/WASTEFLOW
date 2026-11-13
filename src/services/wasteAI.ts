// ─── Waste AI Service ─────────────────────────────────────────────────────────
// Uses Open-Meteo (free, no API key) to fetch real weather for Nigerian coastal
// zones, then scores each location for waste accumulation risk.

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low'

export interface AIWasteAlert {
  id:           string
  name:         string
  state:        string
  lat:          number
  lng:          number
  risk:         RiskLevel
  score:        number        // 0–100
  wasteType:    string
  estimatedKg:  number
  reasons:      string[]      // why AI flagged this location
  rainfall:     number        // mm in last 24h (real)
  windSpeed:    number        // km/h (real)
  windDir:      string        // compass direction (real)
  humidity:     number        // % (real)
  lastUpdated:  string        // ISO timestamp
  dataSource:   'live'| 'cached' | 'unavailable'
}

// ─── Nigerian coastal & waterway monitoring points ────────────────────────────
// These are real coordinates of known waste-prone waterways in Nigeria

const MONITORING_POINTS = [
  // Lagos
  { id: 'lag-1',  name: 'Lagos Lagoon — Apapa',        state: 'Lagos',     lat: 6.4474, lng: 3.3903, baseWaste: 'plastic',        baseKg: 2000 },
  { id: 'lag-2',  name: 'Lagos Lagoon — Ijora',         state: 'Lagos',     lat: 6.4698, lng: 3.3852, baseWaste: 'mixed',           baseKg: 1500 },
  { id: 'lag-3',  name: 'Badagry Creek',                state: 'Lagos',     lat: 6.4140, lng: 2.8880, baseWaste: 'water_hyacinth',  baseKg: 4000 },
  { id: 'lag-4',  name: 'Victoria Island — Bar Beach',  state: 'Lagos',     lat: 6.4281, lng: 3.4219, baseWaste: 'plastic',        baseKg: 800  },
  { id: 'lag-5',  name: 'Lekki Lagoon',                 state: 'Lagos',     lat: 6.4474, lng: 3.5892, baseWaste: 'plastic',        baseKg: 600  },
  { id: 'lag-6',  name: 'Epe Lagoon',                   state: 'Lagos',     lat: 6.5833, lng: 3.9833, baseWaste: 'water_hyacinth',  baseKg: 3000 },
  // Rivers / Port Harcourt
  { id: 'riv-1',  name: 'Bonny River — PHC Docks',     state: 'Rivers',    lat: 4.7799, lng: 7.0134, baseWaste: 'mixed',           baseKg: 3500 },
  { id: 'riv-2',  name: 'New Calabar River',            state: 'Rivers',    lat: 4.8156, lng: 6.9892, baseWaste: 'plastic',        baseKg: 1200 },
  { id: 'riv-3',  name: 'Imo River Estuary',            state: 'Rivers',    lat: 4.5500, lng: 7.2000, baseWaste: 'mixed',           baseKg: 900  },
  // Akwa Ibom
  { id: 'aki-1',  name: 'Itu River — Uyo',             state: 'Akwa Ibom', lat: 5.0227, lng: 7.9189, baseWaste: 'water_hyacinth',  baseKg: 2200 },
  { id: 'aki-2',  name: 'Cross River — Calabar Port',  state: 'Akwa Ibom', lat: 4.9517, lng: 8.3161, baseWaste: 'plastic',        baseKg: 1800 },
  // Delta
  { id: 'del-1',  name: 'Warri River',                 state: 'Delta',     lat: 5.5167, lng: 5.7500, baseWaste: 'mixed',           baseKg: 2800 },
  { id: 'del-2',  name: 'Escravos River Mouth',         state: 'Delta',     lat: 5.5333, lng: 5.1500, baseWaste: 'plastic',        baseKg: 1600 },
  // Bayelsa
  { id: 'bay-1',  name: 'Nun River — Yenagoa',         state: 'Bayelsa',   lat: 4.9266, lng: 6.2676, baseWaste: 'mixed',           baseKg: 2000 },
  { id: 'bay-2',  name: 'Brass River Estuary',          state: 'Bayelsa',   lat: 4.3167, lng: 6.2333, baseWaste: 'water_hyacinth',  baseKg: 3200 },
  // Ondo
  { id: 'ond-1',  name: 'Ondo Coastline — Ilaje',      state: 'Ondo',      lat: 6.4833, lng: 5.1000, baseWaste: 'plastic',        baseKg: 1100 },
  // Ogun
  { id: 'ogu-1',  name: 'Ogun River — Abeokuta',       state: 'Ogun',      lat: 7.1557, lng: 3.3451, baseWaste: 'mixed',           baseKg: 700  },
  // Cross River
  { id: 'crs-1',  name: 'Cross River — Ikom',          state: 'Cross River',lat: 5.9667, lng: 8.7167, baseWaste: 'water_hyacinth', baseKg: 2600 },
]

// ─── Fetch weather from Open-Meteo (free, no API key) ────────────────────────

interface WeatherData {
  rainfall:  number   // mm precipitation last hour
  windSpeed: number   // km/h
  windDir:   number   // degrees
  humidity:  number   // %
}

async function fetchWeather(lat: number, lng: number): Promise<WeatherData | null> {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?` +
      `latitude=${lat}&longitude=${lng}` +
      `&current=precipitation,wind_speed_10m,wind_direction_10m,relative_humidity_2m` +
      `&timezone=Africa%2FLagos`

    const res  = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return null
    const data = await res.json()
    const c    = data.current

    return {
      rainfall:  c.precipitation          ?? 0,
      windSpeed: c.wind_speed_10m         ?? 0,
      windDir:   c.wind_direction_10m     ?? 0,
      humidity:  c.relative_humidity_2m   ?? 0,
    }
  } catch {
    return null
  }
}

// ─── Wind direction helpers ───────────────────────────────────────────────────

function degreesToCompass(deg: number): string {
  const dirs = ['N','NE','E','SE','S','SW','W','NW']
  return dirs[Math.round(deg / 45) % 8]
}

// Is wind blowing onshore (toward coast)? Simplified: S–SW wind pushes to Lagos shore
function isOnshoreWind(windDir: number, lat: number): boolean {
  // Southern Nigeria coast faces south — onshore = wind from S (135–225°)
  // Northern inland rivers: wind from N/NE is less relevant
  if (lat < 6.5) return windDir >= 135 && windDir <= 225
  return false
}

// ─── AI scoring engine ────────────────────────────────────────────────────────

function scoreLocation(
  point: typeof MONITORING_POINTS[0],
  weather: WeatherData | null,
): { score: number; reasons: string[] } {
  let score   = 20   // base score — all Nigerian waterways have baseline waste
  const reasons: string[] = []

  if (!weather) {
    reasons.push('Weather data unavailable — using baseline estimate')
    return { score, reasons }
  }

  // Rainfall drives waste into waterways
  if (weather.rainfall > 10) {
    score += 35
    reasons.push(`Heavy rainfall (${weather.rainfall.toFixed(1)} mm) washing waste into waterway`)
  } else if (weather.rainfall > 3) {
    score += 20
    reasons.push(`Moderate rainfall (${weather.rainfall.toFixed(1)} mm) increasing runoff`)
  } else if (weather.rainfall > 0.5) {
    score += 10
    reasons.push(`Light rainfall (${weather.rainfall.toFixed(1)} mm) detected`)
  }

  // High wind pushes floating debris to shore / accumulation points
  if (weather.windSpeed > 30) {
    score += 25
    reasons.push(`Strong wind (${weather.windSpeed.toFixed(0)} km/h ${degreesToCompass(weather.windDir)}) pushing debris`)
  } else if (weather.windSpeed > 15) {
    score += 12
    reasons.push(`Moderate wind (${weather.windSpeed.toFixed(0)} km/h ${degreesToCompass(weather.windDir)}) moving debris`)
  }

  // Onshore wind concentrates coastal waste
  if (isOnshoreWind(weather.windDir, point.lat)) {
    score += 15
    reasons.push('Onshore wind direction concentrating coastal debris')
  }

  // High humidity often correlates with wet season — more runoff
  if (weather.humidity > 85) {
    score += 8
    reasons.push(`High humidity (${weather.humidity}%) indicating wet conditions`)
  }

  // Water hyacinth grows faster in warm humid conditions
  if (point.baseWaste === 'water_hyacinth' && weather.humidity > 75) {
    score += 10
    reasons.push('Humid conditions accelerate water hyacinth growth')
  }

  // Known high-risk waterways get a bump
  if (['lag-1','lag-2','lag-3','riv-1','bay-2','crs-1'].includes(point.id)) {
    score += 10
    reasons.push('Historically high waste accumulation zone')
  }

  if (reasons.length === 0) {
    reasons.push('Low weather activity — baseline monitoring active')
  }

  return { score: Math.min(100, score), reasons }
}

function scoreToRisk(score: number): RiskLevel {
  if (score >= 75) return 'critical'
  if (score >= 55) return 'high'
  if (score >= 35) return 'medium'
  return 'low'
}

function estimateKg(base: number, score: number): number {
  const multiplier = 0.5 + (score / 100) * 2.5
  return Math.round(base * multiplier / 100) * 100
}

// ─── Main export: run the AI scan ─────────────────────────────────────────────

export async function runWasteAIScan(
  onProgress?: (done: number, total: number) => void
): Promise<AIWasteAlert[]> {
  const alerts: AIWasteAlert[] = []
  const total = MONITORING_POINTS.length

  // Fetch weather for all points in parallel (batched to avoid rate limits)
  const BATCH = 6
  for (let i = 0; i < total; i += BATCH) {
    const batch = MONITORING_POINTS.slice(i, i + BATCH)
    const weatherResults = await Promise.all(batch.map(p => fetchWeather(p.lat, p.lng)))

    batch.forEach((point, j) => {
      const weather = weatherResults[j]
      const { score, reasons } = scoreLocation(point, weather)
      const risk = scoreToRisk(score)

      alerts.push({
        id:          point.id,
        name:        point.name,
        state:       point.state,
        lat:         point.lat,
        lng:         point.lng,
        risk,
        score,
        wasteType:   point.baseWaste,
        estimatedKg: estimateKg(point.baseKg, score),
        reasons,
        rainfall:    weather?.rainfall  ?? 0,
        windSpeed:   weather?.windSpeed ?? 0,
        windDir:     weather ? degreesToCompass(weather.windDir) : 'N/A',
        humidity:    weather?.humidity  ?? 0,
        lastUpdated: new Date().toISOString(),
        dataSource:  weather ? 'live' : 'unavailable',
      })
    })

    onProgress?.(Math.min(i + BATCH, total), total)
    // Small delay between batches to be polite to the API
    if (i + BATCH < total) await new Promise(r => setTimeout(r, 300))
  }

  // Sort: critical first, then high, medium, low
  const order: Record<RiskLevel, number> = { critical: 0, high: 1, medium: 2, low: 3 }
  return alerts.sort((a, b) => order[a.risk] - order[b.risk])
}
