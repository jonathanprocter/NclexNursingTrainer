import { pgTable, text, serial, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const modules = pgTable('modules', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  type: text('type'),
  orderIndex: integer('order_index'),
  createdAt: timestamp('created_at').defaultNow(),
  aiGeneratedContent: text('ai_generated_content'),
});

export const questions = pgTable('questions', {
  id: serial('id').primaryKey(),
  moduleId: integer('module_id').references(() => modules.id),
  text: text('text').notNull(),
  options: json('options').$type<Array<{ id: string, text: string }>>(),
  correctAnswer: text('correct_answer'),
  explanation: text('explanation'),
  category: text('category'),
  difficulty: text('difficulty'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const quizAttempts = pgTable('quiz_attempts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  moduleId: integer('module_id').references(() => modules.id),
  score: integer('score'),
  answers: json('answers').$type<Array<{ 
    questionId: string, 
    selectedAnswer: string, 
    correct: boolean,
    timeSpent: number 
  }>>(),
  startedAt: timestamp('started_at').defaultNow(),
  completedAt: timestamp('completed_at'),
});

export const userProgress = pgTable('user_progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  moduleId: integer('module_id').references(() => modules.id),
  completedQuestions: integer('completed_questions').default(0),
  correctAnswers: integer('correct_answers').default(0),
  lastAttempt: timestamp('last_attempt'),
  updatedAt: timestamp('updated_at').defaultNow(),
  confidenceScore: integer('confidence_score').default(0),
});

// Export types for better type safety
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Module = typeof modules.$inferSelect;
export type NewModule = typeof modules.$inferInsert;
export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type NewQuizAttempt = typeof quizAttempts.$inferInsert;
export type UserProgress = typeof userProgress.$inferSelect;
export type NewUserProgress = typeof userProgress.$inferInsert;

// Zod validation schemas
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertModuleSchema = createInsertSchema(modules);
export const selectModuleSchema = createSelectSchema(modules);
export const insertQuestionSchema = createInsertSchema(questions);
export const selectQuestionSchema = createSelectSchema(questions);
export const insertQuizAttemptSchema = createInsertSchema(quizAttempts);
export const selectQuizAttemptSchema = createSelectSchema(quizAttempts);