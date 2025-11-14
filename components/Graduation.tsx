
import React from 'react';
import { TrophyIcon } from './icons/Icons.tsx';

interface GraduationProps {
    onReset: () => void;
}

const Graduation: React.FC<GraduationProps> = ({ onReset }) => {
    return (
        <div className="max-w-2xl mx-auto bg-[#1e2639] rounded-lg p-8 text-center shadow-2xl flex flex-col items-center justify-center animate-fade-in">
            <div className="mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full h-28 w-28 flex items-center justify-center mb-6 animate-pulse">
                <TrophyIcon className="h-16 w-16 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-3">Parabéns, Mestre do Inglês!</h2>
            
            <p className="text-slate-300 text-lg mb-8">
                Você completou todas as atividades do seu Mapa do Tesouro. Sua dedicação é inspiradora!
            </p>

            <button
                onClick={onReset}
                className="w-full sm:w-auto px-8 py-3 rounded-lg text-md bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold hover:opacity-90 transition-opacity"
            >
                Começar uma Nova Jornada
            </button>
        </div>
    );
};

export default Graduation;