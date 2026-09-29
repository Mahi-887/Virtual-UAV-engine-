/**
 * ============================================================================
 * UAV AEROSPACE VOICE ALERT & TACTICAL SPEECH SYNTHESIS ENGINE
 * ============================================================================
 * Features:
 * 1. Web Speech API (SpeechSynthesisUtterance) with natural tactical female voice.
 * 2. Big Animated Center Alert Modal (Zoom-in / Zoom-out pulsing effect).
 * 3. Repetitive Tactical Warning Beep ("tee-tee-tee-tee") via Web Audio API.
 * 4. Manual Dismiss & Mute Controls (via UI button or 'M' key).
 * ============================================================================
 */

class SpeechAlertEngine {
  constructor() {
    this.synth = window.speechSynthesis;
    this.enabled = true;
    this.isMuted = false;
    this.lastSpokenText = "";
    this.lastSpokenTime = 0;
    this.speechCooldownMs = 4000;
    this.isSpeaking = false;
    this.voice = null;

    // Web Audio Alarm Beeper State
    this.audioCtx = null;
    this.beeperInterval = null;
    this.isAlarmBeeping = false;
    this.currentAlarmReason = null;

    // Initialize Voices
    this.initVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => this.initVoices();
    }
  }

  initVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    this.voice = voices.find(v => v.lang.includes('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Zira') || v.name.includes('Samantha'))) || voices.find(v => v.lang.includes('en')) || voices[0];
  }

  // --- 1. VOICE CALLOUT SYNTHESIS ---
  speak(text, priority = false, customCooldown = null) {
    if (!this.enabled || !this.synth) return;

    const now = Date.now();
    const cooldown = customCooldown || this.speechCooldownMs;

    if (!priority && text === this.lastSpokenText && (now - this.lastSpokenTime) < cooldown) {
      return;
    }

    if (priority) {
      this.synth.cancel();
    } else if (this.synth.speaking) {
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      if (this.voice) utterance.voice = this.voice;
      utterance.rate = 1.06;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        this.isSpeaking = true;
        this.showVoiceBubble(text);
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.hideVoiceBubble();
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        this.hideVoiceBubble();
      };

      this.lastSpokenText = text;
      this.lastSpokenTime = now;
      this.synth.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
    }
  }

  showVoiceBubble(text) {
    let bubble = document.getElementById('voiceIndicatorBubble');
    if (!bubble) {
      bubble = document.createElement('div');
      bubble.id = 'voiceIndicatorBubble';
      bubble.className = 'voice-alert-bubble';
      document.body.appendChild(bubble);
    }
    bubble.innerHTML = `<span class="voice-wave">🔊</span> <span class="voice-text">${text}</span>`;
    bubble.style.display = 'flex';

    // Auto-hide after 2.2s so it never stays stuck or blocks the background content
    clearTimeout(this.bubbleTimer);
    this.bubbleTimer = setTimeout(() => {
      this.hideVoiceBubble();
    }, 2200);
  }

  hideVoiceBubble() {
    const bubble = document.getElementById('voiceIndicatorBubble');
    if (bubble) bubble.style.display = 'none';
  }

  // --- 2. BIG CENTER ANIMATED ALERT POPUP (ZOOM-IN / ZOOM-OUT) ---
  triggerCriticalAlert(title, message, voiceText = null) {
    // Show big center alert popup
    const modal = document.getElementById('centerAlertModal');
    const titleEl = document.getElementById('centerAlertTitle');
    const descEl = document.getElementById('centerAlertDesc');

    if (modal && titleEl && descEl) {
      titleEl.textContent = title;
      descEl.textContent = message;
      modal.style.display = 'flex';

      // Automatically hide the big center popup after 4.5 seconds so player can see
      clearTimeout(this.popupHideTimer);
      this.popupHideTimer = setTimeout(() => {
        modal.style.display = 'none';
      }, 4500);
    }

    // Speak voice out loud
    this.speak(voiceText || `${title}. ${message}`, true);

    // Start persistent audio alarm beep ("tee-tee-tee")
    this.startAlarmBeeper(title);
  }

  dismissAlert() {
    const modal = document.getElementById('centerAlertModal');
    if (modal) modal.style.display = 'none';
    this.stopAlarmBeeper();
    if (this.synth) this.synth.cancel();
    this.hideVoiceBubble();
  }

  // --- 3. REPETITIVE TACTICAL ALARM BEEP ("tee-tee-tee-tee") ---
  initAudio() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtx();
    }
  }

  startAlarmBeeper(reason) {
    if (this.isMuted || this.isAlarmBeeping) return;
    this.initAudio();
    this.isAlarmBeeping = true;
    this.currentAlarmReason = reason;

    // Pulse 880 Hz tactical tone: 100ms beep every 320ms ("tee-tee-tee")
    this.beeperInterval = setInterval(() => {
      if (!this.isAlarmBeeping || this.isMuted || !this.audioCtx) return;
      try {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, this.audioCtx.currentTime); // High pitch warning tone

        gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.12);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.13);
      } catch (e) {
        console.warn("Beeper audio error:", e);
      }
    }, 320);
  }

  stopAlarmBeeper() {
    this.isAlarmBeeping = false;
    this.currentAlarmReason = null;
    if (this.beeperInterval) {
      clearInterval(this.beeperInterval);
      this.beeperInterval = null;
    }
  }

  muteToggle() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopAlarmBeeper();
      this.dismissAlert();
    }
    return this.isMuted;
  }
}

window.speechAlertEngine = new SpeechAlertEngine();
