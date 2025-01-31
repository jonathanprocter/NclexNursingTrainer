import { pgTable, text, uuid, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Modules table
export const modules = pgTable('modules', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  type: text('type'),
  orderIndex: text('order_index'),
  createdAt: timestamp('created_at').defaultNow(),
  aiGeneratedContent: text('ai_generated_content')
});

// Questions table
export const questions = pgTable('questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  moduleId: uuid('module_id').references(() => modules.id),
  text: text('text').notNull(),
  options: jsonb('options').$type<Array<{ id: string, text: string }>>(),
  correctAnswer: text('correct_answer'),
  explanation: text('explanation'),
  category: text('category'),
  difficulty: text('difficulty'),
  createdAt: timestamp('created_at').defaultNow()
});

// Quiz attempts table
export const quizAttempts = pgTable('quiz_attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  moduleId: uuid('module_id').references(() => modules.id),
  score: text('score'),
  answers: jsonb('answers').$type<Array<{ questionId: string, selectedAnswer: string, correct: boolean }>>(),
  startedAt: timestamp('started_at').defaultNow()
});

// Analytics table
export const analytics = pgTable('analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  eventType: text('event_type').notNull(),
  eventData: jsonb('event_data').default({}),
  timestamp: timestamp('timestamp').defaultNow()
});

// User Progress table
export const userProgress = pgTable('user_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  moduleId: uuid('module_id').references(() => modules.id),
  completedQuestions: text('completed_questions').default('0'),
  correctAnswers: text('correct_answers').default('0'),
  lastAttempt: timestamp('last_attempt'),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  quizAttempts: many(quizAttempts),
  progress: many(userProgress),
  analytics: many(analytics)
}));

export const modulesRelations = relations(modules, ({ many }) => ({
  questions: many(questions),
  attempts: many(quizAttempts)
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Module = typeof modules.$inferSelect;
export type NewModule = typeof modules.$inferInsert;
export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type NewQuizAttempt = typeof quizAttempts.$inferInsert;
export type Analytics = typeof analytics.$inferSelect;
export type NewAnalytics = typeof analytics.$inferInsert;
export type UserProgress = typeof userProgress.$inferSelect;
export type NewUserProgress = typeof userProgress.$inferInsert;

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertModuleSchema = createInsertSchema(modules);
export const selectModuleSchema = createSelectSchema(modules);
export const insertQuestionSchema = createInsertSchema(questions);
export const selectQuestionSchema = createSelectSchema(questions);
export const insertQuizAttemptSchema = createInsertSchema(quizAttempts);
export const selectQuizAttemptSchema = createSelectSchema(quizAttempts);
export const insertAnalyticsSchema = createInsertSchema(analytics);
export const selectAnalyticsSchema = createSelectSchema(analytics);
export const insertUserProgressSchema = createInsertSchema(userProgress);
export const selectUserProgressSchema = createSelectSchema(userProgress);