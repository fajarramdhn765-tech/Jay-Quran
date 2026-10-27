import React from 'react';
import { Sun, Sunset, Sunrise, Moon, CloudSun, AlertCircle, Sparkles, ChevronRight } from 'lucide-react';
import { DayPrayerSchedule, PrayerItemInfo, PrayerKey } from '../types/prayer';

interface PrayerScheduleListProps {
  schedule: DayPrayerSchedule;
  onSelectPrayer: (prayer: PrayerItemInfo) => void;
}

export const PrayerScheduleList: React.FC<PrayerScheduleListProps> = ({
  schedule,
  onSelectPrayer,
}) => {
  const getPrayerIcon = (key: PrayerKey) => {
    switch (key) {
      case 'imsak':
        return <AlertCircle className="h-4 w-4 text-[#E9B949]" />;
      case 'fajr':
        return <Sunrise className="h-4 w-4 text-[#08784F]" />;
      case 'sunrise':
        return <Sun className="h-4 w-4 text-[#E9B949]" />;
      case 'dhuhr':
        return <Sun className="h-4 w-4 text-amber-500" />;
      case 'asr':
        return <CloudSun className="h-4 w-4 text-emerald-600" />;
      case 'maghrib':
        return <Sunset className="h-4 w-4 text-orange-500" />;
      case 'isha':
        return <Moon className="h-4 w-4 text-[#064B32]" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'next':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#064B32] px-2.5 py-0.5 text-[11px] font-semibold text-[#FFF4D6]">
            <Sparkles className="h-3 w-3 text-[#E9B949]" />
            Berikutnya
          </span>
        );
      case 'active':
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 animate-pulse">
            Sedang Berlangsung
          </span>
        );
      case 'upcoming':
        return (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
            Akan Datang
          </span>
        );
      case 'passed':
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-normal text-slate-400">
            Sudah Lewat
          </span>
        );
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1 text-xs text-[#52665B]">
        <span>Waktu Salat & Ibadah</span>
        <span>{schedule.cityName} ({schedule.timezoneLabel})</span>
      </div>

      <div className="divide-y divide-[#DCE5DD] rounded-2xl border border-[#DCE5DD] bg-white overflow-hidden shadow-sm">
        {schedule.prayers.map((prayer) => {
          const isNext = prayer.status === 'next';

          return (
            <button
              key={prayer.key}
              onClick={() => onSelectPrayer(prayer)}
              className={`flex w-full items-center justify-between p-3.5 text-left transition ${
                isNext
                  ? 'bg-[#FFF4D6]/50 hover:bg-[#FFF4D6]/70'
                  : 'hover:bg-[#F5F7F2]'
              }`}
            >
              {/* Left column: Icon, Name, Arabic name */}
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    isNext ? 'bg-[#064B32] text-[#E9B949]' : 'bg-[#F5F7F2] text-[#064B32]'
                  }`}
                >
                  {getPrayerIcon(prayer.key)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${isNext ? 'text-[#064B32]' : 'text-[#09251B]'}`}>
                      {prayer.label}
                    </span>
                    <span className="font-arabic text-sm text-[#52665B]/80 font-normal">
                      {prayer.arabicName}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#52665B]">
                    {prayer.dateString} · {prayer.hijriString}
                  </p>
                </div>
              </div>

              {/* Right column: Time, Status, Arrow */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-mono text-base font-bold text-[#09251B]">
                    {prayer.timeString} <span className="text-xs font-normal text-[#52665B]">{schedule.timezoneLabel}</span>
                  </div>
                  <div className="mt-0.5">{getStatusBadge(prayer.status)}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-[#52665B]/60" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
