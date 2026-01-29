import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'accent' | 'destructive';
}

export default function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  color = 'primary',
}: MetricCardProps) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    secondary: 'bg-secondary/10 text-secondary border-secondary/20',
    accent: 'bg-accent/10 text-accent border-accent/20',
    destructive: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  const trendIcon = trend === 'up' ? (
    <TrendingUp className="w-4 h-4 text-secondary" />
  ) : trend === 'down' ? (
    <TrendingDown className="w-4 h-4 text-destructive" />
  ) : null;

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground font-medium mb-1">{title}</p>
          <h3 className="display-md text-card-foreground">{value}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>}
        </div>
        {icon && (
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>

      {trend && trendValue && (
        <div className="flex items-center gap-2 pt-4 border-t border-border">
          <div className="flex items-center gap-1">
            {trendIcon}
            <span className={`text-xs font-medium ${trend === 'up' ? 'text-secondary' : 'text-destructive'}`}>
              {trendValue}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">vs. período anterior</span>
        </div>
      )}
    </div>
  );
}
