import { races, type Race } from "@/data/f1-fantasy";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Props = {
  selectedRace: Race;
  onSelect: (race: Race) => void;
};

const RaceSelector = ({ selectedRace, onSelect }: Props) => {
  return (
    <Select
      value={selectedRace.id}
      onValueChange={(val) => {
        const race = races.find(r => r.id === val);
        if (race) onSelect(race);
      }}
    >
      <SelectTrigger className="w-full sm:w-[280px] bg-secondary border-border font-mono text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-card border-border">
        {races.map((race) => (
          <SelectItem key={race.id} value={race.id} className="font-mono text-sm">
            <span className="mr-2">{race.country}</span>
            R{race.round} — {race.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default RaceSelector;
