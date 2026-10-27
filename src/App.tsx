import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { BottomNavigation, ActiveTab } from './components/BottomNavigation';
import { HomeView } from './components/HomeView';
import { SurahList } from './components/SurahList';
import { SurahReader } from './components/SurahReader';
import { PrayerScheduleList } from './components/PrayerScheduleList';
import { MonthlyPrayerCalendar } from './components/MonthlyPrayerCalendar';
import { BookmarksNotesView } from './components/BookmarksNotesView';
import { SettingsView } from './components/SettingsView';
import { PrayerDetailModal } from './components/PrayerDetailModal';
import { CitySelectorModal } from './components/CitySelectorModal';
import { AdzanSettingsModal } from './components/AdzanSettingsModal';
import { AndroidGuideModal } from './components/AndroidGuideModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { MurottalPlayerBar } from './components/MurottalPlayerBar';
import { OfflineIndicator } from './components/OfflineIndicator';

import { CityInfo } from './config/appConfig';
import { SurahSummary, ReadingProgress } from './types/quran';
import { DayPrayerSchedule, PrayerItemInfo } from './types/prayer';
import { quranService } from './services/quranService';
import { prayerTimesService } from './services/prayerTimesService';
import { audioService, AudioPlayerState } from './services/audioService';
import { localStore } from './storage/localStore';

export function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<ActiveTab>('beranda');
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number | null>(null);
  const [targetVerseNumber, setTargetVerseNumber] = useState<number | undefined>(undefined);

  // App Data State
  const [currentCity, setCurrentCity] = useState<CityInfo>(localStore.getSelectedCity());
  const [prayerSchedule, setPrayerSchedule] = useState<DayPrayerSchedule | null>(null);
  const [surahs, setSurahs] = useState<SurahSummary[]>([]);
  const [loadingSurahs, setLoadingSurahs] = useState(true);
  const [readingProgress, setReadingProgress] = useState<ReadingProgress | null>(
    localStore.getReadingProgress()
  );

  // Audio State
  const [audioState, setAudioState] = useState<AudioPlayerState>(audioService.getState());

  // Dark Mode State
  const [darkMode, setDarkMode] = useState<boolean>(localStore.getSettings().darkMode || false);

  // Modals State
  const [selectedPrayerDetail, setSelectedPrayerDetail] = useState<PrayerItemInfo | null>(null);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showAdzanModal, setShowAdzanModal] = useState(false);
  const [showAndroidGuideModal, setShowAndroidGuideModal] = useState(false);
  const [showPWAInstallModal, setShowPWAInstallModal] = useState(false);

  // Prayer Sub-View (Daily List vs Monthly Calendar)
  const [prayerViewMode, setPrayerViewMode] = useState<'daily' | 'calendar'>('daily');

  // Sync dark mode class on <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleToggleDarkMode = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    const settings = localStore.getSettings();
    settings.darkMode = nextMode;
    localStore.saveSettings(settings);
  };

  // Subscribe to audio changes
  useEffect(() => {
    return audioService.subscribe(setAudioState);
  }, []);

  // Fetch 114 Surahs on mount
  useEffect(() => {
    let isMounted = true;
    setLoadingSurahs(true);

    quranService.getSurahList().then((res) => {
      if (isMounted) {
        setSurahs(res.data);
        setLoadingSurahs(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Calculate & Refresh Prayer Schedule for currentCity
  const refreshPrayerSchedule = useCallback(async () => {
    const sched = await prayerTimesService.getScheduleForDate(new Date(), currentCity);
    setPrayerSchedule(sched);
  }, [currentCity]);

  useEffect(() => {
    refreshPrayerSchedule();
    // Refresh schedule every minute to smoothly advance countdown and statuses
    const interval = setInterval(refreshPrayerSchedule, 60000);
    return () => clearInterval(interval);
  }, [refreshPrayerSchedule]);

  // Open a specific surah (and optional verse)
  const handleOpenSurah = (surahNumber: number, verseNumber?: number) => {
    setSelectedSurahNumber(surahNumber);
    setTargetVerseNumber(verseNumber);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Change active city location
  const handleSelectCity = (newCity: CityInfo) => {
    setCurrentCity(newCity);
    localStore.saveSelectedCity(newCity);
  };

  // When reading in reader, keep readingProgress refreshed
  const handleReaderClose = () => {
    setSelectedSurahNumber(null);
    setTargetVerseNumber(undefined);
    setReadingProgress(localStore.getReadingProgress());
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-[#09251B] text-[#FFFDF5]' : 'bg-[#FFFDF5] text-[#09251B]'}`}>
      {/* Offline connectivity alert */}
      <OfflineIndicator />

      {/* Main App Top Header */}
      <Header
        currentCity={currentCity}
        onOpenCitySelector={() => setShowCityModal(true)}
        onOpenSearch={() => setShowSearchModal(true)}
        onOpenPWAInstall={() => setShowPWAInstallModal(true)}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />

      {/* Main Viewport Content */}
      <main className="mx-auto max-w-4xl px-4 py-4 sm:px-6 safe-bottom">
        {/* If SurahReader is open, render it exclusively */}
        {selectedSurahNumber !== null ? (
          <SurahReader
            surahNumber={selectedSurahNumber}
            initialVerseNumber={targetVerseNumber}
            onBack={handleReaderClose}
            onNavigateSurah={(num) => handleOpenSurah(num)}
            audioState={audioState}
          />
        ) : (
          <>
            {/* Tab 1: Beranda (Home) */}
            {activeTab === 'beranda' && (
              <HomeView
                schedule={prayerSchedule}
                currentCity={currentCity}
                readingProgress={readingProgress}
                popularSurahs={surahs}
                onOpenSchedule={() => {
                  setActiveTab('jadwal');
                  setPrayerViewMode('daily');
                }}
                onOpenCitySelector={() => setShowCityModal(true)}
                onOpenAdzanSettings={() => setShowAdzanModal(true)}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onOpenSurah={handleOpenSurah}
                onOpenSearch={() => setShowSearchModal(true)}
              />
            )}

            {/* Tab 2: Al-Qur'an (114 Surahs list) */}
            {activeTab === 'quran' && (
              <SurahList
                surahs={surahs}
                loading={loadingSurahs}
                onSelectSurah={(num) => handleOpenSurah(num)}
                audioState={audioState}
              />
            )}

            {/* Tab 3: Jadwal Salat & Kalender Bulanan */}
            {activeTab === 'jadwal' && (
              <div className="space-y-4">
                {/* Switcher: Jadwal Hari Ini vs Kalender Bulanan */}
                <div className="flex items-center justify-between rounded-2xl border border-[#DCE5DD] bg-white p-1.5 shadow-sm">
                  <button
                    onClick={() => setPrayerViewMode('daily')}
                    className={`flex-1 rounded-xl py-2 text-xs font-semibold transition ${
                      prayerViewMode === 'daily'
                        ? 'bg-[#064B32] text-white shadow-sm'
                        : 'text-[#52665B] hover:text-[#09251B]'
                    }`}
                  >
                    Jadwal Hari Ini
                  </button>
                  <button
                    onClick={() => setPrayerViewMode('calendar')}
                    className={`flex-1 rounded-xl py-2 text-xs font-semibold transition ${
                      prayerViewMode === 'calendar'
                        ? 'bg-[#064B32] text-white shadow-sm'
                        : 'text-[#52665B] hover:text-[#09251B]'
                    }`}
                  >
                    Kalender Bulanan
                  </button>
                </div>

                {prayerViewMode === 'daily' ? (
                  prayerSchedule ? (
                    <div className="space-y-4">
                      <PrayerScheduleList
                        schedule={prayerSchedule}
                        onSelectPrayer={(p) => setSelectedPrayerDetail(p)}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#064B32] border-t-transparent" />
                      <p className="mt-2 text-xs text-[#52665B]">Menghitung jadwal salat...</p>
                    </div>
                  )
                ) : (
                  <MonthlyPrayerCalendar currentCity={currentCity} />
                )}
              </div>
            )}

            {/* Tab 4: Bookmark & Catatan */}
            {activeTab === 'bookmark' && (
              <BookmarksNotesView
                onOpenVerse={handleOpenSurah}
                readingProgress={readingProgress}
              />
            )}

            {/* Tab 5: Pengaturan */}
            {activeTab === 'pengaturan' && (
              <SettingsView
                currentCity={currentCity}
                onOpenCitySelector={() => setShowCityModal(true)}
                onOpenAdzanSettings={() => setShowAdzanModal(true)}
                onOpenAndroidGuide={() => setShowAndroidGuideModal(true)}
                darkMode={darkMode}
                onToggleDarkMode={handleToggleDarkMode}
              />
            )}
          </>
        )}
      </main>

      {/* Floating Murottal Audio Player Bar */}
      <MurottalPlayerBar audioState={audioState} />

      {/* Bottom Navigation (Always accessible unless inside reader on small screens) */}
      <BottomNavigation
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setSelectedSurahNumber(null);
          setTargetVerseNumber(undefined);
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'instant' });
        }}
      />

      {/* Prayer Detail Modal */}
      {selectedPrayerDetail && prayerSchedule && (
        <PrayerDetailModal
          prayer={selectedPrayerDetail}
          schedule={prayerSchedule}
          onClose={() => setSelectedPrayerDetail(null)}
        />
      )}

      {/* City Selector Modal */}
      {showCityModal && (
        <CitySelectorModal
          currentCity={currentCity}
          onSelectCity={handleSelectCity}
          onClose={() => setShowCityModal(false)}
        />
      )}

      {/* Adzan Notification Settings Modal */}
      {showAdzanModal && (
        <AdzanSettingsModal
          onClose={() => setShowAdzanModal(false)}
          onOpenAndroidGuide={() => {
            setShowAdzanModal(false);
            setShowAndroidGuideModal(true);
          }}
        />
      )}

      {/* Android APK & PWA Guide Modal */}
      {showAndroidGuideModal && (
        <AndroidGuideModal onClose={() => setShowAndroidGuideModal(false)} />
      )}

      {/* PWA Direct Install Modal */}
      {showPWAInstallModal && (
        <PWAInstallModal onClose={() => setShowPWAInstallModal(false)} />
      )}

      {/* Global Search Modal */}
      {showSearchModal && (
        <GlobalSearchModal
          surahs={surahs}
          onSelectSurah={handleOpenSurah}
          onClose={() => setShowSearchModal(false)}
        />
      )}
    </div>
  );
}

export default App;
