import { db } from "../db";
import { userProgress } from "../db/schema";
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
    // Quality should be between 0 and 5
    // 0-2: Incorrect
    // 3-5: Correct with varying degrees of difficulty

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
    userId: string,
    questionId: string,
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
      .orderBy(userProgress.timestamp, "desc")
      .limit(1);

    const progress = currentProgress[0];

    // Calculate next review
    const { nextInterval, newEaseFactor } = this.calculateNextReview(
      progress?.easeFactor || 2.5,
      progress?.interval || 1,
      answerQuality,
    );

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + nextInterval);

    // Update progress
    await db
      .update(userProgress)
      .set({
        easeFactor: newEaseFactor,
        interval: nextInterval,
        repetitions: (progress?.repetitions || 0) + 1,
        nextReview: nextReview,
      })
      .where(eq(userProgress.id, progress.id));

    return {
      nextReview,
      interval: nextInterval,
      easeFactor: newEaseFactor,
    };
  }

  // Get questions due for review
  async getDueQuestions(userId: string) {
    const now = new Date();

    const dueQuestions = await db
      .select()
      .from(userProgress)
      .where(
        and(eq(userProgress.userId, userId), lt(userProgress.nextReview, now)),
      )
      .orderBy(userProgress.nextReview);

    return dueQuestions;
  }

  // Get learning progress overview
  async getLearningProgress(userId: string) {
    const progress = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));

    const now = new Date();
    const stats = {
      totalCards: progress.length,
      mastered: 0, // Cards with ease factor > 2.5 and correct answers > 3
      learning: 0, // Cards in learning phase (interval <= 7)
      needsReview: 0, // Cards due for review
      retention: 0, // Overall retention rate
    };

    progress.forEach((card) => {
      if (card.easeFactor > 2.5 && card.repetitions > 3) {
        stats.mastered++;
      } else if (card.interval <= 7) {
        stats.learning++;
      }

      if (card.nextReview && card.nextReview <= now) {
        stats.needsReview++;
      }
    });

    const totalAttempts = progress.reduce(
      (sum, card) => sum + card.repetitions,
      0,
    );
    const correctAttempts = progress.filter((card) => card.isCorrect).length;
    stats.retention =
      totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

    return stats;
  }
}

export const spacedRepetitionService = new SpacedRepetitionService();
