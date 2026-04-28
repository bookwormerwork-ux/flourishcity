import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { CityStats } from '@/types/game';
import { GlassyBuildings } from './GlassyBuildings';
import { SkyLayer } from './SkyLayer';
import { X, Download, Share2, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CityPostcardModalProps {
  stats: CityStats;
  weeklyTasksCompleted: number;
  onClose: () => void;
}

export function CityPostcardModal({
  stats,
  weeklyTasksCompleted,
  onClose,
}: CityPostcardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  const renderToBlob = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
      logging: false,
    });
    return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
  };

  const handleDownload = async () => {
    setBusy(true);
    try {
      const blob = await renderToBlob();
      if (!blob) throw new Error('render failed');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${stats.cityName || 'flourish'}-postcard.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Couldn't render postcard", description: 'Please try again.' });
    } finally {
      setBusy(false);
    }
  };

  const handleShare = async () => {
    setBusy(true);
    try {
      const blob = await renderToBlob();
      if (!blob) throw new Error('render failed');
      const file = new File([blob], 'flourish-postcard.png', { type: 'image/png' });
      const nav = navigator as Navigator & {
        share?: (data: { files?: File[]; title?: string; text?: string }) => Promise<void>;
        canShare?: (data: { files?: File[] }) => boolean;
      };
      if (nav.share && nav.canShare?.({ files: [file] })) {
        await nav.share({
          files: [file],
          title: `${stats.cityName || 'Flourish'} this week`,
          text: `My city ${stats.cityName || 'Flourish'} grew this week 🌇`,
        });
      } else {
        await handleDownload();
      }
    } catch {
      /* user cancelled */
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[180] overlay-blur-strong animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[190] max-w-md mx-auto animate-scale-in">
        <div className="glass-ultra rounded-[2rem] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-headline text-foreground">Weekly Postcard</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-accent/50 ios-press"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Postcard */}
          <div
            ref={cardRef}
            className="relative w-full overflow-hidden rounded-[1.5rem]"
            style={{ aspectRatio: '4/5' }}
          >
            <SkyLayer />
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[hsl(145_45%_45%)] to-transparent" />

            <div className="relative z-10 p-5 h-full flex flex-col">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80 drop-shadow">
                  My city this week
                </p>
                <h3 className="text-3xl font-extrabold text-white mt-1 drop-shadow-lg">
                  {stats.cityName || 'Flourish'}
                </h3>
              </div>

              <div className="flex-1" />

              <div className="absolute left-0 right-0 bottom-24">
                <GlassyBuildings buildings={stats.buildings} max={18} scale="sm" />
              </div>

              <div className="relative mt-auto grid grid-cols-3 gap-2 z-10">
                <Stat label="Citizens" value={stats.population} />
                <Stat label="Tasks" value={weeklyTasksCompleted} />
                <Stat label="Streak" value={`${stats.streak}🔥`} />
              </div>

              <p className="text-[10px] text-white/70 text-center mt-3 font-medium tracking-wider">
                FLOURISH · Built one task at a time
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={handleDownload}
              disabled={busy}
              className="py-3 rounded-2xl glass-subtle text-foreground font-semibold flex items-center justify-center gap-2 ios-press disabled:opacity-60"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Save
            </button>
            <button
              onClick={handleShare}
              disabled={busy}
              className="py-3 rounded-2xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 ios-press disabled:opacity-60"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl bg-white/25 backdrop-blur-md border border-white/40 px-2 py-2 text-center">
      <p className="text-lg font-extrabold text-white drop-shadow">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-white/85 font-semibold">{label}</p>
    </div>
  );
}
