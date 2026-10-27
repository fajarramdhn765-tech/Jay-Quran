import React, { useEffect, useState } from 'react';
import { Search, Compass, Download, Volume2, ShieldCheck, Sun, Moon } from 'lucide-react';
import { APP_CONFIG, CityInfo } from '../config/appConfig';
import { audioService, AudioPlayerState } from '../services/audioService';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeaderProps {
  currentCity: CityInfo;
  onOpenCitySelector: () => void;
  onOpenSearch: () => void;
  onOpenPWAInstall: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCity,
  onOpenCitySelector,
  onOpenSearch,
  onOpenPWAInstall,
  darkMode,
  onToggleDarkMode,
}) => {
  const [audioState, setAudioState] = useState<AudioPlayerState>(audioService.getState());
  const { isInstallable, isIOS } = usePWAInstall();

  useEffect(() => {
    return audioService.subscribe(setAudioState);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-[#DCE5DD] bg-white/95 backdrop-blur-md transition-colors">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#064B32] shadow-sm">
            <svg className="h-6 w-6 text-[#E9B949]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              <path d="M12 6v6" />
              <path d="M9 9h6" />
            </svg>
            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#E9B949] text-[8px] font-bold text-[#09251B]">
              ★
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-[#064B32] sm:text-lg">
                {APP_CONFIG.name}
              </span>
              <span className="hidden items-center gap-1 rounded bg-[#FFF4D6] px-1.5 py-0.5 text-[10px] font-semibold text-[#09251B] sm:inline-flex">
                <ShieldCheck className="h-3 w-3 text-[#08784F]" />
                Kemenag RI
              </span>
            </div>
            <p className="text-xs text-[#52665B] hidden sm:block">
              {APP_CONFIG.tagline}
            </p>
          </div>
        </div>

        {/* Center / Right actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Active city button */}
          <button
            onClick={onOpenCitySelector}
            className="flex items-center gap-1.5 rounded-lg border border-[#DCE5DD] bg-[#F5F7F2] px-2.5 py-1.5 text-xs font-medium text-[#09251B] transition hover:bg-[#EAEFEA]"
            title="Ubah Lokasi Salat"
          >
            <Compass className="h-3.5 w-3.5 text-[#08784F]" />
            <span className="max-w-[90px] truncate sm:max-w-[130px]">{currentCity.name}</span>
            <span className="text-[10px] text-[#52665B] font-semibold">({currentCity.tzLabel})</span>
          </button>

          {/* Quick search button */}
          <button
            onClick={onOpenSearch}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DCE5DD] bg-white text-[#09251B] transition hover:bg-[#F5F7F2]"
            title="Cari Surah atau Terjemahan Ayat"
            aria-label="Cari Surah"
          >
            <Search className="h-4 w-4 text-[#52665B]" />
          </button>

          {/* Theme mode toggle */}
          <button
            onClick={onToggleDarkMode}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DCE5DD] bg-white text-[#09251B] transition hover:bg-[#F5F7F2]"
            title={darkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
            aria-label="Ganti Tema"
          >
            {darkMode ? <Sun className="h-4 w-4 text-[#E9B949]" /> : <Moon className="h-4 w-4 text-[#52665B]" />}
          </button>

          {/* Audio now playing indicator */}
          {audioState.isPlaying && (
            <div className="flex items-center gap-1.5 rounded-lg bg-[#064B32] px-2.5 py-1.5 text-xs font-medium text-white animate-pulse">
              <Volume2 className="h-3.5 w-3.5 text-[#E9B949]" />
              <span className="hidden sm:inline">Memutar Audio</span>
            </div>
          )}

          {/* PWA Install Button */}
          {(isInstallable || isIOS) && (
            <button
              onClick={onOpenPWAInstall}
              className="flex items-center gap-1.5 rounded-lg bg-[#064B32] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#08784F]"
              title="Instal Jay'z Quran di Perangkat Anda"
            >
              <Download className="h-3.5 w-3.5 text-[#E9B949]" />
              <span className="hidden md:inline">Instal Aplikasi</span>
              <span className="md:hidden">Instal</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
