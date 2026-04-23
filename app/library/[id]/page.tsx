import { StoryDetailClient } from "@/components/library/story-detail-client";

export default async function StoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StoryDetailClient id={id} />;
}
