import type { ProcessedRace } from "@/hooks/use-f1-data";

// Driver prices mapped by driverId — 2026 F1 Fantasy prices in $M
const DRIVER_PRICES: Record<string, number> = {
  max_verstappen: 27.7, russell: 27.4, norris: 27.2, piastri: 25.5,
  antonelli: 23.2, leclerc: 22.8, hamilton: 22.5, hadjar: 15.1,
  gasly: 12.0, sainz: 11.8, albon: 11.6, alonso: 10.0,
  stroll: 8.0, bearman: 7.4, ocon: 7.3, hulkenberg: 6.8,
  lawson: 6.5, bortoleto: 6.4, lindblad: 6.2, colapinto: 6.2,
  perez: 6.0, bottas: 5.9,
  // Legacy driver ids that may appear in historical data
  tsunoda: 10.0, ricciardo: 9.0, kevin_magnussen: 8.0, sargeant: 6.0,
  zhou: 6.0, de_vries: 6.0, doohan: 7.0,
};

// Constructor prices — 2026 F1 Fantasy prices in $M
const CONSTRUCTOR_PRICES: Record<string, number> = {
  mercedes: 29.3, mclaren: 28.9, red_bull: 28.2, ferrari: 23.3,
  alpine: 12.5, williams: 12.0, aston_martin: 10.3, haas: 7.4,
  sauber: 6.6, kick_sauber: 6.6, // Sauber rebranded as Audi
  rb: 6.3, racing_bulls: 6.3,   // RB rebranded as Racing Bulls
  cadillac: 6.0,
  // Legacy ids from historical data
  alphatauri: 8.0,
};

export type TeamDriverPick = {
  driverId: string;
  code: string;
  name: string;
  team: string;
  teamColor: string;
  price: number;
  avgPoints: number;
  valueScore: number; // pts per $M
};

export type TeamConstructorPick = {
  constructorId: string;
  name: string;
  color: string;
  price: number;
  avgPoints: number;
  valueScore: number;
};

export type OptimalTeam = {
  drivers: TeamDriverPick[];
  constructors: TeamConstructorPick[];
  totalCost: number;
  projectedPoints: number;
  budgetRemaining: number;
};

export function getDriverPrice(driverId: string): number {
  return DRIVER_PRICES[driverId] ?? 8.0;
}

export function getConstructorPrice(constructorId: string): number {
  return CONSTRUCTOR_PRICES[constructorId] ?? 8.0;
}

function computeDriverStats(races: ProcessedRace[], upToRound: number): TeamDriverPick[] {
  const driverMap = new Map<string, { totalPts: number; count: number; code: string; name: string; team: string; teamColor: string }>();

  for (const race of races) {
    if (race.round > upToRound) continue;
    for (const dr of race.driverResults) {
      const driver = race.drivers.find(d => d.driverId === dr.driverId);
      if (!driver) continue;
      const existing = driverMap.get(dr.driverId);
      if (existing) {
        existing.totalPts += dr.fantasyPoints;
        existing.count++;
      } else {
        driverMap.set(dr.driverId, {
          totalPts: dr.fantasyPoints,
          count: 1,
          code: driver.code,
          name: driver.name,
          team: driver.team,
          teamColor: driver.teamColor,
        });
      }
    }
  }

  return Array.from(driverMap.entries()).map(([id, data]) => {
    const avgPoints = Math.round((data.totalPts / data.count) * 10) / 10;
    const price = getDriverPrice(id);
    return {
      driverId: id,
      code: data.code,
      name: data.name,
      team: data.team,
      teamColor: data.teamColor,
      price,
      avgPoints,
      valueScore: Math.round((avgPoints / price) * 100) / 100,
    };
  });
}

function computeConstructorStats(races: ProcessedRace[], upToRound: number): TeamConstructorPick[] {
  const cMap = new Map<string, { totalPts: number; count: number; name: string; color: string }>();

  for (const race of races) {
    if (race.round > upToRound) continue;
    for (const cr of race.constructorResults) {
      const existing = cMap.get(cr.constructorId);
      if (existing) {
        existing.totalPts += cr.fantasyPoints;
        existing.count++;
      } else {
        cMap.set(cr.constructorId, {
          totalPts: cr.fantasyPoints,
          count: 1,
          name: cr.constructorName,
          color: cr.color,
        });
      }
    }
  }

  return Array.from(cMap.entries()).map(([id, data]) => {
    const avgPoints = Math.round((data.totalPts / data.count) * 10) / 10;
    const price = getConstructorPrice(id);
    return {
      constructorId: id,
      name: data.name,
      color: data.color,
      price,
      avgPoints,
      valueScore: Math.round((avgPoints / price) * 100) / 100,
    };
  });
}

export function buildOptimalTeam(
  races: ProcessedRace[],
  upToRound: number,
  budget: number = 100
): OptimalTeam | null {
  const allDrivers = computeDriverStats(races, upToRound);
  const allConstructors = computeConstructorStats(races, upToRound);

  if (allDrivers.length < 5 || allConstructors.length < 2) return null;

  let bestTeam: OptimalTeam | null = null;
  let bestPoints = -1;

  // Try all pairs of constructors
  for (let i = 0; i < allConstructors.length; i++) {
    for (let j = i + 1; j < allConstructors.length; j++) {
      const c1 = allConstructors[i];
      const c2 = allConstructors[j];
      const constructorCost = c1.price + c2.price;
      const remainingBudget = budget - constructorCost;
      if (remainingBudget <= 0) continue;

      // Sort drivers by value score (pts/$M) descending
      const affordable = allDrivers
        .filter(d => d.price <= remainingBudget)
        .sort((a, b) => b.valueScore - a.valueScore);

      // Greedy: pick top value drivers that fit budget
      const picked: TeamDriverPick[] = [];
      let spent = 0;

      for (const driver of affordable) {
        if (picked.length >= 5) break;
        if (spent + driver.price <= remainingBudget) {
          picked.push(driver);
          spent += driver.price;
        }
      }

      if (picked.length < 5) continue;

      const projectedPoints =
        picked.reduce((s, d) => s + d.avgPoints, 0) + c1.avgPoints + c2.avgPoints;
      const totalCost = spent + constructorCost;

      if (projectedPoints > bestPoints) {
        bestPoints = projectedPoints;
        bestTeam = {
          drivers: picked.sort((a, b) => b.avgPoints - a.avgPoints),
          constructors: [c1, c2].sort((a, b) => b.avgPoints - a.avgPoints),
          totalCost: Math.round(totalCost * 10) / 10,
          projectedPoints: Math.round(projectedPoints * 10) / 10,
          budgetRemaining: Math.round((budget - totalCost) * 10) / 10,
        };
      }
    }
  }

  return bestTeam;
}

export function getAllDriverPicks(races: ProcessedRace[], upToRound: number): TeamDriverPick[] {
  return computeDriverStats(races, upToRound).sort((a, b) => b.valueScore - a.valueScore);
}

export function getAllConstructorPicks(races: ProcessedRace[], upToRound: number): TeamConstructorPick[] {
  return computeConstructorStats(races, upToRound).sort((a, b) => b.valueScore - a.valueScore);
}
