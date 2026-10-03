import React, { useState } from 'react';
import { X, UserPlus, Check, Sparkles } from 'lucide-react';
import { useStudent } from '../../context/StudentContext';
import { GradeLevel } from '../../types';
import { AVATAR_OPTIONS } from '../../data/initialData';
import { sfx, speech } from '../../utils/audio';

interface StudentSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentSwitchModal: React.FC<StudentSwitchModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { students, currentStudent, setCurrentStudentId, addStudent } = useStudent();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGrade, setNewGrade] = useState<GradeLevel>('KG1');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0].path);

  if (!isOpen) return null;

  const handleSelectStudent = (id: string) => {
    setCurrentStudentId(id);
    sfx.playPop();
    const st = students.find((s) => s.id === id);
    if (st) {
      speech.speakText(`Welcome back, ${st.name}! Ready to explore English?`);
    }
    onClose();
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    addStudent(newName.trim(), newGrade, selectedAvatar);
    speech.speakText(`Welcome to Alphabet Safari, ${newName.trim()}!`);
    setIsAddingNew(false);
    setNewName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-3xl border-2 border-purple-200 shadow-2xl p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👥</span>
            <h3 className="font-display font-bold text-lg text-slate-900">
              {isAddingNew ? 'Add New Learner' : 'Switch Student Profile'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!isAddingNew ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 font-medium">
              Choose who is learning today to track individual stars and letters:
            </p>

            {/* List of Kids */}
            <div className="space-y-2.5">
              {students.map((student) => {
                const isSelected = student.id === currentStudent.id;
                return (
                  <button
                    key={student.id}
                    onClick={() => handleSelectStudent(student.id)}
                    className={`w-full p-3 rounded-2xl border-2 flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50/80 shadow-xs'
                        : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-12 h-12 rounded-full object-cover border border-purple-200"
                      />
                      <div className="text-left">
                        <p className="font-display font-bold text-sm text-slate-900">
                          {student.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Grade {student.grade} · {student.streak} Day Streak · {student.stars} ⭐
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Add New Profile button */}
            <button
              onClick={() => {
                sfx.playPop();
                setIsAddingNew(true);
              }}
              className="w-full mt-2 py-3 rounded-2xl border-2 border-dashed border-purple-300 hover:border-purple-500 text-purple-700 font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-purple-50 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Another Child Profile</span>
            </button>
          </div>
        ) : (
          /* ADD NEW LEARNER FORM */
          <form onSubmit={handleCreateStudent} className="space-y-4">
            <div>
              <label className="block text-xs font-display font-bold text-slate-700 mb-1">
                Child's Name
              </label>
              <input
                type="text"
                placeholder="e.g. Leo, Mia, Noah..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                autoFocus
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-400 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-display font-bold text-slate-700 mb-1">
                Starting Grade Level
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['KG1', 'KG2', 'G1', 'G2'] as GradeLevel[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setNewGrade(g)}
                    className={`py-2 rounded-xl text-xs font-display font-bold border transition-colors ${
                      newGrade === g
                        ? 'bg-purple-600 text-white border-purple-700'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-display font-bold text-slate-700 mb-2">
                Choose an Avatar
              </label>
              <div className="grid grid-cols-4 gap-2.5">
                {AVATAR_OPTIONS.map((av) => {
                  const isSelected = selectedAvatar === av.path;
                  return (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setSelectedAvatar(av.path)}
                      className={`p-1 rounded-2xl border-2 transition-all ${
                        isSelected ? 'border-purple-600 ring-2 ring-purple-300 scale-105' : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={av.path}
                        alt={av.name}
                        className="w-full h-14 object-cover rounded-xl"
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-display font-bold text-xs"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-display font-bold text-xs shadow-xs"
              >
                Create Profile
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
