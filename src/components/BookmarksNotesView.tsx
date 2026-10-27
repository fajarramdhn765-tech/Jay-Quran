import React, { useState } from 'react';
import { Bookmark, Edit3, History, Trash2, BookOpen, Clock, ArrowRight } from 'lucide-react';
import { BookmarkItem, VerseNoteItem, ReadingHistoryItem, ReadingProgress } from '../types/quran';
import { localStore } from '../storage/localStore';

interface BookmarksNotesViewProps {
  onOpenVerse: (surahNumber: number, verseNumber: number) => void;
  readingProgress: ReadingProgress | null;
}

export const BookmarksNotesView: React.FC<BookmarksNotesViewProps> = ({
  onOpenVerse,
  readingProgress,
}) => {
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'notes' | 'history'>('bookmarks');
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(localStore.getBookmarks());
  const [notes, setNotes] = useState<VerseNoteItem[]>(localStore.getVerseNotes());
  const [history, setHistory] = useState<ReadingHistoryItem[]>(localStore.getReadingHistory());

  const handleDeleteBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = bookmarks.filter((b) => b.id !== id);
    localStore.saveBookmarks(updated);
    setBookmarks(updated);
  };

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    localStore.deleteVerseNote(id);
    setNotes(localStore.getVerseNotes());
  };

  const handleClearHistory = () => {
    if (confirm('Kosongkan seluruh riwayat bacaan?')) {
      localStore.clearReadingHistory();
      setHistory([]);
    }
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return `${d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}, ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="space-y-4">
      {/* Tab Switcher */}
      <div className="flex items-center gap-1.5 rounded-2xl border border-[#DCE5DD] bg-white p-1.5 shadow-sm">
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition ${
            activeTab === 'bookmarks'
              ? 'bg-[#064B32] text-white shadow-sm'
              : 'text-[#52665B] hover:text-[#09251B]'
          }`}
        >
          <Bookmark className="h-3.5 w-3.5" />
          <span>Bookmark ({bookmarks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition ${
            activeTab === 'notes'
              ? 'bg-[#064B32] text-white shadow-sm'
              : 'text-[#52665B] hover:text-[#09251B]'
          }`}
        >
          <Edit3 className="h-3.5 w-3.5" />
          <span>Catatan ({notes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition ${
            activeTab === 'history'
              ? 'bg-[#064B32] text-white shadow-sm'
              : 'text-[#52665B] hover:text-[#09251B]'
          }`}
        >
          <History className="h-3.5 w-3.5" />
          <span>Riwayat ({history.length})</span>
        </button>
      </div>

      {/* Tab 1: Bookmarks */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-2.5">
          {bookmarks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#DCE5DD] bg-white p-12 text-center">
              <Bookmark className="mx-auto h-8 w-8 text-[#52665B]/60" />
              <p className="mt-2 text-sm font-semibold text-[#09251B]">Belum Ada Ayat Ditandai</p>
              <p className="mt-1 text-xs text-[#52665B]">
                Tekan ikon bookmark pada ayat Al-Qur'an untuk menyimpannya di sini.
              </p>
            </div>
          ) : (
            bookmarks.map((b) => (
              <div
                key={b.id}
                onClick={() => onOpenVerse(b.surahNumber, b.verseNumber)}
                className="group flex cursor-pointer items-start justify-between rounded-2xl border border-[#DCE5DD] bg-white p-4 shadow-sm transition hover:border-[#08784F] hover:shadow-md"
              >
                <div className="space-y-1.5 flex-1 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#064B32]">
                      QS. {b.surahNameLatin} : Ayat {b.verseNumber}
                    </span>
                    <span className="text-[10px] text-[#52665B]">{formatDate(b.createdAt)}</span>
                  </div>

                  {b.arabicSnippet && (
                    <p className="font-arabic text-sm text-[#09251B] text-right line-clamp-1">
                      {b.arabicSnippet}
                    </p>
                  )}

                  {b.translationSnippet && (
                    <p className="text-xs text-[#52665B] line-clamp-2">
                      "{b.translationSnippet}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                  <button
                    onClick={(e) => handleDeleteBookmark(b.id, e)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                    title="Hapus Bookmark"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <ArrowRight className="h-4 w-4 text-[#52665B] group-hover:text-[#064B32] group-hover:translate-x-0.5 transition" />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Notes */}
      {activeTab === 'notes' && (
        <div className="space-y-2.5">
          {notes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#DCE5DD] bg-white p-12 text-center">
              <Edit3 className="mx-auto h-8 w-8 text-[#52665B]/60" />
              <p className="mt-2 text-sm font-semibold text-[#09251B]">Belum Ada Catatan Tadabbur</p>
              <p className="mt-1 text-xs text-[#52665B]">
                Tuliskan refleksi atau hikmah pada ayat saat membaca untuk disimpan di sini.
              </p>
            </div>
          ) : (
            notes.map((n) => (
              <div
                key={n.id}
                onClick={() => onOpenVerse(n.surahNumber, n.verseNumber)}
                className="group flex cursor-pointer items-start justify-between rounded-2xl border border-[#DCE5DD] bg-white p-4 shadow-sm transition hover:border-[#08784F] hover:shadow-md"
              >
                <div className="space-y-1.5 flex-1 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#064B32]">
                      Catatan QS. {n.surahNameLatin} : Ayat {n.verseNumber}
                    </span>
                    <span className="text-[10px] text-[#52665B]">{formatDate(n.updatedAt)}</span>
                  </div>

                  <p className="rounded-xl bg-[#FFFDF5] border border-[#DCE5DD] p-2.5 text-xs text-[#09251B] leading-relaxed">
                    {n.noteText}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                  <button
                    onClick={(e) => handleDeleteNote(n.id, e)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                    title="Hapus Catatan"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <ArrowRight className="h-4 w-4 text-[#52665B] group-hover:text-[#064B32] group-hover:translate-x-0.5 transition" />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: History & Progress */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* Last read position hero */}
          {readingProgress ? (
            <div className="rounded-2xl bg-gradient-to-br from-[#064B32] to-[#08784F] p-4 text-white shadow-md">
              <div className="flex items-center justify-between border-b border-white/20 pb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#FFF4D6]">
                  Posisi Terakhir Dibaca
                </span>
                <span className="text-[10px] text-white/80">
                  {formatDate(readingProgress.lastReadAt)}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Surah {readingProgress.lastSurahName}
                  </h3>
                  <p className="text-xs text-white/90">
                    Ayat {readingProgress.lastVerseNumber}
                  </p>
                </div>
                <button
                  onClick={() =>
                    onOpenVerse(
                      readingProgress.lastSurahNumber,
                      readingProgress.lastVerseNumber
                    )
                  }
                  className="rounded-xl bg-[#E9B949] px-4 py-2 text-xs font-bold text-[#09251B] shadow-sm hover:bg-[#FCE588] transition"
                >
                  Lanjutkan Tilawah
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#DCE5DD] bg-white p-6 text-center text-xs text-[#52665B]">
              Belum ada posisi tilawah yang tercatat. Buka Surah untuk memulai membaca.
            </div>
          )}

          {/* History list */}
          <div className="rounded-2xl border border-[#DCE5DD] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#DCE5DD] pb-2 mb-2">
              <span className="text-xs font-bold text-[#064B32]">
                Riwayat Membaca Terakhir
              </span>
              {history.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-[11px] text-rose-600 hover:underline"
                >
                  Kosongkan Riwayat
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <p className="py-6 text-center text-xs text-[#52665B]">
                Riwayat membaca masih kosong.
              </p>
            ) : (
              <div className="divide-y divide-[#DCE5DD]">
                {history.map((h, i) => (
                  <button
                    key={`${h.surahNumber}-${h.verseNumber}-${i}`}
                    onClick={() => onOpenVerse(h.surahNumber, h.verseNumber)}
                    className="flex w-full items-center justify-between py-2 text-left hover:bg-[#F5F7F2] px-1 rounded transition"
                  >
                    <div>
                      <span className="text-xs font-semibold text-[#09251B]">
                        QS. {h.surahNameLatin} : Ayat {h.verseNumber}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#52665B]">{formatDate(h.timestamp)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
