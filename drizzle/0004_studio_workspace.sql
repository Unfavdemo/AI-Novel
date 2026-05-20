CREATE TABLE IF NOT EXISTS "studio_threads" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "title" text DEFAULT 'New chat' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "studio_messages" (
  "id" text PRIMARY KEY NOT NULL,
  "thread_id" text NOT NULL REFERENCES "studio_threads"("id") ON DELETE CASCADE,
  "role" text NOT NULL,
  "content" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "studio_agents" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "thread_id" text NOT NULL REFERENCES "studio_threads"("id") ON DELETE CASCADE,
  "story_id" text REFERENCES "stories"("id") ON DELETE SET NULL,
  "draft_body" text DEFAULT '' NOT NULL,
  "controls_json" text DEFAULT '{}' NOT NULL,
  "status" text DEFAULT 'draft' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "studio_agents_thread_id_idx" ON "studio_agents" ("thread_id");
CREATE UNIQUE INDEX IF NOT EXISTS "studio_agents_story_id_idx" ON "studio_agents" ("story_id");
