import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import {
  accounts,
  authenticators,
  sessions,
  users,
  verificationTokens,
} from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Auth.js rejects requests when `secret` is missing or empty (ClientFetchError
 * on /api/auth/session). If AUTH_SECRET is unset, we use a fixed fallback so
 * `next build` and local dev work; set AUTH_SECRET in any deployed environment.
 */
function resolveAuthSecret(): string {
  const fromEnv = process.env.AUTH_SECRET?.trim();
  if (fromEnv) return fromEnv;

  const fallback = "dev-only-insecure-secret-not-for-production";
  if (process.env.NODE_ENV === "production") {
    console.error(
      "[auth] AUTH_SECRET is not set. Using an insecure built-in fallback so the app can build/run. Set AUTH_SECRET (openssl rand -base64 32) before real users or data.",
    );
  } else {
    console.warn(
      "[auth] AUTH_SECRET is not set; using a dev default. Add AUTH_SECRET to .env for stable sessions.",
    );
  }
  return fallback;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: resolveAuthSecret(),
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
    authenticatorsTable: authenticators,
  }),
  session: { strategy: "database" },
  providers: [
    Credentials({
      id: "guest",
      name: "Guest",
      credentials: {},
      async authorize() {
        const guestAllowed =
          process.env.ALLOW_GUEST_AUTH === "true" ||
          process.env.NODE_ENV !== "production";
        if (!guestAllowed) return null;

        const guestEmail = "guest@local.ainovel";
        const [existing] = await db
          .select({ id: users.id, name: users.name, email: users.email })
          .from(users)
          .where(eq(users.email, guestEmail))
          .limit(1);
        if (existing) {
          return {
            id: existing.id,
            name: existing.name ?? "Guest Reader",
            email: existing.email ?? guestEmail,
          };
        }

        const [created] = await db
          .insert(users)
          .values({
            name: "Guest Reader",
            email: guestEmail,
          })
          .returning({ id: users.id, name: users.name, email: users.email });

        if (!created) return null;
        return {
          id: created.id,
          name: created.name ?? "Guest Reader",
          email: created.email ?? guestEmail,
        };
      },
    }),
    ...(() => {
      const githubId = process.env.AUTH_GITHUB_ID?.trim();
      const githubSecret = process.env.AUTH_GITHUB_SECRET?.trim();
      if (!githubId || !githubSecret) return [];
      return [
        GitHub({
          clientId: githubId,
          clientSecret: githubSecret,
        }),
      ];
    })(),
  ],
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  trustHost: true,
});
