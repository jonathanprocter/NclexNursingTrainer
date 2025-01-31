export interface AnalyticsData {
  performanceData: Array<{
    domain: string;
    mastery: number;
  }>;
  totalStudyTime: string;
  questionsAttempted: number;
  averageScore: number;
}
