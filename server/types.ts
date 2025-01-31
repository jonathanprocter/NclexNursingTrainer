import { z } from 'zod';
import type { User, Module, Question, QuizAttempt, UserProgress } from './db/schema.js';

// Base question interface
export interface PracticeQuestion {
  id: string;
  text: string;
  options: Array<{ id: string; text: string }>;
  correctAnswer: string;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
}

// Request/Response types for study guide endpoints
export interface StudyGuideRequest {
  userId: number;
  focusAreas?: string[];
  timeAvailable?: number;
}

export interface StudyGuideTopic {
  id: string;
  name: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  estimatedTime: number;
  description: string;
  learningTips: string[];
}

export interface StudyGuideResponse {
  id: string;
  createdAt: string;
  topics: StudyGuideTopic[];
  weakAreas: Array<{
    moduleId: string;
    score: string;
  }>;
  strengthAreas: Array<{
    moduleId: string;
    score: string;
  }>;
  recommendedResources: Array<{
    id: string;
    type: string;
    title: string;
    url: string;
    difficulty: string;
    estimatedTime: string;
    learningOutcome: string;
  }>;
  progress: number;
  nextSteps: string[];
}

// Analytics types
export interface PerformanceData {
  topic: string;
  score: number;
  timeSpent: number;
}

export interface AnalyticsResponse {
  success: boolean;
  data: {
    attempts: QuizAttempt[];
    progress: UserProgress[];
    analysis: {
      strengths: string[];
      weaknesses: string[];
      confidence: number;
      recommendedTopics: string[];
    };
    summary: {
      totalAttempts: number;
      averageScore: number;
      strengths: string[];
      weaknesses: string[];
      confidence: number;
    };
  };
}

// Quiz attempt types
export interface QuestionOption {
  id: string;
  text: string;
}

export interface QuizSubmissionRequest {
  userId: number;
  moduleId: number;
  answers: Array<{
    questionId: string;
    selectedAnswer: string;
    correct: boolean;
  }>;
}

// Zod validation schemas
export const studyGuideRequestSchema = z.object({
  userId: z.number().int().positive(),
  focusAreas: z.array(z.string()).optional(),
  timeAvailable: z.number().positive().optional()
});

export const quizSubmissionSchema = z.object({
  userId: z.number().int().positive(),
  moduleId: z.number().int().positive(),
  answers: z.array(z.object({
    questionId: z.string(),
    selectedAnswer: z.string(),
    correct: z.boolean()
  }))
});

export const userIdParamSchema = z.object({
  userId: z.string().regex(/^\d+$/).transform(Number)
});