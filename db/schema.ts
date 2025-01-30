import { pgTable, text, serial, integer, boolean, timestamp, json, foreignKey, index, uuid, unique } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  role: text("role").default("student").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  usernameIdx: index("username_idx").on(table.username),
  roleCreatedIdx: index("role_created_idx").on(table.role, table.createdAt)
}));

export const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(''),
  type: text("type").notNull(),
  orderIndex: integer("order_index").notNull(),
  aiGeneratedContent: json("ai_generated_content").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  titleIdx: index("title_idx").on(table.title),
  typeOrderIdx: index("type_order_idx").on(table.type, table.orderIndex)
}));

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").references(() => modules.id, { onDelete: 'cascade' }).notNull(),
  text: text("text").notNull(),
  type: text("type").notNull(),
  options: json("options").$type<Array<{ id: string; text: string }>>().notNull(),
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation").default('').notNull(),
  difficulty: integer("difficulty").notNull(),
  aiGenerated: boolean("ai_generated").default(false).notNull(),
  category: text("category").notNull(),
  subcategory: text("subcategory").notNull(),
  conceptBreakdown: json("concept_breakdown").$type<Array<{ concept: string; explanation: string }>>(),
  faqs: json("faqs").$type<Array<{ question: string; answer: string }>>(),
  relatedTopics: json("related_topics").$type<string[]>(),
  references: json("references").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  moduleIdx: index("questions_module_idx").on(table.moduleId),
  categoryIdx: index("questions_category_idx").on(table.category),
  difficultyIdx: index("questions_difficulty_idx").on(table.difficulty),
  typeModuleIdx: index("questions_type_module_idx").on(table.type, table.moduleId)
}));

export const questionHistory = pgTable("question_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  questionId: integer("question_id").references(() => questions.id, { onDelete: 'cascade' }).notNull(),
  answer: text("answer").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  timeSpent: integer("time_spent").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  easeFactor: integer("ease_factor").default(250).notNull(),
  interval: integer("interval").default(1).notNull(),
  repetitions: integer("repetitions").default(0).notNull(),
  nextReview: timestamp("next_review"),
  attemptContext: json("attempt_context").$type<Record<string, any>>().default({}),
}, (table) => ({
  userIdx: index("question_history_user_idx").on(table.userId),
  questionIdx: index("question_history_question_idx").on(table.questionId),
  reviewIdx: index("question_history_review_idx").on(table.nextReview),
  userQuestionIdx: unique("question_history_user_question_idx").on(table.userId, table.questionId)
}));

export const studyBuddyChats = pgTable("study_buddy_chats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  sessionId: text("session_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  tone: text("tone").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
  sessionIdx: index("study_buddy_chats_session_idx").on(table.sessionId),
  userIdx: index("study_buddy_chats_user_idx").on(table.userId),
  timestampIdx: index("study_buddy_chats_timestamp_idx").on(table.timestamp)
}));

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  moduleId: integer("module_id").references(() => modules.id, { onDelete: 'cascade' }).notNull(),
  completedQuestions: integer("completed_questions").default(0).notNull(),
  correctAnswers: integer("correct_answers").default(0).notNull(),
  lastAttempt: timestamp("last_attempt"),
  learningPath: json("learning_path").$type<Record<string, any>>().default({}),
  performanceMetrics: json("performance_metrics").$type<Record<string, any>>().default({}),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  userIdx: index("user_progress_user_idx").on(table.userId),
  moduleIdx: index("user_progress_module_idx").on(table.moduleId),
  userModuleIdx: unique("user_progress_user_module_idx").on(table.userId, table.moduleId)
}));

// Zod schemas for validation
export const questionHistorySchema = z.object({
  userId: z.number().int().positive(),
  questionId: z.number().int().positive(),
  answer: z.string(),
  isCorrect: z.boolean(),
  timeSpent: z.number().int().positive(),
  easeFactor: z.number().int().min(0).optional(),
  interval: z.number().int().min(0).optional(),
  repetitions: z.number().int().min(0).optional(),
  nextReview: z.date().optional(),
  attemptContext: z.record(z.any()).optional(),
});

export const userProgressSchema = z.object({
  userId: z.number().int().positive(),
  moduleId: z.number().int().positive(),
  completedQuestions: z.number().int().min(0),
  correctAnswers: z.number().int().min(0),
  lastAttempt: z.date().optional(),
  learningPath: z.record(z.any()).optional(),
  performanceMetrics: z.record(z.any()).optional(),
});

// Type exports
export type {
  users as Users,
  modules as Modules,
  questions as Questions,
  questionHistory as QuestionHistory,
  userProgress as UserProgress,
  studyBuddyChats as StudyBuddyChats,
};

export {
  users,
  modules,
  questions,
  questionHistory,
  userProgress,
  studyBuddyChats,
};