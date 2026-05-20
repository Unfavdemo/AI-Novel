import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className = "",
}: PageHeaderProps) {
  return (
    <div
      className={`flex flex-col gap-3 border-b border-border-subtle pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4 ${className}`.trim()}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-500/90">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-text-muted sm:text-[13px]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
