import React from 'react';
import { Play, Pause, Square, FastForward, ArrowDown } from 'lucide-react';

interface AutoScrollControlsProps {
  isScrolling: boolean;
  speed: number;
  onToggleScroll: () => void;
  onChangeSpeed: (newSpeed: number) => void;
  onStop: () => void;
}

export const AutoScrollControls: React.FC<AutoScrollControlsProps> = ({
  isScrolling,
  speed,
  onToggleScroll,
  onChangeSpeed,
  onStop,
}) => {
  const speeds = [
    { label: '0.5x', val: 18 },
    { label: '1.0x', val: 32 },
    { label: '1.5x', val: 50 },
    { label: '2.0x', val: 75 },
  ];

  return (
    <div className="fixed bottom-20 left-1/2 z-40 -translate-x-1/2 rounded-2xl border border-[#DCE5DD] bg-white/95 px-4 py-2 shadow-xl backdrop-blur-md transition-all">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#064B32]">
          <ArrowDown className={`h-3.5 w-3.5 ${isScrolling ? 'animate-bounce' : ''}`} />
          <span className="hidden sm:inline">Auto-Scroll</span>
        </div>

        {/* Play/Pause */}
        <button
          onClick={onToggleScroll}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#064B32] text-white transition hover:bg-[#08784F]"
          title={isScrolling ? 'Jeda Gulir' : 'Lanjutkan Gulir'}
        >
          {isScrolling ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-0.5" />}
        </button>

        {/* Speed choices */}
        <div className="flex items-center rounded-lg bg-[#F5F7F2] p-0.5 border border-[#DCE5DD]">
          {speeds.map((s) => (
            <button
              key={s.label}
              onClick={() => onChangeSpeed(s.val)}
              className={`rounded px-1.5 py-0.5 text-[10px] font-semibold transition ${
                speed === s.val
                  ? 'bg-[#064B32] text-white shadow-xs'
                  : 'text-[#52665B] hover:text-[#09251B]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Stop button */}
        <button
          onClick={onStop}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-rose-600 hover:bg-rose-50"
          title="Hentikan Auto-Scroll"
        >
          <Square className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
