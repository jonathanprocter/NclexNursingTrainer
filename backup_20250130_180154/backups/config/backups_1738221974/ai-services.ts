import type { AIAnalysisResult, SimulationFeedback, SimulationScenario } from './types';

export async function getPathophysiologyHelp(
  section: string,
  context?: string
): Promise<{ content: string }> {
  try {
    const response = await fetch('/api/ai/pathophysiology-help', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section, context })
    });

    if (!response.ok) {
      throw new Error('Failed to get AI assistance');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting pathophysiology help:', error);
    throw new Error('Failed to get AI assistance');
  }
}

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
    const response = await fetch('/api/ai/analyze-performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers })
    });

    if (!response.ok) {
      throw new Error('Failed to analyze performance');
    }

    return await response.json();
  } catch (error) {
    console.error('Error analyzing performance:', error);
    throw new Error('Failed to analyze performance');
  }
}

export interface SimulationFeedback {
  strengths: string[];
  areas_for_improvement: string[];
  recommendations: string[];
  clinical_reasoning_score: number;
}

export interface SimulationScenario {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  objectives: string[];
  initial_state: {
    patient_condition: string;
    vital_signs: {
      blood_pressure: string;
      heart_rate: number;
      respiratory_rate: number;
      temperature: number;
      oxygen_saturation: number;
    };
    symptoms: string[];
    medical_history: string;
  };
  expected_actions: {
    priority: number;
    action: string;
    rationale: string;
  }[];
  duration_minutes: number;
}

export async function generateSimulationScenario(
  difficulty: string,
  focus_areas?: string[]
): Promise<SimulationScenario> {
  try {
    const response = await fetch('/api/ai/simulation-scenario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ difficulty, focus_areas })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server response:', errorText);
      throw new Error(`Failed to generate simulation scenario: ${response.status}`);
    }

    const data = await response.json();
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format');
    }

    return data;
  } catch (error) {
    console.error('Error generating simulation scenario:', error);
    throw error instanceof Error ? error : new Error('Failed to generate simulation scenario');
  }
}

export async function getSimulationFeedback(
  scenario: SimulationScenario,
  userActions: {
    action: string;
    timestamp: string;
    outcome?: string;
  }[]
): Promise<SimulationFeedback> {
  try {
    const response = await fetch('/api/ai/simulation-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario, userActions })
    });

    if (!response.ok) {
      throw new Error('Failed to get simulation feedback');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting simulation feedback:', error);
    throw new Error('Failed to get simulation feedback');
  }
}

export interface QuestionGenerationParams {
  topics: string[];
  difficulty: number;
  previousPerformance: {
    topic: string;
    successRate: number;
  }[];
}

export async function generateAdaptiveQuestions(params: QuestionGenerationParams) {
  try {
    const response = await fetch('/api/ai/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error('Failed to generate questions');
    }

    return await response.json();
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
    const response = await fetch('/api/ai/study-recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ performanceData })
    });

    if (!response.ok) {
      throw new Error('Failed to generate study recommendations');
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating study recommendations:', error);
    throw new Error('Failed to generate study recommendations');
  }
}

export interface AIAnalysisResult {
  strengths: string[];
  weaknesses: string[];
  recommendedTopics: string[];
  confidence: number;
}
import { AnalyticsData } from '@/types/analytics';

export async function fetchAnalytics(userId: string): Promise<AnalyticsData> {
  const response = await fetch(`/api/analytics/user/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Failed to fetch analytics data');
  }

  return response.json();
}

export async function updateUserProgress(userId: string, progressData: any): Promise<void> {
  const response = await fetch(`/api/analytics/progress/${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(progressData),
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Failed to update progress');
  }
}
