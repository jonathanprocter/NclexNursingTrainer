import { pgTable, text, serial, integer, boolean, timestamp, json, foreignKey, index, uuid, unique } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const questionHistory = pgTable('question_history', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  questionId: text('question_id').notNull(),
  correct: boolean('correct').notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
});

export const modules = pgTable('modules', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
});

export const questions = pgTable('questions', {
    id: serial('id').primaryKey(),
    moduleId: integer('module_id').references(() => modules.id),
    text: text('text').notNull(),
    options: json('options'),
    correctAnswer: text('correct_answer'),
    explanation: text('explanation'),
    difficulty: text('difficulty'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const quizAttempts = pgTable('quiz_attempts', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id),
    moduleId: integer('module_id').references(() => modules.id),
    score: integer('score'),
    answers: json('answers'),
    startedAt: timestamp('started_at').defaultNow(),
});

export const userProgress = pgTable('user_progress', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id),
    moduleId: integer('module_id').references(() => modules.id),
    completedQuestions: integer('completed_questions').default(0),
    correctAnswers: integer('correct_answers').default(0),
    lastAttempt: timestamp('last_attempt'),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const studyBuddyChats = pgTable('study_buddy_chats', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id),
    sessionId: text('session_id').notNull(),
    role: text('role').notNull(),
    content: text('content').notNull(),
    tone: text('tone'),
    createdAt: timestamp('created_at').defaultNow(),
});

// Type exports for tables
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type QuestionHistory = typeof questionHistory.$inferSelect;
export type NewQuestionHistory = typeof questionHistory.$inferInsert;
export type Module = typeof modules.$inferSelect;
export type NewModule = typeof modules.$inferInsert;
export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type NewQuizAttempt = typeof quizAttempts.$inferInsert;
export type UserProgress = typeof userProgress.$inferSelect;
export type NewUserProgress = typeof userProgress.$inferInsert;
export type StudyBuddyChat = typeof studyBuddyChats.$inferSelect;
export type NewStudyBuddyChat = typeof studyBuddyChats.$inferInsert;

// Zod validation schemas
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertModuleSchema = createInsertSchema(modules);
export const selectModuleSchema = createSelectSchema(modules);
export const insertQuestionSchema = createInsertSchema(questions);
export const selectQuestionSchema = createSelectSchema(questions);
export const insertQuizAttemptSchema = createInsertSchema(quizAttempts);
export const selectQuizAttemptSchema = createSelectSchema(quizAttempts);