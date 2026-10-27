import React, { useState } from 'react';
import { X, Search, MapPin, Locate, Check, Compass } from 'lucide-react';
import { CityInfo, INDONESIA_CITIES } from '../config/appConfig';
import { prayerTimesService } from '../services/prayerTimesService';

interface CitySelectorModalProps {
  currentCity: CityInfo;
  onSelectCity: (city: CityInfo) => void;
  onClose: () => void;
}

export const CitySelectorModal: React.FC<CitySelectorModalProps> = ({
  currentCity,
  onSelectCity,
  onClose,
}) => {
  const [search, setSearch] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  const filteredCities = INDONESIA_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.province.toLowerCase().includes(search.toLowerCase()) ||
      c.tzLabel.toLowerCase().includes(search.toLowerCase())
  );

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocError('Browser Anda tidak mendukung geolokasi GPS.');
      return;
    }

    setIsLocating(true);
    setLocError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        const nearest = prayerTimesService.findNearestCity(latitude, longitude);

        // Customize with user's actual coordinates
        const customLocation: CityInfo = {
          ...nearest,
          name: `${nearest.name} (Lokasi GPS)`,
          lat: latitude,
          lng: longitude,
        };

        onSelectCity(customLocation);
        onClose();
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocError('Izin akses lokasi ditolak. Silakan pilih kota manual di bawah.');
        } else {
          setLocError('Gagal mendeteksi lokasi otomatis. Silakan pilih kota manual.');
        }
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[85vh] w-full max-w-md flex-col rounded-2xl bg-white p-5 shadow-2xl text-[#09251B]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#DCE5DD] pb-3">
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-[#064B32]" />
            <h3 className="text-base font-bold text-[#064B32]">Pilih Kota / Lokasi Salat</h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#F5F7F2] text-[#52665B]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* GPS Location Button */}
        <div className="mt-3">
          <button
            onClick={handleUseMyLocation}
            disabled={isLocating}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#064B32] py-2.5 text-xs font-semibold text-white transition hover:bg-[#08784F] disabled:opacity-50"
          >
            <Locate className={`h-4 w-4 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Mendeteksi Koordinat GPS...' : 'Gunakan Lokasi GPS Saya'}</span>
          </button>

          {locError && (
            <p className="mt-2 text-center text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
              {locError}
            </p>
          )}
        </div>

        {/* Search input */}
        <div className="relative mt-3">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#52665B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama kota, provinsi, atau zona..."
            className="w-full rounded-xl border border-[#DCE5DD] bg-[#F5F7F2] py-2 pl-9 pr-3 text-xs text-[#09251B] placeholder:text-[#52665B] focus:border-[#064B32] focus:bg-white focus:outline-none"
          />
        </div>

        {/* City list */}
        <div className="mt-3 flex-1 overflow-y-auto divide-y divide-[#DCE5DD] pr-1">
          {filteredCities.length === 0 ? (
            <p className="py-6 text-center text-xs text-[#52665B]">Kota tidak ditemukan.</p>
          ) : (
            filteredCities.map((city) => {
              const isSelected = currentCity.id === city.id;

              return (
                <button
                  key={city.id}
                  onClick={() => {
                    onSelectCity(city);
                    onClose();
                  }}
                  className={`flex w-full items-center justify-between py-2.5 px-2 text-left transition rounded-lg ${
                    isSelected ? 'bg-[#FFF4D6] text-[#064B32] font-semibold' : 'hover:bg-[#F5F7F2]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className={`h-4 w-4 ${isSelected ? 'text-[#064B32]' : 'text-[#52665B]'}`} />
                    <div>
                      <div className="text-xs font-medium">{city.name}</div>
                      <div className="text-[10px] text-[#52665B]">{city.province}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded bg-[#F5F7F2] border border-[#DCE5DD] px-1.5 py-0.5 text-[10px] font-bold text-[#064B32]">
                      {city.tzLabel}
                    </span>
                    {isSelected && <Check className="h-4 w-4 text-[#064B32]" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Note */}
        <div className="border-t border-[#DCE5DD] pt-3 text-center text-[10px] text-[#52665B]">
          Perhitungan waktu salat terkalibrasi otomatis sesuai koordinat lintang & bujur.
        </div>
      </div>
    </div>
  );
};
