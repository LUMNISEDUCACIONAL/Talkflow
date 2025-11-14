
import React from 'react';
import { StarIcon } from './icons/Icons.tsx';
import { UserLevel } from '../App.tsx';

interface ActivityResultProps {
    score: { score: number; total: number };
    onReturnToMap: () => void;
    newLevel: UserLevel | null;
}

const ActivityResult: React.FC<ActivityResultProps> = ({ score, onReturnToMap, newLevel }) => {
    const percentage = Math.round((score.score / score.total) * 100);
    
    let message = "Continue praticando!";
    if (newLevel) message = "Nível Promovido!";
    else if (percentage >= 80) message = "Excelente trabalho!";
    else if (percentage >= 60) message = "Muito bem!";

    return (
        <div className="max-w-xl mx-auto bg-[#1e2639] rounded-lg p-8 text-center shadow-2xl flex flex-col items-center justify-center animate-fade-in">
            <div className="mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full h-24 w-24 flex items-center justify-center mb-6 animate-pulse">
                <StarIcon className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">{message}</h2>
            
            {newLevel ? (
                <p className="text-slate-300 text-lg mb-6">Parabéns! Você avançou para o nível <span className="font-bold text-green-400">{newLevel}</span>.</p>
            ) : (
                 <p className="text-slate-300 text-lg mb-6">Sua pontuação foi:</p>
            )}

            <p className="text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-300 via-teal-400 to-blue-500 mb-8">
                {score.score} <span className="text-4xl text-slate-400">/ {score.total}</span>
            </p>

            <button
                onClick={onReturnToMap}
                className="w-full sm:w-auto px-8 py-3 rounded-lg text-md bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity"
            >
                Voltar para o Mapa
            </button>
        </div>
    );
};

export default ActivityResult;