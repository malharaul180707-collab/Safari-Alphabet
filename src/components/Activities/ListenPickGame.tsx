import React, { useState, useEffect } from 'react';
import { Volume2, Sparkles, Check, X, RotateCcw } from 'lucide-react';
import { GradeLevel } from '../../types';
import { ALPHABET_DATA } from '../../data/alphabetData';
import { speech, sfx } from '../../utils/audio';
import { useStudent } from '../../context/StudentContext';
import { ScoreModal } from './ScoreModal';

interface ListenPickGameProps {
  grade: GradeLevel;
  presetLetter?: string;
  onNextActivity: () => void;
}

interface Question {
  targetLetter: string;
  targetWord: string;
  phonicsSound: string;
  audioPrompt: string;
  options: { letter: string; word: string; emoji: string }[];
}

export const ListenPickGame: React.FC<ListenPickGameProps> = ({
  grade,
  presetLetter,
  onNextActivity,
}) => {
  const { recordActivityResult, markLetterMastered } = useStudent();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [showScoreModal, setShowScoreModal] = useState(false);

  // Generate 5 questions tailored to grade
  const generateQuestions = () => {
    const pool = [...ALPHABET_DATA].sort(() => Math.random() - 0.5);
    let selectedItems = pool.slice(0, 5);

    // If presetLetter was requested, make sure it is question 1
    if (presetLetter) {
      const target = ALPHABET_DATA.find((a) => a.letter === presetLetter);
      if (target) {
        selectedItems = [target, ...selectedItems.filter((i) => i.letter !== presetLetter).slice(0, 4)];
      }
    }

    const newQuestions: Question[] = selectedItems.map((item) => {
      const gradeWord = item.gradeWords[grade][0] || item.gradeWords.KG1[0];

      // Formulate kid friendly spoken prompt
      let audioPrompt = '';
      if (grade === 'KG1') {
        audioPrompt = `Listen carefully: Which letter makes the sound ${item.phonicsSpelling}, like in ${gradeWord.word}?`;
      } else if (grade === 'KG2') {
        audioPrompt = `Find the starting letter for ${gradeWord.word}!`;
      } else {
        audioPrompt = `Which letter has the phonics sound ${item.phonicsSpelling}? Tap the correct card!`;
      }

      // Generate 3 distractors
      const distractors = ALPHABET_DATA.filter((a) => a.letter !== item.letter)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((d) => ({
          letter: d.letter,
          word: d.gradeWords[grade][0]?.word || d.exampleWord,
          emoji: d.emoji,
        }));

      const options = [
        { letter: item.letter, word: gradeWord.word, emoji: gradeWord.emoji },
        ...distractors,
      ].sort(() => Math.random() - 0.5);

      return {
        targetLetter: item.letter,
        targetWord: gradeWord.word,
        phonicsSound: item.phonicsSound,
        audioPrompt,
        options,
      };
    });

    setQuestions(newQuestions);
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setShowScoreModal(false);
  };

  useEffect(() => {
    generateQuestions();
  }, [grade, presetLetter]);

  // Speak prompt when question changes
  useEffect(() => {
    if (questions.length > 0 && !isAnswered) {
      const q = questions[currentIndex];
      // small delay to let UI mount
      const timer = setTimeout(() => {
        speech.speakText(q.audioPrompt);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, questions]);

  const currentQ = questions[currentIndex];

  const handlePlayAudio = () => {
    if (!currentQ) return;
    sfx.playPop();
    speech.speakText(currentQ.audioPrompt);
  };

  const handleOptionSelect = (optionLetter: string) => {
    if (isAnswered) return;

    setSelectedOption(optionLetter);
    setIsAnswered(true);

    const correct = optionLetter === currentQ.targetLetter;
    setIsCorrect(correct);

    if (correct) {
      sfx.playCorrect();
      setScore((prev) => prev + 1);
      markLetterMastered(currentQ.targetLetter);
      speech.speakText(`Correct! ${currentQ.targetLetter} for ${currentQ.targetWord}!`);
    } else {
      sfx.playWrong();
      speech.speakText(`Nice try! That letter was ${optionLetter}. The right answer was ${currentQ.targetLetter}.`);
    }
  };

  const handleNextQuestion = () => {
    sfx.playPop();
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setIsCorrect(false);
    } else {
      // Finished all 5 questions
      const finalScore = score + (isCorrect ? 1 : 0);
      const percentage = (finalScore / questions.length) * 100;
      const starsEarned = percentage >= 90 ? 3 : percentage >= 60 ? 2 : 1;
      recordActivityResult('Listen & Pick Phonics', finalScore, questions.length, starsEarned);
      setShowScoreModal(true);
    }
  };

  if (!currentQ) return null;

  return (
    <div className="bg-white rounded-3xl border-2 border-amber-200/90 shadow-xs p-5 sm:p-8 max-w-2xl mx-auto">
      
      {/* Progress & Question Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-amber-900 text-sm">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-bold">
            {grade}
          </span>
        </div>

        <div className="flex items-center gap-1.5 font-display font-bold text-emerald-600 text-sm">
          <span>Score: {score}</span>
        </div>
      </div>

      {/* Spoken Audio Banner with Big Speaker Icon */}
      <div className="bg-gradient-to-r from-sky-400 to-blue-500 rounded-3xl p-5 sm:p-6 text-white text-center shadow-md mb-6 relative">
        <div className="max-w-md mx-auto flex flex-col items-center">
          
          <button
            onClick={handlePlayAudio}
            className="w-16 h-16 rounded-3xl bg-white text-sky-600 shadow-lg flex items-center justify-center mb-3 transform hover:scale-105 active:scale-95 transition-all cursor-pointer group"
            title="Hear question instructions"
          >
            <Volume2 className="w-8 h-8 group-hover:animate-bounce" />
          </button>

          <p className="font-display font-extrabold text-lg sm:text-xl leading-snug">
            "{currentQ.audioPrompt}"
          </p>

          <button
            onClick={handlePlayAudio}
            className="mt-2 text-xs text-sky-100 underline hover:text-white font-medium flex items-center gap-1"
          >
            <span>Tap to repeat sound 🔊</span>
          </button>
        </div>
      </div>

      {/* Kid Friendly Options: 4 Big Chunky Colorful Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
        {currentQ.options.map((opt) => {
          const isSelected = selectedOption === opt.letter;
          let btnStyle = 'bg-amber-50/70 border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-100/50';

          if (isAnswered) {
            if (opt.letter === currentQ.targetLetter) {
              btnStyle = 'bg-emerald-500 text-white border-2 border-emerald-600 shadow-md scale-102';
            } else if (isSelected) {
              btnStyle = 'bg-rose-400 text-white border-2 border-rose-500';
            } else {
              btnStyle = 'bg-slate-50 text-slate-400 border border-slate-200 opacity-60';
            }
          }

          return (
            <button
              key={opt.letter}
              onClick={() => handleOptionSelect(opt.letter)}
              disabled={isAnswered}
              className={`p-4 sm:p-5 rounded-3xl flex flex-col items-center justify-center transition-all cursor-pointer ${btnStyle} group`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-3xl">{opt.emoji}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    sfx.playPop();
                    speech.speakLetter(opt.letter, 'both', opt.word);
                  }}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700"
                  title={`Hear ${opt.letter}`}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <span className="font-display font-extrabold text-4xl sm:text-5xl my-1 group-hover:scale-105 transition-transform">
                {opt.letter}
              </span>

              <span className="text-xs sm:text-sm font-semibold capitalize opacity-80">
                {opt.word}
              </span>
            </button>
          );
        })}
      </div>

      {/* Answer Feedback & Next Button */}
      {isAnswered && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div
            className={`p-4 rounded-2xl flex items-center justify-between gap-3 mb-4 ${
              isCorrect ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isCorrect ? (
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">
                  <X className="w-5 h-5" />
                </div>
              )}
              <div>
                <p className="font-display font-bold text-sm">
                  {isCorrect ? 'Super Job! Letter ' + currentQ.targetLetter : 'Keep trying! Correct answer: ' + currentQ.targetLetter}
                </p>
                <p className="text-xs opacity-80">
                  Phonics: {currentQ.targetLetter} says {currentQ.phonicsSound} like in {currentQ.targetWord}!
                </p>
              </div>
            </div>

            <button
              onClick={handleNextQuestion}
              className="btn-chunky-amber px-5 py-2.5 rounded-2xl font-display font-bold text-sm shrink-0"
            >
              {currentIndex + 1 < questions.length ? 'Next Question →' : 'See Results ⭐'}
            </button>
          </div>
        </div>
      )}

      {/* Celebratory Score Modal */}
      <ScoreModal
        isOpen={showScoreModal}
        score={score}
        maxScore={questions.length}
        activityTitle="Phonics Ear Training"
        onPlayAgain={generateQuestions}
        onNextActivity={onNextActivity}
        onClose={() => setShowScoreModal(false)}
      />

    </div>
  );
};
