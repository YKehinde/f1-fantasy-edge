# I Built a Live F1 Fantasy Analytics App in React — Here's Every Technical Decision

*Live race data, a greedy optimization algorithm, and a dark carbon UI — how F1 Fantasy Edge works under the hood.*

---

## Why I Built This

Formula 1 fantasy is harder than it looks. You're picking 5 drivers and up to 2 constructors within a fixed budget — trying to predict qualifying pace, positions gained, fastest laps, and DNF risk across 24 races a season. The official game gives you almost no analytics to work with.

I'm a developer and an F1 fan. Spreadsheets weren't cutting it. So I built **F1 Fantasy Edge**: a live analytics dashboard and team optimiser, powered by real F1 race data. Here's every technical decision I made along the way.

---

## What the App Does

F1 Fantasy Edge is a live analytics and team-building platform that helps F1 fans:

- **Browse live race results** from the official F1 API, across the 2022–2025 seasons
- **Analyze fantasy scores** per driver and constructor per race, including qualifying, positions gained, fastest laps, and DNFs
- **Track driver form** — is a driver trending up, down, or stable compared to their season average?
- **Build an optimised team** using a greedy algorithm that maximises projected points within a budget cap
- **Compare value** — every driver and constructor is ranked by points-per-million-dollar

---

## Live Data via the Jolpica F1 API

The first decision was: real data or mocked data? Real data wins, always — so the app pulls from the [Jolpica F1 API](https://api.jolpi.ca), an Ergast-compatible wrapper over the official F1 data feed.

Three endpoints power everything:

```ts
// Season race calendar
GET https://api.jolpi.ca/ergast/f1/{season}.json

// Race results + finishing positions
GET https://api.jolpi.ca/ergast/f1/{season}/{round}/results.json

// Qualifying grid positions
GET https://api.jolpi.ca/ergast/f1/{season}/{round}/qualifying.json
```

The challenge with fetching a full season is rate limits. Loading all 24 rounds naively would hammer the API. The solution: **batch requests in groups of 4**, with a small delay between batches. TanStack Query handles caching so subsequent visits are instant.

```ts
// Fetch all completed races in batches of 4
for (let i = 0; i < rounds.length; i += BATCH_SIZE) {
  const batch = rounds.slice(i, i + BATCH_SIZE);
  const results = await Promise.all(batch.map(round => fetchRaceResults(season, round)));
  await delay(200); // Respect rate limits
}
```

---

## The Fantasy Scoring Engine

All scoring happens in `lib/f1-api.ts`. The `calculateFantasyPoints()` function mirrors the real F1 Fantasy scoring rules:

| Category | Detail | Points |
|---|---|---|
| **Race finish** | P1 | +25 |
| | P2 | +18 |
| | P3 | +15 |
| | P4–P10 | +12 down to +1 |
| **Qualifying** | P1 | +10 |
| | P2 | +8 |
| | P3–P10 | +6 down to +1 |
| **Positions gained** | Per position (max 5) | +1 each |
| **Fastest lap** | — | +5 |
| **DNF** | — | −10 |

Constructors are handled separately: both drivers' points are summed, and a **+5 bonus** is added if both cars finish the race.

```ts
function calculateConstructorPoints(driverResults: DriverResult[]): number {
  const total = driverResults.reduce((sum, d) => sum + d.fantasyPoints, 0);
  const bothFinished = driverResults.every(d => !d.dnf);
  return total + (bothFinished ? 5 : 0);
}
```

---

## Driver Trend Analysis

Raw points per race are useful, but form matters more. Each `DriverCard` computes a trend by comparing the driver's last result to their season average:

- **↑ Up** — last race points > season average
- **↓ Down** — last race points < season average  
- **→ Stable** — within threshold

This gives you an at-a-glance read on who's in form — critical for weekly team changes.

---

## The Team Builder: Greedy Optimization

The Team Builder is the most technically interesting part. Given all race data up to the current round, it finds the highest-scoring 5-driver + 2-constructor team within a user-defined budget.

The algorithm lives in `lib/team-builder.ts`:

1. **Score every driver** by average fantasy points per race → compute a `valueScore` (points per $M)
2. **Score every constructor** the same way
3. **Try all constructor pairs** within budget
4. **For each constructor pair**, greedily pick the top 5 drivers by value score that fit the remaining budget
5. **Return the combination** with the highest total projected points

```ts
function buildOptimalTeam(races: ProcessedRace[], upToRound: number, budget: number) {
  const driverStats = computeDriverStats(races, upToRound);
  const constructorStats = computeConstructorStats(races, upToRound);

  let best = null;

  for (const constructorPair of allConstructorPairs(constructorStats, budget)) {
    const remainingBudget = budget - constructorPair.totalCost;
    const drivers = topDriversByValue(driverStats, remainingBudget, 5);
    const projected = drivers.totalPoints + constructorPair.totalPoints;

    if (!best || projected > best.projected) {
      best = { drivers, constructors: constructorPair, projected };
    }
  }

  return best;
}
```

The Team Builder UI exposes this through a **budget slider ($60M–$150M)** and three tabs:
- **Optimal Lineup** — AI-selected team with projected points and cost breakdown
- **All Drivers** — every driver ranked by value score
- **All Constructors** — every constructor ranked by value score

---

## Data Architecture

Each processed race result carries everything needed for scoring and display:

```ts
interface ProcessedDriverResult {
  driverId: string;
  name: string;
  team: string;
  teamColor: string;
  imageUrl: string;        // Official F1 headshot from Cloudinary CDN
  position: number;
  qualifyingPosition: number;
  positionsGained: number;
  fastestLap: boolean;
  dnf: boolean;
  fantasyPoints: number;
}
```

Official driver and constructor images are pulled from the Formula 1 Cloudinary CDN, mapped by driver/constructor ID in `driverData.json` and `constructorData.json`. This means every card shows the real F1 headshot or car livery — no placeholder images.

---

## UI & Design

The app runs a dark carbon theme — deliberately close to the aesthetic of the official F1 game:

- **Dark backgrounds**: `bg-carbon`, `bg-card`, `bg-secondary`
- **Red accent**: matches F1's brand colour
- **Gold/silver/bronze podium borders** on the top 3 driver cards
- **Team colour stripes** — each driver card shows their constructor's hex colour
- **Country flag emojis** — 20+ nationalities mapped to flags
- **Framer Motion** — staggered card entrance animations when switching races

The Team Builder opens as a **bottom sheet on mobile**, full sidebar on desktop — responsive without a single media query in JavaScript, all Tailwind.

---

## What I Learned

1. **Model your domain first** — getting the `ProcessedRace` shape right made the entire UI layer trivial to build.
2. **Derived state beats stored state** — budget remaining, trend direction, value scores, team validity: all computed, never stored. No sync bugs.
3. **Batch your API calls** — a 200ms delay between batches of 4 is all it takes to stay within rate limits while loading a full season.
4. **Greedy algorithms are underrated** — for a budget optimization problem with ~20 drivers and ~10 constructors, a greedy approach runs instantly and produces excellent results.
5. **shadcn/ui + Tailwind is genuinely fast** — 46 accessible components, zero fighting with a design system's opinions.

---

## What's Next

- Head-to-head team comparison mode
- Price change tracker (delta from last week, like the real F1 Fantasy game)
- Circuit-specific driver weighting (street circuit vs. power circuit specialists)
- Push notifications for team change windows

---

## Try It / Read the Code

**[→ Live Demo](#)** | **[→ GitHub Repository](#)**

The project is open source. If you're building anything in the F1 or sports fantasy analytics space, the scoring engine, batch fetching pattern, and greedy optimization algorithm are all worth a look.

*Built with React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query, Framer Motion, Lucide Icons — and live data from the Jolpica F1 API.*

---

*If this was useful, follow me here on Medium for more posts on React, TypeScript, and building things in public.*

---

> **Medium publishing note:** This is an original post — no canonical URL needed. Recommended tags: `React`, `JavaScript`, `Formula 1`, `Web Development`, `Open Source`

---

*Tags: React, TypeScript, Formula 1, JavaScript, Open Source*
