
import OpenAI from 'openai';

export class AdaptiveQuestionsService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async generateQuestions(userPerformance: {
    topics: string[];
    strengths: string[];
    weaknesses: string[];
    recentScores: number[];
  }) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Generate adaptive NCLEX-style questions that focus on the user's weak areas while reinforcing strengths"
          },
          {
            role: "user",
            content: JSON.stringify(userPerformance)
          }
        ],
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content;
    } catch (error) {
      console.error('Error generating adaptive questions:', error);
      throw error;
    }
  }
}

export const adaptiveQuestionsService = new AdaptiveQuestionsService();
