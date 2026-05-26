# App privacy and data inventory

This document summarizes data the **AI Novel** web application reads, stores, and transmits so you can complete **Apple App Privacy** labels, **Google Play Data safety**, and similar disclosures. It reflects the codebase as of the document’s last update; verify against production configuration before submission.

---

## 1. On-device storage (client)

| Data | Mechanism | Purpose | User control |
|------|-----------|---------|----------------|
| **Theme preference** (`light` / `dark` / `system`) | `localStorage` key `ainovel-theme` via `next-themes` | Remember UI theme between visits | Cleared if user clears site data; removed if user deletes browser profile |
| **Session token** | HTTP-only cookie(s) from Auth.js (`authjs.session-token`, possibly chunked `.0`, `.1`, …) | Keep the user signed in securely | Cleared on sign-out or account deletion; may use `__Secure-` / `__Host-` prefixes in production |

The app does **not** embed third-party advertising or analytics SDKs in the client bundle reviewed for this inventory.

---

## 2. Authentication and account data

| Data | Where stored | Purpose |
|------|--------------|---------|
| User id, email, name, optional image URL | PostgreSQL `user` table (Auth.js shape) | Identity, sign-in, profile display |
| Password hash | PostgreSQL `user.password_hash` | Email/password authentication (bcrypt) |
| OAuth-style rows | `account`, `session`, `verificationToken`, `authenticator` tables | Auth.js adapter compatibility / future providers |

**JWT session strategy:** The server issues a signed JWT stored in the session cookie; payload includes at least user id, email, and an `isAdmin` flag derived from `ADMIN_EMAIL`.

**Account deletion:** From **Account** (`/account`), an authenticated user can permanently delete their row in `user`. Related content is removed or cascaded per database foreign keys; `usage_events` rows for that user are deleted explicitly before user removal. Administrator accounts matching `ADMIN_EMAIL` cannot self-delete from the app.

---

## 3. Server-side database (PostgreSQL)

User-generated and operational data tied to accounts includes (non-exhaustive, from schema):

- **Stories / catalog:** manuscripts, visibility, metadata, cover URLs, voice cast JSON, chapters, pricing, reactions, comments.
- **Library:** shelf saves, chapter unlocks.
- **Studio (admin workspace):** threads, messages, agents, drafts.
- **Usage:** `usage_events` (capability, provider, model, units, unit type, optional metadata, timestamp) for metering; `user_id` may be null after some operations but is cleared on account deletion in the deletion flow.

Retention is **indefinite** until the user deletes their account or an operator purges data per your policy.

---

## 4. Data sent to third-party services (server-side)

All of the following occur **from your Next.js server** (not from the user’s browser directly), using environment variables for endpoints and keys:

| Service / category | Typical data | Purpose |
|--------------------|--------------|---------|
| **LLM provider** (e.g. OpenAI or configured provider) | Prompts including manuscript text, system prompts, metadata | Story generation, studio chat, listing/metadata helpers |
| **Text-to-speech** (e.g. ElevenLabs) | Text segments derived from manuscripts, voice identifiers | Audio preview and narration |
| **PostgreSQL** | All persisted app state above | Primary datastore |
| **Payments (when configured)** | Stripe or stub headers / future checkout identifiers | Paid chapter unlock verification (`PAYMENT_PROVIDER`, `STRIPE_SECRET_KEY`, etc.) |

Exact providers and fields depend on `process.env` in deployment. Review `lib/server/llm-provider.ts`, `lib/server/tts-provider.ts`, and payment code under `lib/payments/` for the authoritative list for your branch.

---

## 5. Network and logs

- **Server logs:** Errors and auth warnings may be written to `console` / hosting logs (e.g. failed sign-in, JWT issues, delete failures). Avoid logging secrets; rotate keys if logs are broad.
- **HTTPS:** Production should terminate TLS at the host or edge so cookies and payloads are encrypted in transit.

---

## 6. Permissions and special access

- **Administrator:** Users whose email matches `ADMIN_EMAIL` receive `isAdmin` in the session and can access `/studio` and related APIs. This is a **role**, not collected from the device beyond email used at sign-in.

---

## 7. Viewport and accessibility note (store review)

The app sets **viewport** metadata to disable user pinch-zoom (`userScalable: false`) for a native-like WebView shell. Some jurisdictions or reviewers prefer allowing zoom for accessibility; revisit if you receive review feedback.

---

## 8. Change log

- Initial inventory added for mobile WebView / store compliance work (account deletion, error boundaries, privacy documentation).

When you add analytics, push notifications, or crash reporting, append a new subsection here and update store forms accordingly.
