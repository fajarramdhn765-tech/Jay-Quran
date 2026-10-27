import React, { useState } from 'react';
import {
  Sliders,
  Type,
  Moon,
  Sun,
  MapPin,
  Clock,
  Bell,
  Download,
  Upload,
  Trash2,
  Smartphone,
  ShieldCheck,
  Check,
  Info,
} from 'lucide-react';
import { APP_CONFIG, CityInfo } from '../config/appConfig';
import { localStore, AppUserSettings } from '../storage/localStore';

interface SettingsViewProps {
  currentCity: CityInfo;
  onOpenCitySelector: () => void;
  onOpenAdzanSettings: () => void;
  onOpenAndroidGuide: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentCity,
  onOpenCitySelector,
  onOpenAdzanSettings,
  onOpenAndroidGuide,
  darkMode,
  onToggleDarkMode,
}) => {
  const [settings, setSettings] = useState<AppUserSettings>(localStore.getSettings());
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleUpdate = (partial: Partial<AppUserSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    localStore.saveSettings(updated);
  };

  const handleExportBackup = () => {
    const json = localStore.exportBackupData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jayz-quran-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data cadangan berhasil diunduh');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ok = localStore.importBackupData(content);
      if (ok) {
        setSettings(localStore.getSettings());
        showToast('Data berhasil dipulihkan!');
      } else {
        alert('Format berkas cadangan tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearHistory = () => {
    if (confirm('Apakah Anda yakin ingin menghapus seluruh riwayat membaca?')) {
      localStore.clearReadingHistory();
      showToast('Riwayat membaca telah dibersihkan');
    }
  };

  const handleClearCache = () => {
    if (confirm('Bersihkan cache data surah dan jadwal salat?')) {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('jayz_quran_cache_')) {
          localStorage.removeItem(key);
        }
      });
      showToast('Cache aplikasi berhasil dibersihkan');
    }
  };

  return (
    <div className="space-y-5 pb-12">
      {toastMsg && (
        <div className="fixed top-16 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#064B32] px-4 py-2 text-xs font-semibold text-[#FFF4D6] shadow-lg animate-bounce">
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="rounded-2xl border border-[#DCE5DD] bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#064B32] text-[#FFF4D6]">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#064B32]">Pengaturan Aplikasi</h2>
            <p className="text-xs text-[#52665B]">Sesuaikan preferensi membaca, lokasi, dan adzan</p>
          </div>
        </div>
      </div>

      {/* Group 1: Pengaturan Bacaan Al-Qur'an */}
      <div className="rounded-2xl border border-[#DCE5DD] bg-white p-4 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-[#DCE5DD] pb-2">
          <Type className="h-4 w-4 text-[#064B32]" />
          <h3 className="text-sm font-bold text-[#09251B]">Tampilan & Tipografi Tilawah</h3>
        </div>

        {/* Font Family Choice */}
        <div>
          <label className="block text-xs font-semibold text-[#09251B] mb-1.5">
            Jenis Font Teks Arab:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {APP_CONFIG.availableArabicFonts.map((f) => (
              <button
                key={f.id}
                onClick={() => handleUpdate({ arabicFont: f.id })}
                className={`flex items-center justify-between rounded-xl p-3 border text-left transition ${
                  settings.arabicFont === f.id
                    ? 'border-[#064B32] bg-[#FFF4D6] text-[#064B32] font-semibold'
                    : 'border-[#DCE5DD] hover:bg-[#F5F7F2] text-[#09251B]'
                }`}
              >
                <div>
                  <div className="text-xs">{f.name}</div>
                  <div className="font-arabic text-xl mt-1 text-[#064B32]">بِسْمِ اللّٰهِ</div>
                </div>
                {settings.arabicFont === f.id && <Check className="h-4 w-4 text-[#064B32]" />}
              </button>
            ))}
          </div>
        </div>

        {/* Arabic Font Size Slider */}
        <div>
          <div className="flex items-center justify-between text-xs text-[#52665B] mb-1">
            <span>Ukuran Huruf Arab</span>
            <span className="font-mono font-bold text-[#064B32]">{settings.arabicFontSize} px</span>
          </div>
          <input
            type="range"
            min={20}
            max={44}
            value={settings.arabicFontSize}
            onChange={(e) => handleUpdate({ arabicFontSize: parseInt(e.target.value) })}
            className="w-full accent-[#064B32]"
          />
          <div className="mt-2 rounded-xl bg-[#FFFDF5] border border-[#DCE5DD] p-3 text-center">
            <p
              className="font-quran text-[#064B32]"
              style={{ fontSize: `${settings.arabicFontSize}px`, lineHeight: '2.2' }}
            >
              الْحَمْدُ لِلّٰهِ رَبِّ الْعٰلَمِيْنَۙ
            </p>
          </div>
        </div>

        {/* Translation Font Size */}
        <div>
          <div className="flex items-center justify-between text-xs text-[#52665B] mb-1">
            <span>Ukuran Teks Terjemahan</span>
            <span className="font-mono font-bold text-[#064B32]">{settings.translationFontSize} px</span>
          </div>
          <input
            type="range"
            min={12}
            max={20}
            value={settings.translationFontSize}
            onChange={(e) => handleUpdate({ translationFontSize: parseInt(e.target.value) })}
            className="w-full accent-[#064B32]"
          />
        </div>

        {/* Qari Selection */}
        <div>
          <label className="block text-xs font-semibold text-[#09251B] mb-1">
            Pilihan Qari Murottal:
          </label>
          <select
            value={settings.selectedQari}
            onChange={(e) => handleUpdate({ selectedQari: e.target.value })}
            className="w-full rounded-xl border border-[#DCE5DD] bg-[#F5F7F2] p-2.5 text-xs text-[#09251B] focus:border-[#064B32] focus:bg-white focus:outline-none"
          >
            {APP_CONFIG.availableQaris.map((q) => (
              <option key={q.id} value={q.id}>
                {q.name}
              </option>
            ))}
          </select>
        </div>

        {/* Toggles */}
        <div className="space-y-2 border-t border-[#DCE5DD] pt-3 text-xs">
          <label className="flex items-center justify-between cursor-pointer py-1">
            <span className="font-medium text-[#09251B]">Tampilkan Terjemahan Bahasa Indonesia</span>
            <input
              type="checkbox"
              checked={settings.showTranslation}
              onChange={(e) => handleUpdate({ showTranslation: e.target.checked })}
              className="h-4 w-4 rounded text-[#064B32] focus:ring-0 accent-[#064B32]"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer py-1">
            <span className="font-medium text-[#09251B]">Tampilkan Transliterasi Latin</span>
            <input
              type="checkbox"
              checked={settings.showTransliteration}
              onChange={(e) => handleUpdate({ showTransliteration: e.target.checked })}
              className="h-4 w-4 rounded text-[#064B32] focus:ring-0 accent-[#064B32]"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer py-1">
            <span className="font-medium text-[#09251B]">Mode Tampilan Gelap (Dark Mode)</span>
            <button
              onClick={onToggleDarkMode}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold border ${
                darkMode ? 'bg-[#064B32] text-white' : 'bg-[#F5F7F2] text-[#09251B]'
              }`}
            >
              {darkMode ? <Moon className="h-3.5 w-3.5 text-[#E9B949]" /> : <Sun className="h-3.5 w-3.5" />}
              <span>{darkMode ? 'Aktif' : 'Nonaktif'}</span>
            </button>
          </label>
        </div>
      </div>

      {/* Group 2: Lokasi & Perhitungan Salat */}
      <div className="rounded-2xl border border-[#DCE5DD] bg-white p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2 border-b border-[#DCE5DD] pb-2">
          <MapPin className="h-4 w-4 text-[#064B32]" />
          <h3 className="text-sm font-bold text-[#09251B]">Lokasi & Parameter Jadwal Salat</h3>
        </div>

        {/* Active City Card */}
        <div className="flex items-center justify-between rounded-xl bg-[#FFFDF5] border border-[#DCE5DD] p-3">
          <div>
            <div className="text-xs font-bold text-[#064B32]">{currentCity.name}</div>
            <div className="text-[11px] text-[#52665B]">
              {currentCity.province} · {currentCity.tzLabel} ({currentCity.timezone})
            </div>
            <div className="font-mono text-[10px] text-slate-400">
              Koordinat: {currentCity.lat.toFixed(4)}°, {currentCity.lng.toFixed(4)}°
            </div>
          </div>
          <button
            onClick={onOpenCitySelector}
            className="rounded-lg bg-[#064B32] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#08784F]"
          >
            Ubah Kota
          </button>
        </div>

        {/* Mazhab Asr */}
        <div>
          <label className="block text-xs font-semibold text-[#09251B] mb-1">
            Metode Perhitungan Waktu Asar:
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleUpdate({ asrJuristic: 'standard' })}
              className={`rounded-xl p-2.5 border text-center font-semibold transition ${
                settings.asrJuristic === 'standard'
                  ? 'border-[#064B32] bg-[#FFF4D6] text-[#064B32]'
                  : 'border-[#DCE5DD] bg-[#F5F7F2] text-[#52665B]'
              }`}
            >
              Standar Syafi'i / Maliki / Hanbali
            </button>
            <button
              onClick={() => handleUpdate({ asrJuristic: 'hanafi' })}
              className={`rounded-xl p-2.5 border text-center font-semibold transition ${
                settings.asrJuristic === 'hanafi'
                  ? 'border-[#064B32] bg-[#FFF4D6] text-[#064B32]'
                  : 'border-[#DCE5DD] bg-[#F5F7F2] text-[#52665B]'
              }`}
            >
              Mazhab Hanafi (Bayangan 2x)
            </button>
          </div>
        </div>

        {/* Kemenag standard notice */}
        <div className="flex items-start gap-2 rounded-xl bg-[#F5F7F2] p-3 text-[11px] text-[#52665B]">
          <ShieldCheck className="h-4 w-4 text-[#08784F] shrink-0 mt-0.5" />
          <span>
            Standar resmi Kemenag RI / MABIMS menggunakan sudut Subuh 20°, sudut Isya 18°, dan penambahan ikhtiyat +2 menit pada waktu salat.
          </span>
        </div>
      </div>

      {/* Group 3: Pengingat Adzan Quick Action */}
      <div className="rounded-2xl border border-[#DCE5DD] bg-white p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-[#DCE5DD] pb-2">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-[#064B32]" />
            <h3 className="text-sm font-bold text-[#09251B]">Pengingat & Notifikasi Adzan</h3>
          </div>
          <button
            onClick={onOpenAdzanSettings}
            className="text-xs font-semibold text-[#064B32] hover:underline"
          >
            Buka Pengaturan Lengkap →
          </button>
        </div>
        <p className="text-xs text-[#52665B]">
          Atur suara Adzan Makkah / Madinah, pilih waktu salat yang dibunyikan, dan uji notifikasi.
        </p>
      </div>

      {/* Group 4: Cadangan & Pengelolaan Data */}
      <div className="rounded-2xl border border-[#DCE5DD] bg-white p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2 border-b border-[#DCE5DD] pb-2">
          <Download className="h-4 w-4 text-[#064B32]" />
          <h3 className="text-sm font-bold text-[#09251B]">Cadangkan & Kelola Data Lokal</h3>
        </div>

        <p className="text-xs text-[#52665B]">
          Jay'z Quran menyimpan bookmark, catatan tadabbur, dan preferensi Anda secara privat di perangkat lokal Anda.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
          <button
            onClick={handleExportBackup}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-[#064B32] bg-white py-2 font-semibold text-[#064B32] hover:bg-[#F5F7F2]"
          >
            <Download className="h-3.5 w-3.5" /> Cadangkan Data (Ekspor JSON)
          </button>

          <label className="flex items-center justify-center gap-1.5 rounded-xl border border-[#DCE5DD] bg-[#F5F7F2] py-2 font-semibold text-[#09251B] hover:bg-[#EAEFEA] cursor-pointer">
            <Upload className="h-3.5 w-3.5 text-[#064B32]" />
            <span>Pulihkan Data (Impor JSON)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>
        </div>

        <div className="flex items-center justify-between border-t border-[#DCE5DD] pt-3 text-xs">
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1 text-rose-600 hover:underline"
          >
            <Trash2 className="h-3.5 w-3.5" /> Bersihkan Riwayat
          </button>
          <button
            onClick={handleClearCache}
            className="text-slate-500 hover:text-slate-800"
          >
            Bersihkan Cache API
          </button>
        </div>
      </div>

      {/* Group 5: Panduan Android APK */}
      <div className="rounded-2xl border border-[#064B32] bg-gradient-to-r from-[#064B32] to-[#08784F] p-4 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Smartphone className="h-6 w-6 text-[#E9B949]" />
            <div>
              <h3 className="text-sm font-bold text-white">Instalasi PWA & Build APK Android</h3>
              <p className="text-[11px] text-white/80">
                Panduan memasang Jay'z Quran di layar utama HP atau membungkus menjadi APK
              </p>
            </div>
          </div>
          <button
            onClick={onOpenAndroidGuide}
            className="rounded-xl bg-[#E9B949] px-3.5 py-1.5 text-xs font-bold text-[#09251B] hover:bg-[#FCE588] transition"
          >
            Buka Panduan
          </button>
        </div>
      </div>

      {/* App Version Info */}
      <div className="text-center text-xs text-[#52665B] space-y-1">
        <p className="font-semibold text-[#064B32]">{APP_CONFIG.name} — Versi {APP_CONFIG.version}</p>
        <p>{APP_CONFIG.tagline}</p>
        <p className="text-[10px]">API Al-Qur'an: equran.id v2 · Jadwal Salat: Kemenag RI</p>
      </div>
    </div>
  );
};
