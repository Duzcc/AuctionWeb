/**
 * Sound Effects Utility for Auction Room
 * Manages audio playback for various auction events
 */

class SoundEffects {
    constructor() {
        this.sounds = {
            bid: null,
            warning: null,
            success: null,
            end: null,
            message: null,
        };
        this.enabled = true;
        this.volume = 0.5;

        // Initialize sounds
        this.initSounds();
    }

    initSounds() {
        // Create Audio objects with data URIs (short beep sounds)
        // In production, these would be actual audio files

        // Bid sound - short beep
        this.sounds.bid = this.createBeep(800, 0.1, 'sine');

        // Warning sound - urgent beep
        this.sounds.warning = this.createBeep(1200, 0.2, 'square');

        // Success sound - pleasant chime
        this.sounds.success = this.createBeep(600, 0.15, 'sine');

        // End sound - lower tone
        this.sounds.end = this.createBeep(400, 0.3, 'sine');

        // Message sound - subtle notification
        this.sounds.message = this.createBeep(500, 0.08, 'sine');
    }

    /**
     * Create a simple beep sound using Web Audio API
     */
    createBeep(frequency, duration, type = 'sine') {
        return () => {
            if (!this.enabled) return;

            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = frequency;
                oscillator.type = type;

                gainNode.gain.setValueAtTime(this.volume, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + duration);
            } catch (error) {
                console.error('Error playing sound:', error);
            }
        };
    }

    /**
     * Play bid placed sound
     */
    playBidSound() {
        this.sounds.bid?.();
    }

    /**
     * Play warning sound (auction ending soon)
     */
    playWarningSound() {
        this.sounds.warning?.();
    }

    /**
     * Play success sound (bid accepted)
     */
    playSuccessSound() {
        this.sounds.success?.();
    }

    /**
     * Play auction end sound
     */
    playEndSound() {
        this.sounds.end?.();
    }

    /**
     * Play new message sound
     */
    playMessageSound() {
        this.sounds.message?.();
    }

    /**
     * Enable/disable sounds
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    /**
     * Set volume (0.0 to 1.0)
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    /**
     * Check if sounds are enabled
     */
    isEnabled() {
        return this.enabled;
    }
}

// Create singleton instance
const soundEffects = new SoundEffects();

export default soundEffects;

// Named exports for convenience
export const {
    playBidSound,
    playWarningSound,
    playSuccessSound,
    playEndSound,
    playMessageSound,
    setEnabled,
    setVolume,
    isEnabled,
} = soundEffects;
