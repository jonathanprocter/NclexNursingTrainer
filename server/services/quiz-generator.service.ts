import OpenAI from "openai";
import { z } from "zod";

export class QuizGeneratorService {
  private readonly openai: OpenAI;
  private readonly nclexDomains = [
    'Management of Care (20%)',
    'Safety and Infection Control (15%)',
    'Health Promotion and Maintenance (15%)',
    'Psychosocial Integrity (15%)',
    'Basic Care and Comfort (12%)',
    'Pharmacological and Parenteral Therapies (12%)',
    'Reduction of Risk Potential (6%)',
    'Physiological Adaptation (5%)'
  ];

  private readonly clinicalJudgmentLayers = [
    'Recognize Cues (20%)',
    'Analyze Cues (20%)',
    'Prioritize Hypotheses (20%)',
    'Generate Solutions (20%)',
    'Take Actions (10%)',
    'Evaluate Outcomes (10%)'
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

  const NCLEX_2024_DOMAINS = [
  "Basic Care and Comfort",
  "Pharmacological and Parenteral Therapies", 
  "Reduction of Risk Potential",
  "Physiological Adaptation",
  "Psychosocial Integrity",
  "Safe and Effective Care Environment"
];

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
    clinicalJudgmentLayer: string;
    difficulty: number;
    itemType: string;
    nextGenFormat: boolean;
  }>> {
    try {
      const domainDistribution = this.calculateDomainDistribution(currentPerformance);
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `Generate Next Gen NCLEX 2024 questions following:
            - Clinical judgment measurement model
            - ${this.clinicalJudgmentLayers.join('\n- ')}
            - Domain distribution: ${JSON.stringify(domainDistribution)}
            - Question types: multiple-choice, multiple-response, hot-spot, drag-and-drop, ordered-response
            - Include clinical scenarios, lab values, and medication calculations
            - Ensure coverage of all 2024 NCLEX domains`
          },
          {
            role: "user",
            content: `Generate a unique ${examType} question avoiding IDs: ${previousQuestions.join(', ')}`
          }
        ],
        temperature: 0.8
      });
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