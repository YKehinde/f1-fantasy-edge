import { useState } from "react";
import { motion } from "framer-motion";
import { Flag, Users, Car, TrendingUp, Zap } from "lucide-react";
import RaceSelector from "@/components/RaceSelector";
import DriverCard from "@/components/DriverCard";
import ConstructorCard from "@/components/ConstructorCard";
import {
  races,
  type Race,
  getRecommendedDrivers,
  getRecommendedConstructors,
} from "@/data/f1-fantasy";

const Index = () => {
  const [selectedRace, setSelectedRace] = useState<Race>(races[races.length - 1]);

  const driverResults = [...selectedRace.driverResults].sort(
    (a, b) => b.fantasyPoints - a.fantasyPoints
  );

  const constructorResults = [...selectedRace.constructorResults].sort(
    (a, b) => b.fantasyPoints - a.fantasyPoints
  );

  const driverRecs = getRecommendedDrivers(selectedRace.round);
  const constructorRecs = getRecommendedConstructors(selectedRace.round);

  const topDriverPts = driverResults[0]?.fantasyPoints ?? 0;
  const topConstructorPts = constructorResults[0]?.fantasyPoints ?? 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-carbon">
        <div className="container mx-auto py-5 px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary glow-red">
                <Flag className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-foreground tracking-tight">
                  F1 Fantasy <span className="text-gradient-red">Playbook</span>
                </h1>
                <p className="text-xs font-mono text-muted-foreground tracking-wide">
                  DATA-BACKED PICKS • MAXIMIZE POINTS
                </p>
              </div>
            </div>
            <RaceSelector selectedRace={selectedRace} onSelect={setSelectedRace} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Race info bar */}
        <motion.div
          key={selectedRace.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-wrap items-center gap-4 text-sm font-mono"
        >
          <span className="text-2xl">{selectedRace.country}</span>
          <div>
            <div className="text-foreground font-semibold">{selectedRace.name}</div>
            <div className="text-xs text-muted-foreground">{selectedRace.circuit}</div>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <Zap className="w-3.5 h-3.5 text-primary" />
              Top Driver: <span className="text-foreground font-bold">{topDriverPts} pts</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="w-3.5 h-3.5 text-accent" />
              Top Constructor: <span className="text-foreground font-bold">{topConstructorPts} pts</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Drivers - 2 columns on large */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <h2 className="font-display font-bold text-lg text-foreground">Driver Rankings</h2>
              <span className="font-mono text-xs text-muted-foreground ml-1">by fantasy pts</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {driverResults.map((result, i) => {
                const rec = driverRecs.find(r => r.driverId === result.driverId);
                return (
                  <DriverCard
                    key={result.driverId}
                    result={result}
                    rank={i + 1}
                    round={selectedRace.round}
                    recommendation={rec && rec.score > 1.0 ? rec : undefined}
                  />
                );
              })}
            </div>
          </div>

          {/* Constructors sidebar */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-accent" />
              <h2 className="font-display font-bold text-lg text-foreground">Constructors</h2>
            </div>

            <div className="space-y-2">
              {constructorResults.map((result, i) => {
                const rec = constructorRecs.find(r => r.constructorId === result.constructorId);
                return (
                  <ConstructorCard
                    key={result.constructorId}
                    result={result}
                    rank={i + 1}
                    round={selectedRace.round}
                    recommendation={rec && rec.score > 1.5 ? rec : undefined}
                  />
                );
              })}
            </div>

            {/* Quick tips */}
            <div className="bg-card border border-border rounded-md p-4 mt-4">
              <h3 className="font-display font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Quick Tips — R{selectedRace.round}
              </h3>
              <ul className="space-y-2 text-xs font-mono text-muted-foreground">
                {driverRecs.slice(0, 3).map((rec) => {
                  const driver = driverResults.find(r => r.driverId === rec.driverId);
                  return (
                    <li key={rec.driverId} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">▸</span>
                      <span>
                        <span className="text-foreground font-medium">
                          {rec.driverId.toUpperCase()}
                        </span>{" "}
                        — {rec.reason} (value: {rec.score})
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-4">
        <div className="container mx-auto px-4">
          <p className="text-center font-mono text-xs text-muted-foreground">
            Historical data from 2024 season • Not affiliated with F1 or F1 Fantasy
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
