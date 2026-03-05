# F1 Fantasy Edge — Project Specification

## Purpose

A web application that analyses historical Formula 1 race data (2022–2025) to help users make informed decisions when building their 2026 F1 Fantasy team. Users can browse past seasons race-by-race, see how drivers and constructors scored fantasy points, and use a Team Builder to find the optimal 5 drivers + 2 constructors lineup within a budget cap — all priced at the current 2026 F1 Fantasy prices.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 |
| Language | TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS v3 + CSS variables for theming |
| Component library | shadcn/ui (Radix UI primitives) |
| Data fetching | TanStack React Query v5 |
| Routing | React Router v6 |
| Animation | Framer Motion |
| Charts | Recharts |
| Testing | Vitest + Testing Library |
| Fonts | Space Grotesk (display), JetBrains Mono (mono) — Google Fonts |

---

## Data Sources

### Historical race data — Jolpica F1 API (free, no key required)
Base URL: `https://api.jolpi.ca/ergast/f1`

Endpoints used:
- `GET /{season}.json?limit=30` — full season schedule
- `GET /{season}/{round}/results.json?limit=30` — race results
- `GET /{season}/{round}/qualifying.json?limit=30` — qualifying results

Only races where `date < today` are fetched (completed races only).

### Static 2026 pricing data (local JSON files)
- `src/data/driverData.json` — 22 drivers with `fullName`, `costMillionsUSD`, `imageUrl`, `ownershipPct`
- `src/data/constructorData.json` — 11 constructors with `name`, `slug`, `priceMillions`, `imageUrl`

Image URLs point to official F1 CDN (`media.formula1.com`).

---

## Fantasy Points Calculation

Points are calculated from the Jolpica API race/qualifying data and approximate the official F1 Fantasy scoring system.

### Driver points
| Event | Points |
|---|---|
| Race finish P1–P10 | 25 / 18 / 15 / 12 / 10 / 8 / 6 / 4 / 2 / 1 |
| Qualifying P1–P10 | 10 / 8 / 6 / 5 / 4 / 3 / 2 / 1 / 1 / 1 |
| Positions gained (grid → finish) | +1 per position, max +5 |
| Fastest lap | +5 |
| DNF | −10 (minimum total is 0) |

### Constructor points
Sum of both drivers' fantasy points + 5 bonus if both cars finish (no DNF).

---

## Application Structure

```
src/
├── pages/
│   ├── Index.tsx          # Main page — all UI lives here
│   └── NotFound.tsx       # 404
├── components/
│   ├── DriverCard.tsx     # Single driver result card
│   ├── ConstructorCard.tsx# Single constructor result card
│   ├── RaceSelector.tsx   # Dropdown to pick a race within a season
│   ├── TeamBuilder.tsx    # Slide-out panel for optimal team selection
│   └── ui/                # shadcn/ui primitives (Button, Select, Sheet, Slider, Tabs, etc.)
├── hooks/
│   ├── use-f1-data.ts     # React Query hooks: useSeasonData, useSeasonSchedule, useRaceData
│   ├── use-mobile.tsx     # Mobile breakpoint hook
│   └── use-toast.ts       # Toast notification hook
├── lib/
│   ├── f1-api.ts          # API fetch functions, fantasy point calculations, image lookups, team colours
│   ├── team-builder.ts    # Optimal team algorithm, driver/constructor pricing, value scoring
│   └── utils.ts           # Tailwind cn() utility
└── data/
    ├── driverData.json    # 2026 driver images + prices
    ├── constructorData.json # 2026 constructor images + prices
    └── f1-fantasy.ts      # Legacy static types/data (not used for live data)
```

---

## Pages & Features

### Main page (`/`)

**Header**
- App branding: "F1 Fantasy Playbook"
- Season selector dropdown — years 2022, 2023, 2024, 2025. **Default: 2025**
- Race selector dropdown — lists all completed races for the selected season. **Default: first race of the season (round 1)**
- "Team Builder" button that opens the Team Builder panel

**Race info bar**
- Country flag, race name, circuit name, date
- Top driver points and top constructor points for the selected race

**Driver Rankings** (left 2/3 of layout)
- Grid of `DriverCard` components sorted by fantasy points descending
- Each card shows: rank, driver number, name, team, fantasy points for that race, average points across all loaded races, trend arrow (up/down/stable vs previous race), qualifying position, race position, positions gained, fastest lap badge, DNF badge
- Driver portrait image from `driverData.json` shown as a ghost overlay on the card (opacity 20%, 35% on hover)
- Podium cards (P1/P2/P3 by fantasy points) get gold/silver/bronze left border

**Constructor Rankings** (right 1/3 of layout)
- List of `ConstructorCard` components sorted by fantasy points descending
- Each card shows: rank, team colour dot, constructor name, best finish, both-cars-finished indicator, fantasy points
- Constructor car image from `constructorData.json` shown as a ghost overlay (opacity 30%, 50% on hover)

**Season Stats sidebar card**
- Total races loaded, current round number, data source attribution

---

## Team Builder Panel

Triggered by the "Team Builder" button. Opens as a right-side sheet.

**Budget cap slider**: $60M – $150M, step $5M, default $100M

**Three tabs:**

### Optimal Lineup tab
Shows the best team the algorithm can build within the budget:
- Summary bar: projected total avg points, total cost, budget remaining
- 5 drivers (ranked by avg points)
- 2 constructors (ranked by avg points)
- Driver and constructor card images shown as ghost overlays

### All Drivers tab
All drivers from the historical data ranked by value score (avg pts / price). Shows name, team, avg points, price, value score.

### Constructors tab
All constructors ranked by value score. Same fields as above.

---

## Team Builder Algorithm

Located in `src/lib/team-builder.ts`.

**Input**: all loaded races up to `currentRound`, budget cap in $M

**Driver stats**: for each driver seen across all loaded races, compute average fantasy points per race and value score (`avgPoints / price`).

**Constructor stats**: same approach for constructors.

**Selection**:
1. Iterate over all pairs of constructors (to select exactly 2)
2. For each pair, subtract their combined price from the budget
3. From the remaining budget, greedily pick the 5 drivers with the highest value score that fit
4. Track the combination that maximises total projected average points (5 drivers + 2 constructors)

**Pricing**: Drivers and constructors are priced at 2026 F1 Fantasy values (from `DRIVER_PRICES` and `CONSTRUCTOR_PRICES` maps in `team-builder.ts`, keyed by Ergast/Jolpica driver/constructor IDs).

---

## 2026 Driver Prices

| Driver | Price ($M) |
|---|---|
| Max Verstappen | 27.7 |
| George Russell | 27.4 |
| Lando Norris | 27.2 |
| Oscar Piastri | 25.5 |
| Kimi Antonelli | 23.2 |
| Charles Leclerc | 22.8 |
| Lewis Hamilton | 22.5 |
| Isack Hadjar | 15.1 |
| Pierre Gasly | 12.0 |
| Carlos Sainz | 11.8 |
| Alexander Albon | 11.6 |
| Fernando Alonso | 10.0 |
| Lance Stroll | 8.0 |
| Oliver Bearman | 7.4 |
| Esteban Ocon | 7.3 |
| Nico Hulkenberg | 6.8 |
| Liam Lawson | 6.5 |
| Gabriel Bortoleto | 6.4 |
| Arvid Lindblad | 6.2 |
| Franco Colapinto | 6.2 |
| Sergio Perez | 6.0 |
| Valtteri Bottas | 5.9 |

## 2026 Constructor Prices

| Constructor | Price ($M) |
|---|---|
| Mercedes | 29.3 |
| McLaren | 28.9 |
| Red Bull Racing | 28.2 |
| Ferrari | 23.3 |
| Alpine | 12.5 |
| Williams | 12.0 |
| Aston Martin | 10.3 |
| Haas | 7.4 |
| Audi (née Sauber) | 6.6 |
| Racing Bulls (née RB) | 6.3 |
| Cadillac | 6.0 |

---

## 2026 Team & Driver Changes (vs 2025)

Key changes to be aware of when mapping historical Ergast IDs to 2026 teams:
- **Lewis Hamilton** moved from Mercedes → Ferrari
- **Carlos Sainz** moved from Ferrari → Williams
- **Kimi Antonelli** is new at Mercedes (rookie)
- **Isack Hadjar** is new at Racing Bulls (rookie)
- **Oliver Bearman** is new at Haas (rookie)
- **Liam Lawson** moved to Red Bull Racing; **Sergio Perez** dropped
- **Cadillac** is a new 11th team — **Perez** and **Bottas** drive for them
- **Sauber** rebranded as **Audi**; **RB** rebranded as **Racing Bulls**
- **Arvid Lindblad**, **Gabriel Bortoleto**, **Franco Colapinto** are new rookies

---

## Theme & Design System

Dark theme only. Carbon/racing aesthetic.

**CSS custom properties (HSL):**
- Background: `220 20% 7%` (near-black)
- Card: `220 18% 10%`
- Primary (red): `0 85% 50%` — used for F1 red accents
- Accent (gold): `45 100% 55%` — used for podium/trophy highlights
- Positive (green): used for positions gained, upward trends
- Negative (red): used for positions lost, DNF, downward trends
- Podium gold/silver/bronze border colours on top-3 driver cards

**Custom Tailwind utilities** (defined in `index.css`):
- `.glow-red` — box shadow with red primary colour
- `.glow-red-subtle` — softer version for hover states
- `.text-gradient-red` — red gradient text for branding
- `.bg-carbon` — carbon-fibre-inspired dark background

**Fonts:**
- `font-display` → Space Grotesk — headings, driver names, team names
- `font-mono` → JetBrains Mono — points, prices, stats, labels

---

## Data Flow

```
Index.tsx
  └── useSeasonData(season: number)   [React Query]
        └── fetchSchedule(season)     → filter to past races
        └── fetchRaceResults(season, round) × N  (batched, 4 at a time)
        └── fetchQualifying(season, round)  × N
              ↓
        ProcessedRace[]
              ↓
        DriverCard (per race result)
        ConstructorCard (per race result)
        TeamBuilder
          └── buildOptimalTeam(races, currentRound, budget)
                └── computeDriverStats → value score per driver
                └── computeConstructorStats → value score per constructor
                └── iterate constructor pairs → greedy driver selection
```

---

## Key Design Decisions

1. **Prices are 2026 F1 Fantasy prices, not historical** — the whole point is to evaluate past performance at current-season cost, so you can identify value picks for 2026.
2. **Only completed races are shown** — the API filter `date < now` ensures no future races appear.
3. **Default season is 2025, default race is round 1** — most recent full season, starting from the beginning so users naturally scroll forward through the year.
4. **Team = 5 drivers + 2 constructors** — matches the official F1 Fantasy game rules.
5. **Value score = avgPoints / price** — the primary ranking metric for both drivers and constructors in the Team Builder.
6. **Ghost images** — official F1 2026 car and driver renders are overlaid at low opacity on cards to add visual richness without cluttering the data.
