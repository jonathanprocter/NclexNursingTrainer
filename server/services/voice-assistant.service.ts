import { z } from 'zod';
import OpenAI from "openai";
import { db } from "@db";
import { eq } from "drizzle-orm";

// Enhanced schema for voice commands with learning context
export const voiceCommandSchema = z.object({
  command: z.string().min(1),
  studentId: z.string(),
  context: z.object({
    type: z.string(),
    topic: z.string().optional(),
    focusAreas: z.array(z.string()),
    emotionalState: z.enum(['stressed', 'confident', 'neutral']).optional(),
    tutorPersonality: z.enum(['encouraging', 'analytical', 'socratic', 'practical']).optional(),
    learningStyle: z.enum(['visual', 'auditory', 'kinesthetic', 'reading']).optional(),
    difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional()
  })
});

export type VoiceResponse = {
  text: string;
  suggestions?: string[];
  confidence: number;
  emotionalSupport?: boolean;
  nextTopic?: string;
  learningTips?: string[];
  visualAids?: string[];
  practiceQuestions?: Array<{
    question: string;
    options?: string[];
    explanation?: string;
  }>;
};

export class VoiceAssistantService {
  private readonly openai: OpenAI;

  constructor() {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey || openaiApiKey.trim() === '') {
      throw new Error('Valid OpenAI API key is required for personalized learning assistance');
    }
    if (!openaiApiKey.startsWith('sk-')) {
      throw new Error('Invalid OpenAI API key format');
    }
    this.openai = new OpenAI({ 
      apiKey: openaiApiKey,
      maxRetries: 3,
      timeout: 30000
    });
  }

  async processCommand(input: z.infer<typeof voiceCommandSchema>): Promise<VoiceResponse> {
    try {
      const validatedInput = voiceCommandSchema.parse(input);
      const emotionalState = this.detectEmotionalState(validatedInput.command);

      let response: VoiceResponse;

      try {
        if (emotionalState) {
          response = this.generateEmotionalResponse(emotionalState);
        } else if (validatedInput.context.tutorPersonality) {
          response = await this.getPersonalizedResponse(validatedInput.command, validatedInput.context);
        } else {
          response = await this.handleDefaultCommand(validatedInput);
        }

        return {
          text: response.text || "I'm here to help with your NCLEX preparation.",
          confidence: response.confidence || 0.8,
          suggestions: response.suggestions || [],
          emotionalSupport: response.emotionalSupport || false,
          nextTopic: response.nextTopic,
          learningTips: response.learningTips || []
        };
      } catch (error) {
        console.error('Error processing voice command:', error);
        return {
          text: "I apologize, but I'm having trouble processing your request. Could you please try again?",
          confidence: 0.5,
          suggestions: ['Try rephrasing your question', 'Ask about a specific topic', 'Request a practice question'],
          emotionalSupport: true
        };
      }
    } catch (error) {
      console.error('Error validating input:', error);
      throw new Error('Invalid input format');
    }
  }

  private detectEmotionalState(command: string): 'stressed' | 'confident' | 'neutral' | null {
    const stressKeywords = ['stressed', 'nervous', 'worried', 'anxiety', 'overwhelmed', 'confused'];
    const confidenceKeywords = ['confident', 'ready', 'understand', 'got this', 'prepared'];

    if (stressKeywords.some(k => command.toLowerCase().includes(k))) return 'stressed';
    if (confidenceKeywords.some(k => command.toLowerCase().includes(k))) return 'confident';
    return null;
  }

  private generateEmotionalResponse(state: 'stressed' | 'confident' | 'neutral'): VoiceResponse {
    const responses: Record<typeof state, Omit<VoiceResponse, 'confidence' | 'emotionalSupport'>> = {
      stressed: {
        text: "I understand you're feeling stressed. Let's break this down into manageable steps and take it one concept at a time.",
        suggestions: [
          'Take a 5-minute breather',
          'Review basic concepts first',
          'Try some practice questions at an easier level',
          'Focus on understanding rather than memorizing'
        ],
        learningTips: [
          'Break complex topics into smaller parts',
          'Use mind maps for visual organization',
          'Practice with simpler questions first'
        ]
      },
      confident: {
        text: "That's excellent that you're feeling confident! Let's challenge yourself while maintaining this positive momentum.",
        suggestions: [
          'Try some advanced practice questions',
          'Explain concepts to others',
          'Tackle complex case studies',
          'Review edge cases and exceptions'
        ],
        learningTips: [
          'Challenge yourself with timed practice',
          'Create your own test questions',
          'Explore related advanced topics'
        ]
      },
      neutral: {
        text: "Let's work on building your confidence through structured practice and clear understanding.",
        suggestions: [
          'Start with concept review',
          'Practice key principles',
          'Track your progress',
          'Set specific learning goals'
        ],
        learningTips: [
          'Focus on one topic at a time',
          'Use active recall techniques',
          'Create summary notes'
        ]
      }
    };

    return {
      ...responses[state],
      confidence: 0.95,
      emotionalSupport: true
    };
  }

  private async getPersonalizedResponse(
    command: string,
    context: z.infer<typeof voiceCommandSchema>['context']
  ): Promise<VoiceResponse> {
    const learningHistory = await this.getLearningHistory(context.studentId);
    const adaptivePrompt = this.generateAdaptivePrompt(command, learningHistory);
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a ${context.tutorPersonality} NCLEX tutor specializing in nursing education.
            Student Context:
            - Emotional State: ${context.emotionalState || 'neutral'}
            - Learning Style: ${context.learningStyle || 'varied'}
            - Difficulty Level: ${context.difficultyLevel || 'intermediate'}

            Provide detailed, encouraging responses with specific examples and mnemonics when applicable.`
          },
          { role: "user", content: command }
        ]
      });

      const response = completion.choices[0]?.message?.content || "Could not generate response";

      // Structure the response with learning aids
      return {
        text: response,
        confidence: 0.95,
        learningTips: [
          "Use mnemonics for better retention",
          "Practice with similar scenarios",
          "Review related concepts"
        ],
        practiceQuestions: [
          {
            question: "How would you apply this concept in a clinical setting?",
            options: [
              "A) Follow standard procedures",
              "B) Assess patient needs first",
              "C) Consult with senior staff",
              "D) Document the situation"
            ],
            explanation: "Consider the nursing process and prioritize patient safety."
          }
        ]
      };
    } catch (error) {
      console.error('Error getting personalized response:', error);
      throw error;
    }
  }

  private async handleDefaultCommand(input: z.infer<typeof voiceCommandSchema>): Promise<VoiceResponse> {
    try {
      const studentId = parseInt(input.studentId);
      if (isNaN(studentId)) {
        throw new Error('Invalid student ID format');
      }

      // Enhanced voice command processing
      const command = input.command.toLowerCase();
      const voiceContext = input.context;
      
      // Detect command type and intent
      const commandType = this.detectCommandType(command);
      const userIntent = await this.analyzeUserIntent(command, voiceContext);
      
      // Generate context-aware response
      const response = await this.generateContextAwareResponse(command, commandType, userIntent, voiceContext);

      // Add speech synthesis markers for better voice output
      const enhancedResponse = this.addSpeechMarkers(response);

      // Generate a basic response when study path service is not available
      const defaultTopics = ['Fundamentals', 'Pharmacology', 'Medical-Surgical Nursing'];
      const nextTopic = input.context.focusAreas[0] || defaultTopics[0];

      return {
        text: `Let's focus on ${input.context.topic || 'NCLEX preparation'}. Based on your preferences, we'll study ${nextTopic} using an approach that matches your learning style.`,
        suggestions: defaultTopics,
        nextTopic,
        confidence: 0.9,
        learningTips: [
          `Break down ${nextTopic} into smaller concepts`,
          "Use practice questions to reinforce learning",
          "Create summary notes for quick review"
        ]
      };
    } catch (error) {
      console.error('Error handling default command:', error);
      throw error;
    }
  }
}

export const voiceAssistantService = new VoiceAssistantService();