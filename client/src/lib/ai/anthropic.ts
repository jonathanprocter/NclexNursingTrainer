import Anthropic from '@anthropic-ai/sdk';

// the newest Anthropic model is "claude-3-5-sonnet-20241022" which was released October 22, 2024. do not change this unless explicitly requested by the user
const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
});

export interface ExplanationRequest {
  topic: string;
  concept: string;
  difficulty: string;
  learningStyle: string;
}

export interface FeedbackAnalysis {
  answers: Array<{
    question: string;
    userAnswer: string;
    correctAnswer: string;
    explanation: string;
  }>;
  previousPerformance?: {
    strongAreas: string[];
    weakAreas: string[];
  };
}

export async function generateDetailedExplanation(params: ExplanationRequest) {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Generate a detailed explanation for the following nursing concept:
          Topic: ${params.topic}
          Concept: ${params.concept}
          Difficulty Level: ${params.difficulty}
          Learning Style: ${params.learningStyle}

          Provide the explanation in a format that best suits the specified learning style.
          Include clinical examples and memory aids where appropriate.`
      }]
    });

    const contentBlock = response.content[0];
    if ('text' in contentBlock) {
      return contentBlock.text;
    }
    throw new Error("Unexpected response format");
  } catch (error) {
    console.error('Error generating explanation:', error);
    throw new Error('Failed to generate detailed explanation');
  }
}

export async function analyzeLearningPatterns(feedbackData: FeedbackAnalysis) {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Analyze the following learning patterns and provide detailed feedback:
          ${JSON.stringify(feedbackData)}

          Consider:
          1. Common misconceptions
          2. Learning style patterns
          3. Knowledge gaps
          4. Improvement areas

          Provide structured recommendations for improvement.`
      }]
    });

    const contentBlock = response.content[0];
    if ('text' in contentBlock) {
      return contentBlock.text;
    }
    throw new Error("Unexpected response format");
  } catch (error) {
    console.error('Error analyzing learning patterns:', error);
    throw new Error('Failed to analyze learning patterns');
  }
}

export async function generateClinicalScenarios(topics: string[], difficulty: string) {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: `Generate a realistic clinical scenario incorporating the following topics:
          ${topics.join(', ')}
          Difficulty: ${difficulty}

          Include:
          1. Patient presentation
          2. Vital signs
          3. Lab results
          4. Relevant history
          5. Key decision points
          6. Expected nursing interventions

          Make it challenging but realistic for NCLEX preparation.`
      }]
    });

    const contentBlock = response.content[0];
    if ('text' in contentBlock) {
      return contentBlock.text;
    }
    throw new Error("Unexpected response format");
  } catch (error) {
    console.error('Error generating clinical scenarios:', error);
    throw new Error('Failed to generate clinical scenarios');
  }
}