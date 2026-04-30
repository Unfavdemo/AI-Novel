import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

type AccountType = "oauth" | "oidc" | "email" | "credentials" | "webauthn";

/** Auth.js default table shape (PostgreSQL) */
export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (a) => ({
    compositePK: primaryKey({ columns: [a.userId, a.credentialID] }),
  }),
);

export const stories = pgTable("stories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  body: text("body").notNull(),
  visibility: text("visibility").notNull().$type<"private" | "public">(),
  genre: text("genre"),
  mood: text("mood"),
  complexity: text("complexity"),
  literarySophistication: integer("literary_sophistication"),
  narrativeTension: integer("narrative_tension"),
  targetCharacterCount: integer("target_character_count"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const storyReactions = pgTable(
  "story_reactions",
  {
    storyId: text("story_id")
      .notNull()
      .references(() => stories.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    value: text("value").notNull().$type<"like" | "dislike">(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.storyId, t.userId] }),
  }),
);

export const storyReactionsRelations = relations(storyReactions, ({ one }) => ({
  story: one(stories, { fields: [storyReactions.storyId], references: [stories.id] }),
  user: one(users, { fields: [storyReactions.userId], references: [users.id] }),
}));

export const comments = pgTable("comments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  storyId: text("story_id")
    .notNull()
    .references(() => stories.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const commentsRelations = relations(comments, ({ one }) => ({
  story: one(stories, { fields: [comments.storyId], references: [stories.id] }),
  user: one(users, { fields: [comments.userId], references: [users.id] }),
}));

export const chapters = pgTable(
  "chapters",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    storyId: text("story_id")
      .notNull()
      .references(() => stories.id, { onDelete: "cascade" }),
    sortIndex: integer("sort_index").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    isFreePreview: boolean("is_free_preview").notNull().default(false),
    priceCents: integer("price_cents"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    storySortUnique: uniqueIndex("chapters_story_id_sort_idx").on(
      t.storyId,
      t.sortIndex,
    ),
  }),
);

export const chapterUnlocks = pgTable(
  "chapter_unlocks",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    chapterId: text("chapter_id")
      .notNull()
      .references(() => chapters.id, { onDelete: "cascade" }),
    unlockedAt: timestamp("unlocked_at", { mode: "date" }).defaultNow().notNull(),
    source: text("source")
      .notNull()
      .$type<"stub" | "stripe">()
      .default("stub"),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.chapterId] }),
  }),
);

export const usageEvents = pgTable("usage_events", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  capability: text("capability").notNull().$type<"llm_generation" | "tts_synthesis">(),
  provider: text("provider").notNull(),
  model: text("model"),
  units: integer("units").notNull().default(0),
  unitType: text("unit_type").notNull().$type<"tokens" | "characters" | "seconds">(),
  metadata: text("metadata"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const chaptersRelations = relations(chapters, ({ one, many }) => ({
  story: one(stories, { fields: [chapters.storyId], references: [stories.id] }),
  unlocks: many(chapterUnlocks),
}));

export const chapterUnlocksRelations = relations(chapterUnlocks, ({ one }) => ({
  chapter: one(chapters, {
    fields: [chapterUnlocks.chapterId],
    references: [chapters.id],
  }),
  user: one(users, {
    fields: [chapterUnlocks.userId],
    references: [users.id],
  }),
}));

export const storiesRelations = relations(stories, ({ one, many }) => ({
  author: one(users, { fields: [stories.userId], references: [users.id] }),
  reactions: many(storyReactions),
  comments: many(comments),
  chapters: many(chapters),
}));

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  stories: many(stories),
  reactions: many(storyReactions),
  comments: many(comments),
  chapterUnlocks: many(chapterUnlocks),
}));
