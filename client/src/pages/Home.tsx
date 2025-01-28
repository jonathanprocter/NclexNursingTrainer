import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Practice Questions 📝</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-muted-foreground">
            Test your knowledge with our extensive question bank covering all NCLEX topics.
            Keep pushing forward! 🎯
          </p>
          <Link href="/questions">
            <Button className="w-full">Start Practice ✨</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}