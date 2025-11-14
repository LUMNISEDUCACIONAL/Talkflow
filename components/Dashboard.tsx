
import React from 'react';
import { WelcomeCard } from './WelcomeCard.tsx';
import { StatCard } from './StatCard.tsx';
import { ActionCard } from './ActionCard.tsx';
import { ZapIcon, TargetIcon, FlameIcon, StarIcon, BookOpenIcon, FileTextIcon } from './icons/Icons.tsx';

interface DashboardProps {
  onStartTest: () => void;
  userLevel: string;
  userName: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ onStartTest, userLevel, userName }) => {
  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 gap-6 animate-fade-in">
      <WelcomeCard userName={userName} />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="XP Total" 
          value="0" 
          Icon={ZapIcon} 
          color="green" 
        />
        <StatCard 
          title="Seu Nível" 
          value={userLevel} 
          Icon={TargetIcon} 
          color="blue"
        />
        <StatCard 
          title="Sequência" 
          value="0 dias" 
          Icon={FlameIcon} 
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActionCard
          icon={<div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full"><StarIcon className="h-6 w-6 text-white"/></div>}
          title="Continue Estudando"
          description="Sua próxima atividade está te esperando"
          buttonText="Ir para Plano de Estudo"
          ButtonIcon={BookOpenIcon}
          glowColor="purple"
          buttonVariant="gradient"
          onClick={onStartTest}
        />
        <ActionCard
          icon={<FileTextIcon className="h-10 w-10 text-green-400"/>}
          title="Próxima atividade do seu plano"
          description={`Atividade de nível ${userLevel} personalizada`}
          buttonText="Ir para Plano de Estudo"
          ButtonIcon={BookOpenIcon}
          glowColor="green"
          buttonVariant="light"
          onClick={onStartTest}
        />
      </div>
    </div>
  );
};

export default Dashboard;