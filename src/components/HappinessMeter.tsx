import { cn } from '@/lib/utils';
import { Heart } from 'lucide-react';

interface HappinessMeterProps {
  value: number; // 0-100
}

export function HappinessMeter({ value }: HappinessMeterProps) {
  const getColor = () => {
    if (value >= 80) return 'bg-category-habits';
    if (value >= 50) return 'bg-category-personal';
    if (value >= 30) return 'bg-category-work';
    return 'bg-destructive';
  };

  const getLabel = () => {
    if (value >= 80) return 'Thriving';
    if (value >= 50) return 'Content';
    if (value >= 30) return 'Uncertain';
    return 'Struggling';
  };

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Heart className={cn(
            "w-5 h-5",
            value >= 50 ? "text-category-habits" : "text-destructive"
          )} />
          <span className="font-semibold text-foreground">Happiness</span>
        </div>
        <span className="text-sm text-muted-foreground">{getLabel()}</span>
      </div>
      
      <div className="h-2 bg-accent rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-500", getColor())}
          style={{ width: `${value}%` }}
        />
      </div>
      <div className="mt-1 text-right">
        <span className="text-xs text-muted-foreground">{value}%</span>
      </div>
    </div>
  );
}
