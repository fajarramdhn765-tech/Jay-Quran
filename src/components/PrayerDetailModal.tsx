import React, { useState } from 'react';
import { X, Bell, BellOff, Volume2, ShieldCheck, MapPin, Calendar, Clock } from 'lucide-react';
import { PrayerItemInfo, DayPrayerSchedule } from '../types/prayer';
import { localStore } from '../storage/localStore';
import { audioService } from '../services/audioService';

interface PrayerDetailModalProps {
  prayer: PrayerItemInfo | null;
  schedule: DayPrayerSchedule;
  onClose: () => void;
}

export const PrayerDetailModal: React.FC<PrayerDetailModalProps> = ({
  prayer,
  schedule,
  onClose,
}) => {
  if (!prayer) return null;

  const [notifications, setNotifications] = useState(localStore.getNotificationSettings());

  const isAlarmEnabled = () => {
    switch (prayer.key) {
      case 'fajr':
        return notifications.subuh;
      case 'dhuhr':
        return notifications.dhuhr;
      case 'asr':
        return notifications.asr;
      case 'maghrib':
        return notifications.maghrib;
      case 'isha':
        return notifications.isha;
      default:
        return false;
    }
  };

  const toggleAlarm = () => {
    const updated = { ...notifications };
    switch (prayer.key) {
      case 'fajr':
        updated.subuh = !updated.subuh;
        break;
      case 'dhuhr':
        updated.dhuhr = !updated.dhuhr;
        break;
      case 'asr':
        updated.asr = !updated.asr;
        break;
      case 'maghrib':
        updated.maghrib = !updated.maghrib;
        break;
      case 'isha':
        updated.isha = !updated.isha;
        break;
    }
    setNotifications(updated);
    localStore.saveNotificationSettings(updated);
  };

  const handleTestSound = () => {
    audioService.playNotificationSound(notifications.sound);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-6 text-[#09251B] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#DCE5DD] pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#064B32] text-[#FFF4D6]">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#064B32]">
                Detail Waktu {prayer.label}
              </h3>
              <p className="text-xs text-[#52665B]">{prayer.arabicName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#F5F7F2] text-[#52665B]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Big Time Display */}
        <div className="my-5 rounded-xl bg-[#FFFDF5] border border-[#DCE5DD] p-4 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#52665B]">
            Jadwal Masuk Waktu
          </span>
          <div className="mt-1 font-mono text-4xl font-extrabold text-[#064B32]">
            {prayer.timeString}{' '}
            <span className="text-lg font-bold text-[#52665B]">{schedule.timezoneLabel}</span>
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#FFF4D6] px-3 py-1 text-xs font-semibold text-[#09251B]">
            Status: {prayer.status === 'next' ? 'Salat Berikutnya' : prayer.status === 'active' ? 'Sedang Berlangsung' : prayer.status === 'upcoming' ? 'Akan Datang' : 'Sudah Lewat'}
          </div>
        </div>

        {/* Detailed Metadata Grid */}
        <div className="space-y-3 text-xs">
          <div className="flex items-start justify-between rounded-lg bg-[#F5F7F2] p-2.5">
            <span className="flex items-center gap-1.5 text-[#52665B]">
              <Calendar className="h-3.5 w-3.5 text-[#08784F]" /> Tanggal Masehi:
            </span>
            <span className="font-semibold text-right text-[#09251B]">{prayer.dateString}</span>
          </div>

          <div className="flex items-start justify-between rounded-lg bg-[#F5F7F2] p-2.5">
            <span className="flex items-center gap-1.5 text-[#52665B]">
              <Calendar className="h-3.5 w-3.5 text-[#E9B949]" /> Tanggal Hijriah:
            </span>
            <span className="font-semibold text-right text-[#09251B]">{prayer.hijriString}</span>
          </div>

          <div className="flex items-start justify-between rounded-lg bg-[#F5F7F2] p-2.5">
            <span className="flex items-center gap-1.5 text-[#52665B]">
              <MapPin className="h-3.5 w-3.5 text-[#064B32]" /> Wilayah & Zona:
            </span>
            <span className="font-semibold text-right text-[#09251B]">
              {schedule.cityName}, {schedule.province} ({schedule.timezoneName})
            </span>
          </div>

          <div className="rounded-lg border border-[#DCE5DD] bg-white p-3 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-[#064B32]">
              <ShieldCheck className="h-4 w-4 text-[#08784F]" /> Sumber & Metode Resmi
            </div>
            <p className="text-[11px] text-[#52665B] leading-relaxed">
              <strong>Sumber:</strong> {schedule.calculationSource}
            </p>
            <p className="text-[11px] text-[#52665B] leading-relaxed">
              <strong>Parameter:</strong> {schedule.calculationMethod}
            </p>
          </div>
        </div>

        {/* Reminder Toggle */}
        {prayer.isObligatory && (
          <div className="mt-5 rounded-xl border border-[#DCE5DD] bg-[#FFFDF5] p-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isAlarmEnabled() ? (
                  <Bell className="h-4 w-4 text-[#064B32]" />
                ) : (
                  <BellOff className="h-4 w-4 text-slate-400" />
                )}
                <div>
                  <div className="text-xs font-bold text-[#09251B]">
                    Pengingat Adzan {prayer.label}
                  </div>
                  <div className="text-[11px] text-[#52665B]">
                    {isAlarmEnabled() ? 'Pengingat Aktif' : 'Pengingat Dinonaktifkan'}
                  </div>
                </div>
              </div>

              <button
                onClick={toggleAlarm}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isAlarmEnabled() ? 'bg-[#064B32]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isAlarmEnabled() ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {isAlarmEnabled() && (
              <div className="mt-3 flex items-center justify-between border-t border-[#DCE5DD] pt-2 text-[11px] text-[#52665B]">
                <span>Suara: {notifications.sound.replace('_', ' ').toUpperCase()}</span>
                <button
                  onClick={handleTestSound}
                  className="flex items-center gap-1 font-semibold text-[#064B32] hover:underline"
                >
                  <Volume2 className="h-3.5 w-3.5" /> Uji Suara
                </button>
              </div>
            )}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-[#064B32] py-2.5 text-xs font-semibold text-white transition hover:bg-[#08784F]"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};
