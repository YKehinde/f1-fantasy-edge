import { useState } from "react";
import { motion } from "framer-motion";
import { Flag, Users, Car, TrendingUp, Zap, Loader2, AlertCircle, Crown } from "lucide-react";
import RaceSelector from "@/components/RaceSelector";
import DriverCard from "@/components/DriverCard";
import ConstructorCard from "@/components/ConstructorCard";
import TeamBuilder from "@/components/TeamBuilder";
import { useSeasonData, type ProcessedRace } from "@/hooks/use-f1-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const SEASONS = [2026, 2025, 2024, 2023, 2022];

const Index = () => {
  const [season, setSeason] = useState(2026);
  const { data: allRaces, isLoading, error } = useSeasonData(season);

  const [selectedRound, setSelectedRound] = useState<number | null>(null);

  const races = allRaces ?? [];
  const selectedRace = selectedRound
    ? (races.find((r) => r.round === selectedRound) ?? races[0])
    : races[0];

  const driverResults = selectedRace
    ? [...selectedRace.driverResults].sort((a, b) => b.fantasyPoints - a.fantasyPoints)
    : [];

  const constructorResults = selectedRace
    ? [...selectedRace.constructorResults].sort((a, b) => b.fantasyPoints - a.fantasyPoints)
    : [];

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
                  REAL DATA • MAXIMIZE POINTS
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Team Builder */}
              {races.length > 0 && selectedRace && (
                <TeamBuilder races={races} currentRound={selectedRace.round}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-mono text-xs border-border bg-secondary hover:glow-red-subtle gap-1.5"
                  >
                    <Crown className="w-3.5 h-3.5 text-accent" />
                    Team Builder
                  </Button>
                </TeamBuilder>
              )}
              {/* Season selector */}
              <Select
                value={String(season)}
                onValueChange={(v) => {
                  setSeason(parseInt(v));
                  setSelectedRound(null);
                }}
              >
                <SelectTrigger className="w-[100px] bg-secondary border-border font-mono text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {SEASONS.map((s) => (
                    <SelectItem key={s} value={String(s)} className="font-mono text-sm">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Race selector */}
              {selectedRace && races.length > 0 && (
                <RaceSelector
                  races={races}
                  selectedRace={selectedRace}
                  onSelect={(r) => setSelectedRound(r.round)}
                />
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="font-mono text-sm text-muted-foreground">
              Loading {season} season data...
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              Fetching race results from API
            </p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <AlertCircle className="w-8 h-8 text-destructive" />
            <p className="font-mono text-sm text-destructive">Failed to load data</p>
            <p className="font-mono text-xs text-muted-foreground">{(error as Error).message}</p>
          </div>
        )}

        {/* No data */}
        {!isLoading && !error && races.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Flag className="w-8 h-8 text-muted-foreground" />
            <p className="font-mono text-sm text-muted-foreground">
              No completed races found for {season}
            </p>
          </div>
        )}

        {/* Race data */}
        {selectedRace && !isLoading && (
          <>
            {/* Race info bar */}
            <motion.div
              key={`${season}-${selectedRace.round}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-wrap items-center gap-4 text-sm font-mono"
            >
              <span className="text-2xl">{selectedRace.flag}</span>
              <div>
                <div className="text-foreground font-semibold">{selectedRace.name}</div>
                <div className="text-xs text-muted-foreground">
                  {selectedRace.circuit} • {selectedRace.date}
                </div>
              </div>
              <div className="ml-auto flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  Top Driver: <span className="text-foreground font-bold">{topDriverPts} pts</span>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                  <TrendingUp className="w-3.5 h-3.5 text-accent" />
                  Top Constructor:{" "}
                  <span className="text-foreground font-bold">{topConstructorPts} pts</span>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Drivers */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <h2 className="font-display font-bold text-lg text-foreground">
                    Driver Rankings
                  </h2>
                  <span className="font-mono text-xs text-muted-foreground ml-1">
                    {driverResults.length} drivers • fantasy pts
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {driverResults.map((result, i) => (
                    <DriverCard
                      key={result.driverId}
                      result={result}
                      driver={selectedRace.drivers.find((d) => d.driverId === result.driverId)}
                      rank={i + 1}
                      allRaces={races}
                      currentRound={selectedRace.round}
                    />
                  ))}
                </div>
              </div>

              {/* Constructors sidebar */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-accent" />
                  <h2 className="font-display font-bold text-lg text-foreground">Constructors</h2>
                </div>

                <div className="space-y-2">
                  {constructorResults.map((result, i) => (
                    <ConstructorCard key={result.constructorId} result={result} rank={i + 1} />
                  ))}
                </div>

                {/* Season summary */}
                <div className="bg-card border border-border rounded-md p-4 mt-4">
                  <h3 className="font-display font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    Season Stats — {season}
                  </h3>
                  <ul className="space-y-2 text-xs font-mono text-muted-foreground">
                    <li className="flex justify-between">
                      <span>Races loaded</span>
                      <span className="text-foreground font-bold">{races.length}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Current round</span>
                      <span className="text-foreground font-bold">R{selectedRace.round}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Data source</span>
                      <span className="text-primary">Jolpica F1 API</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-border mt-12 py-4">
        <div className="container mx-auto px-4">
          <p className="text-center font-mono text-xs text-muted-foreground">
            Built by{" "}
            <a href="https://medium.com/@YAKStack" className="text-primary underline">
              YAKStack
            </a>
          </p>
          <p className="text-center font-mono text-xs text-muted-foreground">
            Real data via Jolpica F1 API • Fantasy points calculated from race results • Not
            affiliated with F1
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
