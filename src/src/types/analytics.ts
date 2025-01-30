import { z } from "zod";

// Define Zod schemas for runtime validation
export const performanceDataSchema = z.object({
  domain: z.string(),
  mastery: z.number().min(0).max(100),
});

export const analyticsDataSchema = z.object({
  performanceData: z.array(performanceDataSchema),
  totalStudyTime: z.string(),
  questionsAttempted: z.number().min(0),
  averageScore: z.number().min(0).max(100),
});

// Export TypeScript types derived from Zod schemas
export type PerformanceData = z.infer<typeof performanceDataSchema>;
export type AnalyticsData = z.infer<typeof analyticsDataSchema>;

// Progress data schema for tracking user progress
export const progressDataSchema = z.object({
  moduleId: z.string(),
  score: z.number().min(0).max(100),
  timeSpent: z.number().min(0),
  completedAt: z.string(),
});

export type ProgressData = z.infer<typeof progressDataSchema>;