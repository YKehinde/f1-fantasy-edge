import { useQuery } from "@tanstack/react-query";
import {
  fetchSchedule,
  fetchRaceResults,
  fetchQualifying,
  calculateFantasyPoints,
  calculateConstructorPoints,
  getCountryFlag,
  getTeamColor,
  type RaceScheduleItem,
} from "@/lib/f1-api";

export type ProcessedDriver = {
  driverId: string;
  code: string;
  name: string;
  number: number;
  team: string;
  teamColor: string;
  constructorId: string;
};

export type ProcessedRaceResult = {
  driverId: string;
  fantasyPoints: number;
  position: number;
  qualifyingPosition: number;
  positionsGained: number;
  fastestLap: boolean;
  dnf: boolean;
};

export type ProcessedConstructorResult = {
  constructorId: string;
  constructorName: string;
  color: string;
  fantasyPoints: number;
  bestFinish: number;
  bothCarsFinish: boolean;
};

export type ProcessedRace = {
  id: string;
  name: string;
  country: string;
  flag: string;
  circuit: string;
  date: string;
  round: number;
  driverResults: ProcessedRaceResult[];
  constructorResults: ProcessedConstructorResult[];
  drivers: ProcessedDriver[];
};

// Fetch schedule for a season
export function useSeasonSchedule(season: number) {
  return useQuery({
    queryKey: ["f1-schedule", season],
    queryFn: () => fetchSchedule(season),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

// Fetch and process a single race's full data
export function useRaceData(season: number, round: number, enabled = true) {
  return useQuery({
    queryKey: ["f1-race-data", season, round],
    queryFn: async (): Promise<ProcessedRace | null> => {
      const [results, qualifying, schedule] = await Promise.all([
        fetchRaceResults(season, round),
        fetchQualifying(season, round).catch(() => []),
        fetchSchedule(season),
      ]);

      if (results.length === 0) return null;

      const raceInfo = schedule.find(r => r.round === String(round));
      if (!raceInfo) return null;

      // Map qualifying positions
      const qualiMap = new Map<string, number>();
      qualifying.forEach(q => {
        qualiMap.set(q.Driver.driverId, parseInt(q.position));
      });

      // Process driver results
      const driverResults: ProcessedRaceResult[] = results.map(r => {
        const pos = parseInt(r.position);
        const grid = parseInt(r.grid);
        const isDNF = r.status !== "Finished" && !r.status.startsWith("+");
        const qualiPos = qualiMap.get(r.Driver.driverId) || grid;

        return {
          driverId: r.Driver.driverId,
          fantasyPoints: calculateFantasyPoints(r, qualiPos),
          position: isDNF ? 0 : pos,
          qualifyingPosition: qualiPos,
          positionsGained: isDNF ? 0 : grid - pos,
          fastestLap: r.FastestLap?.rank === "1",
          dnf: isDNF,
        };
      });

      // Build driver info
      const drivers: ProcessedDriver[] = results.map(r => ({
        driverId: r.Driver.driverId,
        code: r.Driver.code || r.Driver.familyName.substring(0, 3).toUpperCase(),
        name: `${r.Driver.givenName} ${r.Driver.familyName}`,
        number: parseInt(r.Driver.permanentNumber || r.number),
        team: r.Constructor.name,
        teamColor: getTeamColor(r.Constructor.constructorId),
        constructorId: r.Constructor.constructorId,
      }));

      // Process constructor results
      const constructorMap = new Map<string, {
        name: string;
        driverPoints: Array<{ fantasyPoints: number; isDNF: boolean }>;
        bestFinish: number;
      }>();

      results.forEach(r => {
        const cId = r.Constructor.constructorId;
        const pos = parseInt(r.position);
        const isDNF = r.status !== "Finished" && !r.status.startsWith("+");
        const driverPts = driverResults.find(d => d.driverId === r.Driver.driverId);

        if (!constructorMap.has(cId)) {
          constructorMap.set(cId, {
            name: r.Constructor.name,
            driverPoints: [],
            bestFinish: isDNF ? 99 : pos,
          });
        }
        const entry = constructorMap.get(cId)!;
        entry.driverPoints.push({
          fantasyPoints: driverPts?.fantasyPoints ?? 0,
          isDNF,
        });
        if (!isDNF && pos < entry.bestFinish) {
          entry.bestFinish = pos;
        }
      });

      const constructorResults: ProcessedConstructorResult[] = Array.from(
        constructorMap.entries()
      ).map(([id, data]) => ({
        constructorId: id,
        constructorName: data.name,
        color: getTeamColor(id),
        fantasyPoints: calculateConstructorPoints(data.driverPoints),
        bestFinish: data.bestFinish === 99 ? 0 : data.bestFinish,
        bothCarsFinish: data.driverPoints.every(d => !d.isDNF),
      }));

      return {
        id: raceInfo.Circuit.circuitId,
        name: raceInfo.raceName,
        country: raceInfo.Circuit.Location.country,
        flag: getCountryFlag(raceInfo.Circuit.Location.country),
        circuit: raceInfo.Circuit.circuitName,
        date: raceInfo.date,
        round,
        driverResults,
        constructorResults,
        drivers,
      };
    },
    enabled,
    staleTime: 1000 * 60 * 60,
  });
}

// Fetch all completed races for a season
export function useSeasonData(season: number) {
  return useQuery({
    queryKey: ["f1-season-all", season],
    queryFn: async (): Promise<ProcessedRace[]> => {
      const schedule = await fetchSchedule(season);

      // Only fetch races that have already happened
      const now = new Date();
      const pastRaces = schedule.filter(r => new Date(r.date) < now);

      // Fetch all race data in parallel (batched to avoid rate limits)
      const batchSize = 4;
      const allRaces: ProcessedRace[] = [];

      for (let i = 0; i < pastRaces.length; i += batchSize) {
        const batch = pastRaces.slice(i, i + batchSize);
        const results = await Promise.all(
          batch.map(async (race) => {
            try {
              const [results, qualifying] = await Promise.all([
                fetchRaceResults(season, race.round),
                fetchQualifying(season, race.round).catch(() => []),
              ]);

              if (results.length === 0) return null;

              const qualiMap = new Map<string, number>();
              qualifying.forEach(q => {
                qualiMap.set(q.Driver.driverId, parseInt(q.position));
              });

              const driverResults: ProcessedRaceResult[] = results.map(r => {
                const pos = parseInt(r.position);
                const grid = parseInt(r.grid);
                const isDNF = r.status !== "Finished" && !r.status.startsWith("+");
                const qualiPos = qualiMap.get(r.Driver.driverId) || grid;

                return {
                  driverId: r.Driver.driverId,
                  fantasyPoints: calculateFantasyPoints(r, qualiPos),
                  position: isDNF ? 0 : pos,
                  qualifyingPosition: qualiPos,
                  positionsGained: isDNF ? 0 : grid - pos,
                  fastestLap: r.FastestLap?.rank === "1",
                  dnf: isDNF,
                };
              });

              const drivers: ProcessedDriver[] = results.map(r => ({
                driverId: r.Driver.driverId,
                code: r.Driver.code || r.Driver.familyName.substring(0, 3).toUpperCase(),
                name: `${r.Driver.givenName} ${r.Driver.familyName}`,
                number: parseInt(r.Driver.permanentNumber || r.number),
                team: r.Constructor.name,
                teamColor: getTeamColor(r.Constructor.constructorId),
                constructorId: r.Constructor.constructorId,
              }));

              const constructorMap = new Map<string, {
                name: string;
                driverPoints: Array<{ fantasyPoints: number; isDNF: boolean }>;
                bestFinish: number;
              }>();

              results.forEach(r => {
                const cId = r.Constructor.constructorId;
                const pos = parseInt(r.position);
                const isDNF = r.status !== "Finished" && !r.status.startsWith("+");
                const driverPts = driverResults.find(d => d.driverId === r.Driver.driverId);

                if (!constructorMap.has(cId)) {
                  constructorMap.set(cId, { name: r.Constructor.name, driverPoints: [], bestFinish: isDNF ? 99 : pos });
                }
                const entry = constructorMap.get(cId)!;
                entry.driverPoints.push({ fantasyPoints: driverPts?.fantasyPoints ?? 0, isDNF });
                if (!isDNF && pos < entry.bestFinish) entry.bestFinish = pos;
              });

              const constructorResults: ProcessedConstructorResult[] = Array.from(
                constructorMap.entries()
              ).map(([id, data]) => ({
                constructorId: id,
                constructorName: data.name,
                color: getTeamColor(id),
                fantasyPoints: calculateConstructorPoints(data.driverPoints),
                bestFinish: data.bestFinish === 99 ? 0 : data.bestFinish,
                bothCarsFinish: data.driverPoints.every(d => !d.isDNF),
              }));

              return {
                id: race.Circuit.circuitId,
                name: race.raceName,
                country: race.Circuit.Location.country,
                flag: getCountryFlag(race.Circuit.Location.country),
                circuit: race.Circuit.circuitName,
                date: race.date,
                round: parseInt(race.round),
                driverResults,
                constructorResults,
                drivers,
              } as ProcessedRace;
            } catch {
              return null;
            }
          })
        );

        allRaces.push(...results.filter((r): r is ProcessedRace => r !== null));
      }

      return allRaces;
    },
    staleTime: 1000 * 60 * 30, // 30 min
  });
}
