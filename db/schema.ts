import { pgTable, text, serial, integer, boolean, timestamp, json, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  role: text("role").notNull().default("student"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // 'pharmacology', 'fundamentals', etc.
  orderIndex: integer("order_index").notNull(),
  aiGeneratedContent: json("ai_generated_content"), // AI-generated study materials
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").references(() => modules.id),
  text: text("text").notNull(),
  type: text("type").notNull(), // 'mcq', 'cat', 'standard'
  options: json("options").notNull(), // Array of answer options
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation"),
  difficulty: integer("difficulty").notNull(), // 1-5 scale
  aiGenerated: boolean("ai_generated").default(false),
  topicTags: json("topic_tags"), // Array of related topics for AI analysis
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  moduleId: integer("module_id").references(() => modules.id),
  type: text("type").notNull(), // 'practice', 'cat', 'standard'
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  answers: json("answers").notNull(), // Array of user answers
  aiAnalysis: json("ai_analysis"), // AI-generated performance analysis
  strengthAreas: json("strength_areas"), // Topics where user performed well
  weaknessAreas: json("weakness_areas"), // Topics needing improvement
  startedAt: timestamp("started_at").notNull(),
  completedAt: timestamp("completed_at"),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  moduleId: integer("module_id").references(() => modules.id),
  completedQuestions: integer("completed_questions").notNull().default(0),
  correctAnswers: integer("correct_answers").notNull().default(0),
  lastAttempt: timestamp("last_attempt"),
  learningPath: json("learning_path"), // AI-recommended study path
  performanceMetrics: json("performance_metrics"), // Detailed analytics
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Create schemas for all tables
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertModuleSchema = createInsertSchema(modules);
export const selectModuleSchema = createSelectSchema(modules);
export const insertQuestionSchema = createInsertSchema(questions);
export const selectQuestionSchema = createSelectSchema(questions);
export const insertQuizAttemptSchema = createInsertSchema(quizAttempts);
export const selectQuizAttemptSchema = createSelectSchema(quizAttempts);
export const insertUserProgressSchema = createInsertSchema(userProgress);
export const selectUserProgressSchema = createSelectSchema(userProgress);

// Export types for all tables
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
export type InsertModule = typeof modules.$inferInsert;
export type SelectModule = typeof modules.$inferSelect;
export type InsertQuestion = typeof questions.$inferInsert;
export type SelectQuestion = typeof questions.$inferSelect;
export type InsertQuizAttempt = typeof quizAttempts.$inferInsert;
export type SelectQuizAttempt = typeof quizAttempts.$inferSelect;
export type InsertUserProgress = typeof userProgress.$inferInsert;
export type SelectUserProgress = typeof userProgress.$inferSelect;