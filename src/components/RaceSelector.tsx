import { type ProcessedRace } from "@/hooks/use-f1-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Props = {
  races: ProcessedRace[];
  selectedRace: ProcessedRace;
  onSelect: (race: ProcessedRace) => void;
};

const RaceSelector = ({ races, selectedRace, onSelect }: Props) => {
  return (
    <Select
      value={String(selectedRace.round)}
      onValueChange={(val) => {
        const race = races.find(r => r.round === parseInt(val));
        if (race) onSelect(race);
      }}
    >
      <SelectTrigger className="w-full sm:w-[300px] bg-secondary border-border font-mono text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-card border-border max-h-[300px]">
        {races.map((race) => (
          <SelectItem key={race.round} value={String(race.round)} className="font-mono text-sm">
            <span className="mr-2">{race.flag}</span>
            R{race.round} — {race.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default RaceSelector;
