/** App branding — override with NEXT_PUBLIC_APP_NAME when the product name is finalized. */
export const APP_NAME =
  process.env.NEXT_PUBLIC_APP_NAME?.trim() || "Atelier";

export const APP_TAGLINE =
  "Serialized audiobooks — read and listen chapter by chapter.";

/** Admin-only workspace at `/studio` — not shown to readers. */
export const ADMIN_WORKSPACE_NAME = "Admin";

/** @deprecated Use ADMIN_WORKSPACE_NAME */
export const CREATOR_PRODUCT_NAME = ADMIN_WORKSPACE_NAME;
