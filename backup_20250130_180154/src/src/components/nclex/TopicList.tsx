import { Card, CardContent } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Check, ArrowRight } from "lucide-react";
import { Link } from "wouter";

const topics = [
  { id: 1, name: "Safe and Effective Care Environment", progress: 80 },
  { id: 2, name: "Health Promotion and Maintenance", progress: 65 },
  { id: 3, name: "Psychosocial Integrity", progress: 45 },
  { id: 4, name: "Physiological Integrity", progress: 30 },
];

export default function TopicList() {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {topics.map((topic) => (
        <Link key={topic.id} href={`/study-guide#${topic.id}`}>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="font-medium">{topic.name}</h3>
                  <div className="flex items-center space-x-2">
                    <Progress value={topic.progress} className="w-32 h-2" />
                    <span className="text-sm text-muted-foreground">
                      {topic.progress}%
                    </span>
                  </div>
                </div>
                {topic.progress === 100 ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
