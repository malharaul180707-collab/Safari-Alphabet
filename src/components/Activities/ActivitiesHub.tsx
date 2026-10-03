import React, { useState } from 'react';
import { Volume2, Sparkles, Gamepad2, Award, ArrowLeft } from 'lucide-react';
import { GradeLevel } from '../../types';
import { ListenPickGame } from './ListenPickGame';
import { WordBuilderGame } from './WordBuilderGame';
import { BalloonPopGame } from './BalloonPopGame';
import { sfx } from '../../utils/audio';

interface ActivitiesHubProps {
  grade: GradeLevel;
  presetLetter?: string;
  onClearPresetLetter: () => void;
  onOpenMagicCamera?: () => void;
}

export const ActivitiesHub: React.FC<ActivitiesHubProps> = ({
  grade,
  presetLetter,
  onClearPresetLetter,
  onOpenMagicCamera,
}) => {
  const [activeGame, setActiveGame] = useState<'listen' | 'spelling' | 'balloon' | null>(
    presetLetter ? 'listen' : null
  );

  const games = [
    {
      id: 'camera' as const,
      title: 'Magic Camera Drawing 📸',
      subtitle: 'Draw letters or words on paper or screen. The AI camera detects your shapes!',
      icon: '📸',
      badge: 'Camera AI & Shapes',
      color: 'bg-purple-50 border-purple-200 hover:border-purple-400 text-purple-950',
      tagColor: 'bg-purple-200 text-purple-800',
      btnColor: 'btn-chunky-purple',
      action: onOpenMagicCamera,
    },
    {
      id: 'listen' as const,
      title: 'Hear & Pick (Phonics Ear Training)',
      subtitle: 'Listen to the letter sound and tap the matching card!',
      icon: '🎧',
      badge: 'Phonics & Sounds',
      color: 'bg-sky-50 border-sky-200 hover:border-sky-400 text-sky-950',
      tagColor: 'bg-sky-200 text-sky-800',
      btnColor: 'btn-chunky-blue',
    },
    {
      id: 'spelling' as const,
      title: 'Word Builder (Missing Letter)',
      subtitle: 'Spell words by finding the missing vowel or letter!',
      icon: '🧩',
      badge: 'Spelling & Vocabulary',
      color: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400 text-emerald-950',
      tagColor: 'bg-emerald-200 text-emerald-800',
      btnColor: 'btn-chunky-emerald',
    },
    {
      id: 'balloon' as const,
      title: 'Balloon Pop (Letter Safari Arcade)',
      subtitle: 'Fast and fun arcade game: Pop the target letter balloons!',
      icon: '🎈',
      badge: 'Arcade Mini-Game',
      color: 'bg-amber-50 border-amber-200 hover:border-amber-400 text-amber-950',
      tagColor: 'bg-amber-200 text-amber-800',
      btnColor: 'btn-chunky-amber',
    },
  ];

  const handleSelectGame = (game: typeof games[number]) => {
    sfx.playPop();
    if (game.id === 'camera' && onOpenMagicCamera) {
      onOpenMagicCamera();
    } else if (game.id !== 'camera') {
      setActiveGame(game.id as 'listen' | 'spelling' | 'balloon');
    }
  };

  const handleBackToHub = () => {
    sfx.playPop();
    setActiveGame(null);
    onClearPresetLetter();
  };

  const handleNextActivity = () => {
    if (activeGame === 'listen') setActiveGame('spelling');
    else if (activeGame === 'spelling') setActiveGame('balloon');
    else setActiveGame('listen');
  };

  return (
    <div className="space-y-4">
      {/* If a game is active, show back navigation */}
      {activeGame && (
        <div className="flex items-center justify-between">
          <button
            onClick={handleBackToHub}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-display font-bold text-amber-900 hover:text-amber-700 bg-white border border-amber-200 px-3 py-1.5 rounded-xl shadow-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Game Select</span>
          </button>

          <span className="text-xs bg-amber-100 text-amber-900 font-bold px-3 py-1 rounded-full">
            Grade: {grade}
          </span>
        </div>
      )}

      {/* Render Active Game */}
      {activeGame === 'listen' && (
        <ListenPickGame
          grade={grade}
          presetLetter={presetLetter}
          onNextActivity={handleNextActivity}
        />
      )}

      {activeGame === 'spelling' && (
        <WordBuilderGame grade={grade} onNextActivity={handleNextActivity} />
      )}

      {activeGame === 'balloon' && (
        <BalloonPopGame grade={grade} onNextActivity={handleNextActivity} />
      )}

      {/* Game Selection Menu */}
      {!activeGame && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 rounded-3xl p-6 text-white shadow-md">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🎮</span>
              <div>
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl">
                  Play & Score Learning Games
                </h2>
                <p className="text-emerald-100 text-xs sm:text-sm mt-0.5 font-medium">
                  Practice English alphabet sounds, spell new words, and earn gold stars for your student profile!
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {games.map((g) => (
              <div
                key={g.id}
                onClick={() => handleSelectGame(g)}
                className={`rounded-3xl border-2 p-5 shadow-xs transition-all hover:shadow-md hover:-translate-y-1 cursor-pointer flex flex-col justify-between ${g.color}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-4xl">{g.icon}</span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${g.tagColor}`}>
                      {g.badge}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-base leading-snug">
                    {g.title}
                  </h3>
                  <p className="text-xs opacity-75 mt-1.5 font-medium">
                    {g.subtitle}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-black/5">
                  <button
                    className={`w-full py-2.5 rounded-2xl font-display font-bold text-sm ${g.btnColor}`}
                  >
                    Play Now 🚀
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
