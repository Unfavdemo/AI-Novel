import { LibraryChaptersClient } from "@/components/library/library-chapters-client";

export default async function LibraryChaptersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LibraryChaptersClient storyId={id} />;
}
