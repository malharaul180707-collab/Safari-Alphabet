import React from 'react';
import { BookOpen, Gamepad2, Award, User, Shield } from 'lucide-react';
import { sfx } from '../utils/audio';

export type NavTab = 'learn' | 'games' | 'camera' | 'badges' | 'profile' | 'parent';

interface NavigationProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onSelectTab }) => {
  const tabs = [
    {
      id: 'learn' as NavTab,
      label: 'Phonics & A-Z',
      icon: (
        <span className="text-xl">🏠</span>
      ),
      activeColor: 'text-amber-600 border-amber-500 bg-amber-50',
    },
    {
      id: 'games' as NavTab,
      label: 'Play & Score',
      icon: (
        <span className="text-xl">🎮</span>
      ),
      activeColor: 'text-emerald-600 border-emerald-500 bg-emerald-50',
    },
    {
      id: 'camera' as NavTab,
      label: 'Magic Camera',
      icon: (
        <span className="text-xl">📸</span>
      ),
      activeColor: 'text-purple-600 border-purple-500 bg-purple-50',
    },
    {
      id: 'badges' as NavTab,
      label: 'Trophies',
      icon: (
        <span className="text-xl">🏆</span>
      ),
      activeColor: 'text-yellow-600 border-yellow-500 bg-yellow-50',
    },
    {
      id: 'profile' as NavTab,
      label: 'My Profile',
      icon: (
        <span className="text-xl">👧</span>
      ),
      activeColor: 'text-purple-600 border-purple-500 bg-purple-50',
    },
    {
      id: 'parent' as NavTab,
      label: 'Parents',
      icon: (
        <span className="text-xl">🛡️</span>
      ),
      activeColor: 'text-slate-800 border-slate-700 bg-slate-100',
    },
  ];

  const handleSelect = (tab: NavTab) => {
    sfx.playPop();
    onSelectTab(tab);
  };

  return (
    <>
      {/* Desktop & Tablet Top-Sub Navigation Bar */}
      <div className="max-w-4xl mx-auto px-4 pt-3 pb-2 hidden md:block">
        <div className="bg-white/95 p-1.5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between gap-1">
          {tabs.map((tab) => {
            const active = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleSelect(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-display font-semibold text-xs sm:text-sm transition-all ${
                  active
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Sticky Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-2 py-1.5 shadow-lg">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const active = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleSelect(tab.id)}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-transform active:scale-95 ${
                  active ? 'text-stone-900 font-bold' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <div className="relative">
                  {tab.icon}
                  {active && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-stone-900 rounded-full" />
                  )}
                </div>
                <span className="text-[10px] font-display font-medium mt-0.5">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
