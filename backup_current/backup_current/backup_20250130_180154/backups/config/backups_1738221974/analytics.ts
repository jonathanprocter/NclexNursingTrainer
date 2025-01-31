
export interface AnalyticsData {
  performanceData: {
    module: string;
    score: number;
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
