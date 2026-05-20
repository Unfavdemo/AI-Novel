ALTER TABLE "stories" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE "stories" ADD COLUMN IF NOT EXISTS "keywords" text;
ALTER TABLE "stories" ADD COLUMN IF NOT EXISTS "categories" text;
ALTER TABLE "stories" ADD COLUMN IF NOT EXISTS "cover_image_url" text;

ALTER TABLE "studio_agents" ADD COLUMN IF NOT EXISTS "metadata_json" text DEFAULT '{}' NOT NULL;
