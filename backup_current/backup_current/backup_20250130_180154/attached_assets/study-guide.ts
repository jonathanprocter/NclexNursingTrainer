```typescript
import { Router } from 'express';
import { db } from "@db";
import { eq } from "drizzle-orm";
import { userProgress } from "@db/schema";
import { aiLearningService } from '../services/ai-learning.service';

const router = Router();

// Get current study guide
router.get("/current", async (req, res) => {
  try {
    const userId = 1; // TODO: Replace with actual user ID from auth

    // Get adaptive learning path
    const adaptivePath = await aiLearningService.generateAdaptivePath(userId);

    // Get performance data
    const performance = await db.select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId))
      .orderBy((users, { desc }) => [desc(users.timestamp)])
      .limit(100);

    // Transform data to match study guide format
    const guide = {
      id: `sg-${Date.now()}`,
      createdAt: new Date().toISOString(),
      topics: adaptivePath.recommendedPath.currentDomainFocus.map(domain => ({
        id: domain.toLowerCase().replace(/\s+/g, '-'),
        name: domain,
        priority: domain === adaptivePath.recommendedPath.currentDomainFocus[0] ? 'high' : 'medium',
        completed: false,
        estimatedTime: adaptivePath.recommendedPath.estimatedTimeMinutes / adaptivePath.recommendedPath.currentDomainFocus.length
      })),
      weakAreas: performance
        .filter(p => p.score < 70)
        .map(p => p.domain)
        .slice(0, 3),
      strengthAreas: performance
        .filter(p => p.score >= 70)
        .map(p => p.domain)
        .slice(0, 3),
      recommendedResources: adaptivePath.recommendedPath.studyPlan.shortTerm.map((plan, i) => ({
        id: `resource-${i}`,
        type: 'article',
        title: plan,
        url: `/resources/${plan.toLowerCase().replace(/\s+/g, '-')}`
      })),
      progress: Math.round(
        (performance.reduce((acc, curr) => acc + curr.score, 0) / performance.length) || 0
      )
    };

    res.json(guide);
  } catch (error) {
    console.error("Error fetching study guide:", error);
    res.status(500).json({
      error: 'Failed to fetch study guide',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Generate new study guide
router.post("/generate", async (req, res) => {
  try {
    const userId = 1; // TODO: Replace with actual user ID from auth

    // Get new adaptive path
    const adaptivePath = await aiLearningService.generateAdaptivePath(userId);

    // Transform to study guide format
    const guide = {
      id: `sg-${Date.now()}`,
      createdAt: new Date().toISOString(),
      topics: adaptivePath.recommendedPath.currentDomainFocus.map(domain => ({
        id: domain.toLowerCase().replace(/\s+/g, '-'),
        name: domain,
        priority: domain === adaptivePath.recommendedPath.currentDomainFocus[0] ? 'high' : 'medium',
        completed: false,
        estimatedTime: adaptivePath.recommendedPath.estimatedTimeMinutes / adaptivePath.recommendedPath.currentDomainFocus.length
      })),
      weakAreas: adaptivePath.recommendedPath.studyPlan.shortTerm,
      strengthAreas: adaptivePath.recommendedPath.studyPlan.longTerm,
      recommendedResources: adaptivePath.recommendedPath.studyPlan.shortTerm.map((plan, i) => ({
        id: `resource-${i}`,
        type: 'article',
        title: plan,
        url: `/resources/${plan.toLowerCase().replace(/\s+/g, '-')}`
      })),
      progress: 0
    };

    res.json(guide);
  } catch (error) {
    console.error("Error generating study guide:", error);
    res.status(500).json({
      error: 'Failed to generate study guide',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
```