import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProgressDisplayProps {
  title: string;
  value: number;
  target?: number;
  subtitle?: string;
  showPercentage?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export default function ProgressDisplay({
  title,
  value,
  target = 100,
  subtitle,
  showPercentage = true,
  variant = 'default'
}: ProgressDisplayProps) {
  const percentage = Math.round((value / target) * 100);
  const getVariantClass = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-500/10 border-green-500/20';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20';
      case 'danger':
        return 'bg-red-500/10 border-red-500/20';
      default:
        return 'bg-muted/30';
    }
  };

  return (
    <Card className={`border ${getVariantClass()}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          {showPercentage && (
            <Badge variant={variant === 'default' ? 'secondary' : 'outline'}>
              {percentage}%
            </Badge>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardHeader>
      <CardContent>
        <Progress value={percentage} className="h-2" />
        {target !== 100 && (
          <p className="text-sm text-muted-foreground mt-2">
            {value} of {target} completed
          </p>
        )}
      </CardContent>
    </Card>
  );
}
