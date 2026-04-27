import { redirect } from "next/navigation";

/** Catalog lives at `/`; keep `/store` as a stable alias for bookmarks. */
export default function StoreIndexRedirect() {
  redirect("/");
}
