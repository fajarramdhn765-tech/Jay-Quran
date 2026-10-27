import React, { useEffect, useState, useRef } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Bookmark,
  Share2,
  Copy,
  BookOpen,
  Edit3,
  Sliders,
  Check,
  ArrowDown,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { SurahDetail, Ayat } from '../types/quran';
import { quranService } from '../services/quranService';
import { localStore } from '../storage/localStore';
import { audioService, AudioPlayerState } from '../services/audioService';
import { TafsirModal } from './TafsirModal';
import { VerseNoteModal } from './VerseNoteModal';
import { AutoScrollControls } from './AutoScrollControls';
import { APP_CONFIG } from '../config/appConfig';

interface SurahReaderProps {
  surahNumber: number;
  initialVerseNumber?: number;
  onBack: () => void;
  onNavigateSurah: (surahNumber: number) => void;
  audioState: AudioPlayerState;
}

export const SurahReader: React.FC<SurahReaderProps> = ({
  surahNumber,
  initialVerseNumber,
  onBack,
  onNavigateSurah,
  audioState,
}) => {
  const [surah, setSurah] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Settings
  const [settings, setSettings] = useState(localStore.getSettings());
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);

  // Modals state
  const [tafsirVerse, setTafsirVerse] = useState<number | null>(null);
  const [noteVerse, setNoteVerse] = useState<{ number: number; arab: string; idn: string } | null>(null);
  const [copyToast, setCopyToast] = useState<string | null>(null);

  // Auto-scroll state
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(settings.autoScrollSpeed || 32);
  const autoScrollRafRef = useRef<number | null>(null);

  // Bookmarks cache
  const [bookmarks, setBookmarks] = useState(localStore.getBookmarks());
  const [notes, setNotes] = useState(localStore.getVerseNotes());

  // Load surah detail
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    quranService
      .getSurahDetail(surahNumber)
      .then((res) => {
        if (isMounted) {
          setSurah(res.data);
          setLoading(false);

          // Prefetch next & prev
          if (res.data.suratSelanjutnya && typeof res.data.suratSelanjutnya === 'object') {
            quranService.prefetchSurah(res.data.suratSelanjutnya.nomor);
          }
          if (res.data.suratSebelumnya && typeof res.data.suratSebelumnya === 'object') {
            quranService.prefetchSurah(res.data.suratSebelumnya.nomor);
          }

          // If initialVerseNumber was passed, scroll to it after rendering
          if (initialVerseNumber) {
            setTimeout(() => {
              const el = document.getElementById(`ayat-${initialVerseNumber}`);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }, 300);
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Gagal memuat surah.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [surahNumber, initialVerseNumber]);

  // Handle auto-scroll animation loop
  useEffect(() => {
    if (!isAutoScrolling) {
      if (autoScrollRafRef.current) cancelAnimationFrame(autoScrollRafRef.current);
      return;
    }

    let lastTime = performance.now();
    const scrollStep = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      window.scrollBy({ top: scrollSpeed * dt, behavior: 'instant' as ScrollBehavior });

      // Stop if reached bottom
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 50) {
        setIsAutoScrolling(false);
        return;
      }
      autoScrollRafRef.current = requestAnimationFrame(scrollStep);
    };

    autoScrollRafRef.current = requestAnimationFrame(scrollStep);
    return () => {
      if (autoScrollRafRef.current) cancelAnimationFrame(autoScrollRafRef.current);
    };
  }, [isAutoScrolling, scrollSpeed]);

  // Save reading progress when verse comes into view or when user interacts
  const handleMarkReadingProgress = (verseNumber: number) => {
    if (surah) {
      localStore.saveReadingProgress(surah.nomor, surah.namaLatin, verseNumber);
    }
  };

  // Bookmark toggle
  const handleToggleBookmark = (ayat: Ayat) => {
    if (!surah) return;
    const item = {
      id: `${surah.nomor}:${ayat.nomorAyat}`,
      surahNumber: surah.nomor,
      surahNameLatin: surah.namaLatin,
      verseNumber: ayat.nomorAyat,
      arabicSnippet: ayat.teksArab,
      translationSnippet: ayat.teksIndonesia,
      createdAt: Date.now(),
    };
    const isAdded = localStore.toggleBookmark(item);
    setBookmarks(localStore.getBookmarks());
    setCopyToast(isAdded ? `Ayat ${ayat.nomorAyat} ditambahkan ke Bookmark` : `Bookmark Ayat ${ayat.nomorAyat} dihapus`);
    setTimeout(() => setCopyToast(null), 2500);
  };

  // Copy verse
  const handleCopyVerse = (ayat: Ayat) => {
    if (!surah) return;
    const text = `${ayat.teksArab}\n\n"${ayat.teksIndonesia}"\n\n(QS. ${surah.namaLatin} [${surah.nomor}]: ${ayat.nomorAyat})\n— Dibaca via Jay'z Quran`;
    navigator.clipboard.writeText(text).then(() => {
      setCopyToast(`Ayat ${ayat.nomorAyat} berhasil disalin`);
      setTimeout(() => setCopyToast(null), 2500);
    });
  };

  // Share verse
  const handleShareVerse = async (ayat: Ayat) => {
    if (!surah) return;
    const shareData = {
      title: `QS. ${surah.namaLatin}: ${ayat.nomorAyat}`,
      text: `${ayat.teksArab}\n\n"${ayat.teksIndonesia}"\n\n(QS. ${surah.namaLatin}: ${ayat.nomorAyat})\n— Jay'z Quran`,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // Share cancelled or unsupported
      }
    } else {
      handleCopyVerse(ayat);
    }
  };

  // Play individual verse audio
  const handlePlayVerseAudio = (ayat: Ayat) => {
    if (!surah) return;
    const qariId = settings.selectedQari || '01';
    const audioUrl =
      ayat.audio?.[qariId] ||
      ayat.audio?.['01'] ||
      Object.values(ayat.audio || {})[0];

    if (audioUrl) {
      audioService.playVerse(audioUrl, surah.nomor, ayat.nomorAyat, surah.namaLatin);
      handleMarkReadingProgress(ayat.nomorAyat);
    }
  };

  // Play full surah audio
  const handlePlayFullSurah = () => {
    if (!surah) return;
    const qariId = settings.selectedQari || '01';
    const audioUrl =
      surah.audioFull?.[qariId] ||
      surah.audioFull?.['01'] ||
      `https://equran.nos.wjv-1.neo.id/audio-full/Misyari-Rasyid-Al-Afasy/${String(surah.nomor).padStart(3, '0')}.mp3`;

    audioService.playSurah(audioUrl, surah.nomor, surah.namaLatin, qariId);
  };

  const isFullSurahPlaying =
    audioState.isPlaying &&
    audioState.surahNumber === surahNumber &&
    audioState.verseNumber === null;

  return (
    <div className="min-h-screen pb-32">
      {/* Toast Notification */}
      {copyToast && (
        <div className="fixed top-16 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#064B32] px-4 py-2 text-xs font-semibold text-[#FFF4D6] shadow-lg animate-bounce">
          {copyToast}
        </div>
      )}

      {/* Reader Top Action Bar */}
      <div className="sticky top-14 z-20 flex items-center justify-between border-b border-[#DCE5DD] bg-white/95 px-4 py-2.5 backdrop-blur-md">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#064B32] hover:text-[#08784F]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Daftar Surah</span>
        </button>

        <div className="flex items-center gap-1 text-center">
          <span className="text-xs font-bold text-[#09251B]">
            {surah ? `QS. ${surah.namaLatin}` : 'Memuat...'}
          </span>
          {surah && (
            <span className="text-[11px] text-[#52665B]">
              ({surah.nomor}:{surah.jumlahAyat})
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsAutoScrolling(!isAutoScrolling)}
            className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-medium transition ${
              isAutoScrolling
                ? 'border-[#064B32] bg-[#064B32] text-white'
                : 'border-[#DCE5DD] bg-[#F5F7F2] text-[#52665B] hover:text-[#09251B]'
            }`}
            title="Auto-Scroll Halaman"
          >
            <ArrowDown className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Gulir</span>
          </button>

          <button
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#DCE5DD] bg-[#F5F7F2] text-[#52665B] hover:text-[#09251B]"
            title="Pengaturan Tampilan Bacaan"
          >
            <Sliders className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Settings Drawer (Inline quick controls for font sizes and transliteration) */}
      {showSettingsDrawer && (
        <div className="border-b border-[#DCE5DD] bg-[#FFFDF5] p-4 text-xs transition">
          <div className="mx-auto max-w-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#064B32]">Pengaturan Pembaca Al-Qur'an</span>
              <button
                onClick={() => setShowSettingsDrawer(false)}
                className="text-xs font-semibold text-[#52665B]"
              >
                Tutup ✕
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Arabic Font Size */}
              <div>
                <div className="flex justify-between text-[11px] text-[#52665B] mb-1">
                  <span>Ukuran Huruf Arab</span>
                  <span className="font-mono font-bold text-[#064B32]">{settings.arabicFontSize} px</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={44}
                  value={settings.arabicFontSize}
                  onChange={(e) => {
                    const updated = { ...settings, arabicFontSize: parseInt(e.target.value) };
                    setSettings(updated);
                    localStore.saveSettings(updated);
                  }}
                  className="w-full accent-[#064B32]"
                />
              </div>

              {/* Translation Font Size */}
              <div>
                <div className="flex justify-between text-[11px] text-[#52665B] mb-1">
                  <span>Ukuran Terjemahan</span>
                  <span className="font-mono font-bold text-[#064B32]">{settings.translationFontSize} px</span>
                </div>
                <input
                  type="range"
                  min={12}
                  max={20}
                  value={settings.translationFontSize}
                  onChange={(e) => {
                    const updated = { ...settings, translationFontSize: parseInt(e.target.value) };
                    setSettings(updated);
                    localStore.saveSettings(updated);
                  }}
                  className="w-full accent-[#064B32]"
                />
              </div>
            </div>

            {/* Toggle Toggles */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showTranslation}
                  onChange={(e) => {
                    const updated = { ...settings, showTranslation: e.target.checked };
                    setSettings(updated);
                    localStore.saveSettings(updated);
                  }}
                  className="rounded text-[#064B32] focus:ring-0"
                />
                <span>Tampilkan Terjemahan</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showTransliteration}
                  onChange={(e) => {
                    const updated = { ...settings, showTransliteration: e.target.checked };
                    setSettings(updated);
                    localStore.saveSettings(updated);
                  }}
                  className="rounded text-[#064B32] focus:ring-0"
                />
                <span>Tampilkan Latin (Transliterasi)</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Main Reading Canvas */}
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-3 border-[#064B32] border-t-transparent" />
            <p className="mt-3 text-xs text-[#52665B]">Memuat ayat-ayat suci Al-Qur'an...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-xs text-rose-700">
            <p className="font-semibold text-sm mb-1">Gagal Memuat Surah</p>
            <p>{error}</p>
            <button
              onClick={() => onNavigateSurah(surahNumber)}
              className="mt-3 rounded-lg bg-[#064B32] px-4 py-1.5 font-semibold text-white"
            >
              Coba Lagi
            </button>
          </div>
        ) : surah ? (
          <div>
            {/* Surah Header Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#064B32] via-[#08784F] to-[#09251B] p-6 text-center text-white shadow-md">
              <div className="relative z-10">
                <h1 className="text-2xl font-extrabold sm:text-3xl text-[#FFF4D6]">
                  {surah.namaLatin}
                </h1>
                <p className="mt-1 font-arabic text-3xl font-normal leading-relaxed text-[#FFF4D6]">
                  {surah.nama}
                </p>
                <div className="mt-2 flex items-center justify-center gap-2 text-xs text-white/80">
                  <span>{surah.arti}</span>
                  <span aria-hidden="true">·</span>
                  <span>{surah.tempatTurun}</span>
                  <span aria-hidden="true">·</span>
                  <span>{surah.jumlahAyat} Ayat</span>
                </div>

                {/* Full surah audio play button */}
                <div className="mt-4 flex items-center justify-center gap-2">
                  <button
                    onClick={handlePlayFullSurah}
                    className="flex items-center gap-2 rounded-full bg-[#E9B949] px-4 py-2 text-xs font-bold text-[#09251B] shadow-sm transition hover:bg-[#FCE588]"
                  >
                    {isFullSurahPlaying ? (
                      <>
                        <Pause className="h-4 w-4" />
                        <span>Jeda Murottal Surah</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 fill-current" />
                        <span>Putar Murottal Penuh</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Basmalah Display
                Note: Surah At-Taubah (9) does not begin with Basmalah.
                Surah Al-Fatihah (1) has Basmalah as Verse 1.
                Other surahs have Basmalah as opening formula.
            */}
            {surah.nomor !== 9 && surah.nomor !== 1 && (
              <div className="my-8 text-center">
                <div className="inline-block rounded-2xl bg-[#FFF4D6]/70 px-8 py-3.5 border border-[#E9B949]/30">
                  <p className="font-arabic text-2xl font-normal text-[#064B32] sm:text-3xl leading-relaxed">
                    بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
                  </p>
                  <p className="mt-1 text-[11px] text-[#52665B] italic">
                    "Dengan nama Allah Yang Maha Pengasih, Maha Penyayang."
                  </p>
                </div>
              </div>
            )}

            {/* Verses Container */}
            <div className="mt-6 space-y-6">
              {surah.ayat.map((ayat) => {
                const isBookmarked = bookmarks.some(
                  (b) => b.id === `${surah.nomor}:${ayat.nomorAyat}`
                );
                const hasNote = notes.some(
                  (n) => n.id === `${surah.nomor}:${ayat.nomorAyat}`
                );
                const isPlayingThisAyah =
                  audioState.isPlaying &&
                  audioState.surahNumber === surah.nomor &&
                  audioState.verseNumber === ayat.nomorAyat;

                return (
                  <div
                    key={ayat.nomorAyat}
                    id={`ayat-${ayat.nomorAyat}`}
                    onClick={() => handleMarkReadingProgress(ayat.nomorAyat)}
                    className={`rounded-2xl border p-4 sm:p-5 transition shadow-xs ${
                      isPlayingThisAyah
                        ? 'border-[#E9B949] bg-[#FFF4D6]/40 ring-2 ring-[#E9B949]/30'
                        : 'border-[#DCE5DD] bg-white hover:border-[#C2D1C5]'
                    }`}
                  >
                    {/* Verse Toolbar Top */}
                    <div className="flex items-center justify-between border-b border-[#DCE5DD] pb-2.5 text-xs text-[#52665B]">
                      {/* Verse badge */}
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#064B32] text-white font-mono text-xs font-bold">
                          {ayat.nomorAyat}
                        </div>
                        <span className="font-medium text-[11px]">
                          QS. {surah.namaLatin}: {ayat.nomorAyat}
                        </span>
                        {hasNote && (
                          <span className="rounded bg-[#FFF4D6] px-1.5 py-0.2 text-[10px] font-semibold text-[#064B32]">
                            Ada Catatan
                          </span>
                        )}
                      </div>

                      {/* Action buttons per verse */}
                      <div className="flex items-center gap-1">
                        {/* Audio play verse */}
                        <button
                          onClick={() => handlePlayVerseAudio(ayat)}
                          className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
                            isPlayingThisAyah
                              ? 'bg-[#064B32] text-[#FFF4D6]'
                              : 'hover:bg-[#F5F7F2] text-[#52665B]'
                          }`}
                          title="Putar Audio Ayat"
                          aria-label={`Putar audio ayat ${ayat.nomorAyat}`}
                        >
                          {isPlayingThisAyah ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                        </button>

                        {/* Tafsir button */}
                        <button
                          onClick={() => setTafsirVerse(ayat.nomorAyat)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#F5F7F2] text-[#52665B]"
                          title="Buka Tafsir Ayat"
                          aria-label={`Buka tafsir ayat ${ayat.nomorAyat}`}
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                        </button>

                        {/* Note reflection button */}
                        <button
                          onClick={() =>
                            setNoteVerse({
                              number: ayat.nomorAyat,
                              arab: ayat.teksArab,
                              idn: ayat.teksIndonesia,
                            })
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#F5F7F2] text-[#52665B]"
                          title="Tulis Catatan Tadabbur"
                          aria-label={`Tulis catatan ayat ${ayat.nomorAyat}`}
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>

                        {/* Bookmark button */}
                        <button
                          onClick={() => handleToggleBookmark(ayat)}
                          className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
                            isBookmarked
                              ? 'text-[#E9B949] bg-[#FFF4D6]'
                              : 'hover:bg-[#F5F7F2] text-[#52665B]'
                          }`}
                          title={isBookmarked ? 'Hapus Bookmark' : 'Tandai Ayat'}
                          aria-label={`Bookmark ayat ${ayat.nomorAyat}`}
                        >
                          <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                        </button>

                        {/* Copy button */}
                        <button
                          onClick={() => handleCopyVerse(ayat)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#F5F7F2] text-[#52665B]"
                          title="Salin Ayat & Terjemahan"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>

                        {/* Share button */}
                        <button
                          onClick={() => handleShareVerse(ayat)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#F5F7F2] text-[#52665B]"
                          title="Bagikan Ayat"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Arabic Verse Holy Text */}
                    <div className="py-4">
                      <p
                        className="font-quran text-[#09251B] transition-all"
                        style={{
                          fontSize: `${settings.arabicFontSize}px`,
                          lineHeight: '2.4',
                        }}
                      >
                        {ayat.teksArab}
                        <span
                          className="inline-flex mx-2 h-7 w-7 items-center justify-center rounded-full border border-[#E9B949] bg-[#FFF4D6] font-mono text-[11px] font-bold text-[#064B32] align-middle select-none"
                          dir="ltr"
                        >
                          {ayat.nomorAyat}
                        </span>
                      </p>
                    </div>

                    {/* Latin Transliteration */}
                    {settings.showTransliteration && (
                      <div className="border-t border-[#DCE5DD]/60 pt-2.5">
                        <p className="text-xs text-[#08784F] leading-relaxed font-medium">
                          {ayat.teksLatin}
                        </p>
                      </div>
                    )}

                    {/* Indonesian Translation */}
                    {settings.showTranslation && (
                      <div className="mt-2 text-[#09251B]">
                        <p
                          className="leading-relaxed"
                          style={{
                            fontSize: `${settings.translationFontSize}px`,
                          }}
                        >
                          {ayat.teksIndonesia}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Surah Navigation Bar */}
            <div className="mt-10 flex items-center justify-between border-t border-[#DCE5DD] pt-6">
              {surah.suratSebelumnya && typeof surah.suratSebelumnya === 'object' ? (
                (() => {
                  const prev = surah.suratSebelumnya as { nomor: number; namaLatin: string };
                  return (
                    <button
                      onClick={() => onNavigateSurah(prev.nomor)}
                      className="flex items-center gap-2 rounded-xl border border-[#DCE5DD] bg-white px-3.5 py-2 text-xs font-semibold text-[#064B32] shadow-xs hover:bg-[#F5F7F2]"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <div className="text-left">
                        <span className="block text-[10px] text-[#52665B]">Surah Sebelumnya</span>
                        <span>{prev.namaLatin}</span>
                      </div>
                    </button>
                  );
                })()
              ) : (
                <div />
              )}

              {surah.suratSelanjutnya && typeof surah.suratSelanjutnya === 'object' ? (
                (() => {
                  const next = surah.suratSelanjutnya as { nomor: number; namaLatin: string };
                  return (
                    <button
                      onClick={() => onNavigateSurah(next.nomor)}
                      className="flex items-center gap-2 rounded-xl border border-[#DCE5DD] bg-white px-3.5 py-2 text-xs font-semibold text-[#064B32] shadow-xs hover:bg-[#F5F7F2]"
                    >
                      <div className="text-right">
                        <span className="block text-[10px] text-[#52665B]">Surah Berikutnya</span>
                        <span>{next.namaLatin}</span>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  );
                })()
              ) : (
                <div />
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* Auto-Scroll Floating Controls */}
      {isAutoScrolling && (
        <AutoScrollControls
          isScrolling={isAutoScrolling}
          speed={scrollSpeed}
          onToggleScroll={() => setIsAutoScrolling(!isAutoScrolling)}
          onChangeSpeed={(s) => setScrollSpeed(s)}
          onStop={() => setIsAutoScrolling(false)}
        />
      )}

      {/* Tafsir Modal */}
      {tafsirVerse !== null && surah && (
        <TafsirModal
          surahNumber={surah.nomor}
          surahNameLatin={surah.namaLatin}
          targetVerseNumber={tafsirVerse}
          onClose={() => setTafsirVerse(null)}
        />
      )}

      {/* Verse Note Modal */}
      {noteVerse !== null && surah && (
        <VerseNoteModal
          surahNumber={surah.nomor}
          surahNameLatin={surah.namaLatin}
          verseNumber={noteVerse.number}
          arabicSnippet={noteVerse.arab}
          translationSnippet={noteVerse.idn}
          onClose={() => setNoteVerse(null)}
          onSaved={() => setNotes(localStore.getVerseNotes())}
        />
      )}
    </div>
  );
};
