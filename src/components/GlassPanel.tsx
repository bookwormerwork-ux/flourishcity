import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'strong' | 'subtle';
  animate?: boolean;
}

export function GlassPanel({ 
  children, 
  className, 
  variant = 'default',
  animate = true 
}: GlassPanelProps) {
  const variants = {
    default: 'glass',
    strong: 'glass-strong',
    subtle: 'glass-subtle'
  };

  return (
    <div 
      className={cn(
        variants[variant],
        'rounded-2xl p-4',
        animate && 'animate-fade-in',
        className
      )}
    >
      {children}
    </div>
  );
}
