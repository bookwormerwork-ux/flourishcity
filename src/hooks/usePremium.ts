import { useLocalStorage } from './useLocalStorage';

export interface PremiumState {
  isPremium: boolean;
  plan: 'free' | 'monthly' | 'yearly';
  subscribedAt?: string;
  expiresAt?: string;
  isDeveloper?: boolean;
}

const DEFAULT_PREMIUM_STATE: PremiumState = {
  isPremium: false,
  plan: 'free',
  isDeveloper: false
};

// Developer password - in production this would be more secure
const DEV_PASSWORD = 'flourish2024dev';

export function usePremium() {
  const [premiumState, setPremiumState] = useLocalStorage<PremiumState>(
    'flourish-premium',
    DEFAULT_PREMIUM_STATE
  );

  const subscribe = (plan: 'monthly' | 'yearly') => {
    const now = new Date();
    const expires = new Date(now);
    
    if (plan === 'monthly') {
      expires.setMonth(expires.getMonth() + 1);
    } else {
      expires.setFullYear(expires.getFullYear() + 1);
    }

    setPremiumState({
      isPremium: true,
      plan,
      subscribedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      isDeveloper: premiumState.isDeveloper
    });
  };

  const cancelSubscription = () => {
    setPremiumState({
      ...DEFAULT_PREMIUM_STATE,
      isDeveloper: premiumState.isDeveloper
    });
  };

  const activateDeveloperMode = (password: string): boolean => {
    if (password === DEV_PASSWORD) {
      setPremiumState({
        isPremium: true,
        plan: 'yearly',
        isDeveloper: true,
        subscribedAt: new Date().toISOString()
      });
      return true;
    }
    return false;
  };

  const deactivateDeveloperMode = () => {
    setPremiumState(DEFAULT_PREMIUM_STATE);
  };

  // Check if subscription has expired (developers never expire)
  const checkExpiry = () => {
    if (premiumState.isDeveloper) {
      return true;
    }
    if (premiumState.expiresAt) {
      const expiryDate = new Date(premiumState.expiresAt);
      if (expiryDate < new Date()) {
        setPremiumState(DEFAULT_PREMIUM_STATE);
        return false;
      }
    }
    return premiumState.isPremium;
  };

  return {
    ...premiumState,
    isPremium: checkExpiry(),
    subscribe,
    cancelSubscription,
    activateDeveloperMode,
    deactivateDeveloperMode
  };
}
