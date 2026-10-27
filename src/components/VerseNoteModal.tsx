import React, { useState } from 'react';
import { X, Edit3, Trash2, Save } from 'lucide-react';
import { localStore } from '../storage/localStore';

interface VerseNoteModalProps {
  surahNumber: number;
  surahNameLatin: string;
  verseNumber: number;
  arabicSnippet?: string;
  translationSnippet?: string;
  onClose: () => void;
  onSaved: () => void;
}

export const VerseNoteModal: React.FC<VerseNoteModalProps> = ({
  surahNumber,
  surahNameLatin,
  verseNumber,
  arabicSnippet,
  translationSnippet,
  onClose,
  onSaved,
}) => {
  const existingNote = localStore.getNoteForVerse(surahNumber, verseNumber);
  const [noteText, setNoteText] = useState(existingNote?.noteText || '');

  const handleSave = () => {
    localStore.saveVerseNote({
      id: `${surahNumber}:${verseNumber}`,
      surahNumber,
      surahNameLatin,
      verseNumber,
      noteText: noteText.trim(),
      updatedAt: Date.now(),
    });
    onSaved();
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Hapus catatan pribadi untuk ayat ini?')) {
      localStore.deleteVerseNote(`${surahNumber}:${verseNumber}`);
      onSaved();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl text-[#09251B]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#DCE5DD] pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#064B32] text-[#FFF4D6]">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#064B32]">
                Catatan Tadabbur Ayat
              </h3>
              <p className="text-xs text-[#52665B]">
                QS. {surahNameLatin}: {verseNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#F5F7F2] text-[#52665B]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Ayat Context Snippet */}
        {(arabicSnippet || translationSnippet) && (
          <div className="mt-3 rounded-xl bg-[#FFFDF5] border border-[#DCE5DD] p-3 text-xs">
            {arabicSnippet && (
              <p className="font-arabic text-sm text-right text-[#064B32] mb-1 line-clamp-2">
                {arabicSnippet}
              </p>
            )}
            {translationSnippet && (
              <p className="text-[#52665B] italic line-clamp-2">
                "{translationSnippet}"
              </p>
            )}
          </div>
        )}

        {/* Textarea */}
        <div className="mt-3">
          <label className="block text-xs font-semibold text-[#09251B] mb-1">
            Catatan / Refleksi Pribadi Anda:
          </label>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={5}
            placeholder="Tuliskan hikmah, pelajaran, atau tadabbur dari ayat ini (tersimpan aman di perangkat Anda)..."
            className="w-full rounded-xl border border-[#DCE5DD] bg-[#F5F7F2] p-3 text-xs leading-relaxed text-[#09251B] placeholder:text-[#52665B] focus:border-[#064B32] focus:bg-white focus:outline-none"
          />
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between border-t border-[#DCE5DD] pt-3">
          {existingNote ? (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700"
            >
              <Trash2 className="h-3.5 w-3.5" /> Hapus
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-[#DCE5DD] px-3 py-1.5 text-xs font-medium text-[#52665B] hover:bg-[#F5F7F2]"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 rounded-lg bg-[#064B32] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#08784F]"
            >
              <Save className="h-3.5 w-3.5" /> Simpan Catatan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
