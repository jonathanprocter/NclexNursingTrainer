import { z } from "zod";

export interface Option {
  id: string;
  text: string;
}

export interface ConceptualBreakdown {
  key_concepts: string[];
  related_topics: string[];
  clinical_relevance: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Question {
  id: string;
  text: string;
  options: Option[];
  correctAnswer: string;
  explanation: string;
  category: string;
  difficulty: string;
  tags: string[];
  conceptualBreakdown?: ConceptualBreakdown;
  faqs?: FAQ[];
}

// Zod schema for runtime validation
export const questionSchema = z.object({
  id: z.string(),
  text: z.string(),
  options: z.array(z.object({
    id: z.string(),
    text: z.string()
  })),
  correctAnswer: z.string(),
  explanation: z.string(),
  category: z.string(),
  difficulty: z.string(),
  tags: z.array(z.string()),
  conceptualBreakdown: z.object({
    key_concepts: z.array(z.string()),
    related_topics: z.array(z.string()),
    clinical_relevance: z.string()
  }).optional(),
  faqs: z.array(z.object({
    question: z.string(),
    answer: z.string()
  })).optional()
});

export type QuestionInput = z.infer<typeof questionSchema>;
