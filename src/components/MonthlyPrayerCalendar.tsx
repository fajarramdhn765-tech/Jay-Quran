import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Printer, Sparkles, MapPin } from 'lucide-react';
import { CityInfo } from '../config/appConfig';
import { DayPrayerSchedule } from '../types/prayer';
import { prayerTimesService, INDONESIAN_MONTH_NAMES } from '../services/prayerTimesService';

interface MonthlyPrayerCalendarProps {
  currentCity: CityInfo;
  onClose?: () => void;
}

export const MonthlyPrayerCalendar: React.FC<MonthlyPrayerCalendarProps> = ({
  currentCity,
}) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate());
  const [schedules, setSchedules] = useState<DayPrayerSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    prayerTimesService.getMonthlySchedule(currentYear, currentMonth, currentCity).then((data) => {
      if (isMounted) {
        setSchedules(data);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [currentYear, currentMonth, currentCity]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleBackToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDay(today.getDate());
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedSchedule = schedules[selectedDay - 1] || schedules[0];

  return (
    <div className="space-y-4">
      {/* Month Navigation & Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#DCE5DD] bg-white p-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#064B32]" />
            <h2 className="text-base font-bold text-[#064B32]">
              Kalender Jadwal Salat Bulanan
            </h2>
          </div>
          <p className="text-xs text-[#52665B] flex items-center gap-1 mt-0.5">
            <MapPin className="h-3 w-3 text-[#08784F]" />
            {currentCity.name}, {currentCity.province} ({currentCity.tzLabel})
          </p>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={handleBackToToday}
            className="rounded-lg border border-[#DCE5DD] bg-[#F5F7F2] px-2.5 py-1.5 text-xs font-semibold text-[#064B32] transition hover:bg-[#EAEFEA]"
          >
            Hari Ini
          </button>
          <button
            onClick={handlePrint}
            className="hidden sm:flex items-center gap-1 rounded-lg border border-[#DCE5DD] bg-white px-2.5 py-1.5 text-xs font-medium text-[#52665B] transition hover:bg-[#F5F7F2]"
            title="Cetak Jadwal Bulanan"
          >
            <Printer className="h-3.5 w-3.5" /> Cetak
          </button>
          <div className="flex items-center rounded-lg border border-[#DCE5DD] bg-[#F5F7F2]">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:text-[#064B32]"
              aria-label="Bulan Sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 font-semibold text-xs text-[#09251B] min-w-[110px] text-center">
              {INDONESIAN_MONTH_NAMES[currentMonth]} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:text-[#064B32]"
              aria-label="Bulan Berikutnya"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Selected Day Feature Spotlight */}
      {selectedSchedule && (
        <div className="rounded-2xl bg-gradient-to-r from-[#064B32] to-[#08784F] p-4 text-white shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/20 pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#E9B949]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#FFF4D6]">
                Jadwal Hari Terpilih
              </span>
            </div>
            <div className="text-xs text-white/90">
              {selectedSchedule.dateFormatted} · {selectedSchedule.hijriFormatted}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-4 sm:grid-cols-7 gap-2 text-center">
            {selectedSchedule.prayers.map((p) => (
              <div key={p.key} className="rounded-xl bg-black/20 p-2 backdrop-blur-sm">
                <span className="text-[10px] text-white/80 block">{p.label}</span>
                <span className="font-mono text-sm font-bold text-white block mt-0.5">
                  {p.timeString}
                </span>
                <span className="text-[9px] text-[#FFF4D6] block">{currentCity.tzLabel}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day Selector Buttons Strip */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
        {schedules.map((s, idx) => {
          const dayNum = idx + 1;
          const isSelected = selectedDay === dayNum;
          const isToday =
            today.getDate() === dayNum &&
            today.getMonth() === currentMonth &&
            today.getFullYear() === currentYear;

          return (
            <button
              key={dayNum}
              onClick={() => setSelectedDay(dayNum)}
              className={`flex min-w-[42px] flex-col items-center justify-center rounded-xl py-2 px-1 text-xs transition ${
                isSelected
                  ? 'bg-[#064B32] text-white font-bold shadow-sm'
                  : isToday
                  ? 'bg-[#FFF4D6] text-[#064B32] font-semibold border border-[#E9B949]'
                  : 'bg-white border border-[#DCE5DD] text-[#52665B] hover:bg-[#F5F7F2]'
              }`}
            >
              <span className="text-[10px] opacity-75">Tgl</span>
              <span className="text-sm font-bold">{dayNum}</span>
              {isToday && <span className="h-1 w-1 rounded-full bg-[#E9B949]" />}
            </button>
          );
        })}
      </div>

      {/* Full Month Table (Printable and Scannable) */}
      <div className="rounded-2xl border border-[#DCE5DD] bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F7F2] text-[#09251B] border-b border-[#DCE5DD]">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Tanggal</th>
                <th className="py-2.5 px-2 font-semibold">Hijriah</th>
                <th className="py-2.5 px-2 font-semibold">Imsak</th>
                <th className="py-2.5 px-2 font-semibold">Subuh</th>
                <th className="py-2.5 px-2 font-semibold">Terbit</th>
                <th className="py-2.5 px-2 font-semibold">Zuhur</th>
                <th className="py-2.5 px-2 font-semibold">Asar</th>
                <th className="py-2.5 px-2 font-semibold">Magrib</th>
                <th className="py-2.5 px-3 font-semibold">Isya</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE5DD]">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-xs text-[#52665B]">
                    Menghitung jadwal astronomis resmi Kemenag RI...
                  </td>
                </tr>
              ) : (
                schedules.map((s, idx) => {
                  const dayNum = idx + 1;
                  const isSelected = selectedDay === dayNum;
                  const isToday =
                    today.getDate() === dayNum &&
                    today.getMonth() === currentMonth &&
                    today.getFullYear() === currentYear;

                  const pMap: Record<string, string> = {};
                  s.prayers.forEach((p) => {
                    pMap[p.key] = p.timeString;
                  });

                  return (
                    <tr
                      key={dayNum}
                      onClick={() => setSelectedDay(dayNum)}
                      className={`cursor-pointer transition ${
                        isSelected
                          ? 'bg-[#FFF4D6] font-semibold text-[#064B32]'
                          : isToday
                          ? 'bg-[#F5F7F2]'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span className="font-bold">{dayNum}</span>{' '}
                        <span className="text-[#52665B]">{INDONESIAN_MONTH_NAMES[currentMonth].slice(0, 3)}</span>
                      </td>
                      <td className="py-2 px-2 text-[#52665B] whitespace-nowrap">
                        {s.hijriFormatted.split(' ').slice(0, 2).join(' ')}
                      </td>
                      <td className="py-2 px-2 font-mono text-[#52665B]">{pMap['imsak']}</td>
                      <td className="py-2 px-2 font-mono font-medium text-[#064B32]">{pMap['fajr']}</td>
                      <td className="py-2 px-2 font-mono text-slate-500">{pMap['sunrise']}</td>
                      <td className="py-2 px-2 font-mono font-medium">{pMap['dhuhr']}</td>
                      <td className="py-2 px-2 font-mono font-medium">{pMap['asr']}</td>
                      <td className="py-2 px-2 font-mono font-bold text-amber-700">{pMap['maghrib']}</td>
                      <td className="py-2 px-3 font-mono font-medium">{pMap['isha']}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
