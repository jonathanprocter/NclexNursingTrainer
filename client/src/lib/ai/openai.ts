import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: import.meta.env.VITE_OPENAI_API_KEY });

export interface QuestionGeneration {
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  subtopics: string[];
  previousPerformance: number;
}

export interface StudyPlanGeneration {
  weakAreas: string[];
  strongAreas: string[];
  availableTime: number;
  learningStyle: string;
}

export async function generateAdaptiveQuestions(params: QuestionGeneration) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert NCLEX question generator. Create challenging, relevant questions based on the provided parameters."
        },
        {
          role: "user",
          content: `Generate an NCLEX-style question with the following parameters:
            - Difficulty: ${params.difficulty}
            - Topic: ${params.topic}
            - Subtopics: ${params.subtopics.join(', ')}
            - Adjust based on previous performance: ${params.previousPerformance}

            Return in JSON format with the following structure:
            {
              "question": "string",
              "options": [{"id": "string", "text": "string"}],
              "correctAnswer": "string",
              "explanation": "string",
              "rationale": "string",
              "difficulty": "string",
              "topics": ["string"]
            }`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content in response");
    return JSON.parse(content);
  } catch (error) {
    console.error('Error generating question:', error);
    throw new Error('Failed to generate adaptive question');
  }
}

export async function generatePersonalizedStudyPlan(params: StudyPlanGeneration) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert NCLEX study planner. Create personalized study plans based on student performance and preferences."
        },
        {
          role: "user",
          content: `Generate a personalized study plan with the following parameters:
            - Weak Areas: ${params.weakAreas.join(', ')}
            - Strong Areas: ${params.strongAreas.join(', ')}
            - Available Time: ${params.availableTime} minutes
            - Learning Style: ${params.learningStyle}

            Return in JSON format with the following structure:
            {
              "schedule": [{
                "duration": "number",
                "topic": "string",
                "activity": "string",
                "resources": ["string"]
              }],
              "recommendations": ["string"],
              "focus_areas": ["string"]
            }`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content in response");
    return JSON.parse(content);
  } catch (error) {
    console.error('Error generating study plan:', error);
    throw new Error('Failed to generate personalized study plan');
  }
}

export async function analyzePerformance(answers: Array<{
  questionId: string;
  userAnswer: string;
  correctAnswer: string;
  topic: string;
  difficulty: string;
  timeSpent: number;
}>) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert in analyzing NCLEX exam performance. Provide detailed insights and recommendations."
        },
        {
          role: "user",
          content: `Analyze the following exam performance data:
            ${JSON.stringify(answers)}

            Return in JSON format with the following structure:
            {
              "strengthAreas": ["string"],
              "weakAreas": ["string"],
              "recommendations": ["string"],
              "timeManagement": {
                "average": "number",
                "recommendations": ["string"]
              },
              "difficultyAnalysis": {
                "easy": "number",
                "medium": "number",
                "hard": "number"
              }
            }`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content in response");
    return JSON.parse(content);
  } catch (error) {
    console.error('Error analyzing performance:', error);
    throw new Error('Failed to analyze performance');
  }
}