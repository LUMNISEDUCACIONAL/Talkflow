
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header.tsx';
import Dashboard from './components/Dashboard.tsx';
import PreTestIntroduction from './components/PreTestIntroduction.tsx';
import PlacementTest from './components/PlacementTest.tsx';
import TreasureMap, { NodeType, TOTAL_NODES } from './components/TreasureMap.tsx';
import LevelReveal from './components/LevelReveal.tsx';
import Activity, { Question } from './components/Activity.tsx';
import { questionBank } from './components/Activity.tsx';
import ActivityResult from './components/ActivityResult.tsx';
import TuneFlow from './components/SpotifyActivity.tsx';
import Graduation from './components/Graduation.tsx';
import Auth, { User, Credentials } from './components/Auth.tsx';

export type View = 'dashboard' | 'pre-test' | 'test' | 'level-reveal' | 'treasure-map' | 'activity' | 'activity-result' | 'tuneflow' | 'graduation';
export type UserLevel = 'A1' | 'A2' | 'B1' | 'B2';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [view, setView] = useState<View>('dashboard');
  const [userLevel, setUserLevel] = useState<UserLevel>('A1');
  const [hasCompletedTest, setHasCompletedTest] = useState(false);
  const [completedNodes, setCompletedNodes] = useState<number[]>([]);
  const [currentActivityId, setCurrentActivityId] = useState<number | null>(null);
  const [lastActivityScore, setLastActivityScore] = useState<{ score: number, total: number } | null>(null);
  const [seenQuestions, setSeenQuestions] = useState<Record<UserLevel, string[]>>({ A1: [], A2: [], B1: [], B2: [] });
  const [activityQuestions, setActivityQuestions] = useState<Question[]>([]);
  const [levelChanged, setLevelChanged] = useState<UserLevel | null>(null);

  const saveProgress = useCallback((progressData: any) => {
    if (!currentUser) return;
    try {
        const progressKey = `talkflow-progress-${currentUser.email}`;
        const dataToSave = {
            userLevel: progressData.userLevel,
            hasCompletedTest: progressData.hasCompletedTest,
            completedNodes: progressData.completedNodes,
            seenQuestions: progressData.seenQuestions,
        };
        localStorage.setItem(progressKey, JSON.stringify(dataToSave));
    } catch (error) {
        console.error("Failed to save progress to localStorage:", error);
        alert("Erro: Não foi possível salvar seu progresso localmente.");
    }
  }, [currentUser]);

  // Load user data from localStorage on login
  useEffect(() => {
    const loadProgress = () => {
        if (currentUser) {
            try {
                const progressKey = `talkflow-progress-${currentUser.email}`;
                const savedProgress = localStorage.getItem(progressKey);

                if (savedProgress) {
                    const data = JSON.parse(savedProgress);
                    setHasCompletedTest(data.hasCompletedTest);
                    setUserLevel(data.userLevel || 'A1');
                    setCompletedNodes(data.completedNodes || []);
                    setSeenQuestions(data.seenQuestions || { A1: [], A2: [], B1: [], B2: [] });
                } else {
                    // New user, set default state
                    setUserLevel('A1');
                    setHasCompletedTest(false);
                    setCompletedNodes([]);
                    setSeenQuestions({ A1: [], A2: [], B1: [], B2: [] });
                }
            } catch (error) {
                console.error("Failed to load progress from localStorage:", error);
                alert("Erro: Não foi possível carregar seu progresso local.");
            }
            setView('dashboard');
        }
    };
    loadProgress();
  }, [currentUser]);

  // Check for existing session on initial load
  useEffect(() => {
    try {
      const sessionUser = localStorage.getItem('talkflow-session');
      if (sessionUser) {
        const user: User = JSON.parse(sessionUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Failed to parse session data:", error);
      localStorage.removeItem('talkflow-session');
    }
  }, []);

  const handleRegister = async (user: Omit<User, 'passwordConfirmation'>): Promise<string | null> => {
    try {
        const usersJSON = localStorage.getItem('talkflow-users');
        const users = usersJSON ? JSON.parse(usersJSON) : [];

        const existingUser = users.find((u: User) => u.email === user.email);
        if (existingUser) {
            return 'Este e-mail já está em uso.';
        }

        users.push(user);
        localStorage.setItem('talkflow-users', JSON.stringify(users));

        await handleLogin({ email: user.email, password: user.password });
        return null;
    } catch (error) {
        console.error("Registration failed:", error);
        return 'Ocorreu um erro durante o registro.';
    }
  };

  const handleLogin = async (credentials: Credentials): Promise<string | null> => {
     try {
        const usersJSON = localStorage.getItem('talkflow-users');
        if (!usersJSON) {
            return 'E-mail ou senha inválidos.';
        }
        const users: User[] = JSON.parse(usersJSON);
        const user = users.find(u => u.email === credentials.email);

        if (!user || user.password !== credentials.password) {
            return 'E-mail ou senha inválidos.';
        }

        const userToStore = { name: user.name, email: user.email };
        localStorage.setItem('talkflow-session', JSON.stringify(userToStore));
        setCurrentUser(userToStore);
        setIsAuthenticated(true);
        return null;
    } catch (error) {
        console.error("Login failed:", error);
        return 'Ocorreu um erro durante o login.';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('talkflow-session');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setView('dashboard');
    setUserLevel('A1');
    setHasCompletedTest(false);
    setCompletedNodes([]);
    setSeenQuestions({ A1: [], A2: [], B1: [], B2: [] });
  };

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
    
    saveProgress({
      userLevel: newLevel,
      hasCompletedTest: true,
      completedNodes: [], // Reset nodes on new test completion
      seenQuestions: seenQuestions,
    });
    
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
    if (nodeType === 'music') {
        setView('tuneflow');
    } else {
        const allQuestionsForLevel = questionBank[userLevel] || [];
        let seenQuestionsForLevel = seenQuestions[userLevel] || [];

        let unseenQuestions = allQuestionsForLevel.filter(q => !seenQuestionsForLevel.includes(q.id));

        if (unseenQuestions.length === 0 && allQuestionsForLevel.length > 0) {
            seenQuestionsForLevel = [];
            unseenQuestions = allQuestionsForLevel;
            
            const newSeenQuestions = { ...seenQuestions, [userLevel]: [] };
            setSeenQuestions(newSeenQuestions);
            saveProgress({
                userLevel: userLevel,
                hasCompletedTest: hasCompletedTest,
                completedNodes: completedNodes,
                seenQuestions: newSeenQuestions
            });
        }
        
        const shuffled = unseenQuestions.sort(() => 0.5 - Math.random());
        const selectedQuestions = shuffled.slice(0, 10);
        
        setActivityQuestions(selectedQuestions);
        setView('activity');
    }
  }, [userLevel, seenQuestions, completedNodes, hasCompletedTest, saveProgress]);
  
  const completeNode = (nodeId: number) => {
      const newCompletedNodes = Array.from(new Set([...completedNodes, nodeId]));
      setCompletedNodes(newCompletedNodes);
      saveProgress({
          userLevel: userLevel,
          hasCompletedTest: hasCompletedTest,
          completedNodes: newCompletedNodes,
          seenQuestions: seenQuestions
      });
      setCurrentActivityId(null);

      if (newCompletedNodes.length >= TOTAL_NODES) {
          setView('graduation');
          return true;
      }
      return false;
  }

  const handleFinishActivity = (score: number, total: number) => {
    if (currentActivityId !== null) {
      const isGraduating = completeNode(currentActivityId);
      if(isGraduating) return;
      
      const newSeenIds = activityQuestions.map(q => q.id);
      const updatedSeenForLevel = Array.from(new Set([...(seenQuestions[userLevel] || []), ...newSeenIds]));
      const newSeenQuestions = { ...seenQuestions, [userLevel]: updatedSeenForLevel };
      setSeenQuestions(newSeenQuestions);
      
      setLastActivityScore({ score, total });
      
      let finalLevel = userLevel;
      const percentage = (score / total) * 100;
      if (percentage >= 80 && userLevel !== 'B2') {
          const levels: UserLevel[] = ['A1', 'A2', 'B1', 'B2'];
          const currentLevelIndex = levels.indexOf(userLevel);
          const newLevel = levels[currentLevelIndex + 1];
          setUserLevel(newLevel);
          setLevelChanged(newLevel);
          finalLevel = newLevel;
      }
      
      saveProgress({
          userLevel: finalLevel,
          hasCompletedTest: hasCompletedTest,
          completedNodes: completedNodes, // This is stale, use the updated one from completeNode
          seenQuestions: newSeenQuestions
      });

      setView('activity-result');
    }
  };

  const handleFinishTuneFlow = () => {
    if (currentActivityId !== null) {
        if(completeNode(currentActivityId)) return;
        setView('treasure-map');
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
          const initialProgress = {
              userLevel: 'A1' as UserLevel,
              hasCompletedTest: false,
              completedNodes: [],
              seenQuestions: { A1: [], A2: [], B1: [], B2: [] }
          };
          
          saveProgress(initialProgress);
          
          setUserLevel(initialProgress.userLevel);
          setHasCompletedTest(initialProgress.hasCompletedTest);
          setCompletedNodes(initialProgress.completedNodes);
          setSeenQuestions(initialProgress.seenQuestions);
          
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
      case 'tuneflow':
        return <TuneFlow onFinish={handleFinishTuneFlow} userLevel={userLevel} />;
      case 'graduation':
        return <Graduation onReset={handleReset} />;
      case 'dashboard':
      default:
        return <Dashboard onStartTest={handleInitiateTest} userLevel={userLevel} userName={currentUser!.name} />;
    }
  }
  
  if (!isAuthenticated || !currentUser) {
    return (
       <div className="min-h-screen bg-[#10141f] text-white font-sans flex items-center justify-center p-4">
            <Auth onLogin={handleLogin} onRegister={handleRegister} />
       </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#10141f] text-white font-sans flex flex-col">
      <Header onNavigate={handleNavigate} activeView={view} onReset={handleReset} onLogout={handleLogout} />
      <main className="p-4 sm:p-6 lg:p-8 flex-grow">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
