import React, { useState } from 'react';
import { StudentProvider, useStudent } from './context/StudentContext';
import { Header } from './components/Header';
import { Navigation, NavTab } from './components/Navigation';
import { AlphabetTable } from './components/Alphabet/AlphabetTable';
import { ActivitiesHub } from './components/Activities/ActivitiesHub';
import { MagicCameraView } from './components/Camera/MagicCameraView';
import { ProfileView } from './components/Profile/ProfileView';
import { BadgesView } from './components/Badges/BadgesView';
import { ParentControlModal } from './components/ParentControl/ParentControlModal';
import { StudentSwitchModal } from './components/Profile/StudentSwitchModal';
import { GradeLevel } from './types';

const MainApp: React.FC = () => {
  const { currentStudent } = useStudent();
  const [currentTab, setCurrentTab] = useState<NavTab>('learn');
  const [activeGrade, setActiveGrade] = useState<GradeLevel>(currentStudent.grade || 'KG1');
  const [isParentGateOpen, setIsParentGateOpen] = useState(false);
  const [isStudentSwitchOpen, setIsStudentSwitchOpen] = useState(false);
  const [presetLetterForQuiz, setPresetLetterForQuiz] = useState<string | undefined>(undefined);
  const [cameraPresetLetter, setCameraPresetLetter] = useState<string | undefined>(undefined);

  const handleOpenQuizWithLetter = (letter: string) => {
    setPresetLetterForQuiz(letter);
    setCurrentTab('games');
  };

  const handleOpenDrawLetter = (letter: string) => {
    setCameraPresetLetter(letter);
    setCurrentTab('camera');
  };

  const handleOpenMagicCamera = () => {
    setCurrentTab('camera');
  };

  const handleTabSelect = (tab: NavTab) => {
    if (tab === 'parent') {
      setIsParentGateOpen(true);
    } else {
      setCurrentTab(tab);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 via-orange-50/30 to-amber-50/60 flex flex-col font-sans pb-20 md:pb-10">
      
      {/* Top Header */}
      <Header
        onOpenParentGate={() => setIsParentGateOpen(true)}
        onOpenStudentSwitch={() => setIsStudentSwitchOpen(true)}
        activeGrade={activeGrade}
        setActiveGrade={setActiveGrade}
      />

      {/* Main Navigation (Tabs) */}
      <Navigation currentTab={currentTab} onSelectTab={handleTabSelect} />

      {/* Main Content Area */}
      <main className="max-w-6xl w-full mx-auto px-3 sm:px-6 py-4 flex-1">
        {currentTab === 'learn' && (
          <AlphabetTable
            activeGrade={activeGrade}
            onOpenQuizWithLetter={handleOpenQuizWithLetter}
            onOpenDrawLetter={handleOpenDrawLetter}
          />
        )}

        {currentTab === 'games' && (
          <ActivitiesHub
            grade={activeGrade}
            presetLetter={presetLetterForQuiz}
            onClearPresetLetter={() => setPresetLetterForQuiz(undefined)}
            onOpenMagicCamera={handleOpenMagicCamera}
          />
        )}

        {currentTab === 'camera' && (
          <MagicCameraView
            grade={activeGrade}
            presetLetter={cameraPresetLetter}
          />
        )}

        {currentTab === 'badges' && <BadgesView />}

        {currentTab === 'profile' && (
          <ProfileView
            onOpenParentSettings={() => setIsParentGateOpen(true)}
            onOpenStudentSwitch={() => setIsStudentSwitchOpen(true)}
          />
        )}
      </main>

      {/* Parent Control Gate & Analytics Modal */}
      <ParentControlModal
        isOpen={isParentGateOpen}
        onClose={() => setIsParentGateOpen(false)}
      />

      {/* Student Switcher & Profile Creator Modal */}
      <StudentSwitchModal
        isOpen={isStudentSwitchOpen}
        onClose={() => setIsStudentSwitchOpen(false)}
      />

    </div>
  );
};

export default function App() {
  return (
    <StudentProvider>
      <MainApp />
    </StudentProvider>
  );
}
