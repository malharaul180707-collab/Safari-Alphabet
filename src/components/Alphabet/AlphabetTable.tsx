import React, { useState } from 'react';
import { Volume2, Sparkles, LayoutGrid, Table, Search, CheckCircle } from 'lucide-react';
import { ALPHABET_DATA } from '../../data/alphabetData';
import { AlphabetItem, GradeLevel } from '../../types';
import { speech, sfx } from '../../utils/audio';
import { LetterModal } from './LetterModal';
import { useStudent } from '../../context/StudentContext';

interface AlphabetTableProps {
  activeGrade: GradeLevel;
  onOpenQuizWithLetter: (letter: string) => void;
  onOpenDrawLetter?: (letter: string) => void;
}

export const AlphabetTable: React.FC<AlphabetTableProps> = ({
  activeGrade,
  onOpenQuizWithLetter,
  onOpenDrawLetter,
}) => {
  const { currentStudent } = useStudent();
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedLetter, setSelectedLetter] = useState<AlphabetItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'vowels' | 'consonants' | 'mastered'>('all');
  const [isPlayingAll, setIsPlayingAll] = useState(false);

  const vowels = ['A', 'E', 'I', 'O', 'U'];

  const filteredLetters = ALPHABET_DATA.filter((item) => {
    // Search
    const matchesSearch =
      item.letter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.exampleWord.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // Filter
    if (filterType === 'vowels') return vowels.includes(item.letter);
    if (filterType === 'consonants') return !vowels.includes(item.letter);
    if (filterType === 'mastered') return currentStudent.masteredLetters.includes(item.letter);
    return true;
  });

  const handleSpeakUppercase = (e: React.MouseEvent, item: AlphabetItem) => {
    e.stopPropagation();
    sfx.playPop();
    speech.speakLetter(item.letter, 'letter');
  };

  const handleSpeakLowercase = (e: React.MouseEvent, item: AlphabetItem) => {
    e.stopPropagation();
    sfx.playPop();
    speech.speakLetter(item.lowercase, 'letter');
  };

  const handleSpeakWord = (e: React.MouseEvent, item: AlphabetItem) => {
    e.stopPropagation();
    sfx.playPop();
    speech.speakWord(item.exampleWord);
  };

  // Play through the alphabet A-Z
  const handlePlayAllAlphabet = async () => {
    if (isPlayingAll) {
      speech.cancel();
      setIsPlayingAll(false);
      return;
    }

    setIsPlayingAll(true);
    speech.speakText("Let's hear the English Alphabet from A to Z!");
    
    // We queue speech sequentially
    let delay = 1400;
    ALPHABET_DATA.slice(0, 10).forEach((item, index) => {
      setTimeout(() => {
        if (!isPlayingAll) return;
        speech.speakLetter(item.letter, 'both', item.exampleWord);
        if (index === 9) {
          setIsPlayingAll(false);
        }
      }, delay * (index + 1));
    });
  };

  return (
    <div className="space-y-4">
      
      {/* Top Banner & Control Deck */}
      <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 rounded-3xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">🔤</span>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">
                English Alphabet & Phonics Table
              </h2>
            </div>
            <p className="text-amber-100 text-sm mt-1 max-w-xl font-medium">
              Listen to the pronunciation of every uppercase letter, lowercase letter, and its example word. Tap any audio button 🔊 to hear it clearly!
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePlayAllAlphabet}
              className="btn-chunky bg-white text-amber-900 hover:bg-amber-50 px-4 py-2.5 rounded-2xl font-display font-bold text-sm flex items-center gap-2 shadow-sm"
            >
              <Volume2 className={`w-4 h-4 text-amber-600 ${isPlayingAll ? 'animate-bounce' : ''}`} />
              <span>{isPlayingAll ? 'Stop Audio' : 'Listen A-Z (Audio Tour)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and View Mode Toolbar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border-2 border-amber-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search letter or word (e.g. A, apple)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-amber-50/50 border border-amber-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Letters (26)' },
            { id: 'vowels', label: 'Vowels (A, E, I, O, U)' },
            { id: 'consonants', label: 'Consonants (21)' },
            { id: 'mastered', label: `Mastered (${currentStudent.masteredLetters.length})` },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => {
                sfx.playPop();
                setFilterType(f.id as typeof filterType);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold whitespace-nowrap transition-colors ${
                filterType === f.id
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-900/80 hover:bg-amber-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* View Switcher: Table View (matches Reference Image 2) vs Grid Cards */}
        <div className="flex items-center bg-amber-100/70 p-1 rounded-xl shrink-0 self-end md:self-auto">
          <button
            onClick={() => {
              sfx.playPop();
              setViewMode('table');
            }}
            title="Reference Table View"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display font-bold transition-all ${
              viewMode === 'table' ? 'bg-white text-amber-950 shadow-xs' : 'text-amber-800 hover:text-amber-950'
            }`}
          >
            <Table className="w-4 h-4 text-amber-600" />
            <span>Table View</span>
          </button>
          <button
            onClick={() => {
              sfx.playPop();
              setViewMode('cards');
            }}
            title="Interactive Flashcards View"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display font-bold transition-all ${
              viewMode === 'cards' ? 'bg-white text-amber-950 shadow-xs' : 'text-amber-800 hover:text-amber-950'
            }`}
          >
            <LayoutGrid className="w-4 h-4 text-amber-600" />
            <span>Flashcards</span>
          </button>
        </div>

      </div>

      {/* TABLE VIEW: Exactly reproduces the Reference Image 2 specification */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-3xl border-2 border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-stone-100/80 border-b border-stone-200 text-slate-700 text-sm sm:text-base font-display font-bold">
                  <th className="py-4 px-4 sm:px-6 text-left w-1/3">Uppercase letter</th>
                  <th className="py-4 px-4 sm:px-6 text-left w-1/3">Lowercase letter</th>
                  <th className="py-4 px-4 sm:px-6 text-left w-1/3">Example word</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredLetters.map((item) => {
                  const isMastered = currentStudent.masteredLetters.includes(item.letter);
                  return (
                    <tr
                      key={item.letter}
                      onClick={() => setSelectedLetter(item)}
                      className="hover:bg-amber-50/60 transition-colors cursor-pointer group"
                    >
                      {/* Uppercase Column with Speaker & Underline (Image 2 style) */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <button
                            onClick={(e) => handleSpeakUppercase(e, item)}
                            className="p-1.5 rounded-lg text-sky-500 hover:text-sky-600 hover:bg-sky-50 transition-transform active:scale-90"
                            title={`Hear uppercase ${item.letter}`}
                          >
                            <Volume2 className="w-5 h-5 text-sky-500" />
                          </button>
                          <span className="font-display font-bold text-lg sm:text-xl text-sky-600 underline underline-offset-4 decoration-2 decoration-sky-400 group-hover:scale-105 transition-transform inline-block">
                            {item.letter}
                          </span>
                          {isMastered && (
                            <CheckCircle className="w-4 h-4 text-emerald-500 ml-1 inline" />
                          )}
                        </div>
                      </td>

                      {/* Lowercase Column with Speaker & Underline */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <button
                            onClick={(e) => handleSpeakLowercase(e, item)}
                            className="p-1.5 rounded-lg text-sky-500 hover:text-sky-600 hover:bg-sky-50 transition-transform active:scale-90"
                            title={`Hear lowercase ${item.lowercase}`}
                          >
                            <Volume2 className="w-5 h-5 text-sky-500" />
                          </button>
                          <span className="font-display font-bold text-lg sm:text-xl text-sky-600 underline underline-offset-4 decoration-2 decoration-sky-400 group-hover:scale-105 transition-transform inline-block">
                            {item.lowercase}
                          </span>
                        </div>
                      </td>

                      {/* Example Word Column with Speaker & Underlined starting letters (Image 2 style) */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <button
                              onClick={(e) => handleSpeakWord(e, item)}
                              className="p-1.5 rounded-lg text-sky-500 hover:text-sky-600 hover:bg-sky-50 transition-transform active:scale-90"
                              title={`Hear word: ${item.exampleWord}`}
                            >
                              <Volume2 className="w-5 h-5 text-sky-500" />
                            </button>
                            <span className="font-display font-bold text-base sm:text-lg text-sky-600 underline underline-offset-4 decoration-sky-400 group-hover:text-amber-600 transition-colors">
                              {item.exampleWord}
                            </span>
                          </div>
                          <span className="text-2xl mr-2">{item.emoji}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARD FLASHCARD VIEW */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {filteredLetters.map((item) => {
            const isMastered = currentStudent.masteredLetters.includes(item.letter);
            return (
              <div
                key={item.letter}
                onClick={() => setSelectedLetter(item)}
                className={`bg-white rounded-3xl border-2 ${
                  isMastered ? 'border-emerald-300 shadow-emerald-100' : 'border-amber-200'
                } p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between group relative`}
              >
                {/* Mastered Star Icon */}
                {isMastered && (
                  <span className="absolute top-2 right-2 text-xs bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    ✓
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">{item.emoji}</span>
                    <button
                      onClick={(e) => handleSpeakUppercase(e, item)}
                      className="p-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors"
                      title="Hear letter sound"
                    >
                      <Volume2 className="w-4 h-4 text-amber-600" />
                    </button>
                  </div>

                  <div className="text-center my-1">
                    <span className="font-display font-extrabold text-3xl sm:text-4xl text-slate-800 group-hover:text-amber-600 transition-colors">
                      {item.letter} <span className="text-2xl font-bold text-slate-500">{item.lowercase}</span>
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={(e) => handleSpeakWord(e, item)}
                      className="font-display font-bold text-sm text-sky-600 hover:underline capitalize"
                    >
                      {item.exampleWord}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {item.phonicsSound}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Letter Modal */}
      <LetterModal
        item={selectedLetter}
        onClose={() => setSelectedLetter(null)}
        activeGrade={activeGrade}
        onOpenQuizWithLetter={onOpenQuizWithLetter}
        onOpenDrawLetter={onOpenDrawLetter}
      />
    </div>
  );
};
