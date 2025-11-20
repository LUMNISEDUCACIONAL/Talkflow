
import React, { useState, useMemo } from 'react';
import { LogoIcon, DocumentTextIcon, ChatBubbleIcon, ChevronRightIcon, ChevronLeftIcon, CheckCircleIcon } from './icons/Icons.tsx';

export type NodeType = 'doc' | 'chat';
type UserLevel = 'A1' | 'A2' | 'B1' | 'B2';

interface NodeData {
  id: number;
  type: NodeType;
}

interface TreasureMapProps {
    userLevel: string;
    completedNodes: number[];
    onStartActivity: (nodeId: number, nodeType: NodeType) => void;
}

const nodeTypesConfig: { [key in NodeType]: { Icon: React.FC<any>, color: string, size: string, filterClass: string } } = {
  doc: { Icon: DocumentTextIcon, color: 'from-yellow-400 to-orange-500', size: 'w-20 h-20', filterClass: '[filter:drop-shadow(0_0_8px_rgba(251,191,36,0.6))] hover:[filter:drop-shadow(0_0_12px_rgba(251,191,36,0.9))]' },
  chat: { Icon: ChatBubbleIcon, color: 'from-yellow-400 to-orange-500', size: 'w-20 h-20', filterClass: '[filter:drop-shadow(0_0_8px_rgba(251,191,36,0.6))] hover:[filter:drop-shadow(0_0_12px_rgba(251,191,36,0.9))]' },
};

const levelBackgrounds: { [key: string]: string } = {
    A1: 'bg-gradient-to-br from-[#1e2639] to-[#2c3a55]',
    A2: 'bg-gradient-to-br from-[#1e2639] to-[#2c4a55]',
    B1: 'bg-gradient-to-br from-[#1e2639] to-[#4a2c55]',
    B2: 'bg-gradient-to-br from-[#1e2639] to-[#552c3e]',
    default: 'bg-[#1e2639]'
}

const activityPattern: NodeType[] = ['doc', 'chat'];

export const TOTAL_NODES = 108;
const allNodes: NodeData[] = Array.from({ length: TOTAL_NODES }, (_, i) => ({
  id: i + 1,
  type: activityPattern[i % activityPattern.length]
}));

const NODES_PER_PAGE = 3;
const TOTAL_PAGES = Math.ceil(allNodes.length / NODES_PER_PAGE);

const defaultMascotMessages = [ "Estou torcendo por você!", "Que progresso!", "Você consegue! ✨", "Continue assim! 🚀" ];
const nodeTypeMessages: { [key in NodeType]: string } = { doc: "Hora de um pouco de leitura.", chat: "Vamos praticar a conversação." };

const TreasureMap: React.FC<TreasureMapProps> = ({ userLevel, completedNodes, onStartActivity }) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [hoveredNodeType, setHoveredNodeType] = useState<NodeType | null>(null);

    const visibleNodes = useMemo(() => {
        const start = currentPage * NODES_PER_PAGE;
        const end = start + NODES_PER_PAGE;
        return allNodes.slice(start, end);
    }, [currentPage]);

    const handleNext = () => {
        setHoveredNodeType(null);
        setCurrentPage(prev => Math.min(prev + 1, TOTAL_PAGES - 1));
    }
    
    const handlePrev = () => {
        setHoveredNodeType(null);
        setCurrentPage(prev => Math.max(prev - 1, 0));
    }

    const currentMessage = hoveredNodeType ? nodeTypeMessages[hoveredNodeType] : defaultMascotMessages[currentPage % defaultMascotMessages.length];
    const backgroundClass = levelBackgrounds[userLevel] || levelBackgrounds.default;
    
    const pagePositions = [ { top: '35%', left: '30%' }, { top: '65%', left: '50%' }, { top: '35%', left: '70%' } ];


    return (
        <div className={`w-full max-w-7xl mx-auto h-[650px] rounded-xl relative overflow-hidden ${backgroundClass} animate-fade-in transition-colors duration-500`}>
            {/* Mascot */}
            <div className="hidden md:flex absolute left-[8%] top-[45%] flex-col items-center z-20 animate-fade-in-left">
                <div className="relative mb-3 h-16">
                    <div className="bg-slate-800/60 backdrop-blur-sm rounded-lg py-2 px-4 text-center border border-slate-700/50 shadow-lg min-w-[200px]">
                        <p className="text-sm text-slate-200 transition-opacity duration-300" key={currentMessage}>{currentMessage}</p>
                        <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-slate-700/50"></div>
                    </div>
                </div>
                <LogoIcon className="h-20 w-20"/>
                <p className="text-center font-bold text-xs mt-1 text-blue-400">LUMNIS</p>
            </div>

            {/* Map Area */}
            <div className="absolute inset-0 w-full h-full z-10">
                <svg className="w-full h-full" viewBox="0 0 1000 650" preserveAspectRatio="xMidYMid meet">
                    {/* A simple curve path for 3 nodes */}
                    <path d="M 300 227 C 450 450, 550 450, 700 227" stroke="#334155" strokeWidth="2" fill="none" strokeDasharray="5,10" />
                </svg>

                {visibleNodes.map((node, index) => {
                    const pos = pagePositions[index];
                    if (!pos) return null;

                    const config = nodeTypesConfig[node.type];
                    const isCompleted = completedNodes.includes(node.id);
                    const isLocked = node.id > 1 && !completedNodes.includes(node.id - 1);
                    const isClickable = !isLocked && !isCompleted;

                    let nodeClasses = `relative flex items-center justify-center bg-gradient-to-br ${config.color} rounded-full transition-all duration-300 ease-in-out ${config.size}`;
                    if(isClickable) nodeClasses += ` cursor-pointer hover:scale-105 hover:-translate-y-1 ${config.filterClass}`;
                    if(isLocked) nodeClasses += ' opacity-40 grayscale cursor-not-allowed';
                    if(isCompleted) nodeClasses += ' opacity-60 grayscale';

                    return (
                        <div key={node.id} 
                             className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-zoom-in" 
                             style={{ top: pos.top, left: pos.left, animationDelay: `${index * 100}ms` }}
                             onMouseEnter={() => !isLocked && setHoveredNodeType(node.type)}
                             onMouseLeave={() => setHoveredNodeType(null)}
                             onClick={() => isClickable && onStartActivity(node.id, node.type)}
                        >
                            <div className={nodeClasses}>
                                <config.Icon className="h-1/2 w-1/2 text-white" />
                                <div className="absolute -top-1 -left-1 w-7 h-7 bg-slate-900 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-slate-600">
                                    {node.id}
                                </div>
                                {isCompleted && (
                                    <div className="absolute inset-0 rounded-full flex items-center justify-center">
                                        <CheckCircleIcon className="w-1/2 h-1/2 text-green-400" />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {/* Navigation */}
            <button
                onClick={handlePrev}
                disabled={currentPage === 0}
                className="absolute left-8 top-1/2 -translate-y-1/2 bg-slate-800/40 rounded-full p-2 text-white hover:bg-slate-700/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all z-20"
                aria-label="Página anterior"
            >
                <ChevronLeftIcon className="h-7 w-7" />
            </button>
            <button
                onClick={handleNext}
                disabled={currentPage >= TOTAL_PAGES - 1}
                className="absolute right-8 top-1/2 -translate-y-1/2 bg-slate-800/40 rounded-full p-2 text-white hover:bg-slate-700/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all z-20"
                aria-label="Próxima página"
            >
                <ChevronRightIcon className="h-7 w-7" />
            </button>

            <div className="absolute bottom-6 right-8 text-slate-400 text-lg font-bold z-20 p-2">
                <span key={currentPage} className="inline-block text-white animate-page-flicker">{currentPage + 1}</span>
                <span className="mx-1">/</span>
                <span>{TOTAL_PAGES}</span>
            </div>

            <style>{`@keyframes page-flicker { 0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: translateY(0); } } .animate-page-flicker { animation: page-flicker 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }`}</style>
        </div>
    );
};

export default TreasureMap;
