import { db } from '@/db';
import { userProgress } from '@/db/schema';
import { eq, and, lt } from "drizzle-orm";

export class SpacedRepetitionService {
  // Calculate next review date based on SM-2 algorithm
  private calculateNextReview(
    easeFactor: number,
    interval: number,
    quality: number,
  ): {
    nextInterval: number;
    newEaseFactor: number;
  } {
    let newEaseFactor = easeFactor;
    let nextInterval: number;

    // Update ease factor based on performance
    newEaseFactor = Math.max(
      1.3,
      easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
    );

    // Calculate next interval
    if (quality < 3) {
      // If answer was incorrect, reset interval
      nextInterval = 1;
    } else {
      if (interval === 1) {
        nextInterval = 6; // First successful review
      } else {
        nextInterval = Math.round(interval * newEaseFactor);
      }
    }

    return { nextInterval, newEaseFactor };
  }

  // Process an answer and update spaced repetition data
  async processAnswer(
    userId: number,
    questionId: number,
    isCorrect: boolean,
    answerQuality: number,
  ) {
    // Get current progress
    const currentProgress = await db
      .select()
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.questionId, questionId),
        ),
      )
      .limit(1);

    const progress = currentProgress[0];

    if (!progress) {
      // Create new progress entry if it doesn't exist
      const newProgress = await db.insert(userProgress).values({
        userId,
        questionId,
        isCorrect,
        easeFactor: 250, // Default ease factor
        interval: 1,
        repetitions: 0,
        nextReview: new Date(),
      }).returning();
      return {
        nextReview: newProgress[0].nextReview,
        interval: 1,
        easeFactor: 250,
      };
    }

    // Calculate next review
    const { nextInterval, newEaseFactor } = this.calculateNextReview(
      progress.easeFactor / 100, // Convert from stored integer
      progress.interval,
      answerQuality,
    );

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + nextInterval);

    // Update progress
    await db
      .update(userProgress)
      .set({
        easeFactor: Math.round(newEaseFactor * 100), // Store as integer
        interval: nextInterval,
        repetitions: progress.repetitions + 1,
        nextReview,
        isCorrect,
      })
      .where(eq(userProgress.id, progress.id));

    return {
      nextReview,
      interval: nextInterval,
      easeFactor: newEaseFactor,
    };
  }

  // Get questions due for review
  async getDueQuestions(userId: number) {
    const now = new Date();

    const dueQuestions = await db
      .select()
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          lt(userProgress.nextReview, now)
        )
      )
      .orderBy(userProgress.nextReview);

    return dueQuestions;
  }

  // Get learning progress overview
  async getLearningProgress(userId: number) {
    const progress = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));

    const now = new Date();
    const stats = {
      totalCards: progress.length,
      mastered: 0,
      learning: 0,
      needsReview: 0,
      retention: 0,
    };

    let correctAnswers = 0;
    let totalAttempts = 0;

    progress.forEach((card) => {
      if (card.easeFactor > 250 && card.repetitions > 3) {
        stats.mastered++;
      } else if (card.interval <= 7) {
        stats.learning++;
      }

      if (card.nextReview && card.nextReview <= now) {
        stats.needsReview++;
      }

      if (card.isCorrect) {
        correctAnswers++;
      }
      totalAttempts++;
    });

    stats.retention = totalAttempts > 0 ? (correctAnswers / totalAttempts) * 100 : 0;

    return stats;
  }
}

export const spacedRepetitionService = new SpacedRepetitionService();