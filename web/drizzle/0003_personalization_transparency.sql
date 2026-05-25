CREATE TABLE "user_inferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"kind" text NOT NULL,
	"claim" text NOT NULL,
	"confidence" text DEFAULT 'medium' NOT NULL,
	"evidence_memory_ids" uuid[],
	"evidence_message_ids" uuid[],
	"evidence_snippet" text,
	"state" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_surfaced_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "personalization_consent" (
	"user_id" text PRIMARY KEY NOT NULL,
	"cohort_label" text DEFAULT 'default' NOT NULL,
	"scope" text[] NOT NULL,
	"opted_in_at" timestamp NOT NULL,
	"revoked_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "sme_corrections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" uuid,
	"action" text NOT NULL,
	"original_content" text,
	"corrected_content" text,
	"rationale" text,
	"reason_code" text,
	"sme_id" text NOT NULL,
	"conversation_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_inferences" ADD CONSTRAINT "user_inferences_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "personalization_consent" ADD CONSTRAINT "personalization_consent_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "sme_corrections" ADD CONSTRAINT "sme_corrections_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "sme_corrections" ADD CONSTRAINT "sme_corrections_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "user_inferences_user_kind_idx" ON "user_inferences" USING btree ("user_id","kind","created_at");
--> statement-breakpoint
CREATE INDEX "sme_corrections_user_time_idx" ON "sme_corrections" USING btree ("user_id","created_at");
