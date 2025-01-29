import { pgTable, text, serial, integer, boolean, timestamp, json, foreignKey, index } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  role: text("role").default("student").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(''),
  type: text("type").notNull(),
  orderIndex: integer("order_index").notNull(),
  aiGeneratedContent: json("ai_generated_content").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").references(() => modules.id).notNull(),
  text: text("text").notNull(),
  type: text("type").notNull(), // 'mcq', 'cat', 'standard'
  options: json("options").$type<Array<{ id: string; text: string }>>().notNull(),
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation").default('').notNull(),
  difficulty: integer("difficulty").notNull(), // 1-5 scale
  aiGenerated: boolean("ai_generated").default(false).notNull(),
  topicTags: json("topic_tags").$type<string[]>().default([]),
  conceptBreakdown: json("concept_breakdown").$type<Array<{ concept: string; explanation: string }>>().default([]),
  faqs: json("faqs").$type<Array<{ question: string; answer: string }>>().default([]),
  relatedTopics: json("related_topics").$type<string[]>().default([]),
  references: json("references").$type<Array<{ title: string; url: string }>>().default([]),
  category: text("category").notNull(),
  subcategory: text("subcategory").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    moduleIdx: index("questions_module_idx").on(table.moduleId),
    categoryIdx: index("questions_category_idx").on(table.category),
  };
});

export const questionHistory = pgTable("question_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  questionId: integer("question_id").references(() => questions.id).notNull(),
  answer: text("answer").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  timeSpent: integer("time_spent").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  easeFactor: integer("ease_factor").default(250).notNull(),
  interval: integer("interval").default(1).notNull(),
  repetitions: integer("repetitions").default(0).notNull(),
  nextReview: timestamp("next_review"),
  attemptContext: json("attempt_context").$type<Record<string, any>>().default({}),
}, (table) => {
  return {
    userIdx: index("question_history_user_idx").on(table.userId),
    questionIdx: index("question_history_question_idx").on(table.questionId),
  };
});

export const studyBuddyChats = pgTable("study_buddy_chats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  sessionId: text("session_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  tone: text("tone").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => {
  return {
    sessionIdx: index("study_buddy_chats_session_idx").on(table.sessionId),
    userIdx: index("study_buddy_chats_user_idx").on(table.userId),
  };
});

export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  moduleId: integer("module_id").references(() => modules.id).notNull(),
  type: text("type").notNull(),
  answers: json("answers").$type<Array<{ questionId: number; answer: string; correct: boolean }>>().notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  aiAnalysis: json("ai_analysis").$type<Record<string, any>>(),
  strengthAreas: json("strength_areas").$type<string[]>().default([]),
  weaknessAreas: json("weakness_areas").$type<string[]>().default([]),
}, (table) => {
  return {
    userIdx: index("quiz_attempts_user_idx").on(table.userId),
    moduleIdx: index("quiz_attempts_module_idx").on(table.moduleId),
  };
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  moduleId: integer("module_id").references(() => modules.id).notNull(),
  questionId: integer("question_id").references(() => questions.id),
  totalQuestions: integer("total_questions").default(0).notNull(),
  correctAnswers: integer("correct_answers").default(0).notNull(),
  lastStudied: timestamp("last_studied"),
  studyStreak: integer("study_streak").default(0).notNull(),
  masteryLevel: integer("mastery_level").default(0).notNull(),
  easeFactor: integer("ease_factor").default(250).notNull(),
  interval: integer("interval").default(1).notNull(),
  repetitions: integer("repetitions").default(0).notNull(),
  nextReview: timestamp("next_review"),
  isCorrect: boolean("is_correct").default(false).notNull(),
  weakAreas: json("weak_areas").$type<string[]>().default([]),
  strongAreas: json("strong_areas").$type<string[]>().default([]),
  studyGoals: json("study_goals").$type<Record<string, any>>().default({}),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    userIdx: index("user_progress_user_idx").on(table.userId),
    moduleIdx: index("user_progress_module_idx").on(table.moduleId),
    questionIdx: index("user_progress_question_idx").on(table.questionId),
  };
});

// Type inference helpers
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;

export type QuestionHistory = typeof questionHistory.$inferSelect;
export type NewQuestionHistory = typeof questionHistory.$inferInsert;

export type UserProgress = typeof userProgress.$inferSelect;
export type NewUserProgress = typeof userProgress.$inferInsert;

export type StudyBuddyChat = typeof studyBuddyChats.$inferSelect;
export type NewStudyBuddyChat = typeof studyBuddyChats.$inferInsert;

// Zod validation schemas
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertQuestionSchema = createInsertSchema(questions);
export const selectQuestionSchema = createSelectSchema(questions);

export const insertQuestionHistorySchema = createInsertSchema(questionHistory);
export const selectQuestionHistorySchema = createSelectSchema(questionHistory);

export const insertUserProgressSchema = createInsertSchema(userProgress);
export const selectUserProgressSchema = createSelectSchema(userProgress);