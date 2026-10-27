import React, { useEffect, useState } from 'react';
import { X, BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import { quranService } from '../services/quranService';
import { TafsirResponse } from '../types/quran';

interface TafsirModalProps {
  surahNumber: number;
  surahNameLatin: string;
  targetVerseNumber?: number;
  onClose: () => void;
}

export const TafsirModal: React.FC<TafsirModalProps> = ({
  surahNumber,
  surahNameLatin,
  targetVerseNumber,
  onClose,
}) => {
  const [tafsirData, setTafsirData] = useState<TafsirResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeVerse, setActiveVerse] = useState<number>(targetVerseNumber || 1);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    quranService
      .getTafsir(surahNumber)
      .then((res) => {
        if (isMounted) {
          setTafsirData(res.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Gagal memuat tafsir.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [surahNumber]);

  const currentAyatTafsir = tafsirData?.tafsir?.find((t) => t.ayat === activeVerse);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl bg-white p-5 shadow-2xl text-[#09251B]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#DCE5DD] pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#064B32] text-[#FFF4D6]">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#064B32]">
                Tafsir Kemenag RI — {surahNameLatin}
              </h3>
              <p className="text-xs text-[#52665B]">Tafsir Ringkas Kementerian Agama Republik Indonesia</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#F5F7F2] text-[#52665B]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content body */}
        {loading ? (
          <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#064B32]" />
            <p className="mt-2 text-xs text-[#52665B]">Mengambil tafsir resmi Kemenag RI...</p>
          </div>
        ) : error ? (
          <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-8 w-8 text-rose-500" />
            <p className="mt-2 text-xs text-rose-700">{error}</p>
          </div>
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden pt-3">
            {/* Ayat Picker Strip */}
            <div className="mb-3 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-[#DCE5DD]">
              <span className="text-xs font-semibold text-[#52665B] whitespace-nowrap pl-1">Pilih Ayat:</span>
              {tafsirData?.tafsir?.map((t) => (
                <button
                  key={t.ayat}
                  onClick={() => setActiveVerse(t.ayat)}
                  className={`flex h-7 min-w-[28px] items-center justify-center rounded-lg px-2 text-xs font-semibold transition ${
                    activeVerse === t.ayat
                      ? 'bg-[#064B32] text-white shadow-sm'
                      : 'bg-[#F5F7F2] text-[#52665B] hover:bg-[#EAEFEA]'
                  }`}
                >
                  {t.ayat}
                </button>
              ))}
            </div>

            {/* Tafsir Text Panel */}
            <div className="flex-1 overflow-y-auto rounded-xl bg-[#FFFDF5] border border-[#DCE5DD] p-4">
              <div className="mb-2 flex items-center justify-between border-b border-[#DCE5DD] pb-2">
                <span className="text-xs font-bold text-[#064B32]">
                  Surah {surahNameLatin} : Ayat {activeVerse}
                </span>
                <span className="rounded bg-[#FFF4D6] px-2 py-0.5 text-[10px] font-semibold text-[#09251B]">
                  Kitab Tafsir Kemenag
                </span>
              </div>

              <div className="text-sm leading-relaxed text-[#09251B] whitespace-pre-line text-justify font-normal">
                {currentAyatTafsir?.teks || 'Tafsir untuk ayat ini sedang tidak tersedia.'}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-[#DCE5DD] pt-3 text-xs">
          <span className="text-[#52665B]">Sumber: Lajnah Pentashihan Mushaf Al-Qur'an Kemenag RI</span>
          <button
            onClick={onClose}
            className="rounded-lg bg-[#064B32] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#08784F]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
