import { useRef, useState } from 'react';
import { Task, CATEGORY_LABELS } from '@/types/game';
import { Camera, X, Lock, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface VerifyTaskModalProps {
  task: Task;
  beforePhoto?: string | null; // optional — many tasks won't have one stored
  onClose: () => void;
  onVerified: () => void; // call when verification succeeds
}

interface VerifyResult {
  verified: boolean;
  confidence?: 'high' | 'medium' | 'low';
  message: string;
}

export function VerifyTaskModal({ task, beforePhoto, onClose, onVerified }: VerifyTaskModalProps) {
  const [afterPhoto, setAfterPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const tip =
    task.category === 'study' || task.category === 'creative'
      ? 'Tip: show your notebook, screen, or work output.'
      : null;

  const handleFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAfterPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const verify = async () => {
    if (!afterPhoto) return;
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('verify-task', {
        body: {
          beforeImage: beforePhoto || afterPhoto, // fallback if no before stored
          afterImage: afterPhoto,
          taskName: task.title,
          category: task.category,
          estimatedDurationMinutes: task.estimatedDurationMinutes || 30,
        },
      });
      if (error) {
        toast({
          title: 'The council is unreachable',
          description: error.message,
        });
        setLoading(false);
        return;
      }
      const r = data as VerifyResult;
      setResult(r);
      // Discard photos from memory after verification (pass or fail)
      setAfterPhoto(null);
      if (r.verified) {
        setTimeout(() => {
          onVerified();
        }, 800);
      }
    } catch (e) {
      toast({ title: 'The council is unreachable', description: String(e) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 overlay-blur-strong z-[100] animate-fade-in" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[110] max-w-md mx-auto animate-scale-in">
        <div className="glass-ultra rounded-[1.75rem] p-6 max-h-[85dvh] overflow-y-auto scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-headline text-foreground">Prove Your Work</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-accent/50 ios-press">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <p className="text-caption mb-3">
            Show what changed since you started <span className="font-semibold">{task.title}</span>.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <p className="text-micro mb-1">Before</p>
              {beforePhoto ? (
                <img src={beforePhoto} className="w-full h-32 object-cover rounded-xl border border-border/40" alt="Before" />
              ) : (
                <div className="w-full h-32 rounded-xl glass-subtle flex items-center justify-center text-micro text-muted-foreground text-center px-2">
                  No before photo on record
                </div>
              )}
            </div>
            <div>
              <p className="text-micro mb-1">After</p>
              {afterPhoto ? (
                <img src={afterPhoto} className="w-full h-32 object-cover rounded-xl border border-border/40" alt="After" />
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full h-32 rounded-xl border-2 border-dashed border-border/60 glass-subtle flex flex-col items-center justify-center gap-1 ios-press"
                >
                  <Camera className="w-5 h-5 text-primary" />
                  <span className="text-xs text-foreground">Take After Photo</span>
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </div>
          </div>

          {tip && <p className="text-micro mb-3 text-primary">{tip}</p>}

          <p className="text-micro flex items-center gap-1 text-muted-foreground mb-4">
            <Lock className="w-3 h-3" /> Photos are never stored.
          </p>

          {/* Loading state — city builders */}
          {loading && (
            <div className="my-6 flex flex-col items-center gap-3">
              <div className="flex items-end gap-1 h-12">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className="w-3 rounded-sm bg-primary/70"
                    style={{
                      animation: `stack 1.4s ${i * 0.15}s infinite ease-in-out`,
                      height: '20%',
                    }}
                  />
                ))}
              </div>
              <p className="text-caption">The city council is reviewing your work...</p>
            </div>
          )}

          {/* Result */}
          {result && (
            <div
              className={cn(
                'my-3 p-3 rounded-2xl text-sm',
                result.verified
                  ? 'bg-success/10 text-success border border-success/30'
                  : 'bg-destructive/10 text-destructive border border-destructive/30',
              )}
              style={{
                color: result.verified ? 'hsl(142 60% 35%)' : undefined,
                background: result.verified ? 'hsl(142 60% 95%)' : undefined,
              }}
            >
              <div className="flex items-start gap-2">
                {result.verified ? (
                  <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <X className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <p className="font-medium">{result.message}</p>
              </div>
            </div>
          )}

          {!result?.verified && (
            <button
              type="button"
              disabled={!afterPhoto || loading}
              onClick={verify}
              className={cn(
                'w-full py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 ios-press transition-all',
                afterPhoto && !loading
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/30 text-muted-foreground cursor-not-allowed',
              )}
            >
              <Sparkles className="w-4 h-4" /> Verify with AI
            </button>
          )}

        </div>
      </div>
    </>
  );
}
