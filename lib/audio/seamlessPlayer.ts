import type { PlaybackController } from "@/lib/audio/playbackController";

/** Reuses one HTMLAudioElement and preloads the next clip to shorten gaps between TTS chunks. */
export class NarrationAudioPlayer {
  private readonly el: HTMLAudioElement;
  private readonly preloadEl: HTMLAudioElement;
  private objectUrl: string | null = null;
  private preloadedUrl: string | null = null;
  private onEnded: (() => void) | null = null;
  private onError: (() => void) | null = null;
  private playSettled = false;
  private pausePollId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.el = new Audio();
    this.el.preload = "auto";
    this.preloadEl = new Audio();
    this.preloadEl.preload = "auto";
  }

  getAudioElement(): HTMLAudioElement {
    return this.el;
  }

  /** Decode the next segment while the current one plays. */
  warmNext(buffer: ArrayBuffer): void {
    this.revokePreloaded();
    this.preloadedUrl = URL.createObjectURL(
      new Blob([buffer], { type: "audio/mpeg" }),
    );
    this.preloadEl.src = this.preloadedUrl;
    this.preloadEl.load();
  }

  play(
    buffer: ArrayBuffer,
    signal?: AbortSignal,
    controller?: PlaybackController,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (signal?.aborted) {
        reject(new DOMException("Aborted", "AbortError"));
        return;
      }

      this.playSettled = false;
      this.clearPausePoll();
      this.revokeUrl();

      if (this.preloadedUrl) {
        this.objectUrl = this.preloadedUrl;
        this.preloadedUrl = null;
        this.el.src = this.objectUrl;
        this.preloadEl.removeAttribute("src");
      } else {
        this.objectUrl = URL.createObjectURL(
          new Blob([buffer], { type: "audio/mpeg" }),
        );
        this.el.src = this.objectUrl;
      }

      const settle = (fn: () => void) => {
        if (this.playSettled) return;
        this.playSettled = true;
        this.clearPausePoll();
        this.detachListeners();
        fn();
      };

      const onAbort = () => {
        this.el.pause();
        settle(() => reject(new DOMException("Aborted", "AbortError")));
      };

      this.onEnded = () => {
        signal?.removeEventListener("abort", onAbort);
        settle(resolve);
      };
      this.onError = () => {
        signal?.removeEventListener("abort", onAbort);
        this.revokeUrl();
        settle(() => reject(new Error("Audio playback failed")));
      };

      this.el.addEventListener("ended", this.onEnded);
      this.el.addEventListener("error", this.onError);
      signal?.addEventListener("abort", onAbort, { once: true });

      if (controller) {
        this.pausePollId = setInterval(() => {
          if (controller.isPaused) {
            this.pausePlayback();
          }
        }, 50);
      }

      void this.el.play().catch((err) => {
        signal?.removeEventListener("abort", onAbort);
        settle(() =>
          reject(err instanceof Error ? err : new Error("Playback failed")),
        );
      });
    });
  }

  pausePlayback(): void {
    this.el.pause();
  }

  resumePlayback(): void {
    if (this.el.src && this.el.paused && !this.playSettled) {
      void this.el.play().catch(() => {
        /* ignore — user may have stopped */
      });
    }
  }

  stopPlayback(): void {
    this.playSettled = true;
    this.clearPausePoll();
    this.detachListeners();
    this.el.pause();
    this.el.removeAttribute("src");
    this.el.load();
    this.revokeUrl();
    this.revokePreloaded();
  }

  private clearPausePoll(): void {
    if (this.pausePollId !== null) {
      clearInterval(this.pausePollId);
      this.pausePollId = null;
    }
  }

  private detachListeners(): void {
    if (this.onEnded) {
      this.el.removeEventListener("ended", this.onEnded);
      this.onEnded = null;
    }
    if (this.onError) {
      this.el.removeEventListener("error", this.onError);
      this.onError = null;
    }
  }

  private revokeUrl(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
  }

  private revokePreloaded(): void {
    if (this.preloadedUrl) {
      URL.revokeObjectURL(this.preloadedUrl);
      this.preloadedUrl = null;
    }
    this.preloadEl.removeAttribute("src");
  }
}

export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const timer = window.setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      window.clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}
