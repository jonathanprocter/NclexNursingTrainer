import { z } from "zod";

export const analyticsDataSchema = z.object({
  performanceData: z.array(z.object({
    domain: z.string(),
    mastery: z.number().min(0).max(100)
  })),
  totalStudyTime: z.string(),
  questionsAttempted: z.number(),
  averageScore: z.number().min(0).max(100)
});

export type AnalyticsData = z.infer<typeof analyticsDataSchema>;

export const progressDataSchema = z.object({
  userId: z.number(),
  moduleId: z.number(),
  score: z.number().min(0).max(100),
  completedAt: z.string().datetime(),
  timeSpent: z.number()
});

export type ProgressData = z.infer<typeof progressDataSchema>;