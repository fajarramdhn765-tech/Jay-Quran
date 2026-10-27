import React, { useEffect, useState } from 'react';
import { Clock, MapPin, ChevronRight, Bell, Sparkles } from 'lucide-react';
import { DayPrayerSchedule } from '../types/prayer';
import { CityInfo } from '../config/appConfig';

interface PrayerCardProps {
  schedule: DayPrayerSchedule | null;
  currentCity: CityInfo;
  onOpenSchedule: () => void;
  onOpenCitySelector: () => void;
  onOpenAdzanSettings: () => void;
}

export const PrayerCard: React.FC<PrayerCardProps> = ({
  schedule,
  currentCity,
  onOpenSchedule,
  onOpenCitySelector,
  onOpenAdzanSettings,
}) => {
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
  const [secondsLeft, setSecondsLeft] = useState<number>(schedule?.secondsToNextPrayer || 0);

  // Update clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format 24-hour with seconds: e.g. 14:35:42
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      setCurrentTimeStr(`${hh}:${mm}:${ss}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer toward next prayer
  useEffect(() => {
    if (!schedule?.nextPrayer) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((schedule.nextPrayer!.timestamp - now) / 1000));
      setSecondsLeft(diff);
    }, 1000);

    return () => clearInterval(timer);
  }, [schedule]);

  // Format countdown string: HH:mm:ss
  const formatCountdown = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const nextPrayer = schedule?.nextPrayer;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#064B32] via-[#08784F] to-[#09251B] p-5 text-white shadow-lg sm:p-6">
      {/* Decorative Islamic Geometric Pattern Overlay */}
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, #E9B949 10%, transparent 70%)',
        }}
      />
      <div className="pointer-events-none absolute right-4 top-4 text-white/5 font-arabic text-8xl select-none">
        الله
      </div>

      {/* Top row: City & Live Real-Time Clock */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/15 pb-4">
        <button
          onClick={onOpenCitySelector}
          className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white/95 backdrop-blur-sm transition hover:bg-white/20"
        >
          <MapPin className="h-3.5 w-3.5 text-[#E9B949]" />
          <span>{currentCity.name}</span>
          <span className="rounded bg-[#E9B949]/30 px-1.5 py-0.2 text-[10px] font-bold text-[#FFF4D6]">
            {currentCity.tzLabel}
          </span>
        </button>

        <div className="flex items-center gap-2 text-right">
          <Clock className="h-4 w-4 text-[#E9B949]" />
          <span className="font-mono text-base font-bold tracking-wider text-[#FFF4D6] sm:text-lg">
            {currentTimeStr || '00:00:00'}
          </span>
          <span className="text-xs text-white/80">{currentCity.tzLabel}</span>
        </div>
      </div>

      {/* Date info row */}
      <div className="relative z-10 mt-3 flex flex-wrap items-center justify-between text-xs text-white/80">
        <span>{schedule?.dateFormatted || 'Memuat tanggal...'}</span>
        <span className="font-medium text-[#FFF4D6]">{schedule?.hijriFormatted || ''}</span>
      </div>

      {/* Next Prayer Countdown Spotlight */}
      <div className="relative z-10 my-5 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#FFF4D6] backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5 text-[#E9B949]" />
          <span>Menuju Waktu {nextPrayer?.label || 'Salat'}</span>
        </div>

        {/* Large Countdown Display */}
        <div className="mt-2 font-mono text-4xl font-extrabold tracking-wider text-white drop-shadow-sm sm:text-5xl">
          {formatCountdown(secondsLeft)}
        </div>

        {/* Target prayer name and scheduled time */}
        <p className="mt-2 text-sm font-medium text-white/90">
          <span className="font-bold text-[#FFF4D6]">{nextPrayer?.label}</span>
          {' — '}
          <span className="font-semibold text-white">
            {nextPrayer?.timeString} {currentCity.tzLabel}
          </span>
        </p>
      </div>

      {/* Quick Prayers Horizontal Strip */}
      {schedule && (
        <div className="relative z-10 mt-2 grid grid-cols-5 gap-1.5 rounded-xl bg-black/20 p-2 backdrop-blur-sm">
          {schedule.prayers
            .filter((p) => p.isObligatory)
            .map((p) => {
              const isNext = p.status === 'next';
              const isActive = p.status === 'active';
              return (
                <div
                  key={p.key}
                  className={`flex flex-col items-center justify-center rounded-lg py-1.5 transition ${
                    isNext
                      ? 'bg-[#E9B949] text-[#09251B] font-bold shadow-md'
                      : isActive
                      ? 'bg-emerald-500/40 text-white font-semibold'
                      : 'text-white/85 hover:bg-white/10'
                  }`}
                >
                  <span className="text-[11px] leading-tight opacity-90">{p.label}</span>
                  <span className="mt-0.5 font-mono text-xs font-semibold">{p.timeString}</span>
                </div>
              );
            })}
        </div>
      )}

      {/* Bottom actions */}
      <div className="relative z-10 mt-4 flex items-center justify-between pt-2">
        <button
          onClick={onOpenAdzanSettings}
          className="flex items-center gap-1.5 text-xs text-white/80 transition hover:text-[#FFF4D6]"
        >
          <Bell className="h-3.5 w-3.5 text-[#E9B949]" />
          <span>Atur Pengingat Adzan</span>
        </button>

        <button
          onClick={onOpenSchedule}
          className="flex items-center gap-1 text-xs font-semibold text-[#FFF4D6] transition hover:text-white"
        >
          <span>Jadwal Lengkap & Kalender</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
