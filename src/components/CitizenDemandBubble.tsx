import { useEffect, useState } from 'react';
import { CitizenDemand } from '@/types/game';
import { X } from 'lucide-react';

interface CitizenDemandBubbleProps {
  demand: CitizenDemand;
  onDismiss: (id: string) => void;
}

export function CitizenDemandBubble({ demand, onDismiss }: CitizenDemandBubbleProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setShow(false);
      setTimeout(() => onDismiss(demand.id), 300);
    }, 5000);
    return () => clearTimeout(t);
  }, [demand.id, onDismiss]);

  if (!show) return null;

  return (
    <div className="absolute top-2 right-2 left-2 z-30 flex justify-end pointer-events-none animate-fade-in">
      <div className="pointer-events-auto max-w-[80%] glass-ultra rounded-2xl px-3 py-2 shadow-lg border border-border/50 flex items-start gap-2">
        <span className="text-lg leading-none">💬</span>
        <p className="text-xs text-foreground flex-1 leading-snug">{demand.text}</p>
        <button
          onClick={() => onDismiss(demand.id)}
          className="p-0.5 rounded text-muted-foreground hover:text-foreground"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
