type StoryCoverProps = {
  title: string;
  coverImageUrl?: string | null;
  className?: string;
  sizes?: "card" | "thumb";
};

export function StoryCover({
  title,
  coverImageUrl,
  className = "",
  sizes = "card",
}: StoryCoverProps) {
  const height = sizes === "thumb" ? "h-24" : "h-36";

  if (coverImageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={coverImageUrl}
        alt={`Cover: ${title}`}
        className={`${height} w-full object-cover ${className}`.trim()}
      />
    );
  }

  const initial = (title.trim()[0] ?? "?").toUpperCase();
  return (
    <div
      className={`${height} flex w-full items-center justify-center bg-gradient-to-br from-elevated-2 via-elevated to-surface ${className}`.trim()}
      aria-hidden
    >
      <span className="text-3xl font-semibold text-accent/40">{initial}</span>
    </div>
  );
}
