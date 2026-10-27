import React from 'react';
import {
  BookOpen,
  Clock,
  Bookmark,
  Search,
  Volume2,
  Sparkles,
  ArrowRight,
  Compass,
  Play,
  Heart,
  Calendar,
} from 'lucide-react';
import { PrayerCard } from './PrayerCard';
import { DayPrayerSchedule, PrayerItemInfo } from '../types/prayer';
import { CityInfo } from '../config/appConfig';
import { ReadingProgress, SurahSummary } from '../types/quran';

interface HomeViewProps {
  schedule: DayPrayerSchedule | null;
  currentCity: CityInfo;
  readingProgress: ReadingProgress | null;
  popularSurahs: SurahSummary[];
  onOpenSchedule: () => void;
  onOpenCitySelector: () => void;
  onOpenAdzanSettings: () => void;
  onNavigateTab: (tab: 'beranda' | 'quran' | 'jadwal' | 'bookmark' | 'pengaturan') => void;
  onOpenSurah: (surahNumber: number, verseNumber?: number) => void;
  onOpenSearch: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  schedule,
  currentCity,
  readingProgress,
  popularSurahs,
  onOpenSchedule,
  onOpenCitySelector,
  onOpenAdzanSettings,
  onNavigateTab,
  onOpenSurah,
  onOpenSearch,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 3 && hour < 11) return 'Selamat Pagi';
    if (hour >= 11 && hour < 15) return 'Selamat Siang';
    if (hour >= 15 && hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  // Curated quick surahs (Al-Fatihah, Yasin, Al-Mulk, Al-Kahf, Ar-Rahman, Al-Waqi'ah)
  const quickSurahs = [
    { number: 1, name: 'Al-Fatihah', label: 'Pembukaan', verses: 7 },
    { number: 36, name: 'Yasin', label: 'Qalb Al-Quran', verses: 83 },
    { number: 67, name: 'Al-Mulk', label: 'Penyelamat Kubur', verses: 30 },
    { number: 18, name: 'Al-Kahf', label: 'Sunnah Jumat', verses: 110 },
    { number: 55, name: 'Ar-Rahman', label: 'Nikmat Allah', verses: 78 },
    { number: 56, name: 'Al-Waqi\'ah', label: 'Kelapangan Rezeki', verses: 96 },
  ];

  return (
    <div className="space-y-5 pb-8">
      {/* Sapaan & Digital Clock Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div>
          <span className="text-xs font-semibold text-[#08784F]">Assalamu'alaikum</span>
          <h1 className="text-xl font-extrabold text-[#09251B] sm:text-2xl">
            {getGreeting()}, Sahabat Tilawah
          </h1>
        </div>
      </div>

      {/* Main Prayer Card with Live Real-Time Countdown */}
      <PrayerCard
        schedule={schedule}
        currentCity={currentCity}
        onOpenSchedule={onOpenSchedule}
        onOpenCitySelector={onOpenCitySelector}
        onOpenAdzanSettings={onOpenAdzanSettings}
      />

      {/* Lanjutkan Membaca / Mulai Membaca Hero Card */}
      <div className="relative overflow-hidden rounded-2xl border border-[#DCE5DD] bg-white p-4 shadow-sm sm:p-5 transition hover:border-[#08784F]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#FFF4D6] text-[#064B32]">
                <BookOpen className="h-3.5 w-3.5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#064B32]">
                {readingProgress ? 'Lanjutkan Tilawah Terakhir' : 'Mulai Tilawah Al-Qur\'an'}
              </span>
            </div>

            {readingProgress ? (
              <div>
                <h3 className="text-lg font-bold text-[#09251B]">
                  Surah {readingProgress.lastSurahName}
                </h3>
                <p className="text-xs text-[#52665B]">
                  Terakhir dibaca: Ayat {readingProgress.lastVerseNumber}
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-base font-bold text-[#09251B]">
                  Belum Ada Riwayat Bacaan
                </h3>
                <p className="text-xs text-[#52665B]">
                  Mari awali hari dengan tilawah Surah Al-Fatihah atau surah pilihan Anda.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (readingProgress) {
                  onOpenSurah(readingProgress.lastSurahNumber, readingProgress.lastVerseNumber);
                } else {
                  onOpenSurah(1, 1);
                }
              }}
              className="flex items-center gap-2 rounded-xl bg-[#064B32] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#08784F]"
            >
              <span>{readingProgress ? 'Lanjutkan Membaca' : 'Buka Al-Fatihah'}</span>
              <ArrowRight className="h-4 w-4 text-[#E9B949]" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Navigation Action Grid */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <button
          onClick={() => onNavigateTab('quran')}
          className="flex flex-col items-start rounded-2xl border border-[#DCE5DD] bg-white p-3.5 text-left shadow-xs transition hover:border-[#08784F] hover:shadow-sm"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF4D6] text-[#064B32]">
            <BookOpen className="h-4 w-4" />
          </div>
          <span className="mt-2 text-xs font-bold text-[#09251B]">Daftar 114 Surah</span>
          <span className="text-[11px] text-[#52665B]">Teks Arab & Audio</span>
        </button>

        <button
          onClick={onOpenSchedule}
          className="flex flex-col items-start rounded-2xl border border-[#DCE5DD] bg-white p-3.5 text-left shadow-xs transition hover:border-[#08784F] hover:shadow-sm"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F5F7F2] text-[#064B32]">
            <Calendar className="h-4 w-4" />
          </div>
          <span className="mt-2 text-xs font-bold text-[#09251B]">Kalender Salat</span>
          <span className="text-[11px] text-[#52665B]">Jadwal Bulanan Kemenag</span>
        </button>

        <button
          onClick={() => onNavigateTab('bookmark')}
          className="flex flex-col items-start rounded-2xl border border-[#DCE5DD] bg-white p-3.5 text-left shadow-xs transition hover:border-[#08784F] hover:shadow-sm"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F5F7F2] text-[#064B32]">
            <Bookmark className="h-4 w-4" />
          </div>
          <span className="mt-2 text-xs font-bold text-[#09251B]">Bookmark & Catatan</span>
          <span className="text-[11px] text-[#52665B]">Ayat & Refleksi Anda</span>
        </button>

        <button
          onClick={onOpenSearch}
          className="flex flex-col items-start rounded-2xl border border-[#DCE5DD] bg-white p-3.5 text-left shadow-xs transition hover:border-[#08784F] hover:shadow-sm"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F5F7F2] text-[#064B32]">
            <Search className="h-4 w-4" />
          </div>
          <span className="mt-2 text-xs font-bold text-[#09251B]">Pencarian Cepat</span>
          <span className="text-[11px] text-[#52665B]">Surah & Ayat</span>
        </button>
      </div>

      {/* Surah Pilihan Cepat (Frequently Read Surahs) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#064B32]">
            Surah Pilihan Harian
          </h2>
          <button
            onClick={() => onNavigateTab('quran')}
            className="text-xs font-semibold text-[#08784F] hover:underline"
          >
            Lihat Semua (114) →
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {quickSurahs.map((item) => (
            <button
              key={item.number}
              onClick={() => onOpenSurah(item.number)}
              className="flex items-center justify-between rounded-xl border border-[#DCE5DD] bg-white p-3 text-left transition hover:border-[#064B32] hover:bg-[#FFFDF5]"
            >
              <div>
                <span className="font-bold text-xs text-[#09251B] block">{item.name}</span>
                <span className="text-[10px] text-[#52665B] block">{item.label}</span>
              </div>
              <span className="rounded bg-[#F5F7F2] px-1.5 py-0.5 text-[10px] font-mono text-[#52665B]">
                {item.verses} ay
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Inspirasi Ayat Pilihan (Tadabbur) */}
      <div className="rounded-2xl border border-[#DCE5DD] bg-[#FFFDF5] p-4 text-xs leading-relaxed space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-[#064B32]">
          <Sparkles className="h-4 w-4 text-[#E9B949]" />
          <span>Mutiara Al-Qur'an Hari Ini</span>
        </div>
        <p className="font-arabic text-base text-right text-[#064B32] py-1">
          الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُمْ بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ
        </p>
        <p className="text-[#52665B] italic">
          "(Yaitu) orang-orang yang beriman dan hati mereka menjadi tenteram dengan mengingat Allah. Ingatlah, hanya dengan mengingat Allah hati menjadi tenteram."
        </p>
        <div className="text-[11px] font-semibold text-[#064B32]">
          — QS. Ar-Ra'd [13]: 28
        </div>
      </div>
    </div>
  );
};
