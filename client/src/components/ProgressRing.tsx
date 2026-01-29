import React from 'react';

interface ProgressRingProps {
  percentage: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'success' | 'warning' | 'error' | 'info';
}

export default function ProgressRing({
  percentage,
  label,
  size = 'md',
  color = 'info',
}: ProgressRingProps) {
  const sizeMap = {
    sm: { radius: 30, circumference: 188.4 },
    md: { radius: 45, circumference: 282.6 },
    lg: { radius: 60, circumference: 376.8 },
  };

  const colorMap = {
    success: '#4ade80',
    warning: '#f97316',
    error: '#ef4444',
    info: '#3b82f6',
  };

  const { radius, circumference } = sizeMap[size];
  const offset = circumference - (percentage / 100) * circumference;

  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-40 h-40',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className={`flex flex-col items-center gap-3 ${sizeClasses[size]}`}>
      <svg
        className="transform -rotate-90"
        width={radius * 2}
        height={radius * 2}
        viewBox={`0 0 ${radius * 2} ${radius * 2}`}
      >
        {/* Background circle */}
        <circle
          cx={radius}
          cy={radius}
          r={radius - 8}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-border"
        />
        {/* Progress circle */}
        <circle
          cx={radius}
          cy={radius}
          r={radius - 8}
          fill="none"
          stroke={colorMap[color]}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
        {/* Center text */}
        <text
          x={radius}
          y={radius}
          textAnchor="middle"
          dy="0.3em"
          className={`font-bold fill-foreground ${textSizeClasses[size]}`}
        >
          {percentage}%
        </text>
      </svg>
      <p className="text-sm font-medium text-center text-muted-foreground">{label}</p>
    </div>
  );
}
