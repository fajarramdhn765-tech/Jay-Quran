import React from 'react';
import { Home, BookOpen, Clock, Bookmark, Settings } from 'lucide-react';

export type ActiveTab = 'beranda' | 'quran' | 'jadwal' | 'bookmark' | 'pengaturan';

interface BottomNavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'beranda', label: 'Beranda', icon: Home },
    { id: 'quran', label: "Al-Qur'an", icon: BookOpen },
    { id: 'jadwal', label: 'Jadwal Salat', icon: Clock },
    { id: 'bookmark', label: 'Bookmark', icon: Bookmark },
    { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#DCE5DD] bg-white/95 backdrop-blur-lg safe-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1.5 sm:py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-1 flex-col items-center justify-center rounded-xl py-1 text-xs transition-all ${
                isActive
                  ? 'font-semibold text-[#064B32]'
                  : 'font-normal text-[#52665B] hover:text-[#09251B]'
              }`}
            >
              <div
                className={`relative flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
                  isActive ? 'bg-[#FFF4D6] text-[#064B32] shadow-sm' : 'text-[#52665B]'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
                {isActive && (
                  <span className="absolute -bottom-0.5 h-1 w-3 rounded-full bg-[#064B32]" />
                )}
              </div>
              <span className="mt-1 text-[11px] leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
