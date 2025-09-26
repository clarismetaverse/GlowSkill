"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Scenario } from "@/lib/api";

const LABELS: Record<Scenario, string> = {
  conservative: "Conservative",
  realistic: "Realistic",
  optimistic: "Optimistic",
};

export type ScenarioSelectProps = {
  value: Scenario;
  onChange: (scenario: Scenario) => void;
};

export function ScenarioSelect({ value, onChange }: ScenarioSelectProps) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as Scenario)}>
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Select scenario" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(LABELS).map(([key, label]) => (
          <SelectItem key={key} value={key}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
