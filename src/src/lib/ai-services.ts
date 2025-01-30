import { AIAnalysisResult, SimulationFeedback, SimulationScenario } from './types';
import { AnalyticsData } from '../types/analytics';

// Utility function for API calls with retry logic
const fetchWithRetry = async <T>(url: string, options: RequestInit, retries = 3): Promise<T> => {
  let lastError: Error = new Error('Initial error state');

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      lastError = error instanceof Error ? error : new Error(String(error));

      if (i === retries - 1) break;

      // Exponential backoff with jitter
      const delay = Math.min(1000 * 2 ** i + Math.random() * 1000, 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

// Analytics API base URL configuration
const API_BASE_URL = 'http://localhost:4003';

export async function fetchAnalytics(
  userId: string,
  fromDate?: Date,
  toDate?: Date
): Promise<AnalyticsData> {
  try {
    const params = new URLSearchParams();
    if (fromDate) params.append('from', fromDate.toISOString());
    if (toDate) params.append('to', toDate.toISOString());

    const response = await fetchWithRetry<AnalyticsData>(
      `${API_BASE_URL}/api/analytics/${userId}?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // Validate response data structure
    if (!response || typeof response !== 'object' || !Array.isArray(response.performanceData)) {
      throw new Error('Invalid analytics data format');
    }

    return response;
  } catch (error) {
    console.error('Analytics API error:', error);
    throw error instanceof Error ? error : new Error('Failed to fetch analytics data');
  }
}

export async function updateUserProgress(userId: string, progressData: Record<string, unknown>): Promise<void> {
  try {
    await fetchWithRetry<void>(
      `${API_BASE_URL}/api/analytics/progress/${userId}`,
      {
        method: 'POST',
        body: JSON.stringify(progressData),
        credentials: 'include'
      }
    );
  } catch (error) {
    console.error('Error updating progress:', error);
    throw error instanceof Error ? error : new Error('Failed to update progress');
  }
}

export async function getPathophysiologyHelp(
  section: string,
  context?: string
): Promise<{ content: string }> {
  try {
    const response = await fetchWithRetry<{ content: string }>(`${API_BASE_URL}/api/ai/pathophysiology-help`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section, context })
    });
    return response;
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
    const response = await fetchWithRetry<AIAnalysisResult>(`${API_BASE_URL}/api/ai/analyze-performance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers })
    });
    return response;
  } catch (error) {
    console.error('Error analyzing performance:', error);
    throw new Error('Failed to analyze performance');
  }
}

export async function generateSimulationScenario(
  difficulty: string,
  focus_areas?: string[]
): Promise<SimulationScenario> {
  try {
    const response = await fetchWithRetry<SimulationScenario>(`${API_BASE_URL}/api/ai/simulation-scenario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ difficulty, focus_areas })
    });
    return response;
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
    const response = await fetchWithRetry<SimulationFeedback>(`${API_BASE_URL}/api/ai/simulation-feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario, userActions })
    });
    return response;
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
    const response = await fetchWithRetry<any>(`${API_BASE_URL}/api/ai/generate-questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return response;
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
    const response = await fetchWithRetry<any>(`${API_BASE_URL}/api/ai/study-recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ performanceData })
    });
    return response;
  } catch (error) {
    console.error('Error generating study recommendations:', error);
    throw new Error('Failed to generate study recommendations');
  }
}