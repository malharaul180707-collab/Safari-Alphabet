import React, { createContext, useContext, useState, useEffect } from 'react';
import { StudentProfile, ParentSettings, GradeLevel, ActivityLog } from '../types';
import { INITIAL_STUDENTS, DEFAULT_PARENT_SETTINGS } from '../data/initialData';
import { sfx, speech } from '../utils/audio';

interface StudentContextType {
  students: StudentProfile[];
  currentStudent: StudentProfile;
  setCurrentStudentId: (id: string) => void;
  addStudent: (name: string, grade: GradeLevel, avatar: string) => void;
  updateStudentGrade: (studentId: string, grade: GradeLevel) => void;
  toggleStudyBuddyFollow: (buddyId: string) => void;
  recordActivityResult: (activityName: string, score: number, maxScore: number, stars: number) => void;
  markLetterMastered: (letter: string) => void;
  parentSettings: ParentSettings;
  updateParentSettings: (newSettings: Partial<ParentSettings>) => void;
  resetStudentProgress: (studentId: string) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<StudentProfile[]>(() => {
    try {
      const saved = localStorage.getItem('alphabet_safari_students');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_STUDENTS;
  });

  const [currentStudentId, setCurrentStudentId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('alphabet_safari_current_id');
      if (saved) return saved;
    } catch {
      // ignore
    }
    return INITIAL_STUDENTS[0].id;
  });

  const [parentSettings, setParentSettings] = useState<ParentSettings>(() => {
    try {
      const saved = localStorage.getItem('alphabet_safari_parent_settings');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_PARENT_SETTINGS;
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Sync speech engine speed with parent settings
  useEffect(() => {
    speech.setSpeed(parentSettings.audioSpeed);
  }, [parentSettings.audioSpeed]);

  // Persist students
  useEffect(() => {
    try {
      localStorage.setItem('alphabet_safari_students', JSON.stringify(students));
    } catch {
      // ignore
    }
  }, [students]);

  // Persist current student ID
  useEffect(() => {
    try {
      localStorage.setItem('alphabet_safari_current_id', currentStudentId);
    } catch {
      // ignore
    }
  }, [currentStudentId]);

  // Persist parent settings
  useEffect(() => {
    try {
      localStorage.setItem('alphabet_safari_parent_settings', JSON.stringify(parentSettings));
    } catch {
      // ignore
    }
  }, [parentSettings]);

  const currentStudent = students.find((s) => s.id === currentStudentId) || students[0];

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sfx.setSoundEnabled(next);
  };

  const addStudent = (name: string, grade: GradeLevel, avatar: string) => {
    const cleanUsername = name.replace(/\s+/g, '_') + '_' + Math.floor(Math.random() * 100);
    const newStudent: StudentProfile = {
      id: `student-${Date.now()}`,
      name,
      username: cleanUsername,
      avatar,
      grade,
      joinedDate: 'Joined Today',
      streak: 1,
      stars: 10,
      xp: 100,
      masteredLetters: ['A'],
      badges: ['abc-first'],
      studyBuddies: [
        {
          id: 'buddy-cindy',
          name: 'Cindy Blanco',
          subtitle: 'Classmate',
          avatar: '/src/assets/images/avatar_kid_glasses_1790949131396.jpg',
          following: true,
        },
      ],
      activityStats: {
        quizzesTaken: 0,
        correctAnswers: 0,
        totalQuestions: 0,
        minutesPracticed: 2,
        lastActive: 'Just now',
      },
      activityLogs: [],
    };

    setStudents((prev) => [...prev, newStudent]);
    setCurrentStudentId(newStudent.id);
    sfx.playCorrect();
  };

  const updateStudentGrade = (studentId: string, grade: GradeLevel) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, grade } : s))
    );
  };

  const toggleStudyBuddyFollow = (buddyId: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== currentStudentId) return s;
        return {
          ...s,
          studyBuddies: s.studyBuddies.map((b) =>
            b.id === buddyId ? { ...b, following: !b.following } : b
          ),
        };
      })
    );
    sfx.playPop();
  };

  const recordActivityResult = (
    activityName: string,
    score: number,
    maxScore: number,
    stars: number
  ) => {
    const xpEarned = score * 20 + stars * 15;
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      activityName,
      score,
      maxScore,
      stars,
      grade: currentStudent.grade,
    };

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== currentStudentId) return s;
        const currentStats = s.activityStats;
        return {
          ...s,
          stars: s.stars + stars,
          xp: s.xp + xpEarned,
          activityStats: {
            ...currentStats,
            quizzesTaken: currentStats.quizzesTaken + 1,
            correctAnswers: currentStats.correctAnswers + score,
            totalQuestions: currentStats.totalQuestions + maxScore,
            minutesPracticed: currentStats.minutesPracticed + 3,
            lastActive: 'Just now',
          },
          activityLogs: [newLog, ...(s.activityLogs || []).slice(0, 15)],
        };
      })
    );

    // Also update parent settings screen time tracker
    setParentSettings((prev) => ({
      ...prev,
      screenTimeUsedToday: prev.screenTimeUsedToday + 3,
    }));
  };

  const markLetterMastered = (letter: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== currentStudentId) return s;
        if (s.masteredLetters.includes(letter)) return s;
        return {
          ...s,
          masteredLetters: [...s.masteredLetters, letter],
          xp: s.xp + 50,
          stars: s.stars + 1,
        };
      })
    );
  };

  const updateParentSettings = (newSettings: Partial<ParentSettings>) => {
    setParentSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetStudentProgress = (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        return {
          ...s,
          streak: 1,
          stars: 0,
          xp: 0,
          masteredLetters: [],
          activityStats: {
            quizzesTaken: 0,
            correctAnswers: 0,
            totalQuestions: 0,
            minutesPracticed: 0,
            lastActive: 'Just reset',
          },
          activityLogs: [],
        };
      })
    );
  };

  return (
    <StudentContext.Provider
      value={{
        students,
        currentStudent,
        setCurrentStudentId,
        addStudent,
        updateStudentGrade,
        toggleStudyBuddyFollow,
        recordActivityResult,
        markLetterMastered,
        parentSettings,
        updateParentSettings,
        resetStudentProgress,
        soundEnabled,
        toggleSound,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error('useStudent must be used within StudentProvider');
  return ctx;
};
