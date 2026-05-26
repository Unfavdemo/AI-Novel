import { StoryCover } from "@/components/story/story-cover";
import Link from "next/link";

export type ShelfBookItem = {
  id: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  genre: string | null;
  authorName: string | null;
  unlockedChapterCount: number;
  totalChapterCount: number;
  savedAt: string | null;
  lastUnlockedAt: string | null;
};

export function ShelfBookCard({
  book,
  badge,
}: {
  book: ShelfBookItem;
  badge: string;
}) {
  const progress =
    book.totalChapterCount > 0
      ? `${book.unlockedChapterCount} of ${book.totalChapterCount} chapters unlocked`
      : null;

  return (
    <li className="flex h-full flex-col overflow-hidden rounded-xl border border-border-subtle bg-elevated/50 transition hover:border-gold-500/25 hover:shadow-md hover:shadow-black/20">
      <Link href={`/store/${book.id}`} className="flex flex-1 flex-col">
        <StoryCover title={book.title} coverImageUrl={book.coverImageUrl} />
        <div className="flex flex-1 flex-col p-3">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-gold-500/90">
            {badge}
          </span>
          <span className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-text-primary">
            {book.title}
          </span>
          {book.authorName ? (
            <p className="mt-0.5 text-[11px] text-text-faint">{book.authorName}</p>
          ) : null}
          {book.description ? (
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-text-muted">
              {book.description}
            </p>
          ) : null}
          {progress ? (
            <p className="mt-2 text-[11px] text-text-faint">{progress}</p>
          ) : null}
          {book.genre ? (
            <p className="mt-1 text-[10px] text-text-faint">{book.genre}</p>
          ) : null}
        </div>
      </Link>
      <div className="border-t border-border-subtle px-3 py-2">
        <Link
          href={`/store/${book.id}`}
          className="inline-flex text-xs font-semibold text-accent hover:underline"
        >
          Continue reading →
        </Link>
      </div>
    </li>
  );
}
