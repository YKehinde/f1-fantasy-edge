import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Zap, Trophy } from "lucide-react";
import { getDriverById, getDriverAveragePoints, getDriverTrend, type RaceResult } from "@/data/f1-fantasy";

type Props = {
  result: RaceResult;
  rank: number;
  round: number;
  recommendation?: { score: number; reason: string };
};

const DriverCard = ({ result, rank, round, recommendation }: Props) => {
  const driver = getDriverById(result.driverId);
  if (!driver) return null;

  const avg = getDriverAveragePoints(result.driverId, round);
  const trend = getDriverTrend(result.driverId, round);

  const podiumColors: Record<number, string> = {
    1: "border-podium-gold",
    2: "border-podium-silver",
    3: "border-podium-bronze",
  };

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-positive" : trend === "down" ? "text-negative" : "text-muted-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.04, duration: 0.3 }}
      className={`group relative bg-card border rounded-md p-4 hover:glow-red-subtle transition-all duration-200 ${
        podiumColors[rank] || "border-border"
      }`}
    >
      {/* Rank badge */}
      <div className="absolute -top-2.5 -left-2 flex items-center justify-center w-7 h-7 rounded-sm bg-secondary font-mono text-xs font-bold text-foreground border border-border">
        {rank}
      </div>

      {/* Team color strip */}
      <div
        className="absolute top-0 right-0 w-1 h-full rounded-r-md"
        style={{ backgroundColor: driver.teamColor }}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-muted-foreground">#{driver.number}</span>
            <h3 className="font-display font-semibold text-sm text-foreground truncate">{driver.name}</h3>
          </div>
          <p className="text-xs text-muted-foreground truncate">{driver.team}</p>
          
          {recommendation && (
            <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-sm bg-primary/10 text-primary text-[10px] font-mono font-medium">
              <Zap className="w-3 h-3" />
              {recommendation.reason}
            </span>
          )}
        </div>

        <div className="text-right flex-shrink-0">
          <div className="font-mono text-2xl font-bold text-foreground leading-none">
            {result.fantasyPoints}
          </div>
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">pts</span>
          
          <div className="flex items-center justify-end gap-1 mt-2">
            <TrendIcon className={`w-3 h-3 ${trendColor}`} />
            <span className={`font-mono text-xs ${trendColor}`}>
              avg {avg}
            </span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
        <div className="flex items-center gap-1">
          <Trophy className="w-3 h-3 text-muted-foreground" />
          <span className="font-mono text-xs text-muted-foreground">
            P{result.position || "DNF"}
          </span>
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          Q{result.qualifyingPosition}
        </div>
        <div className={`font-mono text-xs ${result.positionsGained > 0 ? "text-positive" : result.positionsGained < 0 ? "text-negative" : "text-muted-foreground"}`}>
          {result.positionsGained > 0 ? "+" : ""}{result.positionsGained} pos
        </div>
        {result.fastestLap && (
          <span className="font-mono text-[10px] text-primary font-medium">⚡ FL</span>
        )}
        {result.dnf && (
          <span className="font-mono text-[10px] text-destructive font-medium">DNF</span>
        )}
        <div className="ml-auto font-mono text-xs text-accent">
          ${driver.price}M
        </div>
      </div>
    </motion.div>
  );
};

export default DriverCard;
