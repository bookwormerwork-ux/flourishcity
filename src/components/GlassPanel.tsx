import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'strong' | 'subtle' | 'ultra';
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
    subtle: 'glass-subtle',
    ultra: 'glass-ultra'
  };

  return (
    <div 
      className={cn(
        variants[variant],
        'rounded-2xl p-4 transition-all duration-500',
        animate && 'animate-fade-in',
        className
      )}
    >
      {children}
    </div>
  );
}
