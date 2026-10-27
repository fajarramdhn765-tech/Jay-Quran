import { APP_CONFIG } from '../config/appConfig';
import { SurahSummary, SurahDetail, TafsirResponse, Ayat } from '../types/quran';
import { CANONICAL_114_SURAHS } from '../data/surahCatalog';

const CACHE_PREFIX = 'jayz_quran_cache_';
const MEMORY_CACHE: Map<string, unknown> = new Map();

export const quranService = {
  /**
   * Fetch all 114 surahs from https://equran.id/api/v2/surat
   */
  async getSurahList(): Promise<{ data: SurahSummary[]; isFromCache: boolean; error?: string }> {
    const memoryKey = 'all_surahs';
    if (MEMORY_CACHE.has(memoryKey)) {
      return { data: MEMORY_CACHE.get(memoryKey) as SurahSummary[], isFromCache: true };
    }

    // Try localStorage cache
    const cached = localStorage.getItem(`${CACHE_PREFIX}surah_list`);
    let cachedData: SurahSummary[] | null = null;
    if (cached) {
      try {
        cachedData = JSON.parse(cached);
      } catch (e) {
        console.error('Failed to parse cached surah list:', e);
      }
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(`${APP_CONFIG.apis.equranBase}/surat`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Gagal memuat daftar surah.`);
      }

      const json = await res.json();
      if (json.code === 200 && Array.isArray(json.data)) {
        MEMORY_CACHE.set(memoryKey, json.data);
        try {
          localStorage.setItem(`${CACHE_PREFIX}surah_list`, JSON.stringify(json.data));
        } catch {
          // ignore quota error
        }
        return { data: json.data, isFromCache: false };
      } else {
        throw new Error(json.message || 'Format respons tidak sesuai standar.');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Koneksi terganggu';
      // Fallback to cached or canonical 114
      if (cachedData && cachedData.length > 0) {
        MEMORY_CACHE.set(memoryKey, cachedData);
        return { data: cachedData, isFromCache: true, error: `Mode Offline: Menggunakan data tersimpan (${errorMsg})` };
      }

      // Convert canonical list to SurahSummary format
      const fallbackList: SurahSummary[] = CANONICAL_114_SURAHS.map((s) => ({
        nomor: s.nomor,
        nama: s.nama,
        namaLatin: s.namaLatin,
        jumlahAyat: s.jumlahAyat,
        tempatTurun: s.tempatTurun,
        arti: s.arti,
        deskripsi: `Surah ${s.namaLatin} terdiri dari ${s.jumlahAyat} ayat dan tergolong surah ${s.tempatTurun}.`,
        audioFull: {
          '01': `https://equran.nos.wjv-1.neo.id/audio-full/Misyari-Rasyid-Al-Afasy/${String(s.nomor).padStart(3, '0')}.mp3`,
        },
      }));
      MEMORY_CACHE.set(memoryKey, fallbackList);
      return { data: fallbackList, isFromCache: true, error: `Mode Offline: Menggunakan data lokal bawaan (${errorMsg})` };
    }
  },

  /**
   * Fetch detail of a surah (all ayat, translations, audio)
   */
  async getSurahDetail(surahNumber: number): Promise<{ data: SurahDetail; isFromCache: boolean; error?: string }> {
    const memoryKey = `surah_detail_${surahNumber}`;
    if (MEMORY_CACHE.has(memoryKey)) {
      return { data: MEMORY_CACHE.get(memoryKey) as SurahDetail, isFromCache: true };
    }

    const localKey = `${CACHE_PREFIX}surah_${surahNumber}`;
    const cached = localStorage.getItem(localKey);
    let cachedData: SurahDetail | null = null;
    if (cached) {
      try {
        cachedData = JSON.parse(cached);
      } catch (e) {
        console.error('Failed to parse cached surah detail:', e);
      }
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(`${APP_CONFIG.apis.equranBase}/surat/${surahNumber}`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Gagal memuat Surah #${surahNumber}.`);
      }

      const json = await res.json();
      if (json.code === 200 && json.data) {
        const detail: SurahDetail = json.data;
        MEMORY_CACHE.set(memoryKey, detail);
        try {
          localStorage.setItem(localKey, JSON.stringify(detail));
        } catch {
          // quota or storage full
        }
        return { data: detail, isFromCache: false };
      } else {
        throw new Error(json.message || 'Gagal memproses data surah');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Koneksi terganggu';
      if (cachedData) {
        MEMORY_CACHE.set(memoryKey, cachedData);
        return { data: cachedData, isFromCache: true, error: `Menggunakan data cache: ${errorMsg}` };
      }
      throw new Error(`Gagal memuat Surah nomor ${surahNumber}: ${errorMsg}. Silakan periksa koneksi internet Anda.`);
    }
  },

  /**
   * Fetch Tafsir of a surah from https://equran.id/api/v2/tafsir/{nomor}
   */
  async getTafsir(surahNumber: number): Promise<{ data: TafsirResponse; isFromCache: boolean; error?: string }> {
    const memoryKey = `tafsir_${surahNumber}`;
    if (MEMORY_CACHE.has(memoryKey)) {
      return { data: MEMORY_CACHE.get(memoryKey) as TafsirResponse, isFromCache: true };
    }

    const localKey = `${CACHE_PREFIX}tafsir_${surahNumber}`;
    const cached = localStorage.getItem(localKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        MEMORY_CACHE.set(memoryKey, parsed);
        return { data: parsed, isFromCache: true };
      } catch (e) {
        console.error('Failed to parse cached tafsir:', e);
      }
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(`${APP_CONFIG.apis.equranBase}/tafsir/${surahNumber}`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Gagal memuat tafsir.`);
      }

      const json = await res.json();
      if (json.code === 200 && json.data) {
        const data: TafsirResponse = json.data;
        MEMORY_CACHE.set(memoryKey, data);
        try {
          localStorage.setItem(localKey, JSON.stringify(data));
        } catch {
          // ignore
        }
        return { data, isFromCache: false };
      } else {
        throw new Error(json.message || 'Tafsir tidak ditemukan');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Koneksi terganggu';
      throw new Error(`Gagal memuat tafsir Surah #${surahNumber}: ${errorMsg}`);
    }
  },

  /**
   * Pre-load next or previous surah into cache silently for silky-smooth navigation
   */
  prefetchSurah(surahNumber: number) {
    if (surahNumber >= 1 && surahNumber <= 114) {
      setTimeout(() => {
        this.getSurahDetail(surahNumber).catch(() => {});
      }, 1500);
    }
  },
};
