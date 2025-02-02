
import OpenAI from "openai";
import { z } from "zod";

export class QuizGeneratorService {
  private readonly openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async generateQuiz(topic: string, difficulty: number, previousMistakes: string[]): Promise<{
    questions: Array<{
      question: string;
      options: string[];
      correctAnswer: string;
      explanation: string;
    }>;
  }> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `Generate NCLEX-style questions focusing on ${topic} at difficulty level ${difficulty}. 
                     Focus on previously challenging concepts: ${previousMistakes.join(', ')}`
          }
        ]
      });

      return JSON.parse(completion.choices[0]?.message?.content || '{"questions": []}');
    } catch (error) {
      console.error('Error generating quiz:', error);
      throw error;
    }
  }
}

export const quizGeneratorService = new QuizGeneratorService();
