import type { NarrationAudioPlayer } from "@/lib/audio/seamlessPlayer";

/** Coordinates pause, resume, and stop for multi-segment narration. */
export class PlaybackController {
  readonly abortController = new AbortController();
  private paused = false;
  private pauseWaiters: Array<() => void> = [];
  private player: NarrationAudioPlayer | null = null;
  private audioEl: HTMLAudioElement | null = null;

  get signal(): AbortSignal {
    return this.abortController.signal;
  }

  get isAborted(): boolean {
    return this.abortController.signal.aborted;
  }

  get isPaused(): boolean {
    return this.paused;
  }

  attachPlayer(player: NarrationAudioPlayer): void {
    this.player = player;
    this.audioEl = player.getAudioElement();
  }

  pause(): void {
    if (this.isAborted) return;
    this.paused = true;
    // Pause the element directly so we never miss due to a stale player ref.
    if (this.audioEl) {
      this.audioEl.pause();
    }
    this.player?.pausePlayback();
  }

  resume(): void {
    if (this.isAborted) return;
    this.paused = false;
    this.player?.resumePlayback();
    const waiters = this.pauseWaiters.splice(0);
    for (const wake of waiters) wake();
  }

  stop(): void {
    const waiters = this.pauseWaiters.splice(0);
    for (const wake of waiters) wake();
    this.paused = false;
    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl.removeAttribute("src");
      this.audioEl.load();
    }
    this.player?.stopPlayback();
    this.player = null;
    this.audioEl = null;
    if (!this.isAborted) {
      this.abortController.abort();
    }
  }

  async waitWhilePaused(): Promise<void> {
    if (this.isAborted) {
      throw new DOMException("Aborted", "AbortError");
    }
    while (this.paused && !this.isAborted) {
      await new Promise<void>((resolve) => {
        this.pauseWaiters.push(resolve);
      });
    }
    if (this.isAborted) {
      throw new DOMException("Aborted", "AbortError");
    }
  }
}

/** Only one narration session should play audio at a time. */
let activeController: PlaybackController | null = null;

export function registerActivePlayback(controller: PlaybackController): void {
  if (activeController && activeController !== controller) {
    activeController.stop();
  }
  activeController = controller;
}

export function clearActivePlayback(controller: PlaybackController): void {
  if (activeController === controller) {
    activeController = null;
  }
}
