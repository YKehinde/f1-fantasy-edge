import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Car, DollarSign, Trophy, Zap, ChevronDown, ChevronUp, Crown } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  buildOptimalTeam,
  getAllDriverPicks,
  getAllConstructorPicks,
  type TeamDriverPick,
  type TeamConstructorPick,
} from "@/lib/team-builder";
import type { ProcessedRace } from "@/hooks/use-f1-data";

type Props = {
  races: ProcessedRace[];
  currentRound: number;
  children: React.ReactNode;
};

const TeamBuilder = ({ races, currentRound, children }: Props) => {
  const [budget, setBudget] = useState(100);
  const [showAllDrivers, setShowAllDrivers] = useState(false);

  const optimalTeam = useMemo(
    () => buildOptimalTeam(races, currentRound, budget),
    [races, currentRound, budget]
  );

  const allDrivers = useMemo(
    () => getAllDriverPicks(races, currentRound),
    [races, currentRound]
  );

  const allConstructors = useMemo(
    () => getAllConstructorPicks(races, currentRound),
    [races, currentRound]
  );

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg bg-card border-border p-0 flex flex-col">
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-border bg-carbon">
          <SheetTitle className="font-display text-foreground flex items-center gap-2">
            <Crown className="w-5 h-5 text-accent" />
            Best Team Builder
          </SheetTitle>
          <p className="text-xs font-mono text-muted-foreground">
            Optimal lineup based on avg fantasy pts through R{currentRound}
          </p>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-5 space-y-5">
            {/* Budget slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-mono text-xs text-muted-foreground flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-accent" />
                  BUDGET CAP
                </label>
                <span className="font-mono text-sm font-bold text-foreground">${budget}M</span>
              </div>
              <Slider
                value={[budget]}
                onValueChange={(v) => setBudget(v[0])}
                min={60}
                max={150}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
                <span>$60M</span>
                <span>$150M</span>
              </div>
            </div>

            <Tabs defaultValue="optimal" className="w-full">
              <TabsList className="w-full bg-secondary border border-border">
                <TabsTrigger value="optimal" className="flex-1 font-mono text-xs">
                  Optimal Lineup
                </TabsTrigger>
                <TabsTrigger value="drivers" className="flex-1 font-mono text-xs">
                  All Drivers
                </TabsTrigger>
                <TabsTrigger value="constructors" className="flex-1 font-mono text-xs">
                  Constructors
                </TabsTrigger>
              </TabsList>

              {/* Optimal lineup tab */}
              <TabsContent value="optimal" className="space-y-4 mt-4">
                {optimalTeam ? (
                  <>
                    {/* Summary bar */}
                    <div className="grid grid-cols-3 gap-2">
                      <StatBox
                        label="PROJECTED"
                        value={`${optimalTeam.projectedPoints}`}
                        suffix="pts"
                        icon={<Zap className="w-3.5 h-3.5 text-primary" />}
                      />
                      <StatBox
                        label="COST"
                        value={`$${optimalTeam.totalCost}M`}
                        icon={<DollarSign className="w-3.5 h-3.5 text-accent" />}
                      />
                      <StatBox
                        label="REMAINING"
                        value={`$${optimalTeam.budgetRemaining}M`}
                        icon={<DollarSign className="w-3.5 h-3.5 text-positive" />}
                      />
                    </div>

                    {/* Drivers */}
                    <div>
                      <h3 className="font-mono text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-primary" /> DRIVERS (5)
                      </h3>
                      <div className="space-y-1.5">
                        {optimalTeam.drivers.map((d, i) => (
                          <DriverRow key={d.driverId} driver={d} rank={i + 1} highlight />
                        ))}
                      </div>
                    </div>

                    {/* Constructor */}
                    <div>
                      <h3 className="font-mono text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5 text-accent" /> CONSTRUCTOR (1)
                      </h3>
                      <ConstructorRow constructor={optimalTeam.constructor} highlight />
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="font-mono text-sm text-muted-foreground">
                      Not enough data or budget too low
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* All drivers tab */}
              <TabsContent value="drivers" className="space-y-2 mt-4">
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                  Ranked by value (pts/$M) • avg through R{currentRound}
                </p>
                {(showAllDrivers ? allDrivers : allDrivers.slice(0, 10)).map((d, i) => (
                  <DriverRow key={d.driverId} driver={d} rank={i + 1} />
                ))}
                {allDrivers.length > 10 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllDrivers(!showAllDrivers)}
                    className="w-full font-mono text-xs text-muted-foreground"
                  >
                    {showAllDrivers ? (
                      <><ChevronUp className="w-3 h-3 mr-1" /> Show less</>
                    ) : (
                      <><ChevronDown className="w-3 h-3 mr-1" /> Show all {allDrivers.length} drivers</>
                    )}
                  </Button>
                )}
              </TabsContent>

              {/* Constructors tab */}
              <TabsContent value="constructors" className="space-y-2 mt-4">
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                  Ranked by value (pts/$M) • avg through R{currentRound}
                </p>
                {allConstructors.map((c, i) => (
                  <ConstructorRow key={c.constructorId} constructor={c} rank={i + 1} />
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

// Sub-components

function StatBox({ label, value, suffix, icon }: { label: string; value: string; suffix?: string; icon: React.ReactNode }) {
  return (
    <div className="bg-secondary border border-border rounded-md p-2.5 text-center">
      <div className="flex items-center justify-center gap-1 mb-1">{icon}</div>
      <div className="font-mono text-lg font-bold text-foreground leading-none">
        {value}
        {suffix && <span className="text-[10px] text-muted-foreground ml-0.5">{suffix}</span>}
      </div>
      <div className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}

function DriverRow({ driver, rank, highlight }: { driver: TeamDriverPick; rank: number; highlight?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.03 }}
      className={`flex items-center gap-2.5 rounded-md p-2.5 border transition-colors ${
        highlight
          ? "bg-secondary/80 border-border glow-red-subtle"
          : "bg-card border-border hover:bg-secondary/50"
      }`}
    >
      <div
        className="w-1 h-8 rounded-full flex-shrink-0"
        style={{ backgroundColor: driver.teamColor }}
      />
      <div className="font-mono text-xs text-muted-foreground w-5 text-center">{rank}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-display font-semibold text-sm text-foreground truncate">{driver.name}</span>
          {rank <= 3 && highlight && <Trophy className="w-3 h-3 text-accent flex-shrink-0" />}
        </div>
        <div className="font-mono text-[10px] text-muted-foreground">{driver.team}</div>
      </div>
      <div className="text-right flex-shrink-0 space-y-0.5">
        <div className="font-mono text-sm font-bold text-foreground">{driver.avgPoints}<span className="text-[9px] text-muted-foreground ml-0.5">avg</span></div>
        <div className="flex items-center gap-2 justify-end">
          <span className="font-mono text-[10px] text-accent">${driver.price}M</span>
          <span className="font-mono text-[10px] text-positive">{driver.valueScore} v</span>
        </div>
      </div>
    </motion.div>
  );
}

function ConstructorRow({ constructor, rank, highlight }: { constructor: TeamConstructorPick; rank?: number; highlight?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-2.5 rounded-md p-2.5 border transition-colors ${
        highlight
          ? "bg-secondary/80 border-border glow-red-subtle"
          : "bg-card border-border hover:bg-secondary/50"
      }`}
    >
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: constructor.color }}
      />
      {rank !== undefined && (
        <div className="font-mono text-xs text-muted-foreground w-5 text-center">{rank}</div>
      )}
      <div className="flex-1 min-w-0">
        <span className="font-display font-semibold text-sm text-foreground truncate">{constructor.name}</span>
      </div>
      <div className="text-right flex-shrink-0 space-y-0.5">
        <div className="font-mono text-sm font-bold text-foreground">{constructor.avgPoints}<span className="text-[9px] text-muted-foreground ml-0.5">avg</span></div>
        <div className="flex items-center gap-2 justify-end">
          <span className="font-mono text-[10px] text-accent">${constructor.price}M</span>
          <span className="font-mono text-[10px] text-positive">{constructor.valueScore} v</span>
        </div>
      </div>
    </motion.div>
  );
}

export default TeamBuilder;
