import { useState, useCallback, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { useBreakpoint } from "../../hooks/use-mobile";
import { useToast } from "../../hooks/use-toast";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "../../lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from "../ui/dialog";
import type { AnalyticsData } from "../../types/analytics";
import type { DateRange } from "../../types/calendar";
import StatisticCard from "./components/StatisticCard";
import ChartTooltip from "./components/ChartTooltip";
import { ErrorBoundary } from "react-error-boundary";

interface AnalyticsContentProps {
  data: AnalyticsData;
}

interface DomainBreakdownProps {
  domain: string;
  mastery: number;
  onClose: () => void;
}

const ErrorFallback = memo(({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="p-4 bg-destructive/10 rounded-md">
    <h2 className="text-lg font-semibold mb-2">Analytics Error:</h2>
    <p className="text-sm text-destructive mb-4">{error.message}</p>
    <Button onClick={resetErrorBoundary}>Retry</Button>
  </div>
));

const DomainBreakdown = memo(({ domain, mastery, onClose }: DomainBreakdownProps) => (
  <Dialog open onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{domain} Breakdown</DialogTitle>
        <DialogDescription>
          Detailed analysis of your performance in this domain
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Overall Mastery</span>
          <span className="font-medium">{mastery}%</span>
        </div>
        <div className="space-y-2">
          <h4 className="font-medium">Key Areas:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Understanding core concepts</li>
            <li>Applying knowledge in practice</li>
            <li>Critical thinking and analysis</li>
          </ul>
        </div>
        <div className="space-y-2">
          <h4 className="font-medium">Recommendations:</h4>
          <p className="text-sm text-muted-foreground">
            Focus on practical applications and case studies to improve your understanding in this domain.
          </p>
        </div>
      </div>
      <DialogClose asChild>
        <Button variant="outline" className="absolute right-4 top-4 rounded-full p-2 h-auto">
          <X className="h-4 w-4" />
        </Button>
      </DialogClose>
    </DialogContent>
  </Dialog>
));

function AnalyticsContent({ data }: AnalyticsContentProps) {
  const { isMobile, isTablet } = useBreakpoint();
  const { toast } = useToast();
  const [date, setDate] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [selectedDomain, setSelectedDomain] = useState<{ domain: string; mastery: number } | null>(null);

  const handleDateRangeChange = useCallback((range: DateRange | undefined) => {
    setDate(range || { from: undefined, to: undefined });
  }, []);

  const handleExport = useCallback(() => {
    try {
      const exportData = {
        ...data,
        exportDate: new Date().toISOString(),
        dateRange: {
          from: date.from?.toISOString(),
          to: date.to?.toISOString(),
        },
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nclex-analytics-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Analytics Exported",
        description: "Your analytics data has been exported successfully.",
      });
    } catch (error) {
      console.error('Error exporting analytics:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export analytics data. Please try again.",
        variant: "destructive",
      });
    }
  }, [data, date, toast]);

  const handleBarClick = useCallback((data: { payload: { domain: string; mastery: number } }) => {
    if (data?.payload) {
      setSelectedDomain({
        domain: data.payload.domain,
        mastery: data.payload.mastery
      });
    }
  }, []);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !date.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date.from}
                  selected={date}
                  onSelect={handleDateRangeChange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            <Button
              variant="outline"
              onClick={() => setDate({ from: undefined, to: undefined })}
              className="h-9"
            >
              Reset
            </Button>
          </div>
          <Button onClick={handleExport} className="h-9">
            Export Data
          </Button>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Module Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ height: isMobile ? 250 : isTablet ? 300 : 350 }} className={isMobile ? '-mx-2 sm:-mx-4' : ''}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.performanceData}
                    margin={{
                      top: 5,
                      right: isMobile ? 10 : 20,
                      bottom: isMobile ? 60 : 40,
                      left: isMobile ? 5 : 0
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="domain"
                      tick={{ fontSize: isMobile ? 10 : 12 }}
                      angle={isMobile ? -45 : -30}
                      textAnchor="end"
                      height={isMobile ? 80 : 60}
                      interval={0}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: isMobile ? 12 : 14 }}
                      width={40}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip content={ChartTooltip} />
                    <Bar
                      dataKey="mastery"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                      name="Mastery Level"
                      aria-label="Module mastery level"
                      onClick={handleBarClick}
                      cursor="pointer"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Study Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <StatisticCard
                  title="Total Study Time"
                  value={`${data.totalStudyTime} hours`}
                  trend={5}
                />
                <StatisticCard
                  title="Questions Attempted"
                  value={data.questionsAttempted}
                  trend={-2}
                />
                <StatisticCard
                  title="Average Score"
                  value={`${data.averageScore}%`}
                  trend={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {selectedDomain && (
          <DomainBreakdown
            domain={selectedDomain.domain}
            mastery={selectedDomain.mastery}
            onClose={() => setSelectedDomain(null)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

ErrorFallback.displayName = "ErrorFallback";
DomainBreakdown.displayName = "DomainBreakdown";

export default memo(AnalyticsContent);