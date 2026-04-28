import { useEffect, useState } from 'react';
import { TaskCategory } from '@/types/game';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Sparkles } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface MoodCheckInProps {
  onPick: (
    title: string,
    category: TaskCategory,
    durationMinutes: number,
  ) => void;
  onDismiss: () => void;
}

const MOODS = [
  { key: 'energized', emoji: '⚡', label: 'Energized' },
  { key: 'okay', emoji: '🙂', label: 'Okay' },
  { key: 'tired', emoji: '😴', label: 'Tired' },
  { key: 'stressed', emoji: '😣', label: 'Stressed' },
] as const;

type MoodKey = (typeof MOODS)[number]['key'];

interface Suggestion {
  title: string;
  category: TaskCategory;
  durationMinutes: number;
}

const FALLBACK: Record<MoodKey, Suggestion[]> = {
  energized: [
    { title: 'Tackle hardest work item', category: 'work', durationMinutes: 45 },
    { title: '30-min cardio', category: 'health', durationMinutes: 30 },
    { title: 'Deep study session', category: 'study', durationMinutes: 60 },
  ],
  okay: [
    { title: 'Tidy your space', category: 'home', durationMinutes: 20 },
    { title: 'Reply to messages', category: 'social', durationMinutes: 15 },
    { title: 'Review weekly budget', category: 'finance', durationMinutes: 20 },
  ],
  tired: [
    { title: '10-min stretch', category: 'health', durationMinutes: 10 },
    { title: 'Make tea, sit still', category: 'growth', durationMinutes: 15 },
    { title: 'One small chore', category: 'home', durationMinutes: 10 },
  ],
  stressed: [
    { title: '5-min breathing', category: 'growth', durationMinutes: 5 },
    { title: 'Walk outside', category: 'health', durationMinutes: 15 },
    { title: 'Brain-dump on paper', category: 'creative', durationMinutes: 10 },
  ],
};

export function MoodCheckIn({ onPick, onDismiss }: MoodCheckInProps) {
  const [mood, setMood] = useState<MoodKey | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [, setLastShown] = useLocalStorage<string>('flourish-mood-last', '');

  useEffect(() => {
    setLastShown(new Date().toDateString());
  }, [setLastShown]);

  const choose = async (m: MoodKey) => {
    setMood(m);
    setLoading(true);
    setSuggestions([]);
    try {
      const { data, error } = await supabase.functions.invoke('mood-suggestions', {
        body: { mood: m },
      });
      if (!error && Array.isArray(data?.suggestions) && data.suggestions.length) {
        setSuggestions(data.suggestions.slice(0, 3));
      } else {
        setSuggestions(FALLBACK[m]);
      }
    } catch {
      setSuggestions(FALLBACK[m]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[160] overlay-blur-strong animate-fade-in"
        onClick={onDismiss}
      />
      <div className="fixed inset-x-5 top-1/2 -translate-y-1/2 z-[170] max-w-md mx-auto animate-scale-in">
        <div className="glass-ultra rounded-[2rem] p-6">
          <div className="text-center mb-5">
            <Sparkles className="w-6 h-6 text-primary mx-auto mb-2" />
            <h2 className="text-headline text-foreground">How are you, Mayor?</h2>
            <p className="text-caption mt-1">
              {mood ? "Here's a right-sized first task." : 'Tap your mood and I’ll pick three tasks.'}
            </p>
          </div>

          {!mood && (
            <div className="grid grid-cols-2 gap-3">
              {MOODS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => choose(m.key)}
                  className="glass-subtle rounded-2xl py-5 ios-press flex flex-col items-center gap-1"
                >
                  <span className="text-3xl">{m.emoji}</span>
                  <span className="text-sm font-semibold text-foreground">{m.label}</span>
                </button>
              ))}
            </div>
          )}

          {mood && loading && (
            <div className="py-10 flex items-center justify-center text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Reading the city's mood…
            </div>
          )}

          {mood && !loading && suggestions.length > 0 && (
            <div className="space-y-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onPick(s.title, s.category, s.durationMinutes);
                    onDismiss();
                  }}
                  className="w-full glass-subtle rounded-2xl p-4 text-left ios-press flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-foreground">{s.title}</p>
                    <p className="text-micro mt-0.5">
                      {s.category} · {s.durationMinutes} min
                    </p>
                  </div>
                  <span className="text-primary font-bold">Add →</span>
                </button>
              ))}
            </div>
          )}

          <button
            onClick={onDismiss}
            className="w-full mt-4 py-3 text-caption hover:text-foreground transition"
          >
            Skip for now
          </button>
        </div>
      </div>
    </>
  );
}
