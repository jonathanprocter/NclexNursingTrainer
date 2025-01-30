import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { ProgressData } from "@/types/analytics";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

function PracticeHistorySkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-3 w-[150px]" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

export default function PracticeHistory() {
  const { data: practiceHistory, isLoading, error } = useQuery<ProgressData[]>({
    queryKey: ['/api/practice/history'],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Practice History</CardTitle>
        </CardHeader>
        <CardContent>
          <PracticeHistorySkeleton />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-destructive/10">
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Practice History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Failed to load practice history. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  if (!practiceHistory?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Practice History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No practice sessions recorded yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Practice History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {practiceHistory.map((session) => (
            <div
              key={`${session.userId}-${session.moduleId}-${session.completedAt}`}
              className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
            >
              <div className="space-y-1">
                <p className="font-medium">Module {session.moduleId}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(session.completedAt), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
              <Badge variant={session.score >= 70 ? "default" : "secondary"}>
                {session.score}%
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
