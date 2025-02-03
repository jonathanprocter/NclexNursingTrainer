
import OpenAI from "openai";
import { z } from "zod";

export class QuizGeneratorService {
  private readonly openai: OpenAI;
  private readonly nclexDomains = [
    'Clinical Judgment & Decision Making',
    'Safety & Infection Control',
    'Physiological Adaptation',
    'Health Promotion & Disease Prevention',
    'Psychosocial Integrity',
    'Basic Care & Comfort',
    'Pharmacological & Parenteral Therapies',
    'Risk Reduction',
    'Management of Care'
  ];

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async generateQuiz(
    examType: 'cat' | 'standard',
    currentPerformance: number,
    previousQuestions: string[] = [],
    previousMistakes: string[] = []
  ): Promise<{
    questions: Array<{
      id: string;
      question: string;
      options: string[];
      correctAnswer: string;
      explanation: string;
      domain: string;
      difficulty: number;
      itemType: string;
    }>;
  }> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `Generate Next Gen NCLEX 2024 questions with the following parameters:
            - Exam type: ${examType.toUpperCase()}
            - Current performance level: ${currentPerformance}
            - Include varied item types: multiple choice, multiple response, hot spots, drag and drop, cloze, etc.
            - Ensure coverage across domains: ${this.nclexDomains.join(', ')}
            - Focus on clinical judgment and decision-making
            - Avoid previously used questions: ${previousQuestions.join(', ')}
            - Address previous weak areas: ${previousMistakes.join(', ')}
            - Include case studies and scenario-based questions
            - Ensure proper difficulty progression based on performance
            `
          }
        ],
        temperature: 0.8,
        max_tokens: 2000
      });

      return JSON.parse(completion.choices[0]?.message?.content || '{"questions": []}');
    } catch (error) {
      console.error('Error generating quiz:', error);
      throw error;
    }
  }
}

export const quizGeneratorService = new QuizGeneratorService();
