import { pgTable, text, serial, integer, boolean, timestamp, json, foreignKey, index, uuid, unique } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";

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

export const questionHistory = pgTable("question_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  questionId: integer("question_id").references(() => questions.id, { onDelete: 'cascade' }).notNull(),
  answer: text("answer").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  timeSpent: integer("time_spent").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  attemptContext: json("attempt_context").$type<Record<string, any>>().default({}),
}, (table) => ({
  userIdx: index("question_history_user_idx").on(table.userId),
  questionIdx: index("question_history_question_idx").on(table.questionId),
  userQuestionIdx: unique("question_history_user_question_idx").on(table.userId, table.questionId)
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const studyBuddyChats = pgTable("study_buddy_chats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  sessionId: text("session_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  tone: text("tone").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  moduleId: integer("module_id").references(() => modules.id, { onDelete: 'cascade' }).notNull(),
  type: text("type").notNull(),
  answers: json("answers").$type<Array<{ questionId: number; answer: string; correct: boolean }>>().notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  aiAnalysis: json("ai_analysis").$type<Record<string, any>>(),
  strengthAreas: json("strength_areas").$type<string[]>().default([]),
  weaknessAreas: json("weakness_areas").$type<string[]>().default([])
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  moduleId: integer("module_id").references(() => modules.id, { onDelete: 'cascade' }).notNull(),
  completedQuestions: integer("completed_questions").default(0).notNull(),
  correctAnswers: integer("correct_answers").default(0).notNull(),
  lastAttempt: timestamp("last_attempt"),
  performanceMetrics: json("performance_metrics").$type<Record<string, any>>().default({}),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Type inference helpers
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Module = typeof modules.$inferSelect;
export type NewModule = typeof modules.$inferInsert;

export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;

export type StudyBuddyChat = typeof studyBuddyChats.$inferSelect;
export type NewStudyBuddyChat = typeof studyBuddyChats.$inferInsert;

export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type NewQuizAttempt = typeof quizAttempts.$inferInsert;

export type UserProgress = typeof userProgress.$inferSelect;
export type NewUserProgress = typeof userProgress.$inferInsert;

export type QuestionHistory = typeof questionHistory.$inferSelect;
export type NewQuestionHistory = typeof questionHistory.$inferInsert;


// Zod validation schemas
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

export const insertQuestionHistorySchema = createInsertSchema(questionHistory);
export const selectQuestionHistorySchema = createSelectSchema(questionHistory);

export const questionHistorySchema = createInsertSchema(questionHistory);
export const userProgressSchema = createInsertSchema(userProgress);