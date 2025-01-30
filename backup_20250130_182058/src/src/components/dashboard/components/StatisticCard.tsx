import { memo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "../../../lib/utils";

interface StatisticCardProps {
  title: string;
  value: string | number;
  trend?: number;
}

const StatisticCard = memo(({ title, value, trend }: StatisticCardProps) => (
  <div className="bg-muted p-4 rounded-lg">
    <div className="flex items-center justify-between mb-2">
      <p className="text-sm text-muted-foreground">{title}</p>
      {trend !== undefined && (
        <div className={cn(
          "flex items-center text-sm",
          trend > 0 ? "text-green-500" : trend < 0 ? "text-red-500" : "text-muted-foreground"
        )}>
          {trend > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <p className="text-2xl font-bold">{value}</p>
  </div>
));

StatisticCard.displayName = "StatisticCard";

export default StatisticCard;
