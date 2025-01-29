Here's the fixed version of the code:

```typescript
import { z } from 'zod';
import { OpenAIApi, Configuration } from "openai";
import { studyPathService } from "./study-path.service";
import { analyticsService } from "./analytics.service";
import { db } from "@db";
import { eq, desc } from "drizzle-orm";

export const voiceCommandSchema = z.object({
  command: z.string().min(1),
  studentId: z.string(),
  context: z.object({
    type: z.string(),
    topic: z.string().optional(),
    focusAreas: z.array(z.string()),
    emotionalState: z.enum(['stressed', 'confident', 'neutral']).optional(),
    tutorPersonality: z.enum(['encouraging', 'analytical', 'socratic', 'practical']).optional()
  })
});

export type VoiceResponse = {
  text: string;
  suggestions?: string[];
  confidence: number;
  emotionalSupport?: boolean;
  nextTopic?: string;
};

export class VoiceAssistantService {
  private readonly openai: OpenAIApi;

  constructor() {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      throw new Error('OpenAI API key is required');
    }
    const configuration = new Configuration({ apiKey: openaiApiKey });
    this.openai = new OpenAIApi(configuration);
  }

  async processCommand(input: z.infer<typeof voiceCommandSchema>): Promise<VoiceResponse> {
    try {
      const validatedInput = voiceCommandSchema.parse(input);

      const emotionalState = this.detectEmotionalState(validatedInput.command);
      if (emotionalState) {
        return this.generateEmotionalResponse(emotionalState);
      }

      if (validatedInput.context.tutorPersonality) {
        return await this.getPersonalizedResponse(validatedInput.command, validatedInput.context);
      }

      return await this.handleDefaultCommand(validatedInput);
    } catch (error) {
      console.error('Error processing voice command:', error);
      throw error;
    }
  }

  private detectEmotionalState(command: string): 'stressed' | 'confident' | 'neutral' | null {
    const stressKeywords = ['stressed', 'nervous', 'worried', 'anxiety', 'overwhelmed'];
    const confidenceKeywords = ['confident', 'ready', 'understand', 'got this'];

    if (stressKeywords.some(k => command.toLowerCase().includes(k))) return 'stressed';
    if (confidenceKeywords.some(k => command.toLowerCase().includes(k))) return 'confident';
    return null;
  }

  private generateEmotionalResponse(state: 'stressed' | 'confident' | 'neutral'): VoiceResponse {
    const responses: Record<typeof state, Omit<VoiceResponse, 'confidence' | 'emotionalSupport'>> = {
      stressed: {
        text: "I understand you're feeling stressed. Let's take a moment to breathe and break this down into manageable steps.",
        suggestions: ['Take a short break', 'Review fundamentals', 'Try an easier practice set']
      },
      confident: {
        text: "That's great that you're feeling confident! Let's maintain this momentum with some challenging exercises.",
        suggestions: ['Try advanced questions', 'Teach concepts to others', 'Take a mock exam']
      },
      neutral: {
        text: "Let's work on building your confidence through structured practice.",
        suggestions: ['Start with review', 'Practice key concepts', 'Track your progress']
      }
    };

    return {
      ...responses[state],
      confidence: 0.95,
      emotionalSupport: true
    };
  }

  private async getPersonalizedResponse(command: string, context: z.infer<typeof voiceCommandSchema>['context']): Promise<VoiceResponse> {
    try {
      const completion = await this.openai.createChatCompletion({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a ${context.tutorPersonality} tutor.${context.emotionalState ? ` Student is feeling ${context.emotionalState}.` : ''}`
          },
          { role: "user", content: command }
        ]
      });

      return {
        text: completion.data.choices[0]?.message?.content || "Could not generate response",
        confidence: 0.95
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
        throw new Error('Invalid student ID');
      }

      const studyPath = await studyPathService.generateStudyPath(studentId, {
        targetScore: 80,
        availableTime: 120,
        focusAreas: input.context.focusAreas
      });

      const nextTopic = studyPath.modules[0]?.name || 'fundamentals';

      return {
        text: `Let's focus on ${input.context.topic || 'NCLEX preparation'}. Based on your progress, we'll study ${nextTopic}.`,
        suggestions: studyPath.modules.slice(0, 3).map(m => m.name),
        nextTopic,
        confidence: 0.9
      };
    } catch (error) {
      console.error('Error handling default command:', error);
      throw error;
    }
  }
}

export const voiceAssistantService = new VoiceAssistantService();
```