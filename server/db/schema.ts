
import { integer, json, pgEnum, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const questions = pgTable('questions', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  type: text('type').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
});

export const questionHistory = pgTable('question_history', {
  id: serial('id').primaryKey(),
  questionId: integer('question_id').notNull(),
  response: text('response').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
});

export const userProgress = pgTable('user_progress', {
  id: serial('id').primaryKey(),
  moduleId: integer('module_id').notNull(),
  progress: integer('progress').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Type inference helpers
export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;
export type QuestionHistory = typeof questionHistory.$inferSelect;
export type NewQuestionHistory = typeof questionHistory.$inferInsert;
export type UserProgress = typeof userProgress.$inferSelect;
export type NewUserProgress = typeof userProgress.$inferInsert;

// Zod validation schemas
export const insertQuestionSchema = createInsertSchema(questions);
export const selectQuestionSchema = createSelectSchema(questions);
export const insertQuestionHistorySchema = createInsertSchema(questionHistory);
export const selectQuestionHistorySchema = createSelectSchema(questionHistory);
export const insertUserProgressSchema = createInsertSchema(userProgress);
export const selectUserProgressSchema = createSelectSchema(userProgress);
