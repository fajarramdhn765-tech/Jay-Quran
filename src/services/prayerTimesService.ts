import { CityInfo, INDONESIA_CITIES, APP_CONFIG } from '../config/appConfig';
import { DayPrayerSchedule, PrayerItemInfo, PrayerKey, PrayerStatus } from '../types/prayer';
import { localStore } from '../storage/localStore';

export const HIJRI_MONTH_NAMES_ID = [
  'Muharram',
  'Safar',
  "Rabi'ul Awwal",
  "Rabi'ul Akhir",
  'Jumadil Awwal',
  'Jumadil Akhir',
  'Rajab',
  "Sya'ban",
  'Ramadan',
  'Syawwal',
  "Dzulqa'dah",
  'Dzulhijjah',
];

export const INDONESIAN_DAY_NAMES = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];

export const INDONESIAN_MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

// Mathematical trigonometric helpers for astronomy
const d2r = (d: number) => (d * Math.PI) / 180.0;
const r2d = (r: number) => (r * 180.0) / Math.PI;
const sin = (d: number) => Math.sin(d2r(d));
const cos = (d: number) => Math.cos(d2r(d));
const tan = (d: number) => Math.tan(d2r(d));
const arccos = (v: number) => r2d(Math.acos(Math.max(-1, Math.min(1, v))));
const arccot = (x: number) => r2d(Math.atan(1.0 / x));

/**
 * Astronomical calculation of solar position and accurate prayer times
 * following Ministry of Religious Affairs (Kemenag RI) standards:
 * Fajr: 20°, Isha: 18°, Standard Asr shadow = 1, +2 min ikhtiyat
 */
export function calculatePrayerTimesAstronomical(
  date: Date,
  lat: number,
  lng: number,
  tzOffsetHours: number,
  asrJuristic: 'standard' | 'hanafi' = 'standard',
  minuteAdjustments?: {
    imsak?: number;
    fajr?: number;
    sunrise?: number;
    dhuhr?: number;
    asr?: number;
    maghrib?: number;
    isha?: number;
  }
) {
  // Julian Day
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  let jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  jd = jd - 0.5 + 12.0 / 24.0; // at noon UTC

  const D = jd - 2451545.0;
  const g = (357.529 + 0.98560028 * D) % 360;
  const q = (280.459 + 0.98564736 * D) % 360;
  const L = (q + 1.915 * sin(g) + 0.02 * sin(2 * g)) % 360;
  const e = 23.439 - 0.00000036 * D;

  // Sun declination & Equation of Time
  const d = r2d(Math.asin(sin(e) * sin(L)));
  const RA = r2d(Math.atan2(cos(e) * sin(L), cos(L))) / 15.0;
  const EqT = q / 15.0 - RA;

  // Solar Noon (transit time) in local hours
  const solarNoon = 12 + tzOffsetHours - lng / 15.0 - EqT;

  // Hour angle helper for sun altitude angle alpha
  const hourAngle = (alpha: number) => {
    const val = (-sin(alpha) - sin(lat) * sin(d)) / (cos(lat) * cos(d));
    if (val > 1 || val < -1) return null;
    return arccos(val) / 15.0;
  };

  // Fajr angle = 20.0° (Kemenag standard)
  const fajrHA = hourAngle(20.0) || 4.2;
  // Sunrise: zenith angle 90.833° (altitude -0.833°)
  const sunriseHA = hourAngle(0.833) || 6.0;
  // Maghrib: altitude 0.833°
  const maghribHA = hourAngle(0.833) || 6.0;
  // Isha angle = 18.0° (Kemenag standard)
  const ishaHA = hourAngle(18.0) || 4.5;

  // Asr hour angle
  const shadowMultiplier = asrJuristic === 'hanafi' ? 2 : 1;
  const asrAltitude = arccot(shadowMultiplier + tan(Math.abs(lat - d)));
  const asrHA = hourAngle(-asrAltitude) || 3.5;

  const rawFajr = solarNoon - fajrHA;
  const rawSunrise = solarNoon - sunriseHA;
  const rawDhuhr = solarNoon;
  const rawAsr = solarNoon + asrHA;
  const rawMaghrib = solarNoon + maghribHA;
  const rawIsha = solarNoon + ishaHA;
  const rawImsak = rawFajr - 10 / 60; // 10 minutes before Fajr

  const toTimeObj = (decimalHours: number, extraMinutes: number = 0) => {
    let totalMinutes = Math.round(decimalHours * 60) + extraMinutes;
    while (totalMinutes < 0) totalMinutes += 24 * 60;
    while (totalMinutes >= 24 * 60) totalMinutes -= 24 * 60;
    const hh = Math.floor(totalMinutes / 60);
    const mm = totalMinutes % 60;
    return {
      hh,
      mm,
      str: `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`,
    };
  };

  const adj = {
    imsak: minuteAdjustments?.imsak ?? 0,
    fajr: minuteAdjustments?.fajr ?? 2, // +2 min ikhtiyat Kemenag
    sunrise: minuteAdjustments?.sunrise ?? -2,
    dhuhr: minuteAdjustments?.dhuhr ?? 2,
    asr: minuteAdjustments?.asr ?? 2,
    maghrib: minuteAdjustments?.maghrib ?? 2,
    isha: minuteAdjustments?.isha ?? 2,
  };

  return {
    imsak: toTimeObj(rawImsak, adj.imsak),
    fajr: toTimeObj(rawFajr, adj.fajr),
    sunrise: toTimeObj(rawSunrise, adj.sunrise),
    dhuhr: toTimeObj(rawDhuhr, adj.dhuhr),
    asr: toTimeObj(rawAsr, adj.asr),
    maghrib: toTimeObj(rawMaghrib, adj.maghrib),
    isha: toTimeObj(rawIsha, adj.isha),
  };
}

/**
 * Algorithmic Hijri calendar conversion with Indonesian Islamic calendar calibration
 */
export function getHijriDate(date: Date): { day: number; month: number; monthName: string; year: number; formatted: string } {
  const d = date.getDate();
  const m = date.getMonth();
  const y = date.getFullYear();

  let jd: number;
  if (m < 2) {
    jd = Math.floor(365.25 * (y - 1)) + Math.floor(30.6001 * (m + 13)) + d + 1720995;
  } else {
    jd = Math.floor(365.25 * y) + Math.floor(30.6001 * (m + 2)) + d + 1720995;
  }

  const b = Math.floor((y / 400)) - Math.floor((y / 100)) + Math.floor((y / 4));
  const a = Math.floor((y - 1) / 400) - Math.floor((y - 1) / 100) + Math.floor((y - 1) / 4);
  jd = jd + b - a - 1;

  // Convert to Hijri (approximate standard astronomical Umm al-Qura)
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = (Math.floor((10985 - l2) / 5316)) * (Math.floor((50 * l2) / 17719)) + (Math.floor(l2 / 5670)) * (Math.floor((43 * l2) / 15238));
  const l3 = l2 - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
  const month = Math.floor((24 * l3) / 709);
  const day = l3 - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;

  const validMonth = Math.max(1, Math.min(12, month));
  const monthName = HIJRI_MONTH_NAMES_ID[validMonth - 1] || 'Hijri';
  const formatted = `${day} ${monthName} ${year} H`;

  return {
    day,
    month: validMonth,
    monthName,
    year,
    formatted,
  };
}

/**
 * Format Gregorian date in clean Indonesian prose: "Selasa, 27 Oktober 2026"
 */
export function formatIndonesianDate(date: Date): string {
  const dayName = INDONESIAN_DAY_NAMES[date.getDay()];
  const day = date.getDate();
  const monthName = INDONESIAN_MONTH_NAMES[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName}, ${day} ${monthName} ${year}`;
}

export const prayerTimesService = {
  /**
   * Get complete schedule for a given date and city location
   */
  async getScheduleForDate(date: Date, city: CityInfo): Promise<DayPrayerSchedule> {
    const settings = localStore.getSettings();

    // Timezone offset for target city
    let tzOffsetHours = 7; // WIB
    if (city.timezone === 'Asia/Makassar') tzOffsetHours = 8; // WITA
    if (city.timezone === 'Asia/Jayapura') tzOffsetHours = 9; // WIT

    // 1. Calculate astronomical values locally (instantaneous and resilient)
    const calc = calculatePrayerTimesAstronomical(
      date,
      city.lat,
      city.lng,
      tzOffsetHours,
      settings.asrJuristic,
      settings.minuteAdjustments
    );

    const dateFormatted = formatIndonesianDate(date);
    const hijri = getHijriDate(date);

    // Build timestamps for each prayer
    const y = date.getFullYear();
    const mo = date.getMonth();
    const da = date.getDate();

    const makeTimestamp = (tObj: { hh: number; mm: number }) => {
      const pDate = new Date(y, mo, da, tObj.hh, tObj.mm, 0, 0);
      return pDate.getTime();
    };

    const imsakTs = makeTimestamp(calc.imsak);
    const fajrTs = makeTimestamp(calc.fajr);
    const sunriseTs = makeTimestamp(calc.sunrise);
    const dhuhrTs = makeTimestamp(calc.dhuhr);
    const asrTs = makeTimestamp(calc.asr);
    const maghribTs = makeTimestamp(calc.maghrib);
    const ishaTs = makeTimestamp(calc.isha);

    const now = Date.now();

    // Determine status of each prayer
    // We'll define:
    // - passed: time has elapsed (or elapsed by more than ~20 min)
    // - active: within 20 mins after prayer started
    // - next: the very next prayer to occur
    // - upcoming: future prayer today

    const rawList: {
      key: PrayerKey;
      label: string;
      arabicName: string;
      str: string;
      ts: number;
      isObligatory: boolean;
    }[] = [
      { key: 'imsak', label: 'Imsak', arabicName: 'الإمساك', str: calc.imsak.str, ts: imsakTs, isObligatory: false },
      { key: 'fajr', label: 'Subuh', arabicName: 'الفجر', str: calc.fajr.str, ts: fajrTs, isObligatory: true },
      { key: 'sunrise', label: 'Terbit / Syuruq', arabicName: 'الشروق', str: calc.sunrise.str, ts: sunriseTs, isObligatory: false },
      { key: 'dhuhr', label: 'Zuhur', arabicName: 'الظهر', str: calc.dhuhr.str, ts: dhuhrTs, isObligatory: true },
      { key: 'asr', label: 'Asar', arabicName: 'العصر', str: calc.asr.str, ts: asrTs, isObligatory: true },
      { key: 'maghrib', label: 'Magrib', arabicName: 'المغرب', str: calc.maghrib.str, ts: maghribTs, isObligatory: true },
      { key: 'isha', label: 'Isya', arabicName: 'العشاء', str: calc.isha.str, ts: ishaTs, isObligatory: true },
    ];

    // Find next obligatory prayer or next upcoming prayer
    let nextIndex = -1;
    for (let i = 0; i < rawList.length; i++) {
      if (rawList[i].ts > now) {
        nextIndex = i;
        break;
      }
    }

    const prayers: PrayerItemInfo[] = rawList.map((item, idx) => {
      let status: PrayerStatus = 'upcoming';
      if (item.ts < now - 20 * 60 * 1000) {
        status = 'passed';
      } else if (item.ts <= now && now <= item.ts + 20 * 60 * 1000) {
        status = 'active';
      } else if (idx === nextIndex) {
        status = 'next';
      } else if (item.ts > now) {
        status = 'upcoming';
      } else {
        status = 'passed';
      }

      return {
        key: item.key,
        label: item.label,
        arabicName: item.arabicName,
        timeString: item.str,
        dateString: dateFormatted,
        hijriString: hijri.formatted,
        timestamp: item.ts,
        status,
        isObligatory: item.isObligatory,
      };
    });

    let nextPrayer: PrayerItemInfo | null = null;
    let secondsToNextPrayer = 0;

    if (nextIndex !== -1) {
      nextPrayer = prayers[nextIndex];
      secondsToNextPrayer = Math.max(0, Math.floor((nextPrayer.timestamp - now) / 1000));
    } else {
      // All prayers passed for today! Next prayer is Tomorrow's Subuh!
      const tomorrow = new Date(date);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowCalc = calculatePrayerTimesAstronomical(
        tomorrow,
        city.lat,
        city.lng,
        tzOffsetHours,
        settings.asrJuristic,
        settings.minuteAdjustments
      );
      const tomorrowDateFormatted = formatIndonesianDate(tomorrow);
      const tomorrowHijri = getHijriDate(tomorrow);
      const tomorrowFajrTs = new Date(
        tomorrow.getFullYear(),
        tomorrow.getMonth(),
        tomorrow.getDate(),
        tomorrowCalc.fajr.hh,
        tomorrowCalc.fajr.mm,
        0,
        0
      ).getTime();

      nextPrayer = {
        key: 'fajr',
        label: 'Subuh (Besok)',
        arabicName: 'الفجر',
        timeString: tomorrowCalc.fajr.str,
        dateString: tomorrowDateFormatted,
        hijriString: tomorrowHijri.formatted,
        timestamp: tomorrowFajrTs,
        status: 'next',
        isObligatory: true,
      };
      secondsToNextPrayer = Math.max(0, Math.floor((tomorrowFajrTs - now) / 1000));
    }

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    return {
      date: dateStr,
      dateFormatted,
      hijriFormatted: hijri.formatted,
      cityId: city.id,
      cityName: city.name,
      province: city.province,
      timezoneLabel: city.tzLabel,
      timezoneName: city.timezone,
      calculationSource: 'Kementerian Agama Republik Indonesia (Kemenag RI / MABIMS)',
      calculationMethod: 'Sudut Subuh 20°, Isya 18°, Standar Syafi\'i/Maliki/Hambali (+2m Ikhtiyat)',
      prayers,
      nextPrayer,
      secondsToNextPrayer,
      isCached: false,
      fetchedAt: Date.now(),
    };
  },

  /**
   * Get 30/31 days schedule for a whole month
   */
  async getMonthlySchedule(year: number, monthIndex: number, city: CityInfo): Promise<DayPrayerSchedule[]> {
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const schedules: DayPrayerSchedule[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, monthIndex, day, 12, 0, 0);
      const schedule = await this.getScheduleForDate(d, city);
      schedules.push(schedule);
    }

    return schedules;
  },

  /**
   * Find nearest registered Indonesian city by coordinates
   */
  findNearestCity(lat: number, lng: number): CityInfo {
    let bestCity = INDONESIA_CITIES[0];
    let minDistance = Number.MAX_VALUE;

    for (const city of INDONESIA_CITIES) {
      const dLat = city.lat - lat;
      const dLng = city.lng - lng;
      const dist = dLat * dLat + dLng * dLng;
      if (dist < minDistance) {
        minDistance = dist;
        bestCity = city;
      }
    }

    return bestCity;
  },
};
