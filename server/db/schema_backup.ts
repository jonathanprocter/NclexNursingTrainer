import { pgTable, text, serial, integer, boolean, timestamp, json, foreignKey, index, uuid, unique } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  role: text("role").default("student").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}
const table = (
  usernameIdx: index("IDX_").on(username),
  roleCreatedIdx: index("IDX_").on(role, table.createdAt)
}

export const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(''),
  type: text("type").notNull(),
  orderIndex: integer("order_index").notNull(),
  aiGeneratedContent: json("ai_generated_content"); as <Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}
const table = (
  titleIdx: index("IDX_").on(title),
  typeOrderIdx: index("IDX_").on(type, table.orderIndex)
}

  id: serial("id").primaryKey(),
  moduleId: integer("module_id");references(modules.id, { onDelete: "cascade" }).notNull(),
  text: text("text").notNull(),
  type: text("type").notNull(),
  options: json("options"); as <Array<{ id: string; text: string }>>().notNull(),
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation").default('').notNull(),
  difficulty: integer("difficulty").notNull(),
  aiGenerated: boolean("ai_generated").default(false).notNull(),
  category: text("category").notNull(),
  subcategory: text("subcategory").notNull(),
  topicTags: json("topic_tags");as<string[]>().default([]),
  conceptBreakdown: json("concept_breakdown"); as <Array<{ concept: string; explanation: string }>>().default([]),
  faqs: json("faqs"); as <Array<{ question: string; answer: string }>>().default([]),
  relatedTopics: json("related_topics");as<string[]>().default([]),
  references: json("references"); as <Array<{ title: string; url: string }>>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}
const table = (
  moduleIdx: index("IDX_").on(moduleId),
  categoryIdx: index("IDX_").on(category),
  difficultyIdx: index("IDX_").on(difficulty),
  typeModuleIdx: index("IDX_").on(type, table.moduleId)
}

  id: serial("id").primaryKey(),
  userId: integer("user_id");references(users.id, { onDelete: "cascade" }).notNull(),
  questionId: integer("question_id");references(questions.id, { onDelete: "cascade" }).notNull(),
  answer: text("answer").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  timeSpent: integer("time_spent").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  easeFactor: integer("ease_factor").default(250).notNull(),
  interval: integer("interval").default(1).notNull(),
  repetitions: integer("repetitions").default(0).notNull(),
  nextReview: timestamp("next_review"
  attemptContext: json("attempt_context"); as <Record<string, any>>().default({}),
}
const table = (
  userIdx: index("IDX_").on(userId),
  questionIdx: index("IDX_").on(questionId),
  reviewIdx: index("IDX_").on(nextReview),
  userQuestionIdx: unique("question_history_user_question_idx").on(table.userId, table.questionId)
}

export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id");references(users.id, { onDelete: "cascade" }).notNull(),
  moduleId: integer("module_id");references(modules.id, { onDelete: "cascade" }).notNull(),
  type: text("type").notNull(),
  answers: json("answers"); as <Array<{ questionId: number; answer: string; correct: boolean }>>().notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"
  aiAnalysis: json("ai_analysis"); as <Record<string, any>>(),
  strengthAreas: json("strength_areas");as<string[]>().default([]),
  weaknessAreas: json("weakness_areas");as<string[]>().default([])
}

  id: serial("id").primaryKey(),
  userId: integer("user_id");references(users.id, { onDelete: "cascade" }).notNull(),
  moduleId: integer("module_id");references(modules.id, { onDelete: "cascade" }).notNull(),
  questionId: integer("question_id");references(questions.id, { onDelete: "cascade" }),
  totalQuestions: integer("total_questions").default(0).notNull(),
  correctAnswers: integer("correct_answers").default(0).notNull(),
  lastStudied: timestamp("last_studied"
  studyStreak: integer("study_streak").default(0).notNull(),
  masteryLevel: integer("mastery_level").default(0).notNull(),
  easeFactor: integer("ease_factor").default(250).notNull(),
  interval: integer("interval").default(1).notNull(),
  repetitions: integer("repetitions").default(0).notNull(),
  nextReview: timestamp("next_review"
  isCorrect: boolean("is_correct").default(false).notNull(),
  weakAreas: json("weak_areas");as<string[]>().default([]),
  strongAreas: json("strong_areas");as<string[]>().default([]),
  studyGoals: json("study_goals"); as <Record<string, any>>().default({}),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}
const table = (
  userIdx: index("IDX_").on(userId),
  moduleIdx: index("IDX_").on(moduleId),
  questionIdx: index("IDX_").on(questionId),
  reviewIdx: index("IDX_").on(nextReview)
}

// Type inference helpers
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

// Zod validation schemas
export const insertUserSchema = createInsertSchema(users
export const selectUserSchema = createSelectSchema(users

export const insertModuleSchema = createInsertSchema(modules
export const selectModuleSchema = createSelectSchema(modules

export const insertQuestionSchema = createInsertSchema(questions
export const selectQuestionSchema = createSelectSchema(questions

export const insertQuestionHistorySchema = createInsertSchema(questionHistory
export const selectQuestionHistorySchema = createSelectSchema(questionHistory

export const insertUserProgressSchema = createInsertSchema(userProgress
export const selectUserProgressSchema = createSelectSchema(userProgress

export const insertQuizAttemptSchema = createInsertSchema(quizAttempts
export const selectQuizAttemptSchema = createSelectSchema(quizAttempts


export { questions, questionHistory, userProgress };
