export interface SurahSummary {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: 'Mekah' | 'Madinah' | string;
  arti: string;
  deskripsi: string;
  audioFull: Record<string, string>; // e.g. "01": "url", "02": "url"
}

export interface Ayat {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
  audio: Record<string, string>; // e.g. "01": "url", "02": "url"
}

export interface SurahDetail extends SurahSummary {
  ayat: Ayat[];
  suratSebelumnya?: {
    nomor: number;
    nama: string;
    namaLatin: string;
    jumlahAyat: number;
  } | false;
  suratSelanjutnya?: {
    nomor: number;
    nama: string;
    namaLatin: string;
    jumlahAyat: number;
  } | false;
}

export interface TafsirAyat {
  ayat: number;
  teks: string;
}

export interface TafsirResponse {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
  audioFull: Record<string, string>;
  tafsir: TafsirAyat[];
}

export interface BookmarkItem {
  id: string; // `${surahNumber}:${verseNumber}`
  surahNumber: number;
  surahNameLatin: string;
  verseNumber: number;
  arabicSnippet: string;
  translationSnippet: string;
  createdAt: number;
}

export interface VerseNoteItem {
  id: string; // `${surahNumber}:${verseNumber}`
  surahNumber: number;
  surahNameLatin: string;
  verseNumber: number;
  noteText: string;
  updatedAt: number;
}

export interface ReadingProgress {
  lastSurahNumber: number;
  lastSurahName: string;
  lastVerseNumber: number;
  lastReadAt: number;
  totalVersesReadSession: number;
}

export interface ReadingHistoryItem {
  surahNumber: number;
  surahNameLatin: string;
  verseNumber: number;
  timestamp: number;
}
