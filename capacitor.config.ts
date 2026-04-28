import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.b2585817a19049cf9b5a6ea76d62b529',
  appName: 'flourishcity',
  webDir: 'dist',
  server: {
    url: 'https://b2585817-a190-49cf-9b5a-6ea76d62b529.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  ios: {
    contentInset: 'always',
  },
};

export default config;
