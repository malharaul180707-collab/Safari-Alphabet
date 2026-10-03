import React from 'react';
import { X, Volume2, Sparkles, CheckCircle2, ArrowRight, Camera } from 'lucide-react';
import { AlphabetItem, GradeLevel } from '../../types';
import { speech, sfx } from '../../utils/audio';
import { useStudent } from '../../context/StudentContext';

interface LetterModalProps {
  item: AlphabetItem | null;
  onClose: () => void;
  activeGrade: GradeLevel;
  onOpenQuizWithLetter: (letter: string) => void;
  onOpenDrawLetter?: (letter: string) => void;
}

export const LetterModal: React.FC<LetterModalProps> = ({
  item,
  onClose,
  activeGrade,
  onOpenQuizWithLetter,
  onOpenDrawLetter,
}) => {
  const { markLetterMastered, currentStudent } = useStudent();

  if (!item) return null;

  const isMastered = currentStudent.masteredLetters.includes(item.letter);

  const handleSpeakLetter = () => {
    sfx.playPop();
    speech.speakLetter(item.letter, 'both', item.exampleWord);
  };

  const handleSpeakPhonics = () => {
    sfx.playPop();
    speech.speakText(`Letter ${item.letter} makes the sound ${item.phonicsSpelling}! Like in ${item.exampleWord}.`);
  };

  const handleSpeakWord = (word: string, sentence?: string) => {
    sfx.playPop();
    speech.speakWord(word, sentence);
  };

  const handleMasterLetter = () => {
    markLetterMastered(item.letter);
    sfx.playCorrect();
    speech.speakText(`Great job! You mastered letter ${item.letter}!`);
  };

  const currentGradeWords = item.gradeWords[activeGrade] || item.gradeWords.KG1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-xl rounded-3xl border-4 border-amber-300 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header with big playful colors */}
        <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 p-5 text-white flex items-center justify-between relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center text-4xl font-display font-extrabold text-amber-600 border-2 border-amber-200">
              {item.letter}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-display font-bold">{item.letter} {item.lowercase}</span>
                <span className="text-2xl">{item.emoji}</span>
              </div>
              <p className="text-amber-100 text-sm font-medium">
                Phonics Sound: <span className="font-bold underline text-white">{item.phonicsSound}</span> ({item.phonicsSpelling})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10">
            <button
              onClick={handleSpeakLetter}
              className="w-11 h-11 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-xs flex items-center justify-center text-white transition-transform active:scale-90"
              title="Hear Letter Sound"
            >
              <Volume2 className="w-6 h-6 animate-pulse" />
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-black/15 hover:bg-black/25 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          
          {/* Audio Sound Buttons Bar */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleSpeakLetter}
              className="btn-chunky-amber p-3.5 rounded-2xl flex items-center justify-center gap-2.5 font-display font-bold text-sm"
            >
              <Volume2 className="w-5 h-5" />
              <span>Hear Letter: "{item.letter}"</span>
            </button>

            <button
              onClick={handleSpeakPhonics}
              className="btn-chunky-purple p-3.5 rounded-2xl flex items-center justify-center gap-2.5 font-display font-bold text-sm"
            >
              <Sparkles className="w-5 h-5" />
              <span>Hear Phonics Sound</span>
            </button>
          </div>

          {/* Graded Vocabulary Words Section */}
          <div className="bg-amber-50/70 rounded-2xl border-2 border-amber-200/80 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-amber-950 text-base flex items-center gap-1.5">
                <span>📚 Words with "{item.letter}"</span>
                <span className="text-xs bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-sans">
                  {activeGrade} Level
                </span>
              </h3>
              <span className="text-xs text-amber-800 font-medium">Tap word to hear!</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {currentGradeWords.map((gw, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSpeakWord(gw.word, gw.sentence)}
                  className="bg-white p-3 rounded-xl border border-amber-200/80 hover:border-amber-400 hover:shadow-md transition-all text-left group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{gw.emoji}</span>
                    <Volume2 className="w-4 h-4 text-amber-600 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                  </div>
                  <div className="mt-2">
                    <span className="font-display font-bold text-base text-slate-900 group-hover:text-amber-600 transition-colors capitalize">
                      {gw.word}
                    </span>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-medium">
                      {gw.phonicsHint}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Example sentence */}
            {currentGradeWords[0] && (
              <div
                onClick={() => handleSpeakWord(currentGradeWords[0].word, currentGradeWords[0].sentence)}
                className="mt-3 bg-white/90 p-2.5 rounded-xl border border-amber-200 flex items-center gap-2 cursor-pointer hover:bg-amber-100/50 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <Volume2 className="w-4 h-4" />
                </div>
                <p className="text-xs text-amber-950 font-medium">
                  "{currentGradeWords[0].sentence}"
                </p>
              </div>
            )}
          </div>

          {/* Practice Action Strip */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
            {onOpenDrawLetter && (
              <button
                onClick={() => {
                  onClose();
                  onOpenDrawLetter(item.letter);
                }}
                className="w-full sm:flex-1 btn-chunky-purple p-3 rounded-2xl flex items-center justify-center gap-2 font-display font-bold text-xs sm:text-sm"
              >
                <Camera className="w-4 h-4" />
                <span>Draw & Scan Letter {item.letter} 📸</span>
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                onOpenQuizWithLetter(item.letter);
              }}
              className="w-full sm:flex-1 btn-chunky-emerald p-3 rounded-2xl flex items-center justify-center gap-2 font-display font-bold text-xs sm:text-sm"
            >
              <span>Quiz on {item.letter}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleMasterLetter}
              className={`w-full sm:w-auto px-3.5 py-3 rounded-2xl font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
                isMastered
                  ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-2 border-slate-300'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${isMastered ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>{isMastered ? 'Mastered!' : 'Mastered'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
