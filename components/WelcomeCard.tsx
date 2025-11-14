
import React from 'react';
import { LogoIcon } from './icons/Icons.tsx';

interface WelcomeCardProps {
    userName: string;
}

export const WelcomeCard: React.FC<WelcomeCardProps> = ({ userName }) => {
  return (
    <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-xl p-6 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
      <div>
        <h2 className="text-3xl font-bold text-white">Olá, {userName}! 👋</h2>
        <p className="text-indigo-100 mt-2">A consistência é a chave do sucesso! 🔥</p>
      </div>
      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 flex flex-col items-center text-center w-40 shrink-0">
        <LogoIcon className="h-16 w-16" />
        <p className="font-bold text-sm mt-2 text-white">TALKFLOW</p>
        <p className="text-xs text-indigo-200">LUMNIS</p>
      </div>
    </div>
  );
};