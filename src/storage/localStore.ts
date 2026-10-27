import { BookmarkItem, VerseNoteItem, ReadingProgress, ReadingHistoryItem } from '../types/quran';
import { PrayerNotificationSettings } from '../types/prayer';
import { CityInfo, INDONESIA_CITIES, APP_CONFIG } from '../config/appConfig';

const KEYS = {
  BOOKMARKS: 'jayz_quran_bookmarks_v1',
  VERSE_NOTES: 'jayz_quran_verse_notes_v1',
  READING_PROGRESS: 'jayz_quran_progress_v1',
  READING_HISTORY: 'jayz_quran_history_v1',
  USER_SETTINGS: 'jayz_quran_settings_v1',
  SELECTED_CITY: 'jayz_quran_selected_city_v1',
  NOTIFICATION_SETTINGS: 'jayz_quran_notifications_v1',
  CUSTOM_COORDINATES: 'jayz_quran_custom_coords_v1',
};

export interface AppUserSettings {
  arabicFontSize: number;
  translationFontSize: number;
  arabicFont: string;
  showTranslation: boolean;
  showTransliteration: boolean;
  autoScrollSpeed: number;
  selectedQari: string;
  darkMode: boolean;
  calculationMethod: string;
  asrJuristic: 'standard' | 'hanafi';
  minuteAdjustments: {
    imsak: number;
    fajr: number;
    sunrise: number;
    dhuhr: number;
    asr: number;
    maghrib: number;
    isha: number;
  };
}

export const localStore = {
  // Bookmarks
  getBookmarks(): BookmarkItem[] {
    try {
      const data = localStorage.getItem(KEYS.BOOKMARKS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveBookmarks(bookmarks: BookmarkItem[]): void {
    try {
      localStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    } catch (e) {
      console.error('Failed to save bookmarks:', e);
    }
  },
  toggleBookmark(item: BookmarkItem): boolean {
    const list = this.getBookmarks();
    const index = list.findIndex((b) => b.id === item.id);
    if (index >= 0) {
      list.splice(index, 1);
      this.saveBookmarks(list);
      return false; // removed
    } else {
      list.unshift(item);
      this.saveBookmarks(list);
      return true; // added
    }
  },
  isBookmarked(id: string): boolean {
    const list = this.getBookmarks();
    return list.some((b) => b.id === id);
  },

  // Verse Notes
  getVerseNotes(): VerseNoteItem[] {
    try {
      const data = localStorage.getItem(KEYS.VERSE_NOTES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  getNoteForVerse(surahNumber: number, verseNumber: number): VerseNoteItem | undefined {
    const list = this.getVerseNotes();
    const id = `${surahNumber}:${verseNumber}`;
    return list.find((n) => n.id === id);
  },
  saveVerseNote(note: VerseNoteItem): void {
    const list = this.getVerseNotes();
    const index = list.findIndex((n) => n.id === note.id);
    if (index >= 0) {
      if (!note.noteText.trim()) {
        list.splice(index, 1);
      } else {
        list[index] = note;
      }
    } else if (note.noteText.trim()) {
      list.unshift(note);
    }
    try {
      localStorage.setItem(KEYS.VERSE_NOTES, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save verse notes:', e);
    }
  },
  deleteVerseNote(id: string): void {
    const list = this.getVerseNotes().filter((n) => n.id !== id);
    try {
      localStorage.setItem(KEYS.VERSE_NOTES, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to delete verse note:', e);
    }
  },

  // Reading Progress
  getReadingProgress(): ReadingProgress | null {
    try {
      const data = localStorage.getItem(KEYS.READING_PROGRESS);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  saveReadingProgress(surahNumber: number, surahName: string, verseNumber: number): void {
    const current = this.getReadingProgress();
    const updated: ReadingProgress = {
      lastSurahNumber: surahNumber,
      lastSurahName: surahName,
      lastVerseNumber: verseNumber,
      lastReadAt: Date.now(),
      totalVersesReadSession: (current?.totalVersesReadSession || 0) + 1,
    };
    try {
      localStorage.setItem(KEYS.READING_PROGRESS, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save reading progress:', e);
    }
    // Also log to history
    this.addReadingHistory({
      surahNumber,
      surahNameLatin: surahName,
      verseNumber,
      timestamp: Date.now(),
    });
  },

  // Reading History
  getReadingHistory(): ReadingHistoryItem[] {
    try {
      const data = localStorage.getItem(KEYS.READING_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  addReadingHistory(item: ReadingHistoryItem): void {
    const list = this.getReadingHistory();
    // Keep max 50 recent items, de-duplicate if same surah and verse within 5 minutes
    const filtered = list.filter(
      (h) => !(h.surahNumber === item.surahNumber && h.verseNumber === item.verseNumber && Math.abs(h.timestamp - item.timestamp) < 300000)
    );
    filtered.unshift(item);
    if (filtered.length > 50) filtered.length = 50;
    try {
      localStorage.setItem(KEYS.READING_HISTORY, JSON.stringify(filtered));
    } catch (e) {
      console.error('Failed to save history:', e);
    }
  },
  clearReadingHistory(): void {
    localStorage.removeItem(KEYS.READING_HISTORY);
  },

  // App Settings
  getSettings(): AppUserSettings {
    try {
      const data = localStorage.getItem(KEYS.USER_SETTINGS);
      if (data) {
        return { ...APP_CONFIG.defaultSettings, ...JSON.parse(data) };
      }
    } catch (e) {
      console.error('Failed to read settings:', e);
    }
    return { ...APP_CONFIG.defaultSettings };
  },
  saveSettings(settings: AppUserSettings): void {
    try {
      localStorage.setItem(KEYS.USER_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  },

  // Selected City Location
  getSelectedCity(): CityInfo {
    try {
      const data = localStorage.getItem(KEYS.SELECTED_CITY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to read selected city:', e);
    }
    return INDONESIA_CITIES[0]; // Default to Jakarta
  },
  saveSelectedCity(city: CityInfo): void {
    try {
      localStorage.setItem(KEYS.SELECTED_CITY, JSON.stringify(city));
    } catch (e) {
      console.error('Failed to save selected city:', e);
    }
  },

  // Notification Settings
  getNotificationSettings(): PrayerNotificationSettings {
    const defaults: PrayerNotificationSettings = {
      subuh: true,
      dhuhr: true,
      asr: true,
      maghrib: true,
      isha: true,
      leadMinutes: 0,
      sound: 'adzan_makkah',
      vibrate: true,
      notificationPermission: typeof Notification !== 'undefined' ? Notification.permission : 'unsupported',
    };
    try {
      const data = localStorage.getItem(KEYS.NOTIFICATION_SETTINGS);
      if (data) {
        return { ...defaults, ...JSON.parse(data) };
      }
    } catch (e) {
      console.error('Failed to read notification settings:', e);
    }
    return defaults;
  },
  saveNotificationSettings(settings: PrayerNotificationSettings): void {
    try {
      localStorage.setItem(KEYS.NOTIFICATION_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save notification settings:', e);
    }
  },

  // Export and import backup data
  exportBackupData(): string {
    const backup = {
      version: APP_CONFIG.version,
      exportedAt: new Date().toISOString(),
      bookmarks: this.getBookmarks(),
      verseNotes: this.getVerseNotes(),
      readingProgress: this.getReadingProgress(),
      readingHistory: this.getReadingHistory(),
      settings: this.getSettings(),
      selectedCity: this.getSelectedCity(),
      notifications: this.getNotificationSettings(),
    };
    return JSON.stringify(backup, null, 2);
  },
  importBackupData(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.bookmarks) this.saveBookmarks(parsed.bookmarks);
      if (parsed.verseNotes) localStorage.setItem(KEYS.VERSE_NOTES, JSON.stringify(parsed.verseNotes));
      if (parsed.readingProgress) localStorage.setItem(KEYS.READING_PROGRESS, JSON.stringify(parsed.readingProgress));
      if (parsed.settings) this.saveSettings(parsed.settings);
      if (parsed.selectedCity) this.saveSelectedCity(parsed.selectedCity);
      if (parsed.notifications) this.saveNotificationSettings(parsed.notifications);
      return true;
    } catch (e) {
      console.error('Failed to import backup:', e);
      return false;
    }
  },
};
