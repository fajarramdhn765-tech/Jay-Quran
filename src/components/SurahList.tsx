import React, { useState, useMemo } from 'react';
import { Search, Play, Pause, Bookmark, Sparkles, BookOpen } from 'lucide-react';
import { SurahSummary } from '../types/quran';
import { audioService, AudioPlayerState } from '../services/audioService';

interface SurahListProps {
  surahs: SurahSummary[];
  loading: boolean;
  onSelectSurah: (surahNumber: number) => void;
  audioState: AudioPlayerState;
}

export const SurahList: React.FC<SurahListProps> = ({
  surahs,
  loading,
  onSelectSurah,
  audioState,
}) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Mekah' | 'Madinah'>('all');

  const filteredSurahs = useMemo(() => {
    return surahs.filter((s) => {
      const matchSearch =
        s.nomor.toString() === search.trim() ||
        s.namaLatin.toLowerCase().includes(search.toLowerCase()) ||
        s.nama.includes(search) ||
        s.arti.toLowerCase().includes(search.toLowerCase());

      const matchType =
        filterType === 'all'
          ? true
          : filterType === 'Mekah'
          ? s.tempatTurun.toLowerCase().includes('mekah')
          : s.tempatTurun.toLowerCase().includes('madinah');

      return matchSearch && matchType;
    });
  }, [surahs, search, filterType]);

  const handlePlaySurah = (e: React.MouseEvent, surah: SurahSummary) => {
    e.stopPropagation();
    const audioUrl =
      surah.audioFull?.['01'] ||
      `https://equran.nos.wjv-1.neo.id/audio-full/Misyari-Rasyid-Al-Afasy/${String(surah.nomor).padStart(3, '0')}.mp3`;

    audioService.playSurah(audioUrl, surah.nomor, surah.namaLatin, '01');
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#DCE5DD] bg-white p-3.5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#52665B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari surah (misal: Yasin, Al-Mulk, 36, Mekah)..."
            className="w-full rounded-xl border border-[#DCE5DD] bg-[#F5F7F2] py-2 pl-9 pr-3 text-xs text-[#09251B] placeholder:text-[#52665B] focus:border-[#064B32] focus:bg-white focus:outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 rounded-xl bg-[#F5F7F2] p-1 border border-[#DCE5DD]">
          <button
            onClick={() => setFilterType('all')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              filterType === 'all'
                ? 'bg-[#064B32] text-white shadow-sm'
                : 'text-[#52665B] hover:text-[#09251B]'
            }`}
          >
            Semua (114)
          </button>
          <button
            onClick={() => setFilterType('Mekah')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              filterType === 'Mekah'
                ? 'bg-[#064B32] text-white shadow-sm'
                : 'text-[#52665B] hover:text-[#09251B]'
            }`}
          >
            Makkiyah
          </button>
          <button
            onClick={() => setFilterType('Madinah')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              filterType === 'Madinah'
                ? 'bg-[#064B32] text-white shadow-sm'
                : 'text-[#52665B] hover:text-[#09251B]'
            }`}
          >
            Madaniyah
          </button>
        </div>
      </div>

      {/* Surahs Count Kicker */}
      <div className="flex items-center justify-between px-1 text-xs text-[#52665B]">
        <span>Menampilkan {filteredSurahs.length} Surah</span>
        <span className="text-[11px] text-[#08784F] font-semibold">Teks Arab Bersanad & Audio Resmi</span>
      </div>

      {/* Surah Grid */}
      {loading && surahs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-[#064B32] border-t-transparent" />
          <p className="mt-3 text-xs text-[#52665B]">Memuat 114 Surah Al-Qur'an...</p>
        </div>
      ) : filteredSurahs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#DCE5DD] bg-white p-12 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-[#52665B]/60" />
          <p className="mt-2 text-sm font-semibold text-[#09251B]">Surah Tidak Ditemukan</p>
          <p className="mt-1 text-xs text-[#52665B]">
            Tidak ada surah yang cocok dengan kata kunci "{search}".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSurahs.map((surah) => {
            const isPlayingThis =
              audioState.isPlaying &&
              audioState.surahNumber === surah.nomor &&
              audioState.verseNumber === null;

            return (
              <div
                key={surah.nomor}
                onClick={() => onSelectSurah(surah.nomor)}
                className="group relative flex cursor-pointer items-center justify-between rounded-2xl border border-[#DCE5DD] bg-white p-3.5 shadow-sm transition hover:border-[#08784F] hover:shadow-md"
              >
                {/* Left side: Surah number badge & Latin name */}
                <div className="flex items-center gap-3">
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF4D6] font-semibold text-xs text-[#064B32] border border-[#E9B949]/40 group-hover:bg-[#064B32] group-hover:text-white transition">
                    <span>{surah.nomor}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-[#09251B] group-hover:text-[#064B32] transition">
                        {surah.namaLatin}
                      </h3>
                      <span className="text-[10px] text-[#52665B] font-medium">
                        ({surah.arti})
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#52665B]">
                      <span>{surah.tempatTurun}</span>
                      <span aria-hidden="true">·</span>
                      <span>{surah.jumlahAyat} Ayat</span>
                    </div>
                  </div>
                </div>

                {/* Right side: Arabic calligraphic name & Quick play button */}
                <div className="flex items-center gap-2.5 text-right">
                  <div className="font-arabic text-xl font-normal text-[#064B32] leading-none">
                    {surah.nama}
                  </div>

                  <button
                    onClick={(e) => handlePlaySurah(e, surah)}
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                      isPlayingThis
                        ? 'bg-[#064B32] text-[#E9B949] shadow-sm'
                        : 'bg-[#F5F7F2] text-[#064B32] hover:bg-[#EAEFEA]'
                    }`}
                    title={isPlayingThis ? 'Jeda Audio Surah' : 'Putar Audio Murottal Surah'}
                    aria-label={`Putar Surah ${surah.namaLatin}`}
                  >
                    {isPlayingThis ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 translate-x-0.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
