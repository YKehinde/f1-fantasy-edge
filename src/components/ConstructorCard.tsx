import { motion } from "framer-motion";
import { type ProcessedConstructorResult } from "@/hooks/use-f1-data";

type Props = {
  result: ProcessedConstructorResult;
  rank: number;
};

const ConstructorCard = ({ result, rank }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.05, duration: 0.3 }}
      className="group flex items-center gap-3 bg-card border border-border rounded-md p-3 hover:glow-red-subtle transition-all"
    >
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: result.color }}
      />

      <div className="font-mono text-xs text-muted-foreground w-5">{rank}</div>

      <div className="flex-1 min-w-0">
        <h4 className="font-display font-semibold text-sm text-foreground truncate">
          {result.constructorName}
        </h4>
        <span className="text-[10px] font-mono text-muted-foreground">
          Best: P{result.bestFinish || "—"} {result.bothCarsFinish ? "• Both finished" : ""}
        </span>
      </div>

      <div className="text-right flex-shrink-0">
        <div className="font-mono text-lg font-bold text-foreground">{result.fantasyPoints}</div>
        <div className="font-mono text-[10px] text-muted-foreground">pts</div>
      </div>
    </motion.div>
  );
};

export default ConstructorCard;
