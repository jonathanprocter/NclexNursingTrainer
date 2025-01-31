import { memo } from "react";
import { TooltipProps } from "recharts";
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

interface CustomTooltipProps extends TooltipProps<ValueType, NameType> {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    payload: {
      domain: string;
      mastery: number;
    };
  }>;
  label?: string;
}

const ChartTooltip = memo(({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg p-3 shadow-lg">
        <p className="font-medium mb-1">{payload[0].payload.domain}</p>
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