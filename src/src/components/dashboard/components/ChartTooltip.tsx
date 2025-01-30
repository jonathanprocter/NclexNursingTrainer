import { memo } from "react";

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

const ChartTooltip = memo(({ active, payload, label }: ChartTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg p-3 shadow-lg">
        <p className="font-medium mb-1">{label}</p>
        <p className="text-sm text-muted-foreground">
          Mastery Level: <span className="font-medium">{payload[0].value}%</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Click to view detailed breakdown
        </p>
      </div>
    );
  }
  return null;
});

ChartTooltip.displayName = "ChartTooltip";

export default ChartTooltip;
