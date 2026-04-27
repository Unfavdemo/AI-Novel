CREATE TABLE "chapter_unlocks" (
	"user_id" text NOT NULL,
	"chapter_id" text NOT NULL,
	"unlocked_at" timestamp DEFAULT now() NOT NULL,
	"source" text DEFAULT 'stub' NOT NULL,
	CONSTRAINT "chapter_unlocks_user_id_chapter_id_pk" PRIMARY KEY("user_id","chapter_id")
);
--> statement-breakpoint
CREATE TABLE "chapters" (
	"id" text PRIMARY KEY NOT NULL,
	"story_id" text NOT NULL,
	"sort_index" integer NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"is_free_preview" boolean DEFAULT false NOT NULL,
	"price_cents" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chapter_unlocks" ADD CONSTRAINT "chapter_unlocks_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chapter_unlocks" ADD CONSTRAINT "chapter_unlocks_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "chapters_story_id_sort_idx" ON "chapters" USING btree ("story_id","sort_index");
--> statement-breakpoint
INSERT INTO "chapters" ("id", "story_id", "sort_index", "title", "body", "is_free_preview", "price_cents", "created_at", "updated_at")
SELECT
	gen_random_uuid()::text,
	s."id",
	0,
	'Chapter 1',
	s."body",
	(s."visibility" = 'public'),
	NULL,
	s."created_at",
	s."updated_at"
FROM "stories" s
WHERE NOT EXISTS (SELECT 1 FROM "chapters" c WHERE c."story_id" = s."id");