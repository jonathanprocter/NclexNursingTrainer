import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  json,
  foreignKey,
  index,
  uuid,
  unique,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";

// ------------------------------------------------------------------
// USERS
// ------------------------------------------------------------------
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  role: text("role").default("student").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    usernameIdx: index("IDX_users_username").on(table.username),
    roleCreatedIdx: index("IDX_users_role_createdat").on(table.role, table.createdAt),
  };
});

// ------------------------------------------------------------------
// MODULES
// ------------------------------------------------------------------
export const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").default("").notNull(),
  type: text("type").notNull(),
  orderIndex: integer("order_index").notNull(),

  // Example: Drizzle JSON with typed access
  aiGeneratedContent: json("ai_generated_content").$type<Record<string, any>>(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    titleIdx: index("IDX_modules_title").on(table.title),
    typeOrderIdx: index("IDX_modules_type_order").on(table.type, table.orderIndex),
  };
});

// ------------------------------------------------------------------
// QUESTIONS
// ------------------------------------------------------------------
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").references(() => modules.id, { onDelete: "cascade" }).notNull(),
  text: text("text").notNull(),
  type: text("type").notNull(),

  // Example Drizzle JSON columns with typed arrays
  options: json("options").$type<Array<{ id: string; text: string }>>().notNull(),
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation").default("").notNull(),
  difficulty: integer("difficulty").notNull(),
  aiGenerated: boolean("ai_generated").default(false).notNull(),
  category: text("category").notNull(),
  subcategory: text("subcategory").notNull(),

  topicTags: json("topic_tags").$type<string[]>().default([]),
  conceptBreakdown: json("concept_breakdown").$type<Array<{ concept: string; explanation: string }>>().default([]),
  faqs: json("faqs").$type<Array<{ question: string; answer: string }>>().default([]),
  relatedTopics: json("related_topics").$type<string[]>().default([]),
  references: json("references").$type<Array<{ title: string; url: string }>>().default([]),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    moduleIdx: index("IDX_questions_module").on(table.moduleId),
    categoryIdx: index("IDX_questions_category").on(table.category),
    difficultyIdx: index("IDX_questions_difficulty").on(table.difficulty),
    typeModuleIdx: index("IDX_questions_type_module").on(table.type, table.moduleId),
  };
});

// ------------------------------------------------------------------
// QUESTION HISTORY
// ------------------------------------------------------------------
export const questionHistory = pgTable("question_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  questionId: integer("question_id").references(() => questions.id, { onDelete: "cascade" }).notNull(),
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
    userIdx: index("IDX_questionhistory_user").on(table.userId),
    questionIdx: index("IDX_questionhistory_question").on(table.questionId),
    reviewIdx: index("IDX_questionhistory_review").on(table.nextReview),
    userQuestionIdx: unique("question_history_user_question_idx").on(table.userId, table.questionId),
  };
});

// ------------------------------------------------------------------
// QUIZ ATTEMPTS
// ------------------------------------------------------------------
export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  moduleId: integer("module_id").references(() => modules.id, { onDelete: "cascade" }).notNull(),
  type: text("type").notNull(),

  // Drizzle typed JSON array
  answers: json("answers").$type<Array<{ questionId: number; answer: string; correct: boolean }>>().notNull(),

  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),

  aiAnalysis: json("ai_analysis").$type<Record<string, any>>(),
  strengthAreas: json("strength_areas").$type<string[]>().default([]),
  weaknessAreas: json("weakness_areas").$type<string[]>().default([]),
}, 
// If you have any indexes or constraints:
(table) => {
  // Example: return { quizAttemptIdx: index("IDX_quiz_attempt").on(table.userId) };
  // If not, just return {}
  return {};
});

// ------------------------------------------------------------------
// USER PROGRESS
// ------------------------------------------------------------------
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  moduleId: integer("module_id").references(() => modules.id, { onDelete: "cascade" }).notNull(),
  questionId: integer("question_id").references(() => questions.id, { onDelete: "cascade" }),

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
    userIdx: index("IDX_userprogress_user").on(table.userId),
    moduleIdx: index("IDX_userprogress_module").on(table.moduleId),
    questionIdx: index("IDX_userprogress_question").on(table.questionId),
    reviewIdx: index("IDX_userprogress_review").on(table.nextReview),
  };
});

// ------------------------------------------------------------------
// Type inference helpers
// ------------------------------------------------------------------
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Module = typeof modules.$inferSelect;
export type NewModule = typeof modules.$inferInsert;

export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;

export type QuestionHistory = typeof questionHistory.$inferSelect;
export type NewQuestionHistory = typeof questionHistory.$inferInsert;

export type UserProgress = typeof userProgress.$inferSelect;
export type NewUserProgress = typeof userProgress.$inferInsert;

export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type NewQuizAttempt = typeof quizAttempts.$inferInsert;

// ------------------------------------------------------------------
// Zod validation schemas
// ------------------------------------------------------------------
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertModuleSchema = createInsertSchema(modules);
export const selectModuleSchema = createSelectSchema(modules);

export const insertQuestionSchema = createInsertSchema(questions);
export const selectQuestionSchema = createSelectSchema(questions);

export const insertQuestionHistorySchema = createInsertSchema(questionHistory);
export const selectQuestionHistorySchema = createSelectSchema(questionHistory);

export const insertUserProgressSchema = createInsertSchema(userProgress);
export const selectUserProgressSchema = createSelectSchema(userProgress);

export const insertQuizAttemptSchema = createInsertSchema(quizAttempts);
export const selectQuizAttemptSchema = createSelectSchema(quizAttempts);

// ------------------------------------------------------------------
// Example re-exports (optional; adjust as needed):
// ------------------------------------------------------------------
export { questions, questionHistory, userProgress };