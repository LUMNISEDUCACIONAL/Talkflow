
import React from 'react';
import { FileTextIcon } from './icons/Icons.tsx';

interface PreTestIntroductionProps {
    onConfirm: () => void;
    onCancel: () => void;
}

const PreTestIntroduction: React.FC<PreTestIntroductionProps> = ({ onConfirm, onCancel }) => {
    return (
        <div className="max-w-xl mx-auto bg-[#1e2639] rounded-lg p-8 text-center shadow-2xl animate-fade-in">
            <div className="mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full h-20 w-20 flex items-center justify-center mb-6">
                <FileTextIcon className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Teste de Nivelamento</h2>
            <p className="text-slate-300 mb-6 max-w-md mx-auto">
                Antes de criarmos seu plano de estudo personalizado, precisamos entender seu nível de inglês atual.
            </p>
            
            <div className="bg-slate-800/50 rounded-lg p-4 mb-8 text-left space-y-3">
                <p className="text-slate-300"><span className="font-semibold text-white">Formato:</span> 20 perguntas de múltipla escolha.</p>
                <p className="text-slate-300"><span className="font-semibold text-white">Objetivo:</span> Avaliar sua gramática e vocabulário.</p>
                <p className="text-slate-300"><span className="font-semibold text-white">Tempo estimado:</span> 10-15 minutos.</p>
            </div>

            <p className="text-slate-200 font-semibold mb-6">Você está pronto para começar?</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <button
                    onClick={onCancel}
                    className="w-full sm:w-auto px-6 py-3 rounded-lg text-md bg-slate-700 text-white font-semibold hover:bg-slate-600 transition-colors"
                >
                    Voltar
                </button>
                <button
                    onClick={onConfirm}
                    className="w-full sm:w-auto px-6 py-3 rounded-lg text-md bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity"
                >
                    Começar Agora
                </button>
            </div>
        </div>
    );
};

export default PreTestIntroduction;