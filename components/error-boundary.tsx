"use client";

import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

type ErrorBoundaryState = { hasError: boolean; message?: string };

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[error-boundary]", error, info.componentStack);
  }

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <p className="text-sm font-semibold text-red-200">This section could not be displayed</p>
          <p className="mt-2 text-xs text-text-muted">
            {this.state.message ? (
              <span className="select-text break-words">{this.state.message}</span>
            ) : (
              "An unexpected error occurred."
            )}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, message: undefined })}
            className="mt-4 rounded-lg border border-border-subtle px-4 py-2 text-sm font-medium text-text-primary transition hover:border-gold-500/35 active:opacity-90"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
