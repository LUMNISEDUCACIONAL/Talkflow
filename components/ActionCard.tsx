
import React from 'react';

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  ButtonIcon: React.ElementType;
  glowColor: 'purple' | 'green';
  buttonVariant: 'gradient' | 'light';
  onClick?: () => void;
}

const glowClasses = {
  purple: 'before:bg-purple-500/80',
  green: 'before:bg-green-500/80',
};

const buttonClasses = {
  gradient: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90',
  light: 'bg-green-200 text-green-900 font-semibold hover:bg-green-300',
};

export const ActionCard: React.FC<ActionCardProps> = ({ 
  icon, 
  title, 
  description, 
  buttonText, 
  ButtonIcon,
  glowColor,
  buttonVariant,
  onClick
}) => {
  return (
    <div className={`bg-[#1e2639] rounded-lg p-6 relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-1 ${glowClasses[glowColor]}`}>
      <div className="flex items-center gap-4">
        {icon}
        <div>
          <h3 className="font-bold text-white text-lg">{title}</h3>
          <p className="text-slate-400 text-sm">{description}</p>
        </div>
      </div>
      <button 
        onClick={onClick}
        className={`mt-6 w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm transition-all ${buttonClasses[buttonVariant]}`}
      >
        <ButtonIcon className="h-4 w-4" />
        <span>{buttonText}</span>
      </button>
    </div>
  );
};
