import { APP_NAME } from "@/lib/brand";
import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <div className="mx-auto flex min-h-[55vh] w-full max-w-md flex-col justify-center px-3 py-10 sm:px-4">
      <div className="rounded-2xl border border-border-subtle bg-elevated/90 p-6 shadow-sm sm:p-8">
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-500/90">
          {APP_NAME}
        </p>
        <h1 className="mt-2 text-center text-xl font-semibold tracking-tight text-text-primary">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-center text-xs leading-relaxed text-text-muted">
            {description}
          </p>
        ) : null}
        <div className="mt-6">{children}</div>
        {footer ? <div className="mt-6 border-t border-border-subtle pt-4">{footer}</div> : null}
      </div>
    </div>
  );
}
