import { StoreCatalogClient } from "@/components/store/store-catalog-client";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense fallback={null}>
      <StoreCatalogClient />
    </Suspense>
  );
}
