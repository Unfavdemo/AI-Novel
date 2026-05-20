import { redirect } from "next/navigation";

/** Legacy route — catalog is the reader home. */
export default function CustomerPage() {
  redirect("/");
}
