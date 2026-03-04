const BASE_URL = "https://api.jolpi.ca/ergast/f1";

type ErgastResponse<T> = {
  MRData: {
    xmlns: string;
    series: string;
    url: string;
    limit: string;
    offset: string;
    total: string;
  } & T;
};

export type RaceScheduleItem = {
  season: string;
  round: string;
  url: string;
  raceName: string;
  Circuit: {
    circuitId: string;
    url: string;
    circuitName: string;
    Location: {
      lat: string;
      long: string;
      locality: string;
      country: string;
    };
  };
  date: string;
  time?: string;
};

export type RaceResultItem = {
  number: string;
  position: string;
  positionText: string;
  points: string;
  Driver: {
    driverId: string;
    permanentNumber: string;
    code: string;
    url: string;
    givenName: string;
    familyName: string;
  };
  Constructor: {
    constructorId: string;
    url: string;
    name: string;
  };
  grid: string;
  laps: string;
  status: string;
  Time?: { millis: string; time: string };
  FastestLap?: {
    rank: string;
    lap: string;
    Time: { time: string };
  };
};

export type QualifyingResultItem = {
  number: string;
  position: string;
  Driver: {
    driverId: string;
    permanentNumber: string;
    code: string;
    givenName: string;
    familyName: string;
  };
  Constructor: {
    constructorId: string;
    name: string;
  };
  Q1?: string;
  Q2?: string;
  Q3?: string;
};

// Fetch season schedule
export async function fetchSchedule(season: number | string): Promise<RaceScheduleItem[]> {
  const res = await fetch(`${BASE_URL}/${season}.json?limit=30`);
  if (!res.ok) throw new Error(`Failed to fetch schedule: ${res.status}`);
  const data: ErgastResponse<{ RaceTable: { season: string; Races: RaceScheduleItem[] } }> = await res.json();
  return data.MRData.RaceTable.Races;
}

// Fetch race results for a specific round
export async function fetchRaceResults(season: number | string, round: number | string): Promise<RaceResultItem[]> {
  const res = await fetch(`${BASE_URL}/${season}/${round}/results.json?limit=30`);
  if (!res.ok) throw new Error(`Failed to fetch results: ${res.status}`);
  const data: ErgastResponse<{ RaceTable: { Races: Array<{ Results: RaceResultItem[] }> } }> = await res.json();
  return data.MRData.RaceTable.Races[0]?.Results ?? [];
}

// Fetch qualifying results for a specific round
export async function fetchQualifying(season: number | string, round: number | string): Promise<QualifyingResultItem[]> {
  const res = await fetch(`${BASE_URL}/${season}/${round}/qualifying.json?limit=30`);
  if (!res.ok) throw new Error(`Failed to fetch qualifying: ${res.status}`);
  const data: ErgastResponse<{ RaceTable: { Races: Array<{ QualifyingResults: QualifyingResultItem[] }> } }> = await res.json();
  return data.MRData.RaceTable.Races[0]?.QualifyingResults ?? [];
}

// Country code mapping for flags
const countryFlags: Record<string, string> = {
  "Bahrain": "🇧🇭", "Saudi Arabia": "🇸🇦", "Australia": "🇦🇺", "Japan": "🇯🇵",
  "China": "🇨🇳", "USA": "🇺🇸", "Italy": "🇮🇹", "Monaco": "🇲🇨",
  "Canada": "🇨🇦", "Spain": "🇪🇸", "Austria": "🇦🇹", "UK": "🇬🇧",
  "Hungary": "🇭🇺", "Belgium": "🇧🇪", "Netherlands": "🇳🇱", "Singapore": "🇸🇬",
  "Azerbaijan": "🇦🇿", "Mexico": "🇲🇽", "Brazil": "🇧🇷", "UAE": "🇦🇪",
  "Qatar": "🇶🇦", "United States": "🇺🇸", "Las Vegas": "🇺🇸",
  "Abu Dhabi": "🇦🇪",
};

export function getCountryFlag(country: string): string {
  return countryFlags[country] || "🏁";
}

// Team colors
const teamColors: Record<string, string> = {
  "red_bull": "#3671C6", "mclaren": "#FF8000", "ferrari": "#E8002D",
  "mercedes": "#27F4D2", "aston_martin": "#229971", "alpine": "#0093CC",
  "rb": "#6692FF", "haas": "#B6BABD", "williams": "#64C4FF",
  "sauber": "#52E252", "kick_sauber": "#52E252", "alphatauri": "#6692FF",
  "alfa": "#C92D4B", "racing_point": "#F596C8", "toro_rosso": "#6692FF",
};

export function getTeamColor(constructorId: string): string {
  return teamColors[constructorId] || "#888888";
}

// Calculate fantasy points from race/qualifying results
export function calculateFantasyPoints(
  raceResult: RaceResultItem,
  qualifyingPosition: number
): number {
  let points = 0;
  const pos = parseInt(raceResult.position);
  const grid = parseInt(raceResult.grid);
  const isDNF = raceResult.status !== "Finished" && !raceResult.status.startsWith("+");

  // Race finish points (F1 Fantasy scoring approximation)
  const finishPoints: Record<number, number> = {
    1: 25, 2: 18, 3: 15, 4: 12, 5: 10,
    6: 8, 7: 6, 8: 4, 9: 2, 10: 1,
  };

  if (!isDNF && finishPoints[pos]) {
    points += finishPoints[pos];
  }

  // Qualifying points
  const qualiPoints: Record<number, number> = {
    1: 10, 2: 8, 3: 6, 4: 5, 5: 4,
    6: 3, 7: 2, 8: 1, 9: 1, 10: 1,
  };
  if (qualiPoints[qualifyingPosition]) {
    points += qualiPoints[qualifyingPosition];
  }

  // Positions gained (1pt per position, max 5)
  if (!isDNF && grid > 0) {
    const gained = grid - pos;
    if (gained > 0) {
      points += Math.min(gained, 5);
    }
  }

  // Fastest lap bonus
  if (raceResult.FastestLap?.rank === "1") {
    points += 5;
  }

  // DNF penalty
  if (isDNF) {
    points -= 10;
  }

  return Math.max(points, 0);
}

// Calculate constructor fantasy points from driver results
export function calculateConstructorPoints(
  driverResults: Array<{ fantasyPoints: number; isDNF: boolean }>
): number {
  const base = driverResults.reduce((sum, d) => sum + d.fantasyPoints, 0);
  const bothFinished = driverResults.every(d => !d.isDNF);
  return base + (bothFinished ? 5 : 0);
}
