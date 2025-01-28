import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CourseProgress from "@/components/nclex/CourseProgress";
import TopicList from "@/components/nclex/TopicList";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="space-y-6">
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to NCLEX Prep</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Your comprehensive study guide for passing the National Council Licensure Examination. Track your progress, practice with questions, and master key nursing concepts.
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <CourseProgress />
            <div className="mt-4 flex justify-end">
              <Link href="/study-guide">
                <Button>Continue Learning</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Practice Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              Test your knowledge with our extensive question bank covering all NCLEX topics.
            </p>
            <Link href="/questions">
              <Button className="w-full">Start Practice</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <section className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Study Topics</h2>
        <TopicList />
      </section>
    </div>
  );
}
