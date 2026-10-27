import React, { useState } from 'react';
import { X, Smartphone, Download, Terminal, CheckCircle2, Copy, ExternalLink } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AndroidGuideModalProps {
  onClose: () => void;
}

export const AndroidGuideModal: React.FC<AndroidGuideModalProps> = ({ onClose }) => {
  const { isInstallable, install, isIOS } = usePWAInstall();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const capacitorSetupCommand = `# 1. Instal dependencies Capacitor Android
npm install @capacitor/core @capacitor/android
npm install -D @capacitor/cli

# 2. Inisialisasi konfigurasi Capacitor
npx cap init "Jay'z Quran" "com.jayz.quran" --web-dir dist

# 3. Build produksi web terlebih dahulu
npm run build

# 4. Tambahkan platform Android
npx cap add android

# 5. Buka proyek di Android Studio untuk Build APK / AAB
npx cap open android`;

  const apkBuildSteps = `# Di dalam Android Studio:
# 1. Tunggu Gradle sync selesai.
# 2. Untuk membuat APK Debug (dapat langsung dites di HP):
#    Menu: Build -> Build Bundle(s) / APK(s) -> Build APK(s)
#    File tersimpan di: app/build/outputs/apk/debug/app-debug.apk
#
# 3. Untuk membuat Release APK / AAB (Google Play Store):
#    Menu: Build -> Generate Signed Bundle / APK -> Android App Bundle
#    Buat KeyStore baru atau gunakan key yang sudah ada.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col rounded-2xl bg-white p-5 shadow-2xl text-[#09251B]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#DCE5DD] pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#064B32] text-[#FFF4D6]">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#064B32]">
                Panduan Instalasi & Build APK Android
              </h3>
              <p className="text-xs text-[#52665B]">Jay'z Quran — PWA & Native Android Wrapper</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#F5F7F2] text-[#52665B]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto space-y-4 py-3 pr-1 text-xs">
          {/* Method 1: Instant PWA Direct Install (Recommended for instant use) */}
          <div className="rounded-xl border border-[#064B32] bg-[#FFFDF5] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-[#064B32]">
                Metode 1: Instal Langsung sebagai PWA (Instan & Ringan)
              </span>
              <span className="rounded bg-[#FFF4D6] px-2 py-0.5 text-[10px] font-bold text-[#09251B]">
                Rekomendasi
              </span>
            </div>
            <p className="text-[11px] text-[#52665B] leading-relaxed">
              Jay'z Quran telah dilengkapi Web App Manifest, Service Worker offline caching, dan ikon standar HD. Anda dapat langsung menginstalnya ke layar utama HP Android Anda tanpa perlu mendownload file APK besar.
            </p>

            {isInstallable ? (
              <button
                onClick={install}
                className="flex items-center gap-2 rounded-xl bg-[#064B32] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#08784F] transition"
              >
                <Download className="h-4 w-4 text-[#E9B949]" />
                Instal Jay'z Quran Sekarang ke Layar Utama
              </button>
            ) : isIOS ? (
              <p className="text-[11px] text-[#064B32] font-semibold">
                Untuk iPhone/iPad: Tekan tombol <strong>Bagikan (Share)</strong> di Safari lalu pilih <strong>Tambah ke Layar Utama (Add to Home Screen)</strong>.
              </p>
            ) : (
              <p className="text-[11px] text-[#52665B]">
                Buka menu browser Anda (titik tiga di kanan atas) lalu pilih <strong>"Instal Aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.
              </p>
            )}
          </div>

          {/* Method 2: Build Native APK using Capacitor */}
          <div className="rounded-xl border border-[#DCE5DD] bg-[#F5F7F2] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-[#09251B]">
                Metode 2: Membangun File APK / AAB dengan Capacitor & Android Studio
              </span>
              <span className="text-[10px] text-[#52665B]">Toolchain Developer</span>
            </div>
            <p className="text-[11px] text-[#52665B] leading-relaxed">
              Karena server AI Studio merupakan lingkungan cloud runtime web, kompilasi binary binary Android APK/AAB memerlukan Android SDK & Gradle. Jalankan perintah berikut di komputer lokal Anda:
            </p>

            {/* Code block 1 */}
            <div className="relative rounded-xl bg-[#09251B] p-3 font-mono text-[11px] text-emerald-200">
              <button
                onClick={() => copyToClipboard(capacitorSetupCommand, 'cmd1')}
                className="absolute right-2 top-2 flex items-center gap-1 rounded bg-white/10 px-2 py-0.5 text-[10px] text-white hover:bg-white/20"
              >
                {copiedSection === 'cmd1' ? <CheckCircle2 className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                {copiedSection === 'cmd1' ? 'Tersalin' : 'Salin Perintah'}
              </button>
              <pre className="overflow-x-auto whitespace-pre-wrap">{capacitorSetupCommand}</pre>
            </div>

            {/* Code block 2 */}
            <div className="relative rounded-xl bg-[#09251B] p-3 font-mono text-[11px] text-emerald-200">
              <button
                onClick={() => copyToClipboard(apkBuildSteps, 'cmd2')}
                className="absolute right-2 top-2 flex items-center gap-1 rounded bg-white/10 px-2 py-0.5 text-[10px] text-white hover:bg-white/20"
              >
                {copiedSection === 'cmd2' ? <CheckCircle2 className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                {copiedSection === 'cmd2' ? 'Tersalin' : 'Salin Langkah'}
              </button>
              <pre className="overflow-x-auto whitespace-pre-wrap">{apkBuildSteps}</pre>
            </div>
          </div>

          {/* Verification checklist note */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 space-y-1">
            <span className="font-bold text-xs text-[#064B32] block">
              Status Kesiapan Ekspor Android:
            </span>
            <ul className="list-disc list-inside text-[11px] text-[#08784F] space-y-0.5">
              <li>Web assets siap di-build (`npm run build` menghasilkan bundle teroptimasi)</li>
              <li>PWA Web Manifest & Service Worker aktif</li>
              <li>Ikon resolusi 192x192, 512x512, dan Maskable 512x512 tersedia lengkap</li>
              <li>Akurasi waktu salat berbasis kalkulasi offline Kemenag RI</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-end border-t border-[#DCE5DD] pt-3">
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
