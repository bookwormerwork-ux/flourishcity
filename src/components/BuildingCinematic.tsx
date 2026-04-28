import { useEffect, useState } from 'react';
import { haptic } from '@/lib/haptics';
import { Building, BUILDING_INFO } from '@/types/game';

interface BuildingCinematicProps {
  building: Building | null;
  onDone: () => void;
}

/**
 * Full-screen cinematic: dim background, swoop a glassy building emoji
 * up from below with confetti + haptics. ~2s total.
 */
export function BuildingCinematic({ building, onDone }: BuildingCinematicProps) {
  const [stage, setStage] = useState<'enter' | 'hold' | 'exit'>('enter');

  useEffect(() => {
    if (!building) return;
    haptic('rise');
    setStage('enter');
    const t1 = setTimeout(() => setStage('hold'), 800);
    const t2 = setTimeout(() => setStage('exit'), 1700);
    const t3 = setTimeout(() => {
      onDone();
    }, 2200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [building, onDone]);

  if (!building) return null;
  const info = BUILDING_INFO[building.type];

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center pointer-events-none"
      style={{
        background:
          stage === 'exit'
            ? 'hsl(0 0% 0% / 0)'
            : 'radial-gradient(circle at center, hsl(0 0% 0% / 0.55), hsl(0 0% 0% / 0.75))',
        transition: 'background 500ms ease-out',
      }}
    >
      {/* confetti */}
      {stage !== 'exit' &&
        Array.from({ length: 28 }).map((_, i) => {
          const left = 50 + (Math.cos((i / 28) * Math.PI * 2) * 30);
          const top = 50 + (Math.sin((i / 28) * Math.PI * 2) * 25);
          const hue = (i * 27) % 360;
          return (
            <span
              key={i}
              className="absolute rounded-sm"
              style={{
                top: `${top}%`,
                left: `${left}%`,
                width: 8,
                height: 12,
                background: `hsl(${hue} 80% 65%)`,
                transform: `rotate(${i * 30}deg) scale(${stage === 'enter' ? 0 : 1})`,
                opacity: stage === 'hold' ? 1 : 0,
                transition: 'all 700ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                transitionDelay: `${i * 15}ms`,
              }}
            />
          );
        })}

      <div
        className="glass-ultra rounded-[2rem] px-8 py-7 text-center"
        style={{
          transform:
            stage === 'enter'
              ? 'translateY(120px) scale(0.5)'
              : stage === 'exit'
              ? 'translateY(-40px) scale(0.9)'
              : 'translateY(0) scale(1)',
          opacity: stage === 'exit' ? 0 : 1,
          transition: 'all 700ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          boxShadow: '0 30px 80px -10px hsl(0 0% 0% / 0.5), 0 0 60px hsl(40 90% 70% / 0.4)',
        }}
      >
        <div
          className="text-6xl mb-3"
          style={{
            filter: stage === 'hold' ? 'drop-shadow(0 0 20px hsl(50 100% 70%))' : 'none',
            transition: 'filter 400ms',
          }}
        >
          {info.emoji}
        </div>
        <p className="text-micro uppercase tracking-widest text-primary font-bold">
          New Building
        </p>
        <h2 className="text-headline text-foreground mt-1">{info.label}</h2>
        <p className="text-caption mt-1">{info.description}</p>
      </div>
    </div>
  );
}
