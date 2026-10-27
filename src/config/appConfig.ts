export interface CityInfo {
  id: string;
  name: string;
  province: string;
  lat: number;
  lng: number;
  timezone: 'Asia/Jakarta' | 'Asia/Makassar' | 'Asia/Jayapura';
  tzLabel: 'WIB' | 'WITA' | 'WIT';
}

export const APP_CONFIG = {
  name: "Jay'z Quran",
  tagline: 'Temukan Kedamaian dalam Tilawah',
  version: '1.2.0',
  author: "Jay'z Studio",
  description: "Aplikasi Al-Qur'an Digital, Jadwal Salat, Adzan, Kalender Hijriah, dan PWA Mobile",
  apis: {
    equranBase: 'https://equran.id/api/v2',
    aladhanBase: 'https://api.aladhan.com/v1',
  },
  colors: {
    primaryEmerald: '#064B32',
    emeraldLight: '#08784F',
    forestDark: '#09251B',
    royalGold: '#E9B949',
    warmIvory: '#FFF4D6',
    appBg: '#FFFDF5',
    surface: '#FFFFFF',
    surfaceMuted: '#F5F7F2',
    textPrimary: '#09251B',
    textSecondary: '#52665B',
    border: '#DCE5DD',
  },
  availableQaris: [
    { id: '01', name: 'Misyari Rasyid Al-Afasy' },
    { id: '02', name: 'Abdullah Al-Juhany' },
    { id: '03', name: 'Abdurrahman As-Sudais' },
    { id: '04', name: 'Ibrahim Al-Dossari' },
    { id: '05', name: 'Mahmud Khalil Al-Husari' },
  ],
  availableArabicFonts: [
    { id: 'Amiri', name: 'Amiri (Standar Mushaf Madinah)', family: "'Amiri', serif" },
    { id: 'Scheherazade', name: 'Scheherazade New (Naskh Indonesia)', family: "'Scheherazade New', serif" },
  ],
  defaultSettings: {
    arabicFontSize: 28,
    translationFontSize: 15,
    arabicFont: 'Amiri',
    showTranslation: true,
    showTransliteration: true,
    autoScrollSpeed: 30, // px per second
    selectedQari: '01',
    darkMode: false,
    calculationMethod: '20', // Kemenag RI
    asrJuristic: 'standard' as 'standard' | 'hanafi', // Shafi'i, Maliki, Hanbali (standard) vs Hanafi
    minuteAdjustments: {
      imsak: 0,
      fajr: 2, // Standar ikhtiyat Kemenag (+2 menit)
      sunrise: -2,
      dhuhr: 2,
      asr: 2,
      maghrib: 2,
      isha: 2,
    },
  },
};

export const INDONESIA_CITIES: CityInfo[] = [
  { id: 'jakarta', name: 'DKI Jakarta', province: 'DKI Jakarta', lat: -6.2088, lng: 106.8456, timezone: 'Asia/Jakarta', tzLabel: 'WIB' },
  { id: 'surabaya', name: 'Surabaya', province: 'Jawa Timur', lat: -7.2575, lng: 112.7521, timezone: 'Asia/Jakarta', tzLabel: 'WIB' },
  { id: 'bandung', name: 'Bandung', province: 'Jawa Barat', lat: -6.9175, lng: 107.6191, timezone: 'Asia/Jakarta', tzLabel: 'WIB' },
  { id: 'medan', name: 'Medan', province: 'Sumatera Utara', lat: 3.5952, lng: 98.6722, timezone: 'Asia/Jakarta', tzLabel: 'WIB' },
  { id: 'semarang', name: 'Semarang', province: 'Jawa Tengah', lat: -6.9667, lng: 110.4167, timezone: 'Asia/Jakarta', tzLabel: 'WIB' },
  { id: 'makassar', name: 'Makassar', province: 'Sulawesi Selatan', lat: -5.1477, lng: 119.4327, timezone: 'Asia/Makassar', tzLabel: 'WITA' },
  { id: 'palembang', name: 'Palembang', province: 'Sumatera Selatan', lat: -2.9761, lng: 104.7754, timezone: 'Asia/Jakarta', tzLabel: 'WIB' },
  { id: 'yogyakarta', name: 'Yogyakarta', province: 'DI Yogyakarta', lat: -7.7956, lng: 110.3695, timezone: 'Asia/Jakarta', tzLabel: 'WIB' },
  { id: 'denpasar', name: 'Denpasar', province: 'Bali', lat: -8.6705, lng: 115.2126, timezone: 'Asia/Makassar', tzLabel: 'WITA' },
  { id: 'banda-aceh', name: 'Banda Aceh', province: 'Aceh', lat: 5.5483, lng: 95.3238, timezone: 'Asia/Jakarta', tzLabel: 'WIB' },
  { id: 'padang', name: 'Padang', province: 'Sumatera Barat', lat: -0.9471, lng: 100.4172, timezone: 'Asia/Jakarta', tzLabel: 'WIB' },
  { id: 'pekanbaru', name: 'Pekanbaru', province: 'Riau', lat: 0.5071, lng: 101.4478, timezone: 'Asia/Jakarta', tzLabel: 'WIB' },
  { id: 'pontianak', name: 'Pontianak', province: 'Kalimantan Barat', lat: -0.0263, lng: 109.3425, timezone: 'Asia/Jakarta', tzLabel: 'WIB' },
  { id: 'banjarmasin', name: 'Banjarmasin', province: 'Kalimantan Selatan', lat: -3.3194, lng: 114.5908, timezone: 'Asia/Makassar', tzLabel: 'WITA' },
  { id: 'balikpapan', name: 'Balikpapan', province: 'Kalimantan Timur', lat: -1.2379, lng: 116.8529, timezone: 'Asia/Makassar', tzLabel: 'WITA' },
  { id: 'samarinda', name: 'Samarinda', province: 'Kalimantan Timur', lat: -0.5022, lng: 117.1536, timezone: 'Asia/Makassar', tzLabel: 'WITA' },
  { id: 'manado', name: 'Manado', province: 'Sulawesi Utara', lat: 1.4748, lng: 124.8421, timezone: 'Asia/Makassar', tzLabel: 'WITA' },
  { id: 'mataram', name: 'Mataram (Lombok)', province: 'Nusa Tenggara Barat', lat: -8.5833, lng: 116.1167, timezone: 'Asia/Makassar', tzLabel: 'WITA' },
  { id: 'kupang', name: 'Kupang', province: 'Nusa Tenggara Timur', lat: -10.1772, lng: 123.607, timezone: 'Asia/Makassar', tzLabel: 'WITA' },
  { id: 'ambon', name: 'Ambon', province: 'Maluku', lat: -3.6547, lng: 128.1906, timezone: 'Asia/Jayapura', tzLabel: 'WIT' },
  { id: 'jayapura', name: 'Jayapura', province: 'Papua', lat: -2.5337, lng: 140.7181, timezone: 'Asia/Jayapura', tzLabel: 'WIT' },
  { id: 'sorong', name: 'Sorong', province: 'Papua Barat Daya', lat: -0.8762, lng: 131.2558, timezone: 'Asia/Jayapura', tzLabel: 'WIT' },
  { id: 'bekasi', name: 'Bekasi', province: 'Jawa Barat', lat: -6.2383, lng: 106.9756, timezone: 'Asia/Jakarta', tzLabel: 'WIB' },
  { id: 'tangerang', name: 'Tangerang', province: 'Banten', lat: -6.1783, lng: 106.6319, timezone: 'Asia/Jakarta', tzLabel: 'WIB' },
  { id: 'depok', name: 'Depok', province: 'Jawa Barat', lat: -6.4025, lng: 106.7942, timezone: 'Asia/Jakarta', tzLabel: 'WIB' },
  { id: 'bogor', name: 'Bogor', province: 'Jawa Barat', lat: -6.5971, lng: 106.806, timezone: 'Asia/Jakarta', tzLabel: 'WIB' },
  { id: 'malang', name: 'Malang', province: 'Jawa Timur', lat: -7.9666, lng: 112.6326, timezone: 'Asia/Jakarta', tzLabel: 'WIB' },
  { id: 'solo', name: 'Surakarta (Solo)', province: 'Jawa Tengah', lat: -7.5755, lng: 110.8243, timezone: 'Asia/Jakarta', tzLabel: 'WIB' },
  { id: 'cirebon', name: 'Cirebon', province: 'Jawa Barat', lat: -6.732, lng: 108.5523, timezone: 'Asia/Jakarta', tzLabel: 'WIB' },
  { id: 'serang', name: 'Serang', province: 'Banten', lat: -6.1104, lng: 106.164, timezone: 'Asia/Jakarta', tzLabel: 'WIB' },
  { id: 'jambi', name: 'Jambi', province: 'Jambi', lat: -1.6101, lng: 103.6131, timezone: 'Asia/Jakarta', tzLabel: 'WIB' },
  { id: 'bengkulu', name: 'Bengkulu', province: 'Bengkulu', lat: -3.8004, lng: 102.2655, timezone: 'Asia/Jakarta', tzLabel: 'WIB' },
  { id: 'bandar-lampung', name: 'Bandar Lampung', province: 'Lampung', lat: -5.45, lng: 105.2667, timezone: 'Asia/Jakarta', tzLabel: 'WIB' },
  { id: 'palu', name: 'Palu', province: 'Sulawesi Tengah', lat: -0.9003, lng: 119.878, timezone: 'Asia/Makassar', tzLabel: 'WITA' },
  { id: 'kendari', name: 'Kendari', province: 'Sulawesi Tenggara', lat: -3.9985, lng: 122.5126, timezone: 'Asia/Makassar', tzLabel: 'WITA' },
  { id: 'gorontalo', name: 'Gorontalo', province: 'Gorontalo', lat: 0.5435, lng: 123.0568, timezone: 'Asia/Makassar', tzLabel: 'WITA' },
  { id: 'makkah', name: 'Makkah Al-Mukarramah', province: 'Arab Saudi', lat: 21.3891, lng: 39.8579, timezone: 'Asia/Jakarta', tzLabel: 'WIB' },
  { id: 'madinah', name: 'Madinah Al-Munawwarah', province: 'Arab Saudi', lat: 24.5247, lng: 39.5692, timezone: 'Asia/Jakarta', tzLabel: 'WIB' },
];
