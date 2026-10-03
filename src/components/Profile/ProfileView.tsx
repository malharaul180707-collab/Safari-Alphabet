import React, { useState } from 'react';
import { Settings, UserPlus, Share2, X, Check, Flame, Star, Award, BookOpen, Clock, Edit2 } from 'lucide-react';
import { useStudent } from '../../context/StudentContext';
import { sfx, speech } from '../../utils/audio';
import { AVATAR_OPTIONS } from '../../data/initialData';
import { ALL_BADGES } from '../../data/initialData';

interface ProfileViewProps {
  onOpenParentSettings: () => void;
  onOpenStudentSwitch: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onOpenParentSettings,
  onOpenStudentSwitch,
}) => {
  const { currentStudent, toggleStudyBuddyFollow } = useStudent();
  const [copiedLink, setCopiedLink] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const handleShare = () => {
    sfx.playPop();
    setCopiedLink(true);
    speech.speakText("Learning report copied to clipboard!");
    navigator.clipboard?.writeText(
      `Check out ${currentStudent.name}'s English Learning Safari: ${currentStudent.masteredLetters.length}/26 Letters Mastered with ${currentStudent.streak} Day Streak!`
    );
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const accuracy = currentStudent.activityStats.totalQuestions > 0
    ? Math.round((currentStudent.activityStats.correctAnswers / currentStudent.activityStats.totalQuestions) * 100)
    : 100;

  return (
    <div className="max-w-xl mx-auto space-y-4 pb-12">
      
      {/* Main Profile Card (Faithful reproduction of Reference Image 1) */}
      <div className="bg-white rounded-3xl border-2 border-slate-200/90 shadow-xs overflow-hidden">
        
        {/* Purple Duolingo-style Character Banner */}
        <div className="bg-[#7c5dfa] relative pt-8 pb-4 px-6 flex flex-col items-center justify-center">
          
          {/* Settings Gear */}
          <button
            onClick={onOpenParentSettings}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            title="Parent & Student Settings"
          >
            <Settings className="w-6 h-6" />
          </button>

          {/* Large Kid Avatar Portrait (Generated Duolingo-style avatar) */}
          <div className="relative group cursor-pointer" onClick={() => setShowAvatarPicker(true)}>
            <img
              src={currentStudent.avatar}
              alt={currentStudent.name}
              className="w-36 h-36 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white shadow-xl group-hover:scale-105 transition-transform"
            />
            <div className="absolute bottom-1 right-2 bg-amber-400 text-amber-950 p-2 rounded-full border-2 border-white shadow-md">
              <Edit2 className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Profile Info & Metadata */}
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
                {currentStudent.name}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                @{currentStudent.username} · {currentStudent.joinedDate}
              </p>
            </div>

            <button
              onClick={onOpenStudentSwitch}
              className="text-xs font-display font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-xl transition-colors"
            >
              Switch Kid
            </button>
          </div>

          {/* Stats Bar (Exact Image 1 layout: Courses, Following/Streak, Followers/XP) */}
          <div className="grid grid-cols-3 divide-x divide-slate-200 my-6 py-2 border-y border-slate-100 text-center">
            <div>
              <div className="flex items-center justify-center gap-1">
                <span className="text-base">🇬🇧</span>
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded">
                  {currentStudent.grade}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-1">Grade Level</p>
            </div>

            <div>
              <p className="font-display font-bold text-lg sm:text-xl text-slate-900">
                {currentStudent.streak}
              </p>
              <p className="text-xs text-slate-400 font-medium">Day Streak</p>
            </div>

            <div>
              <p className="font-display font-bold text-lg sm:text-xl text-slate-900">
                {currentStudent.xp}
              </p>
              <p className="text-xs text-slate-400 font-medium">Total XP</p>
            </div>
          </div>

          {/* Add Friends and Share Buttons (Exact Image 1 layout) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sfx.playPop();
                speech.speakText("You have great study buddies cheering you on!");
              }}
              className="flex-1 py-3 px-4 rounded-2xl border-2 border-sky-400 text-sky-500 hover:bg-sky-50 font-display font-bold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <UserPlus className="w-5 h-5 text-sky-500" />
              <span>ADD STUDY BUDDIES</span>
            </button>

            <button
              onClick={handleShare}
              className="p-3 rounded-2xl border-2 border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors"
              title="Share Learning Progress"
            >
              {copiedLink ? <Check className="w-5 h-5 text-emerald-600" /> : <Share2 className="w-5 h-5" />}
            </button>
          </div>

          {copiedLink && (
            <p className="text-xs text-emerald-600 font-medium text-center mt-2 animate-in fade-in">
              ✓ Learning summary copied to clipboard!
            </p>
          )}

          {/* Friend Suggestions / Study Buddies (Exact match to Reference Image 1) */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-base sm:text-lg text-slate-900">
                Study Buddy suggestions
              </h3>
              <button
                onClick={() => speech.speakText("Here are your classroom classmates and study buddies!")}
                className="text-xs font-display font-bold text-sky-500 hover:text-sky-600 tracking-wider"
              >
                VIEW ALL
              </button>
            </div>

            {/* Horizontal Cards matching Reference Image 1 */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              {currentStudent.studyBuddies.map((buddy) => (
                <div
                  key={buddy.id}
                  className="rounded-2xl border-2 border-slate-200/90 p-3 flex flex-col items-center justify-between text-center relative group hover:border-sky-300 transition-colors"
                >
                  <button
                    onClick={() => toggleStudyBuddyFollow(buddy.id)}
                    className="absolute top-1.5 right-1.5 text-slate-300 hover:text-slate-500 p-0.5"
                    title="Dismiss"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  <img
                    src={buddy.avatar}
                    alt={buddy.name}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-xs mb-1.5 mt-1"
                  />

                  <p className="font-display font-bold text-xs sm:text-sm text-slate-800 truncate max-w-[85px]">
                    {buddy.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium mb-3">
                    {buddy.subtitle}
                  </p>

                  <button
                    onClick={() => toggleStudyBuddyFollow(buddy.id)}
                    className={`w-full py-1.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider transition-all ${
                      buddy.following
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        : 'bg-sky-500 text-white hover:bg-sky-600 shadow-xs'
                    }`}
                  >
                    {buddy.following ? 'FRIENDS' : 'FOLLOW'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Progress Overview */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h3 className="font-display font-bold text-base text-slate-900 mb-3">
              Alphabet Mastery Progress
            </h3>

            {/* Letter Mastery Grid (26 letters with mastered highlights) */}
            <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/70 mb-4">
              <div className="flex items-center justify-between text-xs font-bold text-amber-900 mb-2">
                <span>Letters Mastered</span>
                <span>{currentStudent.masteredLetters.length} / 26 Letters</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 bg-amber-200/80 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${(currentStudent.masteredLetters.length / 26) * 100}%` }}
                />
              </div>

              {/* Mini letter pills */}
              <div className="flex flex-wrap gap-1">
                {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter) => {
                  const mastered = currentStudent.masteredLetters.includes(letter);
                  return (
                    <span
                      key={letter}
                      className={`w-6 h-6 rounded-md flex items-center justify-center font-display font-bold text-xs ${
                        mastered
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white text-slate-300 border border-slate-200'
                      }`}
                    >
                      {letter}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <p className="font-display font-extrabold text-xl text-emerald-600">
                  {accuracy}%
                </p>
                <p className="text-xs text-slate-500 font-medium">Quiz Accuracy</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <p className="font-display font-extrabold text-xl text-sky-600">
                  {currentStudent.activityStats.minutesPracticed} mins
                </p>
                <p className="text-xs text-slate-500 font-medium">Time Practiced</p>
              </div>
            </div>

          </div>

          {/* Badges and Achievements */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h3 className="font-display font-bold text-base text-slate-900 mb-3">
              Badges & Achievements
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              {ALL_BADGES.slice(0, 4).map((badge) => (
                <div
                  key={badge.id}
                  className="bg-amber-50/50 p-3 rounded-2xl border border-amber-200/70 flex items-center gap-2.5"
                >
                  <span className="text-3xl">{badge.icon}</span>
                  <div>
                    <p className="font-display font-bold text-xs text-slate-900">
                      {badge.title}
                    </p>
                    <p className="text-[10px] text-slate-500 line-clamp-1">
                      {badge.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
