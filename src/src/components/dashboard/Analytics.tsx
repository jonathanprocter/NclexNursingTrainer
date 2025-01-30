import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useBreakpoint } from "../../hooks/use-mobile";
import { fetchAnalytics } from "../../lib/ai-services";
import { useQuery } from "@tanstack/react-query";
import type { AnalyticsData } from "../../types/analytics";
import { useToast } from "../../hooks/use-toast";
import { ErrorBoundary } from "react-error-boundary";
import { memo, useState, useCallback } from "react";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon, TrendingDown, TrendingUp, X } from "lucide-react";
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

const DEFAULT_ANALYTICS: AnalyticsData = {
  performanceData: [
    { domain: "Clinical Judgment", mastery: 75 },
    { domain: "Patient Safety", mastery: 80 },
    { domain: "Care Management", mastery: 65 },
    { domain: "Health Promotion", mastery: 70 }
  ],
  totalStudyTime: "0",
  questionsAttempted: 0,
  averageScore: 0
};

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface AnalyticsProps {
  data?: AnalyticsData;
}

const ErrorFallback = memo(({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="p-4 bg-destructive/10 rounded-md">
    <h2 className="text-lg font-semibold mb-2">Something went wrong:</h2>
    <p className="text-sm text-destructive mb-4">{error.message}</p>
    <button
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
    >
      Try again
    </button>
  </div>
));

const LoadingSkeleton = memo(() => (
  <div className="grid gap-4 sm:gap-6 md:grid-cols-2 animate-pulse">
    <Card>
      <CardHeader>
        <div className="h-6 bg-muted rounded w-1/3"></div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] bg-muted rounded"></div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <div className="h-6 bg-muted rounded w-1/3"></div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted rounded"></div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
));

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

const CustomTooltip = ({ active, payload, label }: any) => {
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
};

interface DomainBreakdownProps {
  domain: string;
  mastery: number;
  onClose: () => void;
}

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

function AnalyticsContent({ data: propsData }: AnalyticsProps) {
  const { isMobile, isTablet } = useBreakpoint();
  const { toast } = useToast();
  const [date, setDate] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [selectedDomain, setSelectedDomain] = useState<{ domain: string; mastery: number } | null>(null);

  const { data: fetchedData, isLoading, error } = useQuery<AnalyticsData, Error>({
    queryKey: ['analytics', 'user', '1', date.from?.toISOString(), date.to?.toISOString()],
    queryFn: () => fetchAnalytics('1', date.from, date.to),
    retry: (failureCount: number, err: Error) => {
      if (err.message.includes('status: 4')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 10000),
    staleTime: 30000,
    gcTime: 300000
  });

  const analyticsData = propsData || fetchedData || DEFAULT_ANALYTICS;

  const handleExport = useCallback(() => {
    const exportData = {
      ...analyticsData,
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
  }, [analyticsData, date, toast]);

  const handleBarClick = useCallback((data: any) => {
    setSelectedDomain({
      domain: data.payload.domain,
      mastery: data.payload.mastery
    });
  }, []);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error && !propsData) {
    toast({
      title: "Error loading analytics",
      description: error.message,
      variant: "destructive",
    });

    return (
      <div className="p-4 bg-destructive/10 rounded-md">
        <h2 className="text-lg font-semibold mb-2">Error loading analytics</h2>
        <p className="text-sm text-destructive mb-4">{error.message}</p>
      </div>
    );
  }

  // Sample trend data - in a real app, this would come from the API
  const trends = {
    studyTime: 5,
    questions: -2,
    score: 3
  };

  return (
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
                selected={{ from: date.from, to: date.to }}
                onSelect={(range) => setDate(range || { from: undefined, to: undefined })}
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
                  data={analyticsData.performanceData}
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
                  <Tooltip content={<CustomTooltip />} />
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
                value={`${analyticsData.totalStudyTime} hours`}
                trend={trends.studyTime}
              />
              <StatisticCard 
                title="Questions Attempted" 
                value={analyticsData.questionsAttempted}
                trend={trends.questions}
              />
              <StatisticCard 
                title="Average Score" 
                value={`${analyticsData.averageScore}%`}
                trend={trends.score}
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
  );
}

const Analytics = memo((props: AnalyticsProps) => (
  <ErrorBoundary
    FallbackComponent={ErrorFallback}
    onReset={() => {
      window.location.reload();
    }}
  >
    <AnalyticsContent {...props} />
  </ErrorBoundary>
));

export default Analytics;