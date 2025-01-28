import OpenAI from "openai";
import { Anthropic } from '@anthropic-ai/sdk';

const openai = new OpenAI();
const anthropic = new Anthropic();

interface AIAnalysisResult {
  strengths: string[];
  weaknesses: string[];
  recommendedTopics: string[];
  confidence: number;
}

// Helper function for module-specific AI assistance
export async function getPharmacologyHelp(
  section: string,
  context?: string
): Promise<{ content: string }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert pharmacology instructor helping nursing students prepare for the NCLEX exam. Provide detailed explanations with clinical examples."
        },
        {
          role: "user",
          content: `Provide a detailed explanation for the ${section} section in pharmacology${context ? `. Context: ${context}` : ''}`
        }
      ]
    });

    return { 
      content: response.choices[0].message.content || 'No explanation available'
    };
  } catch (error) {
    console.error('Error getting pharmacology help:', error);
    throw new Error('Failed to get AI assistance');
  }
}

// Existing functions...
export async function analyzePerformance(
  answers: Array<{
    question: string;
    userAnswer: string;
    correctAnswer: string;
    topic: string;
    timestamp: string;
  }>
): Promise<AIAnalysisResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an NCLEX expert AI analyzing student performance."
        },
        {
          role: "user",
          content: JSON.stringify({ answers })
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Error analyzing performance:', error);
    throw new Error('Failed to analyze performance');
  }
}

interface QuestionGenerationParams {
  topics: string[];
  difficulty: number;
  previousPerformance: {
    topic: string;
    successRate: number;
  }[];
}

export async function generateAdaptiveQuestions(params: QuestionGenerationParams) {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Generate NCLEX-style questions focusing on these topics: ${params.topics.join(', ')}. 
        Adjust difficulty (1-10): ${params.difficulty}
        Previous performance: ${JSON.stringify(params.previousPerformance)}
        Output in JSON format with array of questions, each containing:
        - question text
        - answer choices
        - correct answer
        - explanation
        - topic
        - difficulty rating`
      }]
    });

    return JSON.parse(message.content[0].value);
  } catch (error) {
    console.error('Error generating questions:', error);
    throw new Error('Failed to generate questions');
  }
}

export async function getStudyRecommendations(
  performanceData: {
    topic: string;
    score: number;
    timeSpent: number;
  }[]
) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Generate personalized NCLEX study recommendations based on performance data."
        },
        {
          role: "user",
          content: JSON.stringify({ performanceData })
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Error generating study recommendations:', error);
    throw new Error('Failed to generate study recommendations');
  }
}