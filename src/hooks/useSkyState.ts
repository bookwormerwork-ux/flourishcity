import { useEffect, useState } from 'react';
import { SKY_REFRESH_MS, SkyState, getSkyState } from '@/lib/timeOfDay';

export function useSkyState(): SkyState {
  const [sky, setSky] = useState<SkyState>(() => getSkyState());
  useEffect(() => {
    const id = setInterval(() => setSky(getSkyState()), SKY_REFRESH_MS);
    return () => clearInterval(id);
  }, []);
  return sky;
}
