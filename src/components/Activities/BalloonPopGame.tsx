import React, { useState, useEffect } from 'react';
import { Volume2, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import { GradeLevel } from '../../types';
import { ALPHABET_DATA } from '../../data/alphabetData';
import { speech, sfx } from '../../utils/audio';
import { useStudent } from '../../context/StudentContext';
import { ScoreModal } from './ScoreModal';

interface BalloonPopGameProps {
  grade: GradeLevel;
  onNextActivity: () => void;
}

interface Balloon {
  id: number;
  letter: string;
  isTarget: boolean;
  color: string;
  popped: boolean;
  x: number;
  y: number;
}

const BALLOON_COLORS = [
  'bg-red-400 border-red-500 shadow-red-200',
  'bg-amber-400 border-amber-500 shadow-amber-200',
  'bg-emerald-400 border-emerald-500 shadow-emerald-200',
  'bg-sky-400 border-sky-500 shadow-sky-200',
  'bg-purple-400 border-purple-500 shadow-purple-200',
  'bg-pink-400 border-pink-500 shadow-pink-200',
];

export const BalloonPopGame: React.FC<BalloonPopGameProps> = ({
  grade,
  onNextActivity,
}) => {
  const { recordActivityResult } = useStudent();
  const [targetLetter, setTargetLetter] = useState<string>('B');
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [score, setScore] = useState(0);
  const [popsNeeded, setPopsNeeded] = useState(6);
  const [popsRemaining, setPopsRemaining] = useState(6);
  const [showScoreModal, setShowScoreModal] = useState(false);

  // Initialize mission
  const initGame = () => {
    // Pick a fun target letter
    const randTarget = ALPHABET_DATA[Math.floor(Math.random() * ALPHABET_DATA.length)].letter;
    setTargetLetter(randTarget);
    setScore(0);
    setPopsNeeded(6);
    setPopsRemaining(6);
    setShowScoreModal(false);

    // Create 12 balloons with random positions
    const newBalloons: Balloon[] = [];
    for (let i = 0; i < 12; i++) {
      const isTarget = i < 6; // exactly 6 targets
      const letter = isTarget
        ? randTarget
        : ALPHABET_DATA[Math.floor(Math.random() * ALPHABET_DATA.length)].letter;

      newBalloons.push({
        id: i,
        letter,
        isTarget: letter === randTarget,
        color: BALLOON_COLORS[i % BALLOON_COLORS.length],
        popped: false,
        x: (i % 4) * 23 + 5 + Math.random() * 5,
        y: Math.floor(i / 4) * 28 + 5 + Math.random() * 4,
      });
    }

    // Shuffle balloons
    setBalloons(newBalloons.sort(() => Math.random() - 0.5));

    // Announce target
    setTimeout(() => {
      speech.speakText(`Safari Balloon Mission: Pop all the balloons with letter ${randTarget}!`);
    }, 350);
  };

  useEffect(() => {
    initGame();
  }, [grade]);

  const handleHearTarget = () => {
    sfx.playPop();
    speech.speakText(`Pop all the balloons with letter ${targetLetter}!`);
  };

  const handlePopBalloon = (balloon: Balloon) => {
    if (balloon.popped) return;

    sfx.playPop();

    if (balloon.isTarget) {
      speech.speakLetter(balloon.letter, 'letter');
      setBalloons((prev) =>
        prev.map((b) => (b.id === balloon.id ? { ...b, popped: true } : b))
      );
      setScore((s) => s + 1);

      const nextRemaining = popsRemaining - 1;
      setPopsRemaining(nextRemaining);

      if (nextRemaining <= 0) {
        // Mission complete!
        sfx.playCorrect();
        setTimeout(() => {
          recordActivityResult('Balloon Pop Letter Hunt', 6, 6, 3);
          setShowScoreModal(true);
        }, 500);
      }
    } else {
      // Tapped wrong balloon
      sfx.playWrong();
      speech.speakText(`Oops, that is letter ${balloon.letter}! Look for letter ${targetLetter}.`);
    }
  };

  return (
    <div className="bg-white rounded-3xl border-2 border-purple-200 shadow-xs p-5 sm:p-8 max-w-2xl mx-auto">
      
      {/* Game Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎈</span>
          <h3 className="font-display font-bold text-slate-800 text-lg sm:text-xl">
            Balloon Pop Letter Safari
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-purple-100 text-purple-800 font-bold px-3 py-1 rounded-full">
            {popsRemaining} remaining to pop
          </span>
          <button
            onClick={initGame}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
            title="Restart Balloon Game"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Target Mission Callout with Audio Button */}
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-3xl p-4 text-white flex items-center justify-between gap-4 shadow-sm mb-6">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white text-purple-700 flex items-center justify-center font-display font-extrabold text-3xl shadow-sm border-2 border-purple-200">
            {targetLetter}
          </div>
          <div>
            <p className="font-display font-extrabold text-base sm:text-lg">
              Pop the "{targetLetter}" Balloons!
            </p>
            <p className="text-purple-100 text-xs font-medium">
              Tap the speaker to hear the mission sound
            </p>
          </div>
        </div>

        <button
          onClick={handleHearTarget}
          className="w-12 h-12 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-xs flex items-center justify-center text-white shrink-0 active:scale-95 transition-transform"
          title="Hear mission target"
        >
          <Volume2 className="w-6 h-6 animate-pulse" />
        </button>
      </div>

      {/* Balloon Floating Sky Arena */}
      <div className="relative h-96 sm:h-[420px] bg-gradient-to-b from-sky-200 via-sky-100 to-amber-50 rounded-3xl border-2 border-sky-300 overflow-hidden p-4 shadow-inner">
        
        {/* Soft Background Clouds */}
        <div className="absolute top-4 left-6 text-4xl opacity-50 select-none">☁️</div>
        <div className="absolute top-12 right-12 text-5xl opacity-40 select-none">☁️</div>
        <div className="absolute bottom-6 left-1/3 text-3xl opacity-30 select-none">☁️</div>

        {/* Floating Interactive Balloons Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 h-full items-center justify-center">
          {balloons.map((balloon) => {
            if (balloon.popped) {
              return (
                <div
                  key={balloon.id}
                  className="flex items-center justify-center h-20 transition-all opacity-40 scale-75"
                >
                  <span className="text-3xl">💥</span>
                </div>
              );
            }

            return (
              <button
                key={balloon.id}
                onClick={() => handlePopBalloon(balloon)}
                className={`relative group mx-auto flex flex-col items-center justify-center w-16 h-20 sm:w-20 sm:h-24 rounded-full border-2 text-white font-display font-extrabold text-2xl sm:text-3xl shadow-lg transition-transform hover:scale-110 active:scale-90 animate-float cursor-pointer ${balloon.color}`}
                style={{
                  animationDelay: `${(balloon.id * 0.25).toFixed(2)}s`,
                }}
              >
                {/* Balloon shine highlight */}
                <div className="absolute top-2 left-3 w-3 h-3 bg-white/50 rounded-full blur-[0.5px]" />
                
                <span>{balloon.letter}</span>

                {/* Balloon string knot */}
                <div className="absolute -bottom-1.5 w-2 h-2 bg-inherit border-b border-inherit rotate-45" />
                <div className="absolute -bottom-4 w-0.5 h-3 bg-slate-400" />
              </button>
            );
          })}
        </div>

      </div>

      {/* Score Modal */}
      <ScoreModal
        isOpen={showScoreModal}
        score={6}
        maxScore={6}
        activityTitle="Balloon Pop Letter Safari"
        onPlayAgain={initGame}
        onNextActivity={onNextActivity}
        onClose={() => setShowScoreModal(false)}
      />

    </div>
  );
};
