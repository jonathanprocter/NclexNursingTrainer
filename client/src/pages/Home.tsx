
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to NCLEX Prep</h1>
        <p className="text-lg text-muted-foreground">Your path to success starts here</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Practice Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Test your knowledge with our extensive question bank.</p>
            <Link href="/practice/quizzes">
              <Button className="w-full">Start Practice</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Study Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Access comprehensive learning materials.</p>
            <Link href="/modules/pharmacology">
              <Button className="w-full">View Modules</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Companion</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Get personalized study assistance.</p>
            <Link href="/tools/ai-companion">
              <Button className="w-full">Open AI Companion</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
