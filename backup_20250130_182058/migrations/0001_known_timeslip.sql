ALTER TABLE "question_history" DROP CONSTRAINT "question_history_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "question_history" DROP CONSTRAINT "question_history_question_id_questions_id_fk";
--> statement-breakpoint
ALTER TABLE "questions" DROP CONSTRAINT "questions_module_id_modules_id_fk";
--> statement-breakpoint
ALTER TABLE "quiz_attempts" DROP CONSTRAINT "quiz_attempts_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "quiz_attempts" DROP CONSTRAINT "quiz_attempts_module_id_modules_id_fk";
--> statement-breakpoint
ALTER TABLE "study_buddy_chats" DROP CONSTRAINT "study_buddy_chats_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_progress" DROP CONSTRAINT "user_progress_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_progress" DROP CONSTRAINT "user_progress_module_id_modules_id_fk";
--> statement-breakpoint
ALTER TABLE "user_progress" DROP CONSTRAINT "user_progress_question_id_questions_id_fk";
--> statement-breakpoint
ALTER TABLE "user_progress" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "modules" ADD COLUMN "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD COLUMN "completed_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "question_history" ADD CONSTRAINT "question_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "question_history" ADD CONSTRAINT "question_history_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "questions" ADD CONSTRAINT "questions_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "study_buddy_chats" ADD CONSTRAINT "study_buddy_chats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "title_idx" ON "modules" USING btree ("title");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "type_order_idx" ON "modules" USING btree ("type","order_index");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "question_history_review_idx" ON "question_history" USING btree ("next_review");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "questions_difficulty_idx" ON "questions" USING btree ("difficulty");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "questions_type_module_idx" ON "questions" USING btree ("type","module_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quiz_attempts_score_idx" ON "quiz_attempts" USING btree ("score");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quiz_attempts_user_module_idx" ON "quiz_attempts" USING btree ("user_id","module_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "study_buddy_chats_timestamp_idx" ON "study_buddy_chats" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_progress_review_idx" ON "user_progress" USING btree ("next_review");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "role_created_idx" ON "users" USING btree ("role","created_at");--> statement-breakpoint
ALTER TABLE "question_history" ADD CONSTRAINT "question_history_user_question_idx" UNIQUE("user_id","question_id");--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_module_idx" UNIQUE("user_id","module_id");