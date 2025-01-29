import { pgTable, text, serial, integer, boolean, timestamp, json, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  role: text("role").notNull().default("student"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const studyBuddyChats = pgTable("study_buddy_chats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  sessionId: text("session_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  tone: text("tone").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  orderIndex: integer("order_index").notNull(),
  aiGeneratedContent: json("ai_generated_content"),
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
  conceptBreakdown: json("concept_breakdown"), // Array of concept explanations
  faqs: json("faqs"), // Frequently asked questions about this topic
  relatedTopics: json("related_topics"), // Array of related NCLEX topics
  references: json("references"), // Study material references
  category: text("category"), // NCLEX category
  subcategory: text("subcategory"), // Specific topic within category
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const questionHistory = pgTable("question_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  questionId: integer("question_id").references(() => questions.id),
  answer: text("answer").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  timeSpent: integer("time_spent"), // Time spent in seconds
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  // Spaced repetition fields
  easeFactor: integer("ease_factor").default(250), // Multiplied by 100 to store as integer
  interval: integer("interval").default(1),
  repetitions: integer("repetitions").default(0),
  nextReview: timestamp("next_review"),
  // Analytics fields
  attemptContext: json("attempt_context"), // Additional context about the attempt
});

export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  moduleId: integer("module_id").references(() => modules.id),
  type: text("type").notNull(),
  answers: json("answers").notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  aiAnalysis: json("ai_analysis"),
  strengthAreas: json("strength_areas"),
  weaknessAreas: json("weakness_areas"),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  moduleId: integer("module_id").references(() => modules.id),
  questionId: integer("question_id").references(() => questions.id),
  totalQuestions: integer("total_questions").default(0),
  correctAnswers: integer("correct_answers").default(0),
  lastStudied: timestamp("last_studied"),
  studyStreak: integer("study_streak").default(0),
  masteryLevel: integer("mastery_level").default(0), // 0-100
  // Spaced repetition fields
  easeFactor: integer("ease_factor").default(250), // Multiplied by 100 to store as integer
  interval: integer("interval").default(1),
  repetitions: integer("repetitions").default(0),
  nextReview: timestamp("next_review"),
  isCorrect: boolean("is_correct").default(false),
  // Analytics fields
  weakAreas: json("weak_areas"), // Array of topics needing review
  strongAreas: json("strong_areas"), // Array of mastered topics
  studyGoals: json("study_goals"), // User's study goals and progress
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Schemas for TypeScript inference
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;

export type QuestionHistory = typeof questionHistory.$inferSelect;
export type NewQuestionHistory = typeof questionHistory.$inferInsert;

export type UserProgress = typeof userProgress.$inferSelect;
export type NewUserProgress = typeof userProgress.$inferInsert;

export type SelectStudyBuddyChat = typeof studyBuddyChats.$inferSelect;

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertQuestionSchema = createInsertSchema(questions);
export const selectQuestionSchema = createSelectSchema(questions);

export const insertQuestionHistorySchema = createInsertSchema(questionHistory);
export const selectQuestionHistorySchema = createSelectSchema(questionHistory);

export const insertUserProgressSchema = createInsertSchema(userProgress);
export const selectUserProgressSchema = createSelectSchema(userProgress);