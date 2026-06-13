/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Play highly responsive sound effects using Web Audio API (Muted per user request)
class AudioSynthService {
  private ctx: AudioContext | null = null;

  private initCtx() {
    // No-op to avoid audio initialization
  }

  // Play a happy success note (Muted)
  playSuccess() {
    // Muted
  }

  // Play a bouncy "Ting" sound for selection (Muted)
  playTing() {
    // Muted
  }

  // Play a failure "Bzz" sound (Muted)
  playFail() {
    // Muted
  }

  // Play a cute pop sound for balloons (Muted)
  playPop() {
    // Muted
  }

  // Play long celebratory high-level fanfare (Muted)
  playFanfare() {
    // Muted
  }

  // Beautiful level selection click (Muted)
  playClick() {
    // Muted
  }
}

export const playSound = new AudioSynthService();
