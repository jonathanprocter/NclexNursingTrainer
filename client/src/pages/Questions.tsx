import { useQuery } from "@tanstack/react-query"
import QuestionCard from "../components/QuestionCard"
import { ScrollArea } from "../components/ui/scroll-area"
import { Button } from "../components/ui/button"
import { RefreshCw } from "lucide-react"

interface Question {
  id: string
  type: string
  content: string
  options: string[]
  correctAnswer: string
  explanation: string
}

const fetchQuestions = async (): Promise<Question[]> => {
  const response = await fetch("/api/questions")
  if (!response.ok) {
    throw new Error("Failed to fetch questions")
  }
  const data = await response.json()
  console.log("Fetched questions:", data)
  // Ensure data is an array of questions. Adjust if your API returns a different shape.
  return data
}

export default function Questions() {
  const {
    data: questions = [], // fallback to empty array if undefined
    isError,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["questions"],
    queryFn: fetchQuestions,
    retry: 1,
  })

  // If there's an error from the request
  if (isError) {
    return <div>Error loading questions</div>
  }

  // If request is still in loading state
  if (isLoading) {
    return <div>Loading questions...</div>
  }

  // Safely check if questions is indeed an array
  if (!Array.isArray(questions)) {
    return <div>No valid questions found.</div>
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Practice Questions</h1>
        <Button onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Questions
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="space-y-6">
          {questions.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
