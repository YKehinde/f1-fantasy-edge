import { motion } from "framer-motion";
import { getConstructorById, getConstructorAveragePoints, type ConstructorResult } from "@/data/f1-fantasy";

type Props = {
  result: ConstructorResult;
  rank: number;
  round: number;
  recommendation?: { score: number; reason: string };
};

const ConstructorCard = ({ result, rank, round, recommendation }: Props) => {
  const constructor = getConstructorById(result.constructorId);
  if (!constructor) return null;

  const avg = getConstructorAveragePoints(result.constructorId, round);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.05, duration: 0.3 }}
      className="group flex items-center gap-3 bg-card border border-border rounded-md p-3 hover:glow-red-subtle transition-all"
    >
      {/* Team color dot */}
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: constructor.color }}
      />

      <div className="font-mono text-xs text-muted-foreground w-5">{rank}</div>

      <div className="flex-1 min-w-0">
        <h4 className="font-display font-semibold text-sm text-foreground truncate">{constructor.name}</h4>
        {recommendation && (
          <span className="text-[10px] font-mono text-primary">{recommendation.reason}</span>
        )}
      </div>

      <div className="text-right flex-shrink-0">
        <div className="font-mono text-lg font-bold text-foreground">{result.fantasyPoints}</div>
        <div className="font-mono text-[10px] text-muted-foreground">avg {avg}</div>
      </div>

      <div className="font-mono text-xs text-accent flex-shrink-0">${constructor.price}M</div>
    </motion.div>
  );
};

export default ConstructorCard;
