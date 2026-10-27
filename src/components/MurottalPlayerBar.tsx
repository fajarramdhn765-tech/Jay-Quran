import React, { useState } from 'react';
import { Play, Pause, Square, Volume2, FastForward, User, X } from 'lucide-react';
import { audioService, AudioPlayerState } from '../services/audioService';
import { APP_CONFIG } from '../config/appConfig';

interface MurottalPlayerBarProps {
  audioState: AudioPlayerState;
}

export const MurottalPlayerBar: React.FC<MurottalPlayerBarProps> = ({ audioState }) => {
  const [showQariMenu, setShowQariMenu] = useState(false);

  if (!audioState.surahNumber) return null;

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    audioService.seek(val);
  };

  const toggleSpeed = () => {
    const current = audioState.playbackRate;
    let nextRate = 1.0;
    if (current === 1.0) nextRate = 1.25;
    else if (current === 1.25) nextRate = 1.5;
    else nextRate = 1.0;
    audioService.setPlaybackRate(nextRate);
  };

  const currentQari = APP_CONFIG.availableQaris.find((q) => q.id === audioState.qariId) || APP_CONFIG.availableQaris[0];

  return (
    <div className="fixed bottom-14 left-0 right-0 z-30 border-t border-[#DCE5DD] bg-white/95 px-4 py-2.5 shadow-2xl backdrop-blur-md transition-all">
      <div className="mx-auto max-w-4xl">
        {/* Progress seek bar */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="font-mono text-[10px] text-[#52665B] min-w-[32px]">
            {formatTime(audioState.currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={audioState.duration || 100}
            value={audioState.currentTime}
            onChange={handleSeek}
            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-lg bg-[#DCE5DD] accent-[#064B32]"
          />
          <span className="font-mono text-[10px] text-[#52665B] min-w-[32px] text-right">
            {formatTime(audioState.duration)}
          </span>
        </div>

        {/* Player controls */}
        <div className="flex items-center justify-between gap-2">
          {/* Track metadata */}
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFF4D6] text-[#064B32]">
              <Volume2 className="h-4 w-4" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#064B32] truncate">
                  QS. {audioState.surahNameLatin}
                </span>
                <span className="rounded bg-[#F5F7F2] px-1 py-0.2 text-[9px] font-semibold text-[#52665B]">
                  {audioState.verseNumber ? `Ayat ${audioState.verseNumber}` : 'Surah Penuh'}
                </span>
              </div>
              <div className="text-[10px] text-[#52665B] truncate">
                Qari: {currentQari.name}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Speed toggle */}
            <button
              onClick={toggleSpeed}
              className="rounded-lg border border-[#DCE5DD] bg-[#F5F7F2] px-2 py-1 text-[11px] font-semibold text-[#09251B] transition hover:bg-[#EAEFEA]"
              title="Atur Kecepatan Putar"
            >
              {audioState.playbackRate}x
            </button>

            {/* Play / Pause button */}
            <button
              onClick={() => {
                if (audioState.isPlaying) audioService.pause();
                else audioService.resume();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#064B32] text-[#FFF4D6] shadow-sm transition hover:bg-[#08784F]"
            >
              {audioState.isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 translate-x-0.5" />
              )}
            </button>

            {/* Stop button */}
            <button
              onClick={() => audioService.stop()}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700"
              title="Tutup Pemutar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
