export type GradeLevel = 'KG1' | 'KG2' | 'G1' | 'G2';

export interface GradedWord {
  word: string;
  emoji: string;
  sentence: string;
  phonicsHint: string;
}

export interface AlphabetItem {
  letter: string;
  lowercase: string;
  phonicsSound: string;
  phonicsSpelling: string;
  exampleWord: string;
  emoji: string;
  color: {
    bg: string;
    border: string;
    text: string;
    accent: string;
  };
  gradeWords: Record<GradeLevel, GradedWord[]>;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  requiredCount: number;
  currentCount: number;
  category: 'letters' | 'streak' | 'quizzes' | 'words';
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  activityName: string;
  score: number;
  maxScore: number;
  stars: number;
  grade: GradeLevel;
}

export interface StudyBuddy {
  id: string;
  name: string;
  avatar: string;
  subtitle: string;
  following: boolean;
}

export interface StudentProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  grade: GradeLevel;
  joinedDate: string;
  streak: number;
  stars: number;
  xp: number;
  masteredLetters: string[];
  badges: string[];
  studyBuddies: StudyBuddy[];
  activityStats: {
    quizzesTaken: number;
    correctAnswers: number;
    totalQuestions: number;
    minutesPracticed: number;
    lastActive: string;
  };
  activityLogs: ActivityLog[];
}

export interface ParentSettings {
  pin: string;
  audioSpeed: number; // 0.7 to 1.1
  dailyGoalMinutes: number;
  soundEffectsEnabled: boolean;
  voiceGuideEnabled: boolean;
  phonicsFirst: boolean;
  screenTimeUsedToday: number; // in minutes
}
