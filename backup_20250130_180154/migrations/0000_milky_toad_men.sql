CREATE TABLE IF NOT EXISTS "modules" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"type" text NOT NULL,
	"order_index" integer NOT NULL,
	"ai_generated_content" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "question_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"question_id" integer NOT NULL,
	"answer" text NOT NULL,
	"is_correct" boolean NOT NULL,
	"time_spent" integer NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"ease_factor" integer DEFAULT 250 NOT NULL,
	"interval" integer DEFAULT 1 NOT NULL,
	"repetitions" integer DEFAULT 0 NOT NULL,
	"next_review" timestamp,
	"attempt_context" json DEFAULT '{}'::json
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"module_id" integer NOT NULL,
	"text" text NOT NULL,
	"type" text NOT NULL,
	"options" json NOT NULL,
	"correct_answer" text NOT NULL,
	"explanation" text DEFAULT '' NOT NULL,
	"difficulty" integer NOT NULL,
	"ai_generated" boolean DEFAULT false NOT NULL,
	"topic_tags" json DEFAULT '[]'::json,
	"concept_breakdown" json DEFAULT '[]'::json,
	"faqs" json DEFAULT '[]'::json,
	"related_topics" json DEFAULT '[]'::json,
	"references" json DEFAULT '[]'::json,
	"category" text NOT NULL,
	"subcategory" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quiz_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"module_id" integer NOT NULL,
	"type" text NOT NULL,
	"answers" json NOT NULL,
	"score" integer NOT NULL,
	"total_questions" integer NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"ai_analysis" json,
	"strength_areas" json DEFAULT '[]'::json,
	"weakness_areas" json DEFAULT '[]'::json
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "study_buddy_chats" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"session_id" text NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"tone" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"module_id" integer NOT NULL,
	"question_id" integer,
	"total_questions" integer DEFAULT 0 NOT NULL,
	"correct_answers" integer DEFAULT 0 NOT NULL,
	"last_studied" timestamp,
	"study_streak" integer DEFAULT 0 NOT NULL,
	"mastery_level" integer DEFAULT 0 NOT NULL,
	"ease_factor" integer DEFAULT 250 NOT NULL,
	"interval" integer DEFAULT 1 NOT NULL,
	"repetitions" integer DEFAULT 0 NOT NULL,
	"next_review" timestamp,
	"is_correct" boolean DEFAULT false NOT NULL,
	"weak_areas" json DEFAULT '[]'::json,
	"strong_areas" json DEFAULT '[]'::json,
	"study_goals" json DEFAULT '{}'::json,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"role" text DEFAULT 'student' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "question_history" ADD CONSTRAINT "question_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "question_history" ADD CONSTRAINT "question_history_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "questions" ADD CONSTRAINT "questions_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "study_buddy_chats" ADD CONSTRAINT "study_buddy_chats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "question_history_user_idx" ON "question_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "question_history_question_idx" ON "question_history" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "questions_module_idx" ON "questions" USING btree ("module_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "questions_category_idx" ON "questions" USING btree ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quiz_attempts_user_idx" ON "quiz_attempts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quiz_attempts_module_idx" ON "quiz_attempts" USING btree ("module_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "study_buddy_chats_session_idx" ON "study_buddy_chats" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "study_buddy_chats_user_idx" ON "study_buddy_chats" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_progress_user_idx" ON "user_progress" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_progress_module_idx" ON "user_progress" USING btree ("module_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_progress_question_idx" ON "user_progress" USING btree ("question_id");