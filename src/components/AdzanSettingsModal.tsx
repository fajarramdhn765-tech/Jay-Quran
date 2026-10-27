import React, { useState } from 'react';
import { X, Bell, Volume2, ShieldAlert, Check, Play, Smartphone } from 'lucide-react';
import { PrayerNotificationSettings } from '../types/prayer';
import { localStore } from '../storage/localStore';
import { notificationService } from '../services/notificationService';
import { audioService } from '../services/audioService';

interface AdzanSettingsModalProps {
  onClose: () => void;
  onOpenAndroidGuide: () => void;
}

export const AdzanSettingsModal: React.FC<AdzanSettingsModalProps> = ({
  onClose,
  onOpenAndroidGuide,
}) => {
  const [settings, setSettings] = useState<PrayerNotificationSettings>(
    localStore.getNotificationSettings()
  );
  const [testing, setTesting] = useState(false);
  const [permissionState, setPermissionState] = useState<string>(
    notificationService.getPermission()
  );

  const handleTogglePrayer = (key: 'subuh' | 'dhuhr' | 'asr' | 'maghrib' | 'isha') => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    localStore.saveNotificationSettings(updated);
  };

  const handleChangeSound = (sound: PrayerNotificationSettings['sound']) => {
    const updated = { ...settings, sound };
    setSettings(updated);
    localStore.saveNotificationSettings(updated);
    audioService.playNotificationSound(sound);
  };

  const handleChangeLead = (leadMinutes: number) => {
    const updated = { ...settings, leadMinutes };
    setSettings(updated);
    localStore.saveNotificationSettings(updated);
  };

  const handleRequestPermission = async () => {
    const res = await notificationService.requestPermission();
    setPermissionState(res);
  };

  const handleTestNotification = async () => {
    setTesting(true);
    await notificationService.testNotification();
    setTimeout(() => setTesting(false), 2000);
  };

  const soundOptions: { id: PrayerNotificationSettings['sound']; label: string }[] = [
    { id: 'adzan_makkah', label: 'Adzan Makkah Al-Mukarramah' },
    { id: 'adzan_madinah', label: 'Adzan Madinah Al-Munawwarah' },
    { id: 'soft_tone', label: 'Nada Lembut (Gentle Chime)' },
    { id: 'beep', label: 'Bip Pengingat Singkat' },
    { id: 'silent', label: 'Senyap (Hanya Notifikasi Layar)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[88vh] w-full max-w-lg flex-col rounded-2xl bg-white p-5 shadow-2xl text-[#09251B]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#DCE5DD] pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#064B32] text-[#FFF4D6]">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#064B32]">
                Pengaturan Pengingat Adzan
              </h3>
              <p className="text-xs text-[#52665B]">Suara & Notifikasi Waktu Salat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#F5F7F2] text-[#52665B]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto space-y-4 py-3 pr-1 text-xs">
          {/* Permission status callout */}
          <div className="flex items-center justify-between rounded-xl bg-[#F5F7F2] border border-[#DCE5DD] p-3">
            <div>
              <div className="font-semibold text-[#09251B]">Izin Notifikasi Sistem</div>
              <div className="text-[11px] text-[#52665B]">
                Status saat ini:{' '}
                <span className="font-bold uppercase">
                  {permissionState === 'granted'
                    ? 'Diizinkan'
                    : permissionState === 'denied'
                    ? 'Ditolak'
                    : 'Belum Diminta'}
                </span>
              </div>
            </div>

            {permissionState !== 'granted' ? (
              <button
                onClick={handleRequestPermission}
                className="rounded-lg bg-[#064B32] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#08784F]"
              >
                Aktifkan Izin
              </button>
            ) : (
              <span className="flex items-center gap-1 font-semibold text-[#08784F]">
                <Check className="h-4 w-4" /> Aktif
              </span>
            )}
          </div>

          {/* Individual prayer toggles */}
          <div className="rounded-xl border border-[#DCE5DD] bg-white p-3.5 space-y-2.5">
            <span className="font-bold text-[#064B32] block">Pengingat Per Waktu Salat</span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {(
                [
                  { key: 'subuh', label: 'Subuh' },
                  { key: 'dhuhr', label: 'Zuhur' },
                  { key: 'asr', label: 'Asar' },
                  { key: 'maghrib', label: 'Magrib' },
                  { key: 'isha', label: 'Isya' },
                ] as const
              ).map((p) => {
                const isEnabled = settings[p.key];
                return (
                  <button
                    key={p.key}
                    onClick={() => handleTogglePrayer(p.key)}
                    className={`flex items-center justify-between rounded-lg p-2 border text-xs font-semibold transition ${
                      isEnabled
                        ? 'border-[#064B32] bg-[#FFF4D6] text-[#064B32]'
                        : 'border-[#DCE5DD] bg-[#F5F7F2] text-[#52665B]'
                    }`}
                  >
                    <span>{p.label}</span>
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        isEnabled ? 'bg-[#064B32]' : 'bg-slate-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sound choice */}
          <div className="rounded-xl border border-[#DCE5DD] bg-white p-3.5 space-y-2">
            <span className="font-bold text-[#064B32] block">Pilihan Suara Notifikasi</span>
            <div className="space-y-1.5">
              {soundOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleChangeSound(opt.id)}
                  className={`flex w-full items-center justify-between rounded-lg p-2.5 text-left border transition ${
                    settings.sound === opt.id
                      ? 'border-[#064B32] bg-[#FFF4D6] text-[#064B32] font-semibold'
                      : 'border-[#DCE5DD] hover:bg-[#F5F7F2] text-[#09251B]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    <span>{opt.label}</span>
                  </div>
                  {settings.sound === opt.id && <Check className="h-4 w-4 text-[#064B32]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Lead timing */}
          <div className="rounded-xl border border-[#DCE5DD] bg-white p-3.5 space-y-2">
            <span className="font-bold text-[#064B32] block">Waktu Bunyi Pengingat</span>
            <div className="flex gap-2">
              {[
                { val: 0, label: 'Tepat Waktu' },
                { val: 5, label: '5 Mnt Sebelumnya' },
                { val: 10, label: '10 Mnt Sebelumnya' },
              ].map((t) => (
                <button
                  key={t.val}
                  onClick={() => handleChangeLead(t.val)}
                  className={`flex-1 rounded-lg py-2 text-center border font-semibold transition ${
                    settings.leadMinutes === t.val
                      ? 'border-[#064B32] bg-[#064B32] text-white'
                      : 'border-[#DCE5DD] bg-[#F5F7F2] text-[#52665B]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Transparent Platform Limits Disclosure */}
          <div className="rounded-xl border border-amber-200 bg-[#FFFDF5] p-3.5 space-y-2 text-[#09251B]">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <ShieldAlert className="h-4 w-4 text-amber-700" />
              <span>Transparansi Keterbatasan Platform Web / PWA</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#52665B]">
              Pada browser web dan PWA, pengingat adzan bekerja optimal saat aplikasi dibuka di latar belakang atau layar aktif. Ketika peramban dimatikan total atau perangkat masuk mode hemat daya ekstrim (deep-sleep), sistem Android/iOS membatasi timer JavaScript.
            </p>
            <button
              onClick={onOpenAndroidGuide}
              className="flex items-center gap-1 text-[11px] font-bold text-[#064B32] hover:underline pt-0.5"
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Lihat Panduan Bangun APK Android Native (Alarm Tepat Waktu) →</span>
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-3 flex items-center justify-between border-t border-[#DCE5DD] pt-3">
          <button
            onClick={handleTestNotification}
            disabled={testing}
            className="flex items-center gap-1.5 rounded-lg border border-[#064B32] bg-white px-3 py-1.5 text-xs font-semibold text-[#064B32] hover:bg-[#F5F7F2]"
          >
            <Play className="h-3.5 w-3.5" />
            <span>{testing ? 'Menguji Notifikasi...' : 'Uji Notifikasi Sekarang'}</span>
          </button>

          <button
            onClick={onClose}
            className="rounded-lg bg-[#064B32] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#08784F]"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
