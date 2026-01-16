import { useLocalStorage } from './useLocalStorage';

export interface PremiumState {
  isPremium: boolean;
  plan: 'free' | 'monthly' | 'yearly';
  subscribedAt?: string;
  expiresAt?: string;
}

const DEFAULT_PREMIUM_STATE: PremiumState = {
  isPremium: false,
  plan: 'free'
};

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
      expiresAt: expires.toISOString()
    });
  };

  const cancelSubscription = () => {
    setPremiumState(DEFAULT_PREMIUM_STATE);
  };

  // Check if subscription has expired
  const checkExpiry = () => {
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
    cancelSubscription
  };
}
