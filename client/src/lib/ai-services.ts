
import { create } from 'zustand';

interface VoiceState {
  speaking: boolean;
  setSpeaking: (speaking: boolean) => void;
  voicePreferences: {
    rate: number;
    pitch: number;
    volume: number;
  };
  updatePreferences: (prefs: Partial<VoiceState['voicePreferences']>) => void;
}

export const useVoiceStore = create<VoiceState>((set) => ({
  speaking: false,
  setSpeaking: (speaking) => set({ speaking }),
  voicePreferences: {
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0
  },
  updatePreferences: (prefs) => 
    set((state) => ({
      voicePreferences: { ...state.voicePreferences, ...prefs }
    }))
}));

export const speakResponse = (text: string, preferences: VoiceState['voicePreferences']) => {
  const utterance = new SpeechSynthesisUtterance(text);
  Object.assign(utterance, preferences);
  
  utterance.onstart = () => useVoiceStore.getState().setSpeaking(true);
  utterance.onend = () => useVoiceStore.getState().setSpeaking(false);
  
  window.speechSynthesis.speak(utterance);
};

import type { AIAnalysisResult } from './types';

export async function getPharmacologyHelp(
  section: string,
  context: string = 'basic'
): Promise<{ content: string; type?: string; topic?: string }> {
  try {
    const response = await fetch('/api/pharmacology-help', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ 
        topic: section,
        context: context || '',
        type: 'explanation'
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Server response:', errorData);
      throw new Error(errorData.message || 'Failed to get AI assistance');
    }

    const data = await response.json();
    if (!data) {
      throw new Error('No response received from AI service');
    }
    
    // Provide default content if none exists
    const content = data.content || 'Could not generate content. Please try again.';
    
    return { 
      content,
      type: data.type || 'practice',
      topic: data.topic || section
    };
  } catch (error) {
    console.error('Error getting pharmacology help:', error);
    throw error instanceof Error ? error : new Error('Failed to get AI assistance');
  }
}

export async function analyzePerformance(
  answers: Array<{
    question: string;
    userAnswer: string;
    correctAnswer: string;
    topic: string;
    timestamp: string;
  }> | null
): Promise<AIAnalysisResult> {
  if (!answers) {
    return {
      strengths: [],
      weaknesses: [],
      recommendedTopics: [],
      confidence: 0,
      learningStyle: 'visual',
      conceptualUnderstanding: {
        strong: [],
        needsImprovement: []
      },
      suggestedResources: [],
      predictedPerformance: 0
    };
  }
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
  critical_thinking_metrics: {
    cue_recognition: number;
    hypothesis_generation: number;
    clinical_decision_making: number;
    outcome_evaluation: number;
  };
  next_focus_areas: string[];
  personalized_resources: {
    topic: string;
    type: 'video' | 'case_study' | 'practice_questions';
    priority: 'high' | 'medium' | 'low';
  }[];
}

export interface SimulationScenario {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  objectives: string[];
  initial_state: {
    patient_history: string;
    chief_complaint: string;
    airway_assessment?: string;
    vital_signs?: {
      blood_pressure?: string;
      heart_rate?: number;
      respiratory_rate?: number;
      temperature?: number;
      oxygen_saturation?: number;
      spo2?: number;
      work_of_breathing?: string;
      mean_arterial_pressure?: number;
      capillary_refill?: string;
      gcs?: string;
      pupils?: string;
      blood_glucose?: number;
      cvp?: number;
      etco2?: number;
      art_line?: string;
    };
    lab_values?: Record<string, string | number>;
    current_interventions?: string[];
  };
  expected_actions: Array<{
    action: string;
    feedback?: string;
    next_state?: Partial<SimulationScenario['initial_state']>;
  }>;
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
      body: JSON.stringify({ 
        difficulty, 
        focus_areas: focus_areas || []
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to generate simulation scenario: ${error}`);
    }

    try {
      const data = await response.json();
      if (!data?.title || !data?.initial_state || !Array.isArray(data?.expected_actions)) {
         console.error('Invalid scenario data:', data);
        throw new Error('Invalid scenario format - missing required fields');
      }
      return data;
    } catch (error) {
      console.error('Error parsing scenario:', error);
      throw new Error('Failed to parse simulation scenario');
    }
  } catch (error) {
    console.error('Error generating simulation scenario:', error);
    throw error instanceof Error ? error : new Error('Unknown error occurred');
  }
}

export async function getSimulationFeedback(
  scenario: SimulationScenario,
  userActions: {
    action: string;
    timestamp: string;
    response?: string;
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
    itemType: string;
    confidenceLevel: number;
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

export interface CaseStudyResponse {
  content: string;
  caseType: string;
  learningPoints: string[];
}

export async function getPharmacokineticsCaseStudy(topic: string): Promise<CaseStudyResponse> {
  try {
    console.log('Generating case study for topic:', topic);
    const response = await fetch('/api/pharmacokinetics-cases', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ 
        topic: topic || 'ADME principles'
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to get case study');
    }

    const data = await response.json();
    if (!data.content) {
      throw new Error('No content received from AI');
    }

    return {
      content: data.content,
      caseType: data.caseType || topic,
      learningPoints: data.learningPoints || [
        'Drug absorption and distribution',
        'Metabolism pathways',
        'Excretion mechanisms',
        'Clinical applications'
      ]
    };
  } catch (error) {
    console.error('Error getting case study:', error);
    throw error;
  }
}

export interface AIAnalysisResult {
  strengths: string[];
  weaknesses: string[];
  recommendedTopics: string[];
  confidence: number;
  learningStyle: string;
  conceptualUnderstanding: {
    strong: string[];
    needsImprovement: string[];
  };
  suggestedResources: {
    topic: string;
    type: 'video' | 'text' | 'practice';
    priority: number;
  }[];
  predictedPerformance: number;
}
export async function generateStudyPath(
  performanceData: {
    topic: string;
    confidence: number;
    recentScores: number[];
  }[]
): Promise<{
  recommendedTopics: string[];
  estimatedStudyTime: number;
  prerequisites: Record<string, string[]>;
  learningObjectives: string[];
}> {
  try {
    const response = await fetch('/api/ai/study-path', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ performanceData })
    });

    if (!response.ok) {
      throw new Error('Failed to generate study path');
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating study path:', error);
    throw new Error('Failed to generate study path');
  }
}

export interface BiancaProfile {
  learningStyle: 'visual' | 'auditory' | 'kinesthetic';
  preferredPaceMinutes: number;
  focusAreas: string[];
  strengthAreas: string[];
  studyPreferences: {
    timeOfDay: string;
    sessionLength: number;
    breakFrequency: number;
  };
}

const biancaProfile: BiancaProfile = {
  learningStyle: 'visual',
  preferredPaceMinutes: 45,
  focusAreas: ['Clinical Judgment', 'Pharmacology', 'Patient Safety'],
  strengthAreas: ['Basic Care', 'Health Assessment'],
  studyPreferences: {
    timeOfDay: 'morning',
    sessionLength: 45,
    breakFrequency: 15
  }
};

export async function getPersonalizedLearningPath(
  performance: { topic: string; score: number }[]
): Promise<{
  dailyGoals: string[];
  focusAreas: string[];
  estimatedTimeToMastery: number;
  customizedPlan: {
    morning: string[];
    afternoon: string[];
    evening: string[];
  };
}> {
  const response = await fetch('/api/ai/learning-path', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, performance })
  });
  return response.json();
}

export async function startSkillPractice(
  level: 'basic' | 'advanced',
  skillName: string
): Promise<{
  scenario: string;
  objectives: string[];
  steps: Array<{
    instruction: string;
    feedback?: string;
    completed?: boolean;
  }>;
}> {
  try {
    const response = await fetch('/api/ai/skill-practice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level, skillName })
    });

    if (!response.ok) {
      throw new Error('Failed to start skill practice');
    }

    return await response.json();
  } catch (error) {
    console.error('Error starting skill practice:', error);
    throw new Error('Failed to start skill practice');
  }
}