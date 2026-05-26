"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type PromptOptions = {
  title: string;
  description?: string;
  placeholder?: string;
  defaultValue?: string;
  submitLabel?: string;
  cancelLabel?: string;
  optional?: boolean;
  multiline?: boolean;
};

export type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

export type FormField = {
  name: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  multiline?: boolean;
};

export type FormOptions = {
  title: string;
  description?: string;
  fields: FormField[];
  submitLabel?: string;
  cancelLabel?: string;
};

type PromptRequest = PromptOptions & {
  kind: "prompt";
  resolve: (value: string | null) => void;
};

type ConfirmRequest = ConfirmOptions & {
  kind: "confirm";
  resolve: (value: boolean) => void;
};

type FormRequest = FormOptions & {
  kind: "form";
  resolve: (value: Record<string, string> | null) => void;
};

type DialogRequest = PromptRequest | ConfirmRequest | FormRequest;

type AppDialogContextValue = {
  prompt: (options: PromptOptions) => Promise<string | null>;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  form: (options: FormOptions) => Promise<Record<string, string> | null>;
};

const AppDialogContext = createContext<AppDialogContextValue | null>(null);

export function useAppDialog(): AppDialogContextValue {
  const ctx = useContext(AppDialogContext);
  if (!ctx) {
    throw new Error("useAppDialog must be used within AppDialogProvider");
  }
  return ctx;
}

function DialogShell({
  titleId,
  title,
  description,
  children,
  onCancel,
  submitLabel,
  cancelLabel,
  onSubmit,
  submitDisabled,
  destructive,
}: {
  titleId: string;
  title: string;
  description?: string;
  children?: ReactNode;
  onCancel: () => void;
  submitLabel: string;
  cancelLabel: string;
  onSubmit: () => void;
  submitDisabled?: boolean;
  destructive?: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  useEffect(() => {
    const focusable = panelRef.current?.querySelector<HTMLElement>(
      "input, textarea, button:not([disabled])",
    );
    focusable?.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-4 sm:items-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-xl border border-border-subtle bg-elevated p-6 shadow-2xl shadow-black/50"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="text-lg font-semibold text-text-primary">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-text-muted">{description}</p>
        ) : null}
        {children ? <div className="mt-4">{children}</div> : null}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border-subtle px-4 py-2 text-sm text-text-muted transition hover:bg-obsidian-900"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={submitDisabled}
            onClick={onSubmit}
            className={`rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50 ${
              destructive
                ? "bg-red-600/90 text-white hover:bg-red-500"
                : "bg-gradient-to-r from-gold-600 to-gold-400 text-on-accent hover:from-gold-500 hover:to-gold-300"
            }`}
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function ActiveDialog({
  request,
  onClose,
}: {
  request: DialogRequest;
  onClose: () => void;
}) {
  const titleId = useId();
  const [value, setValue] = useState(request.kind === "prompt" ? request.defaultValue ?? "" : "");
  const [formValues, setFormValues] = useState<Record<string, string>>(() => {
    if (request.kind !== "form") return {};
    return Object.fromEntries(
      request.fields.map((f) => [f.name, f.defaultValue ?? ""]),
    );
  });

  const cancel = useCallback(() => {
    if (request.kind === "prompt") request.resolve(null);
    else if (request.kind === "confirm") request.resolve(false);
    else request.resolve(null);
    onClose();
  }, [request, onClose]);

  if (request.kind === "confirm") {
    return (
      <DialogShell
        titleId={titleId}
        title={request.title}
        description={request.description}
        onCancel={cancel}
        cancelLabel={request.cancelLabel ?? "Cancel"}
        submitLabel={request.confirmLabel ?? "Confirm"}
        destructive={request.destructive}
        onSubmit={() => {
          request.resolve(true);
          onClose();
        }}
      />
    );
  }

  if (request.kind === "prompt") {
    const canSubmit = request.optional || value.trim().length > 0;
    const inputClass =
      "w-full rounded-lg border border-border-subtle bg-obsidian-950/80 px-3 py-2 text-sm text-text-primary outline-none ring-gold-500/30 focus:ring-2";

    return (
      <DialogShell
        titleId={titleId}
        title={request.title}
        description={request.description}
        onCancel={cancel}
        cancelLabel={request.cancelLabel ?? "Cancel"}
        submitLabel={request.submitLabel ?? "OK"}
        submitDisabled={!canSubmit}
        onSubmit={() => {
          request.resolve(value);
          onClose();
        }}
      >
        {request.multiline ? (
          <textarea
            id="app-dialog-input"
            name="value"
            rows={4}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={request.placeholder}
            className={`${inputClass} min-h-[100px] resize-y`}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                if (canSubmit) {
                  request.resolve(value);
                  onClose();
                }
              }
            }}
          />
        ) : (
          <input
            id="app-dialog-input"
            name="value"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={request.placeholder}
            className={inputClass}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canSubmit) {
                e.preventDefault();
                request.resolve(value);
                onClose();
              }
            }}
          />
        )}
      </DialogShell>
    );
  }

  const canSubmit = request.fields.every(
    (f) => !f.required || (formValues[f.name] ?? "").trim().length > 0,
  );
  const inputClass =
    "w-full rounded-lg border border-border-subtle bg-obsidian-950/80 px-3 py-2 text-sm text-text-primary outline-none ring-gold-500/30 focus:ring-2";

  return (
    <DialogShell
      titleId={titleId}
      title={request.title}
      description={request.description}
      onCancel={cancel}
      cancelLabel={request.cancelLabel ?? "Cancel"}
      submitLabel={request.submitLabel ?? "Add"}
      submitDisabled={!canSubmit}
      onSubmit={() => {
        request.resolve(formValues);
        onClose();
      }}
    >
      <div className="flex flex-col gap-3">
        {request.fields.map((field) => (
          <label key={field.name} className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-faint">
              {field.label}
            </span>
            {field.multiline ? (
              <textarea
                id={`app-dialog-${field.name}`}
                name={field.name}
                rows={4}
                value={formValues[field.name] ?? ""}
                onChange={(e) =>
                  setFormValues((prev) => ({
                    ...prev,
                    [field.name]: e.target.value,
                  }))
                }
                placeholder={field.placeholder}
                className={`${inputClass} min-h-[100px] resize-y`}
              />
            ) : (
              <input
                id={`app-dialog-${field.name}`}
                name={field.name}
                type="text"
                value={formValues[field.name] ?? ""}
                onChange={(e) =>
                  setFormValues((prev) => ({
                    ...prev,
                    [field.name]: e.target.value,
                  }))
                }
                placeholder={field.placeholder}
                className={inputClass}
              />
            )}
          </label>
        ))}
      </div>
    </DialogShell>
  );
}

export function AppDialogProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<DialogRequest | null>(null);

  const prompt = useCallback((options: PromptOptions) => {
    return new Promise<string | null>((resolve) => {
      setRequest({ kind: "prompt", ...options, resolve });
    });
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setRequest({ kind: "confirm", ...options, resolve });
    });
  }, []);

  const form = useCallback((options: FormOptions) => {
    return new Promise<Record<string, string> | null>((resolve) => {
      setRequest({ kind: "form", ...options, resolve });
    });
  }, []);

  const close = useCallback(() => setRequest(null), []);

  return (
    <AppDialogContext.Provider value={{ prompt, confirm, form }}>
      {children}
      {request ? <ActiveDialog request={request} onClose={close} /> : null}
    </AppDialogContext.Provider>
  );
}
