import React from 'react';
import { Volume2, VolumeX, Shield, Flame, Star, ChevronDown, UserPlus } from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { GradeLevel } from '../types';
import { sfx, speech } from '../utils/audio';

interface HeaderProps {
  onOpenParentGate: () => void;
  onOpenStudentSwitch: () => void;
  activeGrade: GradeLevel;
  setActiveGrade: (g: GradeLevel) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenParentGate,
  onOpenStudentSwitch,
  activeGrade,
  setActiveGrade,
}) => {
  const { currentStudent, soundEnabled, toggleSound, updateStudentGrade } = useStudent();

  const handleGradeChange = (grade: GradeLevel) => {
    setActiveGrade(grade);
    updateStudentGrade(currentStudent.id, grade);
    sfx.playPop();
    speech.speakText(`Switching to ${grade === 'KG1' ? 'Kindergarten 1' : grade === 'KG2' ? 'Kindergarten 2' : grade === 'G1' ? 'Grade 1' : 'Grade 2'}!`);
  };

  const getGradeName = (grade: GradeLevel) => {
    switch (grade) {
      case 'KG1': return 'KG 1 (Ages 3-4)';
      case 'KG2': return 'KG 2 (Ages 4-5)';
      case 'G1': return 'Grade 1 (Ages 5-6)';
      case 'G2': return 'Grade 2 (Ages 6-7)';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs px-3 sm:px-6 py-2.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Logo and Brand */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl sm:text-2xl shadow-xs">
            🦁
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-lg sm:text-xl text-stone-900 tracking-tight">
                Alphabet Safari
              </span>
            </div>
            <p className="text-[11px] text-stone-500 font-medium hidden sm:block">
              English Phonics & Pronunciation Studio
            </p>
          </div>
        </div>

        {/* Grade Level Selector (KG1 -> Grade 2) */}
        <div className="flex items-center bg-stone-200/60 p-1 rounded-2xl border border-stone-200">
          {(['KG1', 'KG2', 'G1', 'G2'] as GradeLevel[]).map((lvl) => {
            const active = activeGrade === lvl;
            return (
              <button
                key={lvl}
                onClick={() => handleGradeChange(lvl)}
                title={getGradeName(lvl)}
                className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs sm:text-sm font-display font-semibold transition-all whitespace-nowrap ${
                  active
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
                }`}
              >
                {lvl}
              </button>
            );
          })}
        </div>

        {/* Right Action Island: Streak, Stars, Current Kid Avatar, Parent Gate */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Streak Flame */}
          <div
            className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 sm:px-2.5 py-1 rounded-full text-amber-800 font-display font-bold text-xs sm:text-sm"
            title={`${currentStudent.streak} Day Learning Streak!`}
          >
            <Flame className="w-3.5 h-3.5 fill-amber-600 text-amber-600" />
            <span>{currentStudent.streak}</span>
          </div>

          {/* Stars Counter */}
          <div
            className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 sm:px-2.5 py-1 rounded-full text-amber-800 font-display font-bold text-xs sm:text-sm"
            title={`${currentStudent.stars} Stars collected!`}
          >
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{currentStudent.stars}</span>
          </div>

          {/* Sound Mute / Unmute */}
          <button
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
            title={soundEnabled ? 'Sound Enabled' : 'Sound Muted'}
            className="p-1.5 sm:p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-700" />
            ) : (
              <VolumeX className="w-4 h-4 text-stone-400" />
            )}
          </button>

          {/* Student Profile Switch Button */}
          <button
            onClick={onOpenStudentSwitch}
            className="flex items-center gap-1.5 bg-white hover:bg-stone-50 border border-stone-200 rounded-2xl p-1 sm:pr-3 transition-colors shadow-xs"
            title="Switch student profile"
          >
            <img
              src={currentStudent.avatar}
              alt={currentStudent.name}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-stone-200 shadow-xs"
            />
            <span className="font-display font-bold text-xs sm:text-sm text-stone-800 max-w-[80px] sm:max-w-[110px] truncate hidden sm:inline">
              {currentStudent.name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-stone-500 hidden sm:inline" />
          </button>

          {/* Parent Control Gate */}
          <button
            onClick={onOpenParentGate}
            className="flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-xl shadow-xs transition-colors"
            title="Parent Area (PIN Protected)"
          >
            <Shield className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Parents</span>
          </button>
        </div>
      </div>
    </header>
  );
};
