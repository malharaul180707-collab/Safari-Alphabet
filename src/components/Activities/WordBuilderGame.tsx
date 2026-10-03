import React, { useState, useEffect } from 'react';
import { Volume2, Sparkles, Check, ArrowRight } from 'lucide-react';
import { GradeLevel } from '../../types';
import { ALPHABET_DATA } from '../../data/alphabetData';
import { speech, sfx } from '../../utils/audio';
import { useStudent } from '../../context/StudentContext';
import { ScoreModal } from './ScoreModal';

interface WordBuilderGameProps {
  grade: GradeLevel;
  onNextActivity: () => void;
}

interface WordPuzzle {
  fullWord: string;
  emoji: string;
  missingIndex: number;
  missingLetter: string;
  sentence: string;
  letterChoices: string[];
}

export const WordBuilderGame: React.FC<WordBuilderGameProps> = ({
  grade,
  onNextActivity,
}) => {
  const { recordActivityResult } = useStudent();
  const [puzzles, setPuzzles] = useState<WordPuzzle[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [showScoreModal, setShowScoreModal] = useState(false);

  // Generate 5 word puzzles suitable for the grade
  const generatePuzzles = () => {
    const pool = [...ALPHABET_DATA].sort(() => Math.random() - 0.5);
    const selected = pool.slice(0, 5);

    const newPuzzles: WordPuzzle[] = selected.map((item) => {
      const gw = item.gradeWords[grade][0] || item.gradeWords.KG1[0];
      const word = gw.word.toUpperCase();

      // For KG1/KG2 missing letter is usually the first letter (initial phonics)
      // For G1/G2 could be first or middle vowel
      let missingIndex = 0;
      if (grade === 'G1' || grade === 'G2') {
        // pick middle letter if possible
        missingIndex = word.length > 3 ? Math.floor(Math.random() * (word.length - 1)) : 0;
      }
      const missingLetter = word[missingIndex];

      // Distractors (3 wrong letters)
      const alphabetLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      const distractors = alphabetLetters
        .filter((l) => l !== missingLetter)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      const letterChoices = [missingLetter, ...distractors].sort(() => Math.random() - 0.5);

      return {
        fullWord: word,
        emoji: gw.emoji,
        missingIndex,
        missingLetter,
        sentence: gw.sentence,
        letterChoices,
      };
    });

    setPuzzles(newPuzzles);
    setCurrentIndex(0);
    setScore(0);
    setSelectedLetter(null);
    setIsAnswered(false);
    setShowScoreModal(false);
  };

  useEffect(() => {
    generatePuzzles();
  }, [grade]);

  const currentPuzzle = puzzles[currentIndex];

  useEffect(() => {
    if (currentPuzzle && !isAnswered) {
      const timer = setTimeout(() => {
        speech.speakText(`Spell the word: ${currentPuzzle.fullWord.toLowerCase()}! Tap the missing letter.`);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentPuzzle]);

  const handlePlayWord = () => {
    if (!currentPuzzle) return;
    sfx.playPop();
    speech.speakWord(currentPuzzle.fullWord, currentPuzzle.sentence);
  };

  const handleLetterSelect = (letter: string) => {
    if (isAnswered || !currentPuzzle) return;

    setSelectedLetter(letter);
    setIsAnswered(true);

    const correct = letter === currentPuzzle.missingLetter;
    setIsCorrect(correct);

    if (correct) {
      sfx.playCorrect();
      setScore((prev) => prev + 1);
      speech.speakText(`Awesome! ${currentPuzzle.fullWord}!`);
    } else {
      sfx.playWrong();
      speech.speakText(`Almost! The missing letter is ${currentPuzzle.missingLetter} for ${currentPuzzle.fullWord.toLowerCase()}.`);
    }
  };

  const handleNext = () => {
    sfx.playPop();
    if (currentIndex + 1 < puzzles.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedLetter(null);
      setIsAnswered(false);
      setIsCorrect(false);
    } else {
      const finalScore = score + (isCorrect ? 1 : 0);
      const percentage = (finalScore / puzzles.length) * 100;
      const starsEarned = percentage >= 90 ? 3 : percentage >= 60 ? 2 : 1;
      recordActivityResult('Word Builder Spelling', finalScore, puzzles.length, starsEarned);
      setShowScoreModal(true);
    }
  };

  if (!currentPuzzle) return null;

  return (
    <div className="bg-white rounded-3xl border-2 border-emerald-200 shadow-xs p-5 sm:p-8 max-w-2xl mx-auto">
      
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-emerald-950 text-sm">
            Word Builder {currentIndex + 1} of {puzzles.length}
          </span>
          <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
            {grade}
          </span>
        </div>

        <div className="flex items-center gap-1.5 font-display font-bold text-amber-600 text-sm">
          <span>Score: {score}</span>
        </div>
      </div>

      {/* Main Illustration & Hear Word Banner */}
      <div className="bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 rounded-3xl p-6 text-white text-center shadow-md mb-6 relative">
        <span className="text-6xl sm:text-7xl block mb-2 filter drop-shadow-sm">
          {currentPuzzle.emoji}
        </span>

        <button
          onClick={handlePlayWord}
          className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-xs px-4 py-2 rounded-2xl text-white font-display font-bold text-sm transition-all cursor-pointer active:scale-95"
          title="Hear word pronunciation"
        >
          <Volume2 className="w-5 h-5 text-amber-300 animate-pulse" />
          <span>Hear Word: "{currentPuzzle.fullWord.toLowerCase()}"</span>
        </button>
      </div>

      {/* Word Slots (Interactive letter blocks with the missing letter slot!) */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 my-6">
        {currentPuzzle.fullWord.split('').map((char, idx) => {
          const isMissing = idx === currentPuzzle.missingIndex;

          if (isMissing) {
            return (
              <div
                key={idx}
                className={`w-12 h-14 sm:w-16 sm:h-20 rounded-2xl border-4 flex items-center justify-center font-display font-extrabold text-3xl sm:text-4xl shadow-inner transition-all ${
                  isAnswered
                    ? isCorrect
                      ? 'bg-emerald-100 border-emerald-500 text-emerald-700 animate-bounce'
                      : 'bg-rose-100 border-rose-500 text-rose-700'
                    : 'bg-amber-100 border-dashed border-amber-400 text-amber-600 animate-pulse'
                }`}
              >
                {isAnswered ? currentPuzzle.missingLetter : '?'}
              </div>
            );
          }

          return (
            <div
              key={idx}
              className="w-12 h-14 sm:w-16 sm:h-20 rounded-2xl bg-slate-100 border-2 border-slate-300 flex items-center justify-center font-display font-extrabold text-3xl sm:text-4xl text-slate-800 shadow-xs"
            >
              {char}
            </div>
          );
        })}
      </div>

      {/* Spoken Hint / Instruction */}
      <p className="text-center font-display font-semibold text-slate-600 text-sm mb-4">
        Tap the missing letter to complete the word!
      </p>

      {/* 4 Chunky Letter Choice Blocks */}
      <div className="grid grid-cols-4 gap-3 sm:gap-4 mb-6">
        {currentPuzzle.letterChoices.map((letter) => {
          const isTarget = letter === currentPuzzle.missingLetter;
          let btnStyle = 'btn-chunky bg-white border-2 border-slate-200 text-slate-800 hover:border-emerald-400';

          if (isAnswered) {
            if (isTarget) {
              btnStyle = 'bg-emerald-500 text-white border-2 border-emerald-600';
            } else if (selectedLetter === letter) {
              btnStyle = 'bg-rose-400 text-white border-2 border-rose-500';
            } else {
              btnStyle = 'bg-slate-50 text-slate-300 border border-slate-200 opacity-50';
            }
          }

          return (
            <button
              key={letter}
              onClick={() => handleLetterSelect(letter)}
              disabled={isAnswered}
              className={`h-16 sm:h-20 rounded-2xl font-display font-extrabold text-3xl sm:text-4xl flex items-center justify-center cursor-pointer transition-all active:scale-95 ${btnStyle}`}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {/* Feedback Bar */}
      {isAnswered && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3 animate-in fade-in duration-150">
          <div>
            <p className="font-display font-bold text-sm text-slate-900">
              {isCorrect ? '🌟 Word Completed!' : 'Keep Going!'}
            </p>
            <p className="text-xs text-slate-600">
              "{currentPuzzle.sentence}"
            </p>
          </div>

          <button
            onClick={handleNext}
            className="btn-chunky-emerald px-5 py-2.5 rounded-2xl font-display font-bold text-sm shrink-0 flex items-center gap-1.5"
          >
            <span>{currentIndex + 1 < puzzles.length ? 'Next Word' : 'See Score'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Score celebration modal */}
      <ScoreModal
        isOpen={showScoreModal}
        score={score}
        maxScore={puzzles.length}
        activityTitle="Word Builder Spelling"
        onPlayAgain={generatePuzzles}
        onNextActivity={onNextActivity}
        onClose={() => setShowScoreModal(false)}
      />

    </div>
  );
};
