import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Zap, Trophy } from "lucide-react";
import {
  type ProcessedRaceResult,
  type ProcessedDriver,
  type ProcessedRace,
} from "@/hooks/use-f1-data";
import { getDriverImage } from "@/lib/f1-api";

type Props = {
  result: ProcessedRaceResult;
  driver: ProcessedDriver | undefined;
  rank: number;
  allRaces: ProcessedRace[];
  currentRound: number;
};

function getDriverAvg(driverId: string, races: ProcessedRace[], upToRound: number): number {
  let total = 0,
    count = 0;
  for (const race of races) {
    if (race.round > upToRound) continue;
    const r = race.driverResults.find((d) => d.driverId === driverId);
    if (r) {
      total += r.fantasyPoints;
      count++;
    }
  }
  return count > 0 ? Math.round((total / count) * 10) / 10 : 0;
}

function getDriverTrend(
  driverId: string,
  races: ProcessedRace[],
  currentRound: number
): "up" | "down" | "stable" {
  const curr = races
    .find((r) => r.round === currentRound)
    ?.driverResults.find((d) => d.driverId === driverId);
  const prev = races
    .find((r) => r.round === currentRound - 1)
    ?.driverResults.find((d) => d.driverId === driverId);
  if (!curr || !prev) return "stable";
  const diff = curr.fantasyPoints - prev.fantasyPoints;
  return diff > 3 ? "up" : diff < -3 ? "down" : "stable";
}

const DriverCard = ({ result, driver, rank, allRaces, currentRound }: Props) => {
  if (!driver) return null;

  const avg = getDriverAvg(result.driverId, allRaces, currentRound);
  const trend = getDriverTrend(result.driverId, allRaces, currentRound);
  const driverImage = getDriverImage(driver.name);

  const podiumColors: Record<number, string> = {
    1: "border-podium-gold",
    2: "border-podium-silver",
    3: "border-podium-bronze",
  };

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor =
    trend === "up" ? "text-positive" : trend === "down" ? "text-negative" : "text-muted-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.04, duration: 0.3 }}
      className={`group relative bg-card border rounded-md p-4 hover:glow-red-subtle overflow-hidden transition-all duration-200 ${
        podiumColors[rank] || "border-border"
      }`}
    >
      <div className="absolute -top-2.5 -left-2 flex items-center justify-center w-7 h-7 rounded-sm bg-secondary font-mono text-xs font-bold text-foreground border border-border">
        {rank}
      </div>

      <div
        className="absolute top-0 right-0 w-1 h-full rounded-r-md"
        style={{ backgroundColor: driver.teamColor }}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-muted-foreground">#{driver.number}</span>
            <h3 className="font-display font-semibold text-sm text-foreground truncate">
              {driver.name}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground truncate">{driver.team}</p>
        </div>

        <div className="text-right flex-shrink-0">
          <div className="font-mono text-2xl font-bold text-foreground leading-none">
            {result.fantasyPoints}
          </div>
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
            pts
          </span>

          <div className="flex items-center justify-end gap-1 mt-2">
            <TrendIcon className={`w-3 h-3 ${trendColor}`} />
            <span className={`font-mono text-xs ${trendColor}`}>avg {avg}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
        <div className="flex items-center gap-1">
          <Trophy className="w-3 h-3 text-muted-foreground" />
          <span className="font-mono text-xs text-muted-foreground">
            P{result.position || "DNF"}
          </span>
        </div>
        <div className="font-mono text-xs text-muted-foreground">Q{result.qualifyingPosition}</div>
        <div
          className={`font-mono text-xs ${result.positionsGained > 0 ? "text-positive" : result.positionsGained < 0 ? "text-negative" : "text-muted-foreground"}`}
        >
          {result.positionsGained > 0 ? "+" : ""}
          {result.positionsGained} pos
        </div>
        {result.fastestLap && (
          <span className="font-mono text-[10px] text-primary font-medium">⚡ FL</span>
        )}
        {result.dnf && (
          <span className="font-mono text-[10px] text-destructive font-medium">DNF</span>
        )}
      </div>
      {driverImage && (
        <img
          src={driverImage}
          alt={driver.name}
          className="absolute top-0 left-0 w-auto object-contain opacity-10 group-hover:opacity-35 transition-opacity pointer-events-none"
        />
      )}
    </motion.div>
  );
};

export default DriverCard;
