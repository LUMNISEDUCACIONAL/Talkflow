
import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  Icon: React.ElementType;
  color: 'green' | 'blue' | 'yellow';
}

const colorClasses = {
  green: {
    border: 'border-l-4 border-green-400',
    text: 'text-green-400',
    icon: 'text-green-400',
  },
  blue: {
    border: 'border-l-4 border-blue-400',
    text: 'text-blue-400',
    icon: 'text-blue-400',
  },
  yellow: {
    border: 'border-l-4 border-yellow-400',
    text: 'text-yellow-400',
    icon: 'text-yellow-400',
  },
};


export const StatCard: React.FC<StatCardProps> = ({ title, value, Icon, color }) => {
  const classes = colorClasses[color];
  return (
    <div className={`bg-[#1e2639] rounded-lg p-6 relative overflow-hidden ${classes.border}`}>
      <div className="flex justify-between items-start">
        <p className="text-slate-300 text-sm">{title}</p>
        <Icon className={`h-5 w-5 ${classes.icon}`} />
      </div>
      <p className={`text-4xl font-bold mt-2 ${classes.text}`}>{value}</p>
    </div>
  );
};
