import { StoreChapterClient } from "@/components/store/store-chapter-client";

export default async function StoreChapterPage({
  params,
}: {
  params: Promise<{ seriesId: string; chapterId: string }>;
}) {
  const { seriesId, chapterId } = await params;
  return <StoreChapterClient seriesId={seriesId} chapterId={chapterId} />;
}
