import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, Trophy, RotateCcw, ArrowRight } from 'lucide-react';
import { sfx, speech } from '../../utils/audio';

interface ScoreModalProps {
  isOpen: boolean;
  score: number;
  maxScore: number;
  activityTitle: string;
  onPlayAgain: () => void;
  onNextActivity: () => void;
  onClose: () => void;
}

export const ScoreModal: React.FC<ScoreModalProps> = ({
  isOpen,
  score,
  maxScore,
  activityTitle,
  onPlayAgain,
  onNextActivity,
  onClose,
}) => {
  if (!isOpen) return null;

  const percentage = Math.round((score / maxScore) * 100);
  const stars = percentage >= 90 ? 3 : percentage >= 60 ? 2 : 1;

  useEffect(() => {
    sfx.playFanfare();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'],
      });
    } catch {
      // ignore
    }

    if (stars === 3) {
      speech.speakText("Superstar! Perfect score! You're an English champion!");
    } else if (stars === 2) {
      speech.speakText("Awesome work! You earned two shiny stars!");
    } else {
      speech.speakText("Good effort! Keep practicing, you are doing great!");
    }
  }, [stars]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl border-4 border-amber-300 shadow-2xl p-6 text-center transform scale-100 transition-all">
        
        {/* Trophy / Ribbon Banner */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center shadow-lg border-2 border-white -mt-10 mb-4 animate-bounce">
          <Trophy className="w-10 h-10 text-amber-950" />
        </div>

        <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-800">
          {stars === 3 ? '🎉 Fantastic Job! 🎉' : stars === 2 ? '🌟 Great Progress! 🌟' : '🎈 Keep Learning! 🎈'}
        </h3>
        
        <p className="text-slate-500 font-medium text-sm mt-1">
          {activityTitle} Completed
        </p>

        {/* 3 Golden Stars */}
        <div className="flex items-center justify-center gap-3 my-5">
          {[1, 2, 3].map((starNum) => {
            const isEarned = starNum <= stars;
            return (
              <div
                key={starNum}
                className={`transform transition-all duration-300 ${
                  isEarned ? 'scale-110 text-amber-400' : 'scale-90 text-slate-200'
                }`}
              >
                <Star
                  className={`w-12 h-12 ${
                    isEarned ? 'fill-amber-400 drop-shadow-md' : 'fill-slate-200'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Score Tally Board */}
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4 mb-6">
          <div className="grid grid-cols-2 divide-x divide-amber-200">
            <div>
              <span className="text-xs text-amber-800 font-medium">Your Score</span>
              <p className="font-display font-extrabold text-3xl text-amber-600">
                {score} <span className="text-lg text-amber-400">/ {maxScore}</span>
              </p>
            </div>
            <div>
              <span className="text-xs text-amber-800 font-medium">Accuracy</span>
              <p className="font-display font-extrabold text-3xl text-emerald-600">
                {percentage}%
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-amber-200/80 flex items-center justify-center gap-2 text-xs font-bold text-amber-900">
            <span>+{score * 20 + stars * 15} XP Earned</span>
            <span>·</span>
            <span>+{stars} Stars Added</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              sfx.playPop();
              onPlayAgain();
            }}
            className="btn-chunky bg-slate-100 hover:bg-slate-200 text-slate-800 py-3 rounded-2xl font-display font-bold text-sm flex items-center justify-center gap-2 border border-slate-300"
          >
            <RotateCcw className="w-4 h-4 text-slate-600" />
            <span>Play Again</span>
          </button>

          <button
            onClick={() => {
              sfx.playPop();
              onNextActivity();
            }}
            className="btn-chunky-amber py-3 rounded-2xl font-display font-bold text-sm flex items-center justify-center gap-2"
          >
            <span>Next Game</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
