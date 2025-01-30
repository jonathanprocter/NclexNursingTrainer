"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectQuizAttemptSchema = exports.insertQuizAttemptSchema = exports.selectUserProgressSchema = exports.insertUserProgressSchema = exports.selectQuestionHistorySchema = exports.insertQuestionHistorySchema = exports.selectQuestionSchema = exports.insertQuestionSchema = exports.selectModuleSchema = exports.insertModuleSchema = exports.selectUserSchema = exports.insertUserSchema = exports.userProgress = exports.quizAttempts = exports.studyBuddyChats = exports.questionHistory = exports.questions = exports.modules = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const drizzle_orm_1 = require("drizzle-orm");
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    username: (0, pg_core_1.text)("username").unique().notNull(),
    password: (0, pg_core_1.text)("password").notNull(),
    role: (0, pg_core_1.text)("role").default("student").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
    usernameIdx: (0, pg_core_1.index)("username_idx").on(table.username),
    roleCreatedIdx: (0, pg_core_1.index)("role_created_idx").on(table.role, table.createdAt)
}));
exports.modules = (0, pg_core_1.pgTable)("modules", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    title: (0, pg_core_1.text)("title").notNull(),
    description: (0, pg_core_1.text)("description").notNull().default(''),
    type: (0, pg_core_1.text)("type").notNull(),
    orderIndex: (0, pg_core_1.integer)("order_index").notNull(),
    aiGeneratedContent: (0, pg_core_1.json)("ai_generated_content").$type(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
    titleIdx: (0, pg_core_1.index)("title_idx").on(table.title),
    typeOrderIdx: (0, pg_core_1.index)("type_order_idx").on(table.type, table.orderIndex)
}));
exports.questions = (0, pg_core_1.pgTable)("questions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    moduleId: (0, pg_core_1.integer)("module_id").references(() => exports.modules.id, { onDelete: 'cascade' }).notNull(),
    text: (0, pg_core_1.text)("text").notNull(),
    type: (0, pg_core_1.text)("type").notNull(),
    options: (0, pg_core_1.json)("options").$type().notNull(),
    correctAnswer: (0, pg_core_1.text)("correct_answer").notNull(),
    explanation: (0, pg_core_1.text)("explanation").default('').notNull(),
    difficulty: (0, pg_core_1.integer)("difficulty").notNull(),
    aiGenerated: (0, pg_core_1.boolean)("ai_generated").default(false).notNull(),
    category: (0, pg_core_1.text)("category").notNull(),
    subcategory: (0, pg_core_1.text)("subcategory").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
    moduleIdx: (0, pg_core_1.index)("questions_module_idx").on(table.moduleId),
    categoryIdx: (0, pg_core_1.index)("questions_category_idx").on(table.category),
    difficultyIdx: (0, pg_core_1.index)("questions_difficulty_idx").on(table.difficulty),
    typeModuleIdx: (0, pg_core_1.index)("questions_type_module_idx").on(table.type, table.moduleId)
}));
exports.questionHistory = (0, pg_core_1.pgTable)("question_history", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(() => exports.users.id, { onDelete: 'cascade' }).notNull(),
    questionId: (0, pg_core_1.integer)("question_id").references(() => exports.questions.id, { onDelete: 'cascade' }).notNull(),
    answer: (0, pg_core_1.text)("answer").notNull(),
    isCorrect: (0, pg_core_1.boolean)("is_correct").notNull(),
    timeSpent: (0, pg_core_1.integer)("time_spent").notNull(),
    timestamp: (0, pg_core_1.timestamp)("timestamp").defaultNow().notNull(),
    easeFactor: (0, pg_core_1.integer)("ease_factor").default(250).notNull(),
    interval: (0, pg_core_1.integer)("interval").default(1).notNull(),
    repetitions: (0, pg_core_1.integer)("repetitions").default(0).notNull(),
    nextReview: (0, pg_core_1.timestamp)("next_review"),
    attemptContext: (0, pg_core_1.json)("attempt_context").$type().default({}),
}, (table) => ({
    userIdx: (0, pg_core_1.index)("question_history_user_idx").on(table.userId),
    questionIdx: (0, pg_core_1.index)("question_history_question_idx").on(table.questionId),
    reviewIdx: (0, pg_core_1.index)("question_history_review_idx").on(table.nextReview),
    userQuestionIdx: (0, pg_core_1.unique)("question_history_user_question_idx").on(table.userId, table.questionId)
}));
exports.studyBuddyChats = (0, pg_core_1.pgTable)("study_buddy_chats", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(() => exports.users.id, { onDelete: 'cascade' }).notNull(),
    sessionId: (0, pg_core_1.text)("session_id").notNull(),
    role: (0, pg_core_1.text)("role").notNull(),
    content: (0, pg_core_1.text)("content").notNull(),
    tone: (0, pg_core_1.text)("tone").notNull(),
    timestamp: (0, pg_core_1.timestamp)("timestamp").defaultNow().notNull(),
}, (table) => ({
    sessionIdx: (0, pg_core_1.index)("study_buddy_chats_session_idx").on(table.sessionId),
    userIdx: (0, pg_core_1.index)("study_buddy_chats_user_idx").on(table.userId),
    timestampIdx: (0, pg_core_1.index)("study_buddy_chats_timestamp_idx").on(table.timestamp)
}));
exports.quizAttempts = (0, pg_core_1.pgTable)("quiz_attempts", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(() => exports.users.id, { onDelete: 'cascade' }).notNull(),
    moduleId: (0, pg_core_1.integer)("module_id").references(() => exports.modules.id, { onDelete: 'cascade' }).notNull(),
    type: (0, pg_core_1.text)("type").notNull(),
    answers: (0, pg_core_1.json)("answers").$type().notNull(),
    score: (0, pg_core_1.integer)("score").notNull(),
    totalQuestions: (0, pg_core_1.integer)("total_questions").notNull(),
    startedAt: (0, pg_core_1.timestamp)("started_at").defaultNow().notNull(),
    completedAt: (0, pg_core_1.timestamp)("completed_at"),
    aiAnalysis: (0, pg_core_1.json)("ai_analysis").$type(),
    strengthAreas: (0, pg_core_1.json)("strength_areas").$type().default([]),
    weaknessAreas: (0, pg_core_1.json)("weakness_areas").$type().default([])
});
exports.userProgress = (0, pg_core_1.pgTable)("user_progress", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(() => exports.users.id, { onDelete: 'cascade' }).notNull(),
    moduleId: (0, pg_core_1.integer)("module_id").references(() => exports.modules.id, { onDelete: 'cascade' }).notNull(),
    questionId: (0, pg_core_1.integer)("question_id").references(() => exports.questions.id, { onDelete: 'set null' }),
    totalQuestions: (0, pg_core_1.integer)("total_questions").default(0).notNull(),
    correctAnswers: (0, pg_core_1.integer)("correct_answers").default(0).notNull(),
    lastStudied: (0, pg_core_1.timestamp)("last_studied"),
    studyStreak: (0, pg_core_1.integer)("study_streak").default(0).notNull(),
    masteryLevel: (0, pg_core_1.integer)("mastery_level").default(0).notNull(),
    easeFactor: (0, pg_core_1.integer)("ease_factor").default(250).notNull(),
    interval: (0, pg_core_1.integer)("interval").default(1).notNull(),
    repetitions: (0, pg_core_1.integer)("repetitions").default(0).notNull(),
    nextReview: (0, pg_core_1.timestamp)("next_review"),
    isCorrect: (0, pg_core_1.boolean)("is_correct").default(false).notNull(),
    weakAreas: (0, pg_core_1.json)("weak_areas").$type().default([]),
    strongAreas: (0, pg_core_1.json)("strong_areas").$type().default([]),
    studyGoals: (0, pg_core_1.json)("study_goals").$type().default({}),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
    userIdx: (0, pg_core_1.index)("user_progress_user_idx").on(table.userId),
    moduleIdx: (0, pg_core_1.index)("user_progress_module_idx").on(table.moduleId),
    questionIdx: (0, pg_core_1.index)("user_progress_question_idx").on(table.questionId),
    reviewIdx: (0, pg_core_1.index)("user_progress_review_idx").on(table.nextReview),
    userModuleIdx: (0, pg_core_1.unique)("user_progress_user_module_idx").on(table.userId, table.moduleId)
}));
// Zod validation schemas with enhanced validation
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users);
exports.selectUserSchema = (0, drizzle_zod_1.createSelectSchema)(exports.users);
exports.insertModuleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.modules);
exports.selectModuleSchema = (0, drizzle_zod_1.createSelectSchema)(exports.modules);
exports.insertQuestionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.questions);
exports.selectQuestionSchema = (0, drizzle_zod_1.createSelectSchema)(exports.questions);
exports.insertQuestionHistorySchema = (0, drizzle_zod_1.createInsertSchema)(exports.questionHistory);
exports.selectQuestionHistorySchema = (0, drizzle_zod_1.createSelectSchema)(exports.questionHistory);
exports.insertUserProgressSchema = (0, drizzle_zod_1.createInsertSchema)(exports.userProgress);
exports.selectUserProgressSchema = (0, drizzle_zod_1.createSelectSchema)(exports.userProgress);
exports.insertQuizAttemptSchema = (0, drizzle_zod_1.createInsertSchema)(exports.quizAttempts);
exports.selectQuizAttemptSchema = (0, drizzle_zod_1.createSelectSchema)(exports.quizAttempts);
