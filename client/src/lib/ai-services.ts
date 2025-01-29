import type { AIAnalysisResult } from './types';

export interface SimulationFeedback {
  strengths: string[];
  areas_for_improvement: string[];
  recommendations: string[];
  clinical_reasoning_score: number;
}

export interface VitalSigns {
  respiratory_rate: string;
  spo2: string;
  work_of_breathing: string;
  blood_pressure: string;
  heart_rate: string;
  mean_arterial_pressure: string;
  capillary_refill: string;
  temperature: string;
  gcs: string;
  pupils: string;
  blood_glucose: string;
  cvp: string;
  etco2: string;
  art_line: string;
}

export interface LabValues {
  arterial_blood_gas?: string;
  hemoglobin?: string;
  wbc?: string;
  platelets?: string;
  sodium?: string;
  potassium?: string;
  lactate?: string;
  troponin?: string;
  [key: string]: string | undefined;
}

export interface InitialState {
  patient_history: string;
  chief_complaint: string;
  airway_assessment: string;
  vital_signs: VitalSigns;
  lab_values?: LabValues;
  current_interventions?: string[];
}

export interface SimulationScenario {
  id: string;
  title: string;
  description: string;
  expected_actions: Array<{
    action: string;
    priority?: number;
    rationale?: string;
  }>;
  initial_state: InitialState | null;
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
      console.error('Invalid response data:', data);
      throw new Error('Invalid response format');
    }

    return data as SimulationScenario;
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
      const errorText = await response.text();
      console.error('Server response:', errorText);
      throw new Error(`Failed to get simulation feedback: ${response.status}`);
    }

    const data = await response.json();
    if (!data || typeof data !== 'object') {
      console.error('Invalid response data:', data);
      throw new Error('Invalid feedback format');
    }

    return data;
  } catch (error) {
    console.error('Error getting simulation feedback:', error);
    throw error instanceof Error ? error : new Error('Failed to get simulation feedback');
  }
}

// Re-export other types and functions that were in the file
export interface QuestionGenerationParams {
  topics: string[];
  difficulty: number;
  previousPerformance: {
    topic: string;
    successRate: number;
  }[];
}

export interface AIAnalysisResult {
  strengths: string[];
  weaknesses: string[];
  recommendedTopics: string[];
  confidence: number;
}

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