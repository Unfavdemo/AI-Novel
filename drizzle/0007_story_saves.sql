CREATE TABLE IF NOT EXISTS "story_saves" (
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "story_id" text NOT NULL REFERENCES "stories"("id") ON DELETE CASCADE,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "story_saves_user_id_story_id_pk" PRIMARY KEY("user_id","story_id")
);
