import { useMemo } from 'react';
import { Sparkles } from 'lucide-react';

const quotes = [
  "Your city grows with every step forward.",
  "Small actions lead to great cities.",
  "Today's effort is tomorrow's skyline.",
  "Your citizens believe in you.",
  "Progress, not perfection.",
  "Every task completed is a foundation laid.",
  "Build your dreams, one task at a time.",
  "Your future self will thank you.",
  "Consistency is the architect of success.",
  "Start where you are, use what you have."
];

export function MotivationalQuote() {
  const quote = useMemo(() => {
    const today = new Date().toDateString();
    const hash = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return quotes[hash % quotes.length];
  }, []);

  return (
    <div className="glass-subtle rounded-2xl p-4 flex items-start gap-3">
      <Sparkles className="w-5 h-5 text-category-personal flex-shrink-0 mt-0.5 animate-pulse-soft" />
      <p className="text-sm text-muted-foreground italic leading-relaxed">
        "{quote}"
      </p>
    </div>
  );
}
