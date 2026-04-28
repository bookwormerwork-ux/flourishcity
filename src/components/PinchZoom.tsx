import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface PinchZoomProps {
  children: React.ReactNode;
  className?: string;
  minScale?: number;
  maxScale?: number;
}

/**
 * Lightweight pinch / wheel zoom + pan wrapper. No library dependency.
 * Supports double-tap to reset. Touch-first.
 */
export function PinchZoom({
  children,
  className,
  minScale = 1,
  maxScale = 3,
}: PinchZoomProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);

  const state = useRef({
    pinching: false,
    startDist: 0,
    startScale: 1,
    panning: false,
    startX: 0,
    startY: 0,
    startTx: 0,
    startTy: 0,
    lastTap: 0,
  });

  const clamp = (s: number) => Math.max(minScale, Math.min(maxScale, s));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const dist = (touches: TouchList) => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.hypot(dx, dy);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        state.current.pinching = true;
        state.current.startDist = dist(e.touches);
        state.current.startScale = scale;
      } else if (e.touches.length === 1 && scale > 1) {
        state.current.panning = true;
        state.current.startX = e.touches[0].clientX;
        state.current.startY = e.touches[0].clientY;
        state.current.startTx = tx;
        state.current.startTy = ty;
      }
      // double-tap detect
      const now = Date.now();
      if (e.touches.length === 1 && now - state.current.lastTap < 280) {
        if (scale > 1.1) {
          setScale(1);
          setTx(0);
          setTy(0);
        } else {
          setScale(2);
        }
      }
      state.current.lastTap = now;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (state.current.pinching && e.touches.length === 2) {
        e.preventDefault();
        const d = dist(e.touches);
        const ratio = d / state.current.startDist;
        setScale(clamp(state.current.startScale * ratio));
      } else if (state.current.panning && e.touches.length === 1) {
        e.preventDefault();
        const dx = e.touches[0].clientX - state.current.startX;
        const dy = e.touches[0].clientY - state.current.startY;
        setTx(state.current.startTx + dx);
        setTy(state.current.startTy + dy);
      }
    };

    const onTouchEnd = () => {
      state.current.pinching = false;
      state.current.panning = false;
      if (scale <= 1.05) {
        setScale(1);
        setTx(0);
        setTy(0);
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && Math.abs(e.deltaY) < 5) return;
      e.preventDefault();
      const delta = -e.deltaY * 0.01;
      setScale((s) => clamp(s + delta));
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    el.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('wheel', onWheel);
    };
  }, [scale, tx, ty, minScale, maxScale]);

  return (
    <div ref={ref} className={cn('relative overflow-hidden touch-none', className)}>
      <div
        style={{
          transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
          transformOrigin: 'center center',
          transition: state.current.pinching || state.current.panning
            ? 'none'
            : 'transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          willChange: 'transform',
        }}
        className="w-full h-full"
      >
        {children}
      </div>
      {scale > 1.05 && (
        <button
          onClick={() => {
            setScale(1);
            setTx(0);
            setTy(0);
          }}
          className="absolute top-2 right-2 z-20 px-3 py-1.5 rounded-full glass-subtle text-xs font-semibold ios-press"
        >
          Reset
        </button>
      )}
    </div>
  );
}
