
import React, { useEffect } from 'react';
import { TargetIcon } from './icons/Icons.tsx';

interface LevelRevealProps {
    userLevel: string;
    onAnimationEnd: () => void;
}

const LevelReveal: React.FC<LevelRevealProps> = ({ userLevel, onAnimationEnd }) => {
    
    useEffect(() => {
        const timer = setTimeout(() => {
            onAnimationEnd();
        }, 3000); // Wait for 3 seconds before transitioning

        return () => clearTimeout(timer); // Cleanup timer on component unmount
    }, [onAnimationEnd]);

    return (
        <div className="max-w-xl mx-auto bg-[#1e2639] rounded-lg p-8 text-center shadow-2xl flex flex-col items-center justify-center h-[500px] animate-fade-in">
            <div className="mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full h-24 w-24 flex items-center justify-center mb-6 animate-pulse">
                <TargetIcon className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Parabéns! Seu nível é...</h2>
            
            <div className="my-4 p-2 overflow-hidden">
                <p className="text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-300 via-teal-400 to-blue-500 animate-level-reveal">
                    {userLevel}
                </p>
            </div>

            <p className="text-slate-300 mt-6 max-w-md mx-auto">
                Seu mapa do tesouro está sendo preparado...
            </p>

            <style>{`
                @keyframes level-reveal {
                    0% {
                        opacity: 0;
                        transform: translateY(20px) scale(0.9);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                .animate-level-reveal {
                    animation: level-reveal 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                    animation-delay: 0.2s;
                }
            `}</style>
        </div>
    );
};

export default LevelReveal;