import { useState } from 'react';
import { Building, BUILDING_INFO } from '@/types/game';
import { cn } from '@/lib/utils';
import { X, Users, Layers, Store } from 'lucide-react';

interface GlassyBuildingsProps {
  buildings: Building[];
  /** Maximum number of buildings to render in the strip */
  max?: number;
  /** Smaller scale for the compact city card vs the full detailed view */
  scale?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Renders a horizontally scrolling skyline of clean glass buildings.
 * Each building is a CSS-drawn shape (no emoji) with windows, a roof,
 * and category-tinted accent colour. Tap a building to see info.
 */
export function GlassyBuildings({
  buildings,
  max = 24,
  scale = 'md',
  className,
}: GlassyBuildingsProps) {
  const [selected, setSelected] = useState<Building | null>(null);

  const sizeMap = {
    sm: { unit: 14, gap: 4 },
    md: { unit: 18, gap: 6 },
    lg: { unit: 22, gap: 8 },
  } as const;
  const { unit, gap } = sizeMap[scale];

  const visible = buildings.slice(-max);

  return (
    <>
      <div
        className={cn(
          'relative w-full overflow-x-auto scrollbar-hide',
          className
        )}
      >
        <div
          className="flex items-end justify-start min-w-full px-2"
          style={{ gap, minHeight: unit * 7 }}
        >
          {visible.map((b, i) => (
            <BuildingShape
              key={b.id}
              building={b}
              unit={unit}
              index={i}
              onClick={() => setSelected(b)}
            />
          ))}
        </div>
      </div>

      {selected && (
        <BuildingInfoModal
          building={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Individual building                                                */
/* ------------------------------------------------------------------ */

interface ShapeProps {
  building: Building;
  unit: number;
  index: number;
  onClick: () => void;
}

function BuildingShape({ building, unit, index, onClick }: ShapeProps) {
  const dims = getDims(building.type, unit);
  const accent = `hsl(var(--${categoryToken(building.category)}))`;
  const state = building.state || 'completed';

  // Debt and Big Project use wireframe outlines instead of full color
  const isWireframe = state === 'debt' || state === 'big_project';
  const wireColor = state === 'debt' ? 'hsl(0 70% 55%)' : 'hsl(210 80% 60%)';

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative shrink-0 ios-press animate-fade-in',
        state === 'big_project' && 'animate-pulse',
      )}
      style={{
        width: dims.w,
        height: dims.h,
        animationDelay: `${index * 60}ms`,
      }}
      aria-label={building.meta.name}
    >
      <span
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full blur-md opacity-50 group-hover:opacity-80 transition-opacity"
        style={{
          width: dims.w * 0.9,
          height: 4,
          background: isWireframe ? wireColor : accent,
        }}
      />

      {/* Body */}
      {isWireframe ? (
        <span
          className="absolute inset-0 rounded-[8px] border-2 border-dashed"
          style={{
            borderColor: wireColor,
            background: `${wireColor.replace(')', ' / 0.08)')}`,
          }}
        />
      ) : (
        <span
          className="absolute inset-0 rounded-[8px] border border-white/40 backdrop-blur-md transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-[1.04]"
          style={{
            background: `linear-gradient(160deg,
              hsl(var(--card) / 0.85) 0%,
              hsl(var(--card) / 0.65) 50%,
              ${accent.replace(')', ' / 0.25)')} 100%)`,
            boxShadow: 'inset 0 1px 0 hsl(0 0% 100% / 0.45), 0 4px 12px -4px hsl(0 0% 0% / 0.18)',
          }}
        />
      )}

      {/* Roof */}
      {!isWireframe && renderRoof(building.type, dims, accent)}

      {/* Windows */}
      {!isWireframe && (
        <span className="absolute inset-x-1 top-2 bottom-2 flex flex-col justify-around pointer-events-none">
          {Array.from({ length: dims.windowRows }).map((_, r) => (
            <span key={r} className="flex justify-around">
              {Array.from({ length: dims.windowCols }).map((__, c) => {
                const lit = (r * 3 + c + (building.id.charCodeAt(0) % 5)) % 4 !== 0;
                return (
                  <span
                    key={c}
                    className="rounded-[2px] border border-white/30"
                    style={{
                      width: Math.max(2, unit * 0.18),
                      height: Math.max(2, unit * 0.18),
                      background: lit
                        ? `linear-gradient(180deg, ${accent.replace(')', ' / 0.9)')}, ${accent.replace(')', ' / 0.55)')})`
                        : 'hsl(var(--muted) / 0.5)',
                      boxShadow: lit ? `0 0 4px ${accent.replace(')', ' / 0.6)')}` : 'none',
                    }}
                  />
                );
              })}
            </span>
          ))}
        </span>
      )}

      {!isWireframe && (
        <span
          className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-t-[3px] border border-white/30"
          style={{
            width: Math.max(4, unit * 0.35),
            height: Math.max(4, unit * 0.4),
            background: `linear-gradient(180deg, ${accent.replace(')', ' / 0.6)')}, ${accent.replace(')', ' / 0.3)')})`,
          }}
        />
      )}

      {/* Neglected overlay */}
      {state === 'neglected' && (
        <>
          <span className="absolute inset-0 rounded-[8px] bg-foreground/30 mix-blend-multiply pointer-events-none" />
          <span className="absolute -top-1 -right-1 text-xs">🌿</span>
        </>
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Per-type sizing & roofs                                            */
/* ------------------------------------------------------------------ */

function getDims(type: Building['type'], unit: number) {
  const presets: Record<Building['type'], { w: number; h: number; windowRows: number; windowCols: number }> = {
    house:         { w: unit * 1.5, h: unit * 1.8, windowRows: 1, windowCols: 2 },
    apartment:     { w: unit * 1.6, h: unit * 4.5, windowRows: 5, windowCols: 3 },
    shop:          { w: unit * 1.8, h: unit * 1.6, windowRows: 1, windowCols: 3 },
    cafe:          { w: unit * 1.5, h: unit * 1.7, windowRows: 1, windowCols: 2 },
    office:        { w: unit * 1.7, h: unit * 4.0, windowRows: 4, windowCols: 3 },
    school:        { w: unit * 2.4, h: unit * 2.4, windowRows: 2, windowCols: 4 },
    library:       { w: unit * 2.0, h: unit * 2.2, windowRows: 2, windowCols: 3 },
    gym:           { w: unit * 2.0, h: unit * 1.8, windowRows: 1, windowCols: 3 },
    hospital:      { w: unit * 2.2, h: unit * 3.4, windowRows: 4, windowCols: 4 },
    park:          { w: unit * 2.0, h: unit * 1.0, windowRows: 0, windowCols: 0 },
    tower:         { w: unit * 1.4, h: unit * 6.0, windowRows: 7, windowCols: 2 },
    town_hall:     { w: unit * 2.6, h: unit * 2.6, windowRows: 2, windowCols: 4 },
    police:        { w: unit * 1.8, h: unit * 2.2, windowRows: 2, windowCols: 3 },
    fire:          { w: unit * 1.8, h: unit * 2.2, windowRows: 2, windowCols: 3 },
    factory:       { w: unit * 2.6, h: unit * 2.4, windowRows: 2, windowCols: 5 },
    statue:        { w: unit * 1.0, h: unit * 2.4, windowRows: 0, windowCols: 0 },
    studio:        { w: unit * 1.8, h: unit * 2.0, windowRows: 2, windowCols: 3 },
    temple:        { w: unit * 2.2, h: unit * 2.4, windowRows: 1, windowCols: 3 },
    meditation:    { w: unit * 1.8, h: unit * 1.6, windowRows: 1, windowCols: 2 },
    bank:          { w: unit * 2.0, h: unit * 2.6, windowRows: 3, windowCols: 3 },
    cathedral:     { w: unit * 2.6, h: unit * 4.0, windowRows: 3, windowCols: 3 },
    stadium:       { w: unit * 3.2, h: unit * 2.2, windowRows: 1, windowCols: 5 },
    grand_library: { w: unit * 2.8, h: unit * 3.2, windowRows: 3, windowCols: 4 },
  };
  return presets[type];
}

function renderRoof(type: Building['type'], dims: { w: number; h: number }, accent: string) {
  switch (type) {
    case 'house':
    case 'cafe':
      return (
        <span
          className="absolute -top-2 left-0 right-0"
          style={{
            height: dims.w * 0.4,
            background: accent,
            clipPath: 'polygon(0 100%, 50% 0, 100% 100%)',
            opacity: 0.85,
          }}
        />
      );
    case 'tower':
      return (
        <span
          className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-t-full"
          style={{ width: 4, height: 12, background: accent }}
        />
      );
    case 'town_hall':
      return (
        <span
          className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-white/50"
          style={{
            width: dims.w * 0.4,
            height: dims.w * 0.4,
            background: `radial-gradient(circle at 30% 30%, ${accent.replace(')', ' / 0.95)')}, ${accent.replace(')', ' / 0.5)')})`,
          }}
        />
      );
    case 'factory':
      return (
        <>
          <span
            className="absolute -top-2 left-3 rounded-sm"
            style={{ width: 4, height: 10, background: accent, opacity: 0.85 }}
          />
          <span
            className="absolute -top-3 left-7 rounded-sm"
            style={{ width: 4, height: 14, background: accent, opacity: 0.85 }}
          />
        </>
      );
    case 'park':
      return (
        <>
          <span
            className="absolute -top-3 left-1/4 rounded-full"
            style={{ width: 14, height: 14, background: 'hsl(145 45% 48%)' }}
          />
          <span
            className="absolute -top-4 right-1/4 rounded-full"
            style={{ width: 18, height: 18, background: 'hsl(145 55% 42%)' }}
          />
        </>
      );
    case 'statue':
      return (
        <span
          className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full"
          style={{
            width: 10,
            height: 10,
            background: accent,
            boxShadow: `0 0 12px ${accent.replace(')', ' / 0.8)')}`,
          }}
        />
      );
    default:
      return null;
  }
}

function categoryToken(c: Building['category']) {
  // Only legacy category vars are defined in index.css; map new ones to them.
  switch (c) {
    case 'study':
    case 'growth':
      return 'category-study';
    case 'work':
    case 'finance':
      return 'category-work';
    case 'health':
    case 'habits':
      return 'category-habits';
    case 'home':
    case 'creative':
    case 'social':
    case 'personal':
    default:
      return 'category-personal';
  }
}

/* ------------------------------------------------------------------ */
/*  Info modal                                                         */
/* ------------------------------------------------------------------ */

function BuildingInfoModal({
  building,
  onClose,
}: {
  building: Building;
  onClose: () => void;
}) {
  const info = BUILDING_INFO[building.type];

  return (
    <>
      <div
        className="absolute inset-0 z-[140] bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 z-[150] animate-scale-in">
        <div className="glass-ultra rounded-[1.75rem] p-5">
          <div className="flex items-start gap-3">
            <div className="w-14 h-14 rounded-2xl bg-accent/40 flex items-center justify-center text-3xl">
              {info.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-title text-foreground truncate">{info.label}</h3>
              <p className="text-micro">{info.kind}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-accent/50 transition ios-press"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <p className="text-caption mt-3">{info.description}</p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <Stat icon={<Users className="w-4 h-4" />} label="Members" value={building.meta.members} />
            {building.meta.floors !== undefined && (
              <Stat icon={<Layers className="w-4 h-4" />} label="Floors" value={building.meta.floors} />
            )}
            {building.meta.shops !== undefined && (
              <Stat icon={<Store className="w-4 h-4" />} label="Shops" value={building.meta.shops} />
            )}
          </div>

          <div className="mt-4 text-micro">
            Unlocked {new Date(building.unlockedAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="glass rounded-xl p-2 text-center">
      <div className="flex items-center justify-center gap-1 text-primary">{icon}</div>
      <p className="text-sm font-bold text-foreground mt-1">{value}</p>
      <p className="text-micro">{label}</p>
    </div>
  );
}
