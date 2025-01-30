import OpenAI from "openai";
import Anthropic from '@anthropic-ai/sdk';
import { rateLimit } from '../utils/rate-limit.js';

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY must be set in environment variables");
}

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY must be set in environment variables");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Apply more restrictive rate limits for AI endpoints
const aiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 20 // 20 requests per minute for AI endpoints
});

export { aiRateLimit };

export async function generateClinicalJudgment(topic: string, context?: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert nursing educator specializing in clinical judgment and critical thinking.
          Focus on the NCSBN Clinical Judgment Measurement Model (NCJMM) and its application in nursing practice.
          Provide detailed, practical guidance that helps nurses develop their clinical reasoning skills.`
        },
        {
          role: "user",
          content: `Analyze and provide guidance on ${topic}${context ? `. Context: ${context}` : ''}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    if (!completion.choices[0]?.message?.content) {
      throw new Error("No content generated from OpenAI");
    }

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error in clinical judgment generation:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to generate clinical judgment");
  }
}

export async function generateStudyMaterials(topic: string, difficulty: string = "medium") {
  try {
    const message = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 1500,
      system: "You are an expert nursing educator creating comprehensive study materials for NCLEX preparation. Focus on clear explanations, clinical correlations, and practical applications.",
      messages: [{
        role: "user",
        content: `Generate detailed study materials for ${topic} at ${difficulty} difficulty level. Include key concepts, clinical applications, and practice points.`
      }]
    });

    if (!message.content) {
      throw new Error("No content generated from Anthropic");
    }

    return message.content;
  } catch (error) {
    console.error("Error generating study materials:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to generate study materials");
  }
}

export async function analyzeUserResponse(response: string, questionContext: string) {
  try {
    const message = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 1000,
      system: "You are an expert nursing educator analyzing student responses to NCLEX-style questions. Provide detailed feedback on clinical reasoning and suggest areas for improvement.",
      messages: [{
        role: "user",
        content: `Analyze this student response: "${response}" for the question context: "${questionContext}". Provide detailed feedback on clinical reasoning and suggest improvements.`
      }]
    });

    if (!message.content) {
      throw new Error("No content generated from Anthropic");
    }

    return message.content;
  } catch (error) {
    console.error("Error analyzing user response:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to analyze user response");
  }
}

export async function generateQuestionSet(topic: string, difficulty: string = "medium", count: number = 5) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Generate ${count} NCLEX-style questions about ${topic} at ${difficulty} difficulty level. Include detailed explanations and rationales.`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    if (!completion.choices[0]?.message?.content) {
      throw new Error("No content generated from OpenAI");
    }

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error generating questions:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to generate questions");
  }
}