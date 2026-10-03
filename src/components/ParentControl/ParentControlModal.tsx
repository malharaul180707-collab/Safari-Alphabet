import React, { useState, useEffect } from 'react';
import { Shield, Lock, X, Check, Clock, Award, BookOpen, Volume2, RotateCcw, AlertTriangle, Printer } from 'lucide-react';
import { useStudent } from '../../context/StudentContext';
import { GradeLevel } from '../../types';
import { sfx, speech } from '../../utils/audio';

interface ParentControlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ParentControlModal: React.FC<ParentControlModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    currentStudent,
    parentSettings,
    updateParentSettings,
    updateStudentGrade,
    resetStudentProgress,
  } = useStudent();

  // Child-proof gate state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mathProblem, setMathProblem] = useState({ num1: 7, num2: 8, answer: 15 });
  const [userAnswer, setUserAnswer] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'analytics' | 'settings' | 'logs'>('analytics');
  const [confirmReset, setConfirmReset] = useState(false);

  // Generate a new math problem whenever modal opens
  useEffect(() => {
    if (isOpen && !isAuthenticated) {
      const n1 = Math.floor(Math.random() * 8) + 6; // 6-13
      const n2 = Math.floor(Math.random() * 9) + 4; // 4-12
      setMathProblem({ num1: n1, num2: n2, answer: n1 + n2 });
      setUserAnswer('');
      setErrorMsg('');
    }
  }, [isOpen, isAuthenticated]);

  if (!isOpen) return null;

  const handleVerifyGate = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(userAnswer.trim(), 10) === mathProblem.answer || userAnswer.trim() === parentSettings.pin) {
      sfx.playCorrect();
      setIsAuthenticated(true);
      setErrorMsg('');
    } else {
      sfx.playWrong();
      setErrorMsg('Incorrect answer. Please solve the math problem or enter PIN 1234.');
    }
  };

  const handleGradeChange = (grade: GradeLevel) => {
    updateStudentGrade(currentStudent.id, grade);
    sfx.playPop();
  };

  const handleSpeedChange = (speed: number) => {
    updateParentSettings({ audioSpeed: speed });
    speech.setSpeed(speed);
    speech.speakText("Audio speed adjusted.");
  };

  const handleGoalChange = (minutes: number) => {
    updateParentSettings({ dailyGoalMinutes: minutes });
    sfx.playPop();
  };

  const handleReset = () => {
    resetStudentProgress(currentStudent.id);
    setConfirmReset(false);
    sfx.playPop();
    speech.speakText("Student learning progress has been reset.");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-3xl border-2 border-slate-300 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Top Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">
                Parental Control & Learning Monitor
              </h3>
              <p className="text-slate-400 text-xs font-medium">
                Protected area for parents to monitor {currentStudent.name}'s progress
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsAuthenticated(false);
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STEP 1: CHILD-PROOF GATE (If not authenticated) */}
        {!isAuthenticated ? (
          <div className="p-6 sm:p-8 text-center max-w-md mx-auto my-auto">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center mb-4">
              <Lock className="w-8 h-8" />
            </div>

            <h4 className="font-display font-bold text-xl text-slate-900 mb-1">
              Parents Verification
            </h4>
            <p className="text-slate-500 text-xs sm:text-sm mb-6 font-medium">
              To keep little hands safe from changing settings, please answer the math problem below:
            </p>

            <form onSubmit={handleVerifyGate} className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-200">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">
                  Solve to unlock
                </span>
                <p className="font-display font-extrabold text-3xl text-slate-800 my-1">
                  {mathProblem.num1} + {mathProblem.num2} = ?
                </p>
                <input
                  type="text"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  placeholder="Enter answer (or PIN 1234)"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  autoFocus
                  className="w-full mt-2 text-center py-2.5 px-3 bg-white border border-slate-300 rounded-xl font-display font-bold text-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-600 font-bold animate-shake">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                className="w-full btn-chunky bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-display font-bold text-sm shadow-md"
              >
                Unlock Parental Controls
              </button>
            </form>
          </div>
        ) : (
          /* STEP 2: PARENT DASHBOARD & CONTROLS */
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            
            {/* Tab navigation inside Parents Area */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              {[
                { id: 'analytics' as const, label: '📊 Learning Analytics' },
                { id: 'settings' as const, label: '⚙️ Audio & Grade Settings' },
                { id: 'logs' as const, label: '📜 Activity History' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    sfx.playPop();
                    setActiveTab(t.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-display font-bold text-xs sm:text-sm transition-colors ${
                    activeTab === t.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* TAB 1: ANALYTICS & PROGRESS */}
            {activeTab === 'analytics' && (
              <div className="space-y-5">
                
                {/* Daily Goal & Screen Time Monitor */}
                <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-amber-600" />
                      <span className="font-display font-bold text-sm text-amber-950">
                        Today's Learning Time Target
                      </span>
                    </div>
                    <span className="text-xs font-bold text-amber-800">
                      {parentSettings.screenTimeUsedToday} / {parentSettings.dailyGoalMinutes} mins
                    </span>
                  </div>

                  <div className="w-full h-3 bg-amber-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, (parentSettings.screenTimeUsedToday / parentSettings.dailyGoalMinutes) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-amber-700/90 mt-2 font-medium">
                    {parentSettings.screenTimeUsedToday >= parentSettings.dailyGoalMinutes
                      ? '🎉 Daily learning target reached! Child is thriving!'
                      : `${parentSettings.dailyGoalMinutes - parentSettings.screenTimeUsedToday} more minutes to reach today's target.`}
                  </p>
                </div>

                {/* 3 Metric Cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                    <span className="text-xs text-slate-500 font-medium">Alphabet Mastery</span>
                    <p className="font-display font-extrabold text-2xl text-emerald-600 mt-0.5">
                      {currentStudent.masteredLetters.length} / 26
                    </p>
                    <p className="text-[10px] text-slate-400">letters mastered</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                    <span className="text-xs text-slate-500 font-medium">Quiz Accuracy</span>
                    <p className="font-display font-extrabold text-2xl text-sky-600 mt-0.5">
                      {currentStudent.activityStats.totalQuestions > 0
                        ? Math.round((currentStudent.activityStats.correctAnswers / currentStudent.activityStats.totalQuestions) * 100)
                        : 100}%
                    </p>
                    <p className="text-[10px] text-slate-400">across all games</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                    <span className="text-xs text-slate-500 font-medium">Day Streak</span>
                    <p className="font-display font-extrabold text-2xl text-amber-600 mt-0.5">
                      {currentStudent.streak} Days
                    </p>
                    <p className="text-[10px] text-slate-400">consistent practice</p>
                  </div>
                </div>

                {/* Letter Breakdown (Mastered vs Needs Review) */}
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
                  <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-600 mb-3">
                    Mastered Letters vs Still Learning
                  </h4>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="font-bold text-emerald-700 flex items-center gap-1 mb-1.5">
                        <Check className="w-3.5 h-3.5" /> Mastered ({currentStudent.masteredLetters.length}):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {currentStudent.masteredLetters.length > 0 ? (
                          currentStudent.masteredLetters.map((l) => (
                            <span key={l} className="w-6 h-6 bg-emerald-100 text-emerald-800 font-bold rounded flex items-center justify-center">
                              {l}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-xs italic">No letters mastered yet</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-amber-700 flex items-center gap-1 mb-1.5">
                        <Clock className="w-3.5 h-3.5" /> Next to Practice ({26 - currentStudent.masteredLetters.length}):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
                          .split('')
                          .filter((l) => !currentStudent.masteredLetters.includes(l))
                          .slice(0, 10)
                          .map((l) => (
                            <span key={l} className="w-6 h-6 bg-slate-200 text-slate-700 font-bold rounded flex items-center justify-center">
                              {l}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Print Progress Report button */}
                <button
                  onClick={handlePrint}
                  className="w-full py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 font-display font-bold text-xs text-slate-700 flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  <span>Print Student Learning Report</span>
                </button>

              </div>
            )}

            {/* TAB 2: SETTINGS (Grade, Audio Speed, Daily Goal) */}
            {activeTab === 'settings' && (
              <div className="space-y-5">
                
                {/* Grade Level Selection */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <label className="block font-display font-bold text-sm text-slate-900 mb-1">
                    Student Curriculum Level
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    Adjusts word difficulty, phonics hints, and question prompts.
                  </p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'KG1' as GradeLevel, label: 'KG 1', desc: 'Ages 3-4 (Basic sounds)' },
                      { id: 'KG2' as GradeLevel, label: 'KG 2', desc: 'Ages 4-5 (3-letter CVC)' },
                      { id: 'G1' as GradeLevel, label: 'Grade 1', desc: 'Ages 5-6 (Blends & words)' },
                      { id: 'G2' as GradeLevel, label: 'Grade 2', desc: 'Ages 6-7 (Vocab & sentences)' },
                    ].map((g) => (
                      <button
                        key={g.id}
                        onClick={() => handleGradeChange(g.id)}
                        className={`p-3 rounded-xl text-left border transition-all ${
                          currentStudent.grade === g.id
                            ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                            : 'bg-white text-slate-800 border-slate-200 hover:border-amber-300'
                        }`}
                      >
                        <p className="font-display font-bold text-sm">{g.label}</p>
                        <p className={`text-[10px] mt-0.5 ${currentStudent.grade === g.id ? 'text-amber-100' : 'text-slate-400'}`}>
                          {g.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pronunciation Audio Speed */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <label className="block font-display font-bold text-sm text-slate-900 mb-1">
                    Speech Pronunciation Cadence
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    Early learners benefit from slightly slower, articulated speech.
                  </p>

                  <div className="flex items-center gap-2">
                    {[
                      { speed: 0.7, label: '0.7x (Very Slow)' },
                      { speed: 0.85, label: '0.85x (Kid Optimal)' },
                      { speed: 1.0, label: '1.0x (Normal)' },
                    ].map((s) => (
                      <button
                        key={s.speed}
                        onClick={() => handleSpeedChange(s.speed)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-display font-bold transition-colors ${
                          parentSettings.audioSpeed === s.speed
                            ? 'bg-slate-900 text-white'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Daily Goal Target */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <label className="block font-display font-bold text-sm text-slate-900 mb-1">
                    Daily Screen Time Learning Goal
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    Healthy daily learning target before encouraging offline activities.
                  </p>

                  <div className="flex items-center gap-2">
                    {[10, 15, 20, 30].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => handleGoalChange(mins)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-display font-bold transition-colors ${
                          parentSettings.dailyGoalMinutes === mins
                            ? 'bg-amber-500 text-white'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {mins} Mins
                      </button>
                    ))}
                  </div>
                </div>

                {/* Danger Zone: Reset Progress */}
                <div className="pt-4 border-t border-slate-200">
                  {!confirmReset ? (
                    <button
                      onClick={() => setConfirmReset(true)}
                      className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset {currentStudent.name}'s Learning Progress</span>
                    </button>
                  ) : (
                    <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-rose-800 text-xs">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                        <span>Are you sure? This will clear stars and mastered letters.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleReset}
                          className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 rounded-lg text-xs font-bold"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmReset(false)}
                          className="bg-slate-200 text-slate-700 px-3 py-1 rounded-lg text-xs font-bold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB 3: ACTIVITY HISTORY LOGS */}
            {activeTab === 'logs' && (
              <div className="space-y-3">
                <h4 className="font-display font-bold text-sm text-slate-900">
                  Recent Learning Sessions
                </h4>

                {currentStudent.activityLogs && currentStudent.activityLogs.length > 0 ? (
                  <div className="divide-y divide-slate-100 bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                    {currentStudent.activityLogs.map((log) => (
                      <div key={log.id} className="p-3 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-800">{log.activityName}</p>
                          <p className="text-slate-400 text-[11px]">{log.timestamp} · Grade {log.grade}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-600">
                            {log.score} / {log.maxScore}
                          </span>
                          <span className="text-amber-500 font-bold">
                            {'⭐'.repeat(log.stars)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic text-center py-6">
                    No activity logs recorded yet. Play a game to see logs!
                  </p>
                )}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
