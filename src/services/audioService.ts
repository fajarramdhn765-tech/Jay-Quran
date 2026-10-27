type AudioCallback = (state: AudioPlayerState) => void;

export interface AudioPlayerState {
  isPlaying: boolean;
  surahNumber: number | null;
  verseNumber: number | null; // null if playing full surah
  surahNameLatin: string;
  qariId: string;
  currentTime: number;
  duration: number;
  playbackRate: number;
  isLoading: boolean;
  error: string | null;
}

class AudioServiceManager {
  private audio: HTMLAudioElement | null = null;
  private listeners: Set<AudioCallback> = new Set();
  private state: AudioPlayerState = {
    isPlaying: false,
    surahNumber: null,
    verseNumber: null,
    surahNameLatin: '',
    qariId: '01',
    currentTime: 0,
    duration: 0,
    playbackRate: 1.0,
    isLoading: false,
    error: null,
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio();
      this.setupAudioListeners();
    }
  }

  private setupAudioListeners() {
    if (!this.audio) return;

    this.audio.addEventListener('play', () => {
      this.updateState({ isPlaying: true, isLoading: false, error: null });
    });

    this.audio.addEventListener('pause', () => {
      this.updateState({ isPlaying: false });
    });

    this.audio.addEventListener('waiting', () => {
      this.updateState({ isLoading: true });
    });

    this.audio.addEventListener('canplay', () => {
      this.updateState({ isLoading: false });
    });

    this.audio.addEventListener('timeupdate', () => {
      if (this.audio) {
        this.updateState({
          currentTime: this.audio.currentTime,
          duration: isNaN(this.audio.duration) ? 0 : this.audio.duration,
        });
      }
    });

    this.audio.addEventListener('ended', () => {
      this.updateState({ isPlaying: false, currentTime: 0 });
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('Audio playback error:', e);
      this.updateState({
        isPlaying: false,
        isLoading: false,
        error: 'Tidak dapat memuat berkas audio. Periksa koneksi internet.',
      });
    });
  }

  private updateState(partial: Partial<AudioPlayerState>) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((cb) => cb(this.state));
  }

  subscribe(callback: AudioCallback): () => void {
    this.listeners.add(callback);
    callback(this.state);
    return () => {
      this.listeners.delete(callback);
    };
  }

  getState(): AudioPlayerState {
    return this.state;
  }

  /**
   * Play verse audio
   */
  async playVerse(audioUrl: string, surahNumber: number, verseNumber: number, surahNameLatin: string) {
    if (!this.audio) return;

    try {
      if (
        this.state.surahNumber === surahNumber &&
        this.state.verseNumber === verseNumber &&
        this.state.isPlaying
      ) {
        this.pause();
        return;
      }

      this.updateState({
        isLoading: true,
        surahNumber,
        verseNumber,
        surahNameLatin,
        error: null,
      });

      this.audio.src = audioUrl;
      this.audio.playbackRate = this.state.playbackRate;
      await this.audio.play();
    } catch (err: unknown) {
      console.warn('Playback request failed:', err);
      this.updateState({
        isLoading: false,
        isPlaying: false,
        error: 'Gagal memutar audio ayat. Silakan coba lagi.',
      });
    }
  }

  /**
   * Play full surah audio
   */
  async playSurah(audioUrl: string, surahNumber: number, surahNameLatin: string, qariId: string = '01') {
    if (!this.audio) return;

    try {
      if (
        this.state.surahNumber === surahNumber &&
        this.state.verseNumber === null &&
        this.state.isPlaying
      ) {
        this.pause();
        return;
      }

      this.updateState({
        isLoading: true,
        surahNumber,
        verseNumber: null,
        surahNameLatin,
        qariId,
        error: null,
      });

      this.audio.src = audioUrl;
      this.audio.playbackRate = this.state.playbackRate;
      await this.audio.play();
    } catch (err: unknown) {
      console.warn('Surah playback error:', err);
      this.updateState({
        isLoading: false,
        isPlaying: false,
        error: 'Gagal memutar audio surah penuh.',
      });
    }
  }

  pause() {
    if (this.audio) {
      this.audio.pause();
    }
  }

  resume() {
    if (this.audio && this.audio.src) {
      this.audio.play().catch(() => {});
    }
  }

  seek(seconds: number) {
    if (this.audio && !isNaN(seconds)) {
      this.audio.currentTime = seconds;
    }
  }

  setPlaybackRate(rate: number) {
    if (this.audio) {
      this.audio.playbackRate = rate;
    }
    this.updateState({ playbackRate: rate });
  }

  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    this.updateState({
      isPlaying: false,
      surahNumber: null,
      verseNumber: null,
      surahNameLatin: '',
      currentTime: 0,
      duration: 0,
    });
  }

  /**
   * Play Adzan or chime alert for testing or prayer notification
   */
  playNotificationSound(soundType: 'adzan_makkah' | 'adzan_madinah' | 'soft_tone' | 'beep' | 'silent') {
    if (soundType === 'silent') return;

    if (soundType === 'beep' || soundType === 'soft_tone') {
      try {
        const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (soundType === 'soft_tone') {
          // Gentle bell chime
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
          osc.frequency.exponentialRampToValueAtTime(659.25, audioCtx.currentTime + 0.3); // E5
          gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
          osc.start();
          osc.stop(audioCtx.currentTime + 1.2);
        } else {
          // Standard beep
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, audioCtx.currentTime);
          gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.5);
        }
      } catch (e) {
        console.warn('Web Audio synthesis error:', e);
      }
      return;
    }

    // Adzan audio URL (reliable public domain / creative commons Islamic adzan)
    const adzanUrl =
      soundType === 'adzan_madinah'
        ? 'https://raw.githubusercontent.com/islamic-network/cdn/master/audio/adhan/madinah.mp3'
        : 'https://raw.githubusercontent.com/islamic-network/cdn/master/audio/adhan/makkah.mp3';

    const testAudio = new Audio(adzanUrl);
    testAudio.play().catch(() => {
      // Fallback to soft tone if network is blocked
      this.playNotificationSound('soft_tone');
    });
  }
}

export const audioService = new AudioServiceManager();
