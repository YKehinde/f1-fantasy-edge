import type { ProcessedRace } from "@/hooks/use-f1-data";

// Driver prices mapped by driverId (approximate F1 Fantasy prices in $M)
const DRIVER_PRICES: Record<string, number> = {
  max_verstappen: 30.5, norris: 28.0, leclerc: 27.0, sainz: 24.5, piastri: 25.0,
  hamilton: 23.0, russell: 23.5, perez: 18.0, alonso: 16.0, stroll: 10.0,
  gasly: 12.5, ocon: 11.0, tsunoda: 11.5, ricciardo: 10.5, bottas: 7.0,
  zhou: 6.5, kevin_magnussen: 8.5, hulkenberg: 9.0, albon: 10.0, sargeant: 6.0,
  lawson: 9.0, bearman: 7.5, colapinto: 6.5, de_vries: 6.0, drugovich: 6.0,
  doohan: 7.0, hadjar: 7.0, bortoleto: 7.0, antonelli: 8.0,
};

const CONSTRUCTOR_PRICES: Record<string, number> = {
  red_bull: 32.0, mclaren: 28.5, ferrari: 27.0, mercedes: 24.0,
  aston_martin: 14.0, alpine: 11.5, rb: 10.0, haas: 8.0,
  williams: 8.5, sauber: 6.0, kick_sauber: 6.0, alphatauri: 10.0,
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
  constructor: TeamConstructorPick;
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

  if (allDrivers.length < 5 || allConstructors.length < 1) return null;

  let bestTeam: OptimalTeam | null = null;
  let bestPoints = -1;

  // For each constructor, find the best 5 drivers that fit the remaining budget
  for (const constructor of allConstructors) {
    const remainingBudget = budget - constructor.price;
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

    const projectedPoints = picked.reduce((s, d) => s + d.avgPoints, 0) + constructor.avgPoints;
    const totalCost = spent + constructor.price;

    if (projectedPoints > bestPoints) {
      bestPoints = projectedPoints;
      bestTeam = {
        drivers: picked.sort((a, b) => b.avgPoints - a.avgPoints),
        constructor,
        totalCost: Math.round(totalCost * 10) / 10,
        projectedPoints: Math.round(projectedPoints * 10) / 10,
        budgetRemaining: Math.round((budget - totalCost) * 10) / 10,
      };
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
