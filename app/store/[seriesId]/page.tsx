import { StoreSeriesClient } from "@/components/store/store-series-client";

export default async function StoreSeriesPage({
  params,
}: {
  params: Promise<{ seriesId: string }>;
}) {
  const { seriesId } = await params;
  return <StoreSeriesClient seriesId={seriesId} />;
}
