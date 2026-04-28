import { useSkyState } from '@/hooks/useSkyState';
import { cn } from '@/lib/utils';

interface SkyLayerProps {
  className?: string;
  /** Show animated sun/moon? */
  withCelestial?: boolean;
}

/**
 * Absolutely-positioned sky layer that adapts to real time of day.
 * Place inside a `relative` container. Renders behind everything.
 */
export function SkyLayer({ className, withCelestial = true }: SkyLayerProps) {
  const sky = useSkyState();

  return (
    <div
      className={cn('absolute inset-0 transition-[background] duration-[3000ms]', className)}
      style={{ background: sky.gradient }}
    >
      {sky.showStars && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 30 }).map((_, i) => {
            const top = (i * 37) % 60;
            const left = (i * 53) % 100;
            const size = (i % 3) + 1;
            const delay = (i % 5) * 0.4;
            return (
              <span
                key={i}
                className="absolute rounded-full bg-white animate-pulse"
                style={{
                  top: `${top}%`,
                  left: `${left}%`,
                  width: size,
                  height: size,
                  opacity: 0.6 + ((i % 4) / 10),
                  animationDelay: `${delay}s`,
                }}
              />
            );
          })}
        </div>
      )}

      {withCelestial && sky.showSun && (
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            top: sky.phase === 'dawn' || sky.phase === 'dusk' ? '55%' : '18%',
            right: sky.phase === 'dusk' ? '20%' : '15%',
            width: 44,
            height: 44,
            background:
              sky.phase === 'day'
                ? 'radial-gradient(circle, hsl(50 100% 75%), hsl(40 100% 60% / 0.8))'
                : 'radial-gradient(circle, hsl(20 100% 70%), hsl(10 100% 55% / 0.7))',
            boxShadow:
              sky.phase === 'day'
                ? '0 0 40px hsl(50 100% 70% / 0.6)'
                : '0 0 60px hsl(15 100% 60% / 0.7)',
          }}
        />
      )}

      {withCelestial && sky.showMoon && (
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            top: '18%',
            right: '20%',
            width: 36,
            height: 36,
            background:
              'radial-gradient(circle at 35% 35%, hsl(50 30% 95%), hsl(220 20% 75%))',
            boxShadow: '0 0 30px hsl(220 60% 80% / 0.4)',
          }}
        />
      )}
    </div>
  );
}
