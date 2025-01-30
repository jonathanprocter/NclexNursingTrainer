export interface AnalyticsData {
  performanceData: {
    domain: string;
    mastery: number;
  }[];
  totalStudyTime: string;
  questionsAttempted: number;
  averageScore: number;
}
