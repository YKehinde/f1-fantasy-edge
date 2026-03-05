export type Driver = {
  id: string;
  name: string;
  team: string;
  teamColor: string;
  number: number;
  price: number; // fantasy price in millions
};

export type ConstructorTeam = {
  id: string;
  name: string;
  color: string;
  price: number;
};

export type RaceResult = {
  driverId: string;
  fantasyPoints: number;
  position: number;
  qualifyingPosition: number;
  positionsGained: number;
  fastestLap: boolean;
  dnf: boolean;
};

export type ConstructorResult = {
  constructorId: string;
  fantasyPoints: number;
  bestFinish: number;
  bothCarsFinish: boolean;
};

export type Race = {
  id: string;
  name: string;
  country: string;
  circuit: string;
  date: string;
  round: number;
  driverResults: RaceResult[];
  constructorResults: ConstructorResult[];
};

export const drivers: Driver[] = [
  { id: "ver", name: "Max Verstappen", team: "Red Bull Racing", teamColor: "#003282", number: 1, price: 27.7 },
  { id: "rus", name: "George Russell", team: "Mercedes", teamColor: "#007560", number: 63, price: 27.4 },
  { id: "nor", name: "Lando Norris", team: "McLaren", teamColor: "#FF8000", number: 4, price: 27.2 },
  { id: "pia", name: "Oscar Piastri", team: "McLaren", teamColor: "#FF8000", number: 81, price: 25.5 },
  { id: "ant", name: "Kimi Antonelli", team: "Mercedes", teamColor: "#007560", number: 12, price: 23.2 },
  { id: "lec", name: "Charles Leclerc", team: "Ferrari", teamColor: "#E8002D", number: 16, price: 22.8 },
  { id: "ham", name: "Lewis Hamilton", team: "Ferrari", teamColor: "#E8002D", number: 44, price: 22.5 },
  { id: "had", name: "Isack Hadjar", team: "Racing Bulls", teamColor: "#2345AB", number: 6, price: 15.1 },
  { id: "gas", name: "Pierre Gasly", team: "Alpine", teamColor: "#0093CC", number: 10, price: 12.0 },
  { id: "sai", name: "Carlos Sainz", team: "Williams", teamColor: "#64C4FF", number: 55, price: 11.8 },
  { id: "alb", name: "Alexander Albon", team: "Williams", teamColor: "#64C4FF", number: 23, price: 11.6 },
  { id: "alo", name: "Fernando Alonso", team: "Aston Martin", teamColor: "#229971", number: 14, price: 10.0 },
  { id: "str", name: "Lance Stroll", team: "Aston Martin", teamColor: "#229971", number: 18, price: 8.0 },
  { id: "bea", name: "Oliver Bearman", team: "Haas", teamColor: "#B6BABD", number: 87, price: 7.4 },
  { id: "oco", name: "Esteban Ocon", team: "Haas", teamColor: "#B6BABD", number: 31, price: 7.3 },
  { id: "hul", name: "Nico Hulkenberg", team: "Audi", teamColor: "#6B0015", number: 27, price: 6.8 },
  { id: "law", name: "Liam Lawson", team: "Red Bull Racing", teamColor: "#003282", number: 30, price: 6.5 },
  { id: "bor", name: "Gabriel Bortoleto", team: "Audi", teamColor: "#6B0015", number: 5, price: 6.4 },
  { id: "lin", name: "Arvid Lindblad", team: "Racing Bulls", teamColor: "#2345AB", number: 40, price: 6.2 },
  { id: "col", name: "Franco Colapinto", team: "Alpine", teamColor: "#0093CC", number: 43, price: 6.2 },
  { id: "per", name: "Sergio Perez", team: "Cadillac", teamColor: "#444444", number: 11, price: 6.0 },
  { id: "bot", name: "Valtteri Bottas", team: "Cadillac", teamColor: "#444444", number: 77, price: 5.9 },
];

export const constructors: ConstructorTeam[] = [
  { id: "mercedes", name: "Mercedes", color: "#007560", price: 29.3 },
  { id: "mclaren", name: "McLaren", color: "#FF8000", price: 28.9 },
  { id: "red_bull", name: "Red Bull Racing", color: "#003282", price: 28.2 },
  { id: "ferrari", name: "Ferrari", color: "#E8002D", price: 23.3 },
  { id: "alpine", name: "Alpine", color: "#0093CC", price: 12.5 },
  { id: "williams", name: "Williams", color: "#64C4FF", price: 12.0 },
  { id: "aston_martin", name: "Aston Martin", color: "#229971", price: 10.3 },
  { id: "haas", name: "Haas", color: "#B6BABD", price: 7.4 },
  { id: "sauber", name: "Audi", color: "#6B0015", price: 6.6 },
  { id: "rb", name: "Racing Bulls", color: "#2345AB", price: 6.3 },
  { id: "cadillac", name: "Cadillac", color: "#444444", price: 6.0 },
];

// Simulated historical race data for 2024 season
export const races: Race[] = [
  {
    id: "bahrain", name: "Bahrain Grand Prix", country: "🇧🇭", circuit: "Bahrain International Circuit",
    date: "2024-03-02", round: 1,
    driverResults: [
      { driverId: "ver", fantasyPoints: 42, position: 1, qualifyingPosition: 1, positionsGained: 0, fastestLap: true, dnf: false },
      { driverId: "nor", fantasyPoints: 28, position: 6, qualifyingPosition: 7, positionsGained: 1, fastestLap: false, dnf: false },
      { driverId: "lec", fantasyPoints: 34, position: 3, qualifyingPosition: 2, positionsGained: -1, fastestLap: false, dnf: false },
      { driverId: "sai", fantasyPoints: 30, position: 4, qualifyingPosition: 4, positionsGained: 0, fastestLap: false, dnf: false },
      { driverId: "pia", fantasyPoints: 25, position: 5, qualifyingPosition: 5, positionsGained: 0, fastestLap: false, dnf: false },
      { driverId: "ham", fantasyPoints: 20, position: 7, qualifyingPosition: 9, positionsGained: 2, fastestLap: false, dnf: false },
      { driverId: "rus", fantasyPoints: 22, position: 8, qualifyingPosition: 6, positionsGained: -2, fastestLap: false, dnf: false },
      { driverId: "per", fantasyPoints: 36, position: 2, qualifyingPosition: 3, positionsGained: 1, fastestLap: false, dnf: false },
      { driverId: "alo", fantasyPoints: 18, position: 9, qualifyingPosition: 8, positionsGained: -1, fastestLap: false, dnf: false },
      { driverId: "str", fantasyPoints: 12, position: 12, qualifyingPosition: 14, positionsGained: 2, fastestLap: false, dnf: false },
    ],
    constructorResults: [
      { constructorId: "red_bull", fantasyPoints: 78, bestFinish: 1, bothCarsFinish: true },
      { constructorId: "ferrari", fantasyPoints: 58, bestFinish: 3, bothCarsFinish: true },
      { constructorId: "mclaren", fantasyPoints: 45, bestFinish: 5, bothCarsFinish: true },
      { constructorId: "mercedes", fantasyPoints: 38, bestFinish: 7, bothCarsFinish: true },
      { constructorId: "aston_martin", fantasyPoints: 25, bestFinish: 9, bothCarsFinish: true },
    ],
  },
  {
    id: "saudi", name: "Saudi Arabian Grand Prix", country: "🇸🇦", circuit: "Jeddah Corniche Circuit",
    date: "2024-03-09", round: 2,
    driverResults: [
      { driverId: "ver", fantasyPoints: 45, position: 1, qualifyingPosition: 1, positionsGained: 0, fastestLap: false, dnf: false },
      { driverId: "nor", fantasyPoints: 22, position: 7, qualifyingPosition: 6, positionsGained: -1, fastestLap: false, dnf: false },
      { driverId: "lec", fantasyPoints: 32, position: 2, qualifyingPosition: 3, positionsGained: 1, fastestLap: true, dnf: false },
      { driverId: "sai", fantasyPoints: 26, position: 5, qualifyingPosition: 4, positionsGained: -1, fastestLap: false, dnf: false },
      { driverId: "pia", fantasyPoints: 30, position: 3, qualifyingPosition: 5, positionsGained: 2, fastestLap: false, dnf: false },
      { driverId: "ham", fantasyPoints: 18, position: 9, qualifyingPosition: 8, positionsGained: -1, fastestLap: false, dnf: false },
      { driverId: "rus", fantasyPoints: 24, position: 6, qualifyingPosition: 7, positionsGained: 1, fastestLap: false, dnf: false },
      { driverId: "per", fantasyPoints: 28, position: 4, qualifyingPosition: 2, positionsGained: -2, fastestLap: false, dnf: false },
      { driverId: "alo", fantasyPoints: 16, position: 10, qualifyingPosition: 10, positionsGained: 0, fastestLap: false, dnf: false },
      { driverId: "str", fantasyPoints: 8, position: 15, qualifyingPosition: 13, positionsGained: -2, fastestLap: false, dnf: false },
    ],
    constructorResults: [
      { constructorId: "red_bull", fantasyPoints: 72, bestFinish: 1, bothCarsFinish: true },
      { constructorId: "ferrari", fantasyPoints: 52, bestFinish: 2, bothCarsFinish: true },
      { constructorId: "mclaren", fantasyPoints: 48, bestFinish: 3, bothCarsFinish: true },
      { constructorId: "mercedes", fantasyPoints: 36, bestFinish: 6, bothCarsFinish: true },
      { constructorId: "aston_martin", fantasyPoints: 20, bestFinish: 10, bothCarsFinish: true },
    ],
  },
  {
    id: "australia", name: "Australian Grand Prix", country: "🇦🇺", circuit: "Albert Park Circuit",
    date: "2024-03-24", round: 3,
    driverResults: [
      { driverId: "ver", fantasyPoints: 10, position: 0, qualifyingPosition: 1, positionsGained: 0, fastestLap: false, dnf: true },
      { driverId: "nor", fantasyPoints: 38, position: 2, qualifyingPosition: 4, positionsGained: 2, fastestLap: false, dnf: false },
      { driverId: "lec", fantasyPoints: 24, position: 4, qualifyingPosition: 3, positionsGained: -1, fastestLap: false, dnf: false },
      { driverId: "sai", fantasyPoints: 44, position: 1, qualifyingPosition: 2, positionsGained: 1, fastestLap: true, dnf: false },
      { driverId: "pia", fantasyPoints: 30, position: 3, qualifyingPosition: 6, positionsGained: 3, fastestLap: false, dnf: false },
      { driverId: "ham", fantasyPoints: 22, position: 6, qualifyingPosition: 5, positionsGained: -1, fastestLap: false, dnf: false },
      { driverId: "rus", fantasyPoints: 26, position: 5, qualifyingPosition: 7, positionsGained: 2, fastestLap: false, dnf: false },
      { driverId: "per", fantasyPoints: 14, position: 8, qualifyingPosition: 9, positionsGained: 1, fastestLap: false, dnf: false },
      { driverId: "alo", fantasyPoints: 20, position: 7, qualifyingPosition: 8, positionsGained: 1, fastestLap: false, dnf: false },
      { driverId: "str", fantasyPoints: 10, position: 13, qualifyingPosition: 15, positionsGained: 2, fastestLap: false, dnf: false },
    ],
    constructorResults: [
      { constructorId: "ferrari", fantasyPoints: 68, bestFinish: 1, bothCarsFinish: true },
      { constructorId: "mclaren", fantasyPoints: 62, bestFinish: 2, bothCarsFinish: true },
      { constructorId: "mercedes", fantasyPoints: 44, bestFinish: 5, bothCarsFinish: true },
      { constructorId: "red_bull", fantasyPoints: 20, bestFinish: 8, bothCarsFinish: false },
      { constructorId: "aston_martin", fantasyPoints: 26, bestFinish: 7, bothCarsFinish: true },
    ],
  },
  {
    id: "japan", name: "Japanese Grand Prix", country: "🇯🇵", circuit: "Suzuka International Racing Course",
    date: "2024-04-07", round: 4,
    driverResults: [
      { driverId: "ver", fantasyPoints: 46, position: 1, qualifyingPosition: 1, positionsGained: 0, fastestLap: true, dnf: false },
      { driverId: "nor", fantasyPoints: 34, position: 2, qualifyingPosition: 3, positionsGained: 1, fastestLap: false, dnf: false },
      { driverId: "lec", fantasyPoints: 22, position: 4, qualifyingPosition: 5, positionsGained: 1, fastestLap: false, dnf: false },
      { driverId: "sai", fantasyPoints: 28, position: 3, qualifyingPosition: 2, positionsGained: -1, fastestLap: false, dnf: false },
      { driverId: "pia", fantasyPoints: 24, position: 5, qualifyingPosition: 4, positionsGained: -1, fastestLap: false, dnf: false },
      { driverId: "ham", fantasyPoints: 18, position: 9, qualifyingPosition: 7, positionsGained: -2, fastestLap: false, dnf: false },
      { driverId: "rus", fantasyPoints: 20, position: 7, qualifyingPosition: 6, positionsGained: -1, fastestLap: false, dnf: false },
      { driverId: "per", fantasyPoints: 16, position: 8, qualifyingPosition: 8, positionsGained: 0, fastestLap: false, dnf: false },
      { driverId: "alo", fantasyPoints: 22, position: 6, qualifyingPosition: 9, positionsGained: 3, fastestLap: false, dnf: false },
      { driverId: "str", fantasyPoints: 10, position: 14, qualifyingPosition: 12, positionsGained: -2, fastestLap: false, dnf: false },
    ],
    constructorResults: [
      { constructorId: "red_bull", fantasyPoints: 58, bestFinish: 1, bothCarsFinish: true },
      { constructorId: "mclaren", fantasyPoints: 54, bestFinish: 2, bothCarsFinish: true },
      { constructorId: "ferrari", fantasyPoints: 46, bestFinish: 3, bothCarsFinish: true },
      { constructorId: "mercedes", fantasyPoints: 34, bestFinish: 7, bothCarsFinish: true },
      { constructorId: "aston_martin", fantasyPoints: 28, bestFinish: 6, bothCarsFinish: true },
    ],
  },
  {
    id: "miami", name: "Miami Grand Prix", country: "🇺🇸", circuit: "Miami International Autodrome",
    date: "2024-05-05", round: 5,
    driverResults: [
      { driverId: "ver", fantasyPoints: 40, position: 1, qualifyingPosition: 1, positionsGained: 0, fastestLap: false, dnf: false },
      { driverId: "nor", fantasyPoints: 42, position: 2, qualifyingPosition: 5, positionsGained: 3, fastestLap: true, dnf: false },
      { driverId: "lec", fantasyPoints: 28, position: 3, qualifyingPosition: 3, positionsGained: 0, fastestLap: false, dnf: false },
      { driverId: "sai", fantasyPoints: 20, position: 7, qualifyingPosition: 4, positionsGained: -3, fastestLap: false, dnf: false },
      { driverId: "pia", fantasyPoints: 24, position: 5, qualifyingPosition: 6, positionsGained: 1, fastestLap: false, dnf: false },
      { driverId: "ham", fantasyPoints: 22, position: 6, qualifyingPosition: 7, positionsGained: 1, fastestLap: false, dnf: false },
      { driverId: "rus", fantasyPoints: 26, position: 4, qualifyingPosition: 2, positionsGained: -2, fastestLap: false, dnf: false },
      { driverId: "per", fantasyPoints: 16, position: 8, qualifyingPosition: 8, positionsGained: 0, fastestLap: false, dnf: false },
      { driverId: "alo", fantasyPoints: 14, position: 10, qualifyingPosition: 11, positionsGained: 1, fastestLap: false, dnf: false },
      { driverId: "str", fantasyPoints: 8, position: 16, qualifyingPosition: 16, positionsGained: 0, fastestLap: false, dnf: false },
    ],
    constructorResults: [
      { constructorId: "red_bull", fantasyPoints: 52, bestFinish: 1, bothCarsFinish: true },
      { constructorId: "mclaren", fantasyPoints: 60, bestFinish: 2, bothCarsFinish: true },
      { constructorId: "ferrari", fantasyPoints: 44, bestFinish: 3, bothCarsFinish: true },
      { constructorId: "mercedes", fantasyPoints: 44, bestFinish: 4, bothCarsFinish: true },
      { constructorId: "aston_martin", fantasyPoints: 18, bestFinish: 10, bothCarsFinish: true },
    ],
  },
];

// Utility functions
export function getDriverById(id: string): Driver | undefined {
  return drivers.find(d => d.id === id);
}

export function getConstructorById(id: string): ConstructorTeam | undefined {
  return constructors.find(c => c.id === id);
}

export function getDriverAveragePoints(driverId: string, upToRound?: number): number {
  const relevantRaces = upToRound 
    ? races.filter(r => r.round <= upToRound) 
    : races;
  
  let total = 0;
  let count = 0;
  
  for (const race of relevantRaces) {
    const result = race.driverResults.find(r => r.driverId === driverId);
    if (result) {
      total += result.fantasyPoints;
      count++;
    }
  }
  
  return count > 0 ? Math.round(total / count * 10) / 10 : 0;
}

export function getConstructorAveragePoints(constructorId: string, upToRound?: number): number {
  const relevantRaces = upToRound 
    ? races.filter(r => r.round <= upToRound) 
    : races;
  
  let total = 0;
  let count = 0;
  
  for (const race of relevantRaces) {
    const result = race.constructorResults.find(r => r.constructorId === constructorId);
    if (result) {
      total += result.fantasyPoints;
      count++;
    }
  }
  
  return count > 0 ? Math.round(total / count * 10) / 10 : 0;
}

export function getDriverTrend(driverId: string, currentRound: number): "up" | "down" | "stable" {
  if (currentRound <= 1) return "stable";
  
  const current = races.find(r => r.round === currentRound)?.driverResults.find(r => r.driverId === driverId);
  const previous = races.find(r => r.round === currentRound - 1)?.driverResults.find(r => r.driverId === driverId);
  
  if (!current || !previous) return "stable";
  
  const diff = current.fantasyPoints - previous.fantasyPoints;
  if (diff > 3) return "up";
  if (diff < -3) return "down";
  return "stable";
}

export function getRecommendedDrivers(round: number): { driverId: string; score: number; reason: string }[] {
  const scored = drivers.map(driver => {
    const avg = getDriverAveragePoints(driver.id, round);
    const valueScore = avg / driver.price;
    const trend = getDriverTrend(driver.id, round);
    const trendBonus = trend === "up" ? 1.15 : trend === "down" ? 0.9 : 1;
    
    const score = Math.round(valueScore * trendBonus * 100) / 100;
    
    let reason = "";
    if (valueScore > 1.5) reason = "Elite value pick";
    else if (trend === "up") reason = "Trending upward";
    else if (avg > 35) reason = "Consistent top scorer";
    else if (valueScore > 1.0) reason = "Good value";
    else reason = "Budget option";
    
    return { driverId: driver.id, score, reason };
  });
  
  return scored.sort((a, b) => b.score - a.score);
}

export function getRecommendedConstructors(round: number): { constructorId: string; score: number; reason: string }[] {
  const scored = constructors.map(constructor => {
    const avg = getConstructorAveragePoints(constructor.id, round);
    const valueScore = avg / constructor.price;
    
    const score = Math.round(valueScore * 100) / 100;
    
    let reason = "";
    if (valueScore > 2.0) reason = "Best value constructor";
    else if (avg > 55) reason = "Dominant force";
    else if (valueScore > 1.5) reason = "Strong value pick";
    else reason = "Solid choice";
    
    return { constructorId: constructor.id, score, reason };
  });
  
  return scored.sort((a, b) => b.score - a.score);
}
