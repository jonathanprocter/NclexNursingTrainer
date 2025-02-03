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
    'Management of Care',
    'Emergency Care & Crisis Management',
    'Cultural Competence & Ethics',
    'Evidence-Based Practice',
    'Quality Improvement',
    'Leadership & Delegation',
    'Technology in Healthcare'
  ];

  private readonly questionTypes = [
    'multiple-choice',
    'multiple-response',
    'hot-spot',
    'drag-and-drop',
    'ordered-response',
    'fill-in-blank',
    'chart-exhibit',
    'case-study',
    'audio-item',
    'graphic-item'
  ];

  private readonly difficultyLevels = {
    entry: { range: [1, 3], weight: 0.3 },
    intermediate: { range: [4, 6], weight: 0.4 },
    advanced: { range: [7, 8], weight: 0.3 }
  };

  private readonly biancaPreferences = {
    questionTypes: ['visual', 'case-based', 'calculation'],
    difficultyAdjustment: 0.8,
    topicWeights: {
      'Clinical Judgment': 1.5,
      'Pharmacology': 1.3,
      'Patient Safety': 1.2
    }
  };

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async generateQuestions(
    examType: string,
    currentPerformance: number,
    previousQuestions: string[] = [],
    previousMistakes: string[] = []
  ): Promise<Array<{
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    domain: string;
    difficulty: number;
    itemType: string;
  }>> {
    try {
      const domainDistribution = this.calculateDomainDistribution(currentPerformance);
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `Generate Next Gen NCLEX 2024 questions with the following parameters:
            - Follow clinical judgment measurement model
            - Layer 1: Recognize Cues (20%)
            - Layer 2: Analyze Cues (20%)
            - Layer 3: Prioritize Hypotheses (20%)
            - Layer 4: Generate Solutions (20%)
            - Layer 5: Take Actions (10%)
            - Layer 6: Evaluate Outcomes (10%)
            Domain distribution: ${JSON.stringify(domainDistribution)}
            - Exam type: ${examType.toUpperCase()}
            - Current performance level: ${currentPerformance}
            - Include varied item types: ${this.biancaPreferences.questionTypes.join(', ')}
            - Ensure coverage across domains: ${this.nclexDomains.join(', ')}
            - Focus on clinical judgment and decision-making
            - Avoid previously used questions: ${previousQuestions.join(', ')}
            - Address previous weak areas: ${previousMistakes.join(', ')}
            - Include case studies and scenario-based questions
            - Adjust difficulty based on performance with a modifier of ${this.biancaPreferences.difficultyAdjustment}
            - Apply topic weights: ${JSON.stringify(this.biancaPreferences.topicWeights)}
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


  private calculateDomainDistribution(performance: number): Record<string, number> {
    const distribution: Record<string, number> = {};
    const baseWeight = 1 / this.nclexDomains.length;

    this.nclexDomains.forEach(domain => {
      // Adjust weights based on performance and Bianca's preferences
      let weight = baseWeight;
      if (performance < 0.7) {
        // Give more weight to foundational domains
        weight *= domain.includes('Basic') || domain.includes('Safety') ? 1.5 : 0.8;
      } else {
        // Give more weight to advanced domains
        weight *= domain.includes('Clinical') || domain.includes('Management') ? 1.3 : 0.9;
      }
      //Apply Bianca's topic weights if available
      weight *= this.biancaPreferences.topicWeights[domain] || 1;
      distribution[domain] = weight;
    });

    // Normalize weights
    const total = Object.values(distribution).reduce((a, b) => a + b, 0);
    Object.keys(distribution).forEach(key => {
      distribution[key] = distribution[key] / total;
    });

    return distribution;
  }
}

export const quizGeneratorService = new QuizGeneratorService();