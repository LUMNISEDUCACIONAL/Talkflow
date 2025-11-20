
import React, { useState, useCallback } from 'react';
import Header from './components/Header.tsx';
import Dashboard from './components/Dashboard.tsx';
import PreTestIntroduction from './components/PreTestIntroduction.tsx';
import PlacementTest from './components/PlacementTest.tsx';
import TreasureMap, { NodeType, TOTAL_NODES } from './components/TreasureMap.tsx';
import LevelReveal from './components/LevelReveal.tsx';
import Activity, { Question } from './components/Activity.tsx';
import { questionBank } from './components/Activity.tsx';
import ActivityResult from './components/ActivityResult.tsx';
import Graduation from './components/Graduation.tsx';
import TuneFlow from './components/TuneFlow.tsx';

export type View = 'dashboard' | 'pre-test' | 'test' | 'level-reveal' | 'treasure-map' | 'activity' | 'activity-result' | 'graduation' | 'tuneflow' | 'tune-flow-test';
export type UserLevel = 'A1' | 'A2' | 'B1' | 'B2';

const App: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  const [userLevel, setUserLevel] = useState<UserLevel>('A1');
  const [hasCompletedTest, setHasCompletedTest] = useState(false);
  const [completedNodes, setCompletedNodes] = useState<number[]>([]);
  const [currentActivityId, setCurrentActivityId] = useState<number | null>(null);
  const [lastActivityScore, setLastActivityScore] = useState<{ score: number, total: number } | null>(null);
  const [seenQuestions, setSeenQuestions] = useState<Record<UserLevel, string[]>>({ A1: [], A2: [], B1: [], B2: [] });
  const [activityQuestions, setActivityQuestions] = useState<Question[]>([]);
  const [levelChanged, setLevelChanged] = useState<UserLevel | null>(null);

  const handleInitiateTest = () => {
    if (!hasCompletedTest) {
      setView('pre-test');
    } else {
      setView('treasure-map');
    }
  };

  const handleConfirmStartTest = () => {
    setView('test');
  };

  const handleFinishTest = (score: number) => {
    let newLevel: UserLevel = 'A1';
    if (score > 15) newLevel = 'B2';
    else if (score > 10) newLevel = 'B1';
    else if (score > 5) newLevel = 'A2';
    
    setUserLevel(newLevel);
    setHasCompletedTest(true);
    setCompletedNodes([]);
    setSeenQuestions({ A1: [], A2: [], B1: [], B2: [] });
    
    setView('level-reveal');
  };

  const handleLevelRevealEnd = () => {
    setView('treasure-map');
  };

  const handleReturnToDashboard = () => {
    setView('dashboard');
  };
  
  const handleStartActivity = useCallback((nodeId: number, nodeType: NodeType) => {
    setCurrentActivityId(nodeId);
    setLevelChanged(null); 
    
    // Logic for 'doc' and 'chat' types (standard activities)
    const allQuestionsForLevel = questionBank[userLevel] || [];
    let seenQuestionsForLevel = seenQuestions[userLevel] || [];

    let unseenQuestions = allQuestionsForLevel.filter(q => !seenQuestionsForLevel.includes(q.id));

    if (unseenQuestions.length === 0 && allQuestionsForLevel.length > 0) {
        const newSeenQuestions = { ...seenQuestions, [userLevel]: [] };
        setSeenQuestions(newSeenQuestions);
        unseenQuestions = allQuestionsForLevel;
    }
    
    const shuffled = unseenQuestions.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, 10);
    
    setActivityQuestions(selectedQuestions);
    setView('activity');
  }, [userLevel, seenQuestions]);
  
  const completeNode = (nodeId: number): boolean => {
      const newCompletedNodes = Array.from(new Set([...completedNodes, nodeId]));
      setCompletedNodes(newCompletedNodes);
      setCurrentActivityId(null);

      if (newCompletedNodes.length >= TOTAL_NODES) {
          setView('graduation');
          return true;
      }
      return false;
  }

  const handleFinishActivity = (score: number, total: number) => {
    if (currentActivityId !== null) {
      if(completeNode(currentActivityId)) return;
      
      const newSeenIds = activityQuestions.map(q => q.id);
      const updatedSeenForLevel = Array.from(new Set([...(seenQuestions[userLevel] || []), ...newSeenIds]));
      const newSeenQuestions = { ...seenQuestions, [userLevel]: updatedSeenForLevel };
      setSeenQuestions(newSeenQuestions);
      
      setLastActivityScore({ score, total });
      
      const levels: UserLevel[] = ['A1', 'A2', 'B1', 'B2'];
      const percentage = (score / total) * 100;
      if (percentage >= 80 && userLevel !== 'B2') {
          const currentLevelIndex = levels.indexOf(userLevel);
          const newLevel = levels[currentLevelIndex + 1];
          setUserLevel(newLevel);
          setLevelChanged(newLevel);
      }
      
      setView('activity-result');
    }
  };
  
  const handleReturnToMap = () => {
    setView('treasure-map');
  };

  const handleNavigate = (targetView: View) => {
    if (targetView === 'treasure-map') {
      if (hasCompletedTest) {
        setView('treasure-map');
      } else {
        alert('Você precisa completar o teste de nivelamento primeiro!');
      }
      return;
    }
    setView(targetView);
  }
  
  const handleReset = () => {
      if (window.confirm("Você tem certeza que quer resetar todo o seu progresso? Esta ação não pode ser desfeita.")) {
          setUserLevel('A1');
          setHasCompletedTest(false);
          setCompletedNodes([]);
          setSeenQuestions({ A1: [], A2: [], B1: [], B2: [] });
          
          localStorage.removeItem('talkflow-audio-cache');
          localStorage.removeItem('talkflow-lyrics-cache');
          localStorage.removeItem('talkflow-quiz-cache');

          setView('dashboard');
      }
  }

  const renderContent = () => {
    switch (view) {
      case 'pre-test':
        return <PreTestIntroduction onConfirm={handleConfirmStartTest} onCancel={handleReturnToDashboard} />;
      case 'test':
        return <PlacementTest onFinishTest={handleFinishTest} />;
      case 'level-reveal':
        return <LevelReveal userLevel={userLevel} onAnimationEnd={handleLevelRevealEnd} />;
      case 'treasure-map':
        return <TreasureMap 
                  userLevel={userLevel} 
                  completedNodes={completedNodes}
                  onStartActivity={handleStartActivity}
                />;
      case 'activity':
        return <Activity 
                  questions={activityQuestions}
                  onFinishActivity={handleFinishActivity} 
                />;
      case 'activity-result':
        return <ActivityResult 
                  score={lastActivityScore!}
                  onReturnToMap={handleReturnToMap}
                  newLevel={levelChanged}
                />;
      case 'graduation':
        return <Graduation onReset={handleReset} />;
      case 'tuneflow':
        return <TuneFlow />;
      case 'tune-flow-test':
        return <TuneFlow />;
      case 'dashboard':
      default:
        return <Dashboard onStartTest={handleInitiateTest} userLevel={userLevel} userName={'Usuário'} />;
    }
  }

  return (
    <div className="min-h-screen bg-[#10141f] text-white font-sans flex flex-col">
      <Header onNavigate={handleNavigate} activeView={view} />
      <main className="p-4 sm:p-6 lg:p-8 flex-grow">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
