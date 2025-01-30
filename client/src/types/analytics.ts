export interface AnalyticsData {
  performanceData: {
    domain: string;
    mastery: number;
  }[];
  totalStudyTime: string;
  questionsAttempted: number;
  averageScore: number;
}

export interface ProgressData {
  moduleId: string;
  score: number;
  timeSpent: number;
  completedAt: string;
}