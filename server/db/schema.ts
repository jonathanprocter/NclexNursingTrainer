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


export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type QuestionHistory = typeof questionHistory.$inferSelect;
export type NewQuestionHistory = typeof questionHistory.$inferInsert;
export type Module = typeof modules.$inferSelect;
export type NewModule = typeof modules.$inferInsert;

// Zod validation schemas
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertModuleSchema = createInsertSchema(modules);
export const selectModuleSchema = createSelectSchema(modules);