import { Progress } from "@/components/ui/progress";

export default function CourseProgress() {
  const progress = 65; // This would come from your actual progress tracking

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm">
        <span>Overall Progress</span>
        <span className="font-medium">{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
      
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-muted p-3 rounded-lg">
          <div className="text-2xl font-bold">245</div>
          <div className="text-sm text-muted-foreground">Questions Completed</div>
        </div>
        <div className="bg-muted p-3 rounded-lg">
          <div className="text-2xl font-bold">12</div>
          <div className="text-sm text-muted-foreground">Topics Mastered</div>
        </div>
      </div>
    </div>
  );
}
