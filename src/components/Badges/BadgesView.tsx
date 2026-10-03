import React from 'react';
import { Award, Lock, Sparkles, CheckCircle } from 'lucide-react';
import { ALL_BADGES } from '../../data/initialData';
import { useStudent } from '../../context/StudentContext';
import { speech, sfx } from '../../utils/audio';

export const BadgesView: React.FC = () => {
  const { currentStudent } = useStudent();

  const handleSpeakBadge = (title: string, desc: string, unlocked: boolean) => {
    sfx.playPop();
    speech.speakText(
      unlocked
        ? `Badge Unlocked: ${title}! ${desc}`
        : `Locked Badge: ${title}. ${desc} Keep practicing to earn it!`
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Banner */}
      <div className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 rounded-3xl p-6 text-white shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-4xl">🏆</span>
          <div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-amber-950">
              Trophy Room & Badges
            </h2>
            <p className="text-amber-900/90 text-xs sm:text-sm font-medium">
              Collect all shiny badges by completing English phonics activities and streaks!
            </p>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        {ALL_BADGES.map((badge) => {
          const isUnlocked =
            badge.category === 'letters'
              ? currentStudent.masteredLetters.length >= badge.requiredCount
              : badge.category === 'streak'
              ? currentStudent.streak >= badge.requiredCount
              : badge.unlocked;

          const progress = Math.min(
            100,
            badge.category === 'letters'
              ? (currentStudent.masteredLetters.length / badge.requiredCount) * 100
              : badge.category === 'streak'
              ? (currentStudent.streak / badge.requiredCount) * 100
              : 80
          );

          return (
            <div
              key={badge.id}
              onClick={() => handleSpeakBadge(badge.title, badge.description, isUnlocked)}
              className={`p-4 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                isUnlocked
                  ? 'bg-amber-50/70 border-amber-300 shadow-sm hover:border-amber-400 hover:scale-102'
                  : 'bg-slate-50 border-slate-200 opacity-70 hover:opacity-90'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-4xl ${isUnlocked ? 'filter drop-shadow-sm' : 'grayscale opacity-50'}`}>
                    {badge.icon}
                  </span>

                  {isUnlocked ? (
                    <span className="text-[11px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>Unlocked</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>Locked</span>
                    </span>
                  )}
                </div>

                <h3 className="font-display font-bold text-base text-slate-900">
                  {badge.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  {badge.description}
                </p>
              </div>

              {/* Progress bar */}
              <div className="mt-4 pt-3 border-t border-black/5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isUnlocked ? 'bg-amber-500' : 'bg-slate-400'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
