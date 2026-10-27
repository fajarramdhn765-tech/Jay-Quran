import React, { useState } from 'react';
import { Search, X, BookOpen, ChevronRight } from 'lucide-react';
import { SurahSummary } from '../types/quran';

interface GlobalSearchModalProps {
  surahs: SurahSummary[];
  onSelectSurah: (surahNumber: number) => void;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  surahs,
  onSelectSurah,
  onClose,
}) => {
  const [query, setQuery] = useState('');

  const results = surahs.filter((s) => {
    if (!query.trim()) return false;
    const q = query.toLowerCase().trim();
    return (
      s.nomor.toString() === q ||
      s.namaLatin.toLowerCase().includes(q) ||
      s.nama.includes(query) ||
      s.arti.toLowerCase().includes(q) ||
      s.deskripsi.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-16 backdrop-blur-sm">
      <div className="relative flex max-h-[80vh] w-full max-w-lg flex-col rounded-2xl bg-white p-4 shadow-2xl text-[#09251B]">
        {/* Search header */}
        <div className="flex items-center gap-2 border-b border-[#DCE5DD] pb-3">
          <Search className="h-5 w-5 text-[#064B32]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari surah (misal: Al-Kahf, Yasin, 67, Kerajaan)..."
            className="flex-1 bg-transparent text-sm text-[#09251B] placeholder:text-[#52665B] focus:outline-none"
          />
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#F5F7F2] text-[#52665B]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#DCE5DD] py-2">
          {!query.trim() ? (
            <div className="py-8 text-center text-xs text-[#52665B]">
              Ketik nama surah, nomor surah, atau arti untuk mencari.
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#52665B]">
              Tidak ada surah yang cocok dengan "{query}".
            </div>
          ) : (
            results.map((s) => (
              <button
                key={s.nomor}
                onClick={() => {
                  onSelectSurah(s.nomor);
                  onClose();
                }}
                className="flex w-full items-center justify-between p-3 text-left hover:bg-[#F5F7F2] rounded-xl transition"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFF4D6] text-xs font-bold text-[#064B32]">
                    {s.nomor}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-[#09251B]">
                        {s.namaLatin}
                      </span>
                      <span className="text-xs text-[#52665B]">({s.arti})</span>
                    </div>
                    <span className="text-[11px] text-[#52665B]">
                      {s.tempatTurun} · {s.jumlahAyat} Ayat
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-arabic text-lg text-[#064B32]">{s.nama}</span>
                  <ChevronRight className="h-4 w-4 text-[#52665B]" />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
