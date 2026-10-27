export type PrayerKey = 'imsak' | 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export type PrayerStatus = 'passed' | 'active' | 'next' | 'upcoming';

export interface PrayerItemInfo {
  key: PrayerKey;
  label: string;
  arabicName: string;
  timeString: string; // HH:mm format, e.g. "04:28"
  dateString: string; // formatted Masehi date for this specific prayer
  hijriString: string; // formatted Hijri date
  timestamp: number; // millisecond timestamp of exact prayer time on this date
  status: PrayerStatus;
  isObligatory: boolean; // 5 fardh prayers are true, imsak & syuruq are false
}

export interface DayPrayerSchedule {
  date: string; // YYYY-MM-DD
  dateFormatted: string; // e.g. "Selasa, 27 Oktober 2026"
  hijriFormatted: string; // e.g. "16 Jumadil Awwal 1448 H"
  cityId: string;
  cityName: string;
  province: string;
  timezoneLabel: 'WIB' | 'WITA' | 'WIT';
  timezoneName: string; // e.g. "Asia/Jakarta"
  calculationSource: string; // e.g. "Kementerian Agama Republik Indonesia (Kemenag RI)"
  calculationMethod: string;
  prayers: PrayerItemInfo[];
  nextPrayer: PrayerItemInfo | null;
  secondsToNextPrayer: number;
  isCached: boolean;
  fetchedAt: number;
}

export interface PrayerNotificationSettings {
  subuh: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
  leadMinutes: number; // 0 = exactly at prayer time, 5 = 5 minutes before, 10 = 10 minutes before
  sound: 'adzan_makkah' | 'adzan_madinah' | 'soft_tone' | 'beep' | 'silent';
  vibrate: boolean;
  notificationPermission: NotificationPermission | 'unsupported';
}
