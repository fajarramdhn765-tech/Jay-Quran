import React from 'react';
import { X, Download, Smartphone, CheckCircle, Share, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl text-[#09251B]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#DCE5DD] pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#064B32] text-[#FFF4D6]">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#064B32]">
                Instal Jay'z Quran
              </h3>
              <p className="text-xs text-[#52665B]">Akses Cepat & Offline di HP / Laptop</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#F5F7F2] text-[#52665B]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="py-4 space-y-3 text-xs">
          {isInstalled ? (
            <div className="flex flex-col items-center justify-center py-4 text-center space-y-2">
              <CheckCircle className="h-10 w-10 text-[#08784F]" />
              <p className="font-bold text-sm text-[#064B32]">Aplikasi Telah Terinstal!</p>
              <p className="text-[#52665B]">
                Jay'z Quran sudah terpasang di perangkat Anda dan dapat diakses langsung dari layar utama.
              </p>
            </div>
          ) : isInstallable ? (
            <div className="space-y-3">
              <p className="text-[#52665B] leading-relaxed">
                Pasang Jay'z Quran di layar utama ponsel Android atau desktop Anda untuk pengalaman seperti aplikasi native tanpa perlu membuka peramban:
              </p>
              <ul className="space-y-1.5 text-[#09251B]">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#08784F] shrink-0" />
                  <span>Dapat dibuka offline tanpa kuota internet</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#08784F] shrink-0" />
                  <span>Ukuran sangat ringan (kurang dari 2 MB)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#08784F] shrink-0" />
                  <span>Tampilan layar penuh tanpa bilah peramban</span>
                </li>
              </ul>

              <button
                onClick={handleInstallClick}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#064B32] py-3 text-xs font-bold text-white shadow-sm hover:bg-[#08784F] transition"
              >
                <Download className="h-4 w-4 text-[#E9B949]" />
                Pasang Jay'z Quran Sekarang
              </button>
            </div>
          ) : isIOS ? (
            <div className="space-y-3">
              <p className="text-[#52665B] leading-relaxed">
                Untuk memasang Jay'z Quran di perangkat Apple iPhone atau iPad:
              </p>
              <div className="space-y-2 rounded-xl bg-[#F5F7F2] p-3 text-[#09251B]">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#064B32] text-white text-[10px] font-bold">1</span>
                  <span>Tekan tombol <strong>Bagikan (Share)</strong> <Share className="inline h-3.5 w-3.5" /> di menu Safari</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#064B32] text-white text-[10px] font-bold">2</span>
                  <span>Gulir ke bawah dan pilih <strong>"Tambah ke Layar Utama"</strong> (Add to Home Screen)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#064B32] text-white text-[10px] font-bold">3</span>
                  <span>Tekan <strong>Tambah</strong> di sudut kanan atas</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[#52665B] leading-relaxed">
                Untuk memasang aplikasi ini di browser Anda:
              </p>
              <div className="rounded-xl bg-[#F5F7F2] p-3 space-y-1 text-[#09251B]">
                <p>1. Buka menu peramban (titik tiga di kanan atas peramban).</p>
                <p>2. Pilih menu <strong>"Instal Jay'z Quran"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#DCE5DD] pt-3 text-right">
          <button
            onClick={onClose}
            className="rounded-lg bg-[#F5F7F2] px-4 py-1.5 text-xs font-semibold text-[#52665B] hover:bg-[#EAEFEA]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
