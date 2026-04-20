import { useLocalStorage } from './useLocalStorage';

export type DeviceFrameId =
  | 'iphone-se'
  | 'iphone-x'
  | 'iphone-12'
  | 'iphone-12-pro-max'
  | 'iphone-15-pro'
  | 'iphone-15-pro-max'
  | 'ipad-mini'
  | 'mac'
  | 'fit';

export interface DeviceFrame {
  id: DeviceFrameId;
  label: string;
  width: number;
  height: number;
  radius: string;
  category: 'phone' | 'tablet' | 'desktop' | 'auto';
}

export const DEVICE_FRAMES: DeviceFrame[] = [
  { id: 'fit', label: 'Fit to Screen', width: 0, height: 0, radius: '0', category: 'auto' },
  { id: 'iphone-se', label: 'iPhone SE', width: 375, height: 667, radius: '2.5rem', category: 'phone' },
  { id: 'iphone-x', label: 'iPhone X', width: 375, height: 812, radius: '3rem', category: 'phone' },
  { id: 'iphone-12', label: 'iPhone 12', width: 390, height: 844, radius: '3rem', category: 'phone' },
  { id: 'iphone-15-pro', label: 'iPhone 15 Pro', width: 393, height: 852, radius: '3.25rem', category: 'phone' },
  { id: 'iphone-12-pro-max', label: 'iPhone 12 Pro Max', width: 428, height: 926, radius: '3.25rem', category: 'phone' },
  { id: 'iphone-15-pro-max', label: 'iPhone 15 Pro Max', width: 430, height: 932, radius: '3.5rem', category: 'phone' },
  { id: 'ipad-mini', label: 'iPad Mini', width: 540, height: 820, radius: '2rem', category: 'tablet' },
  { id: 'mac', label: 'Mac (Desktop)', width: 1024, height: 768, radius: '1rem', category: 'desktop' },
];

export function useDeviceFrame() {
  const [frameId, setFrameId] = useLocalStorage<DeviceFrameId>('flourish-device-frame', 'iphone-12');
  const frame = DEVICE_FRAMES.find(f => f.id === frameId) ?? DEVICE_FRAMES[3];
  return { frame, frameId, setFrameId, frames: DEVICE_FRAMES };
}
