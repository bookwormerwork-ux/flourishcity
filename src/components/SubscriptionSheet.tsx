import { useState } from 'react';
import { cn } from '@/lib/utils';
import { X, Check, Crown, Sparkles, Bell, Calendar, Award, Zap } from 'lucide-react';

interface SubscriptionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (plan: 'monthly' | 'yearly') => void;
  currentPlan: 'free' | 'monthly' | 'yearly';
}

export function SubscriptionSheet({ isOpen, onClose, onSubscribe, currentPlan }: SubscriptionSheetProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    onSubscribe(selectedPlan);
    setIsProcessing(false);
    onClose();
  };

  const features = [
    { icon: Calendar, text: 'Full schedule & reminders' },
    { icon: Bell, text: 'Smart notifications' },
    { icon: Award, text: 'Exclusive achievements' },
    { icon: Zap, text: 'Unlimited city zoom' },
    { icon: Sparkles, text: 'Premium city themes' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 overlay-blur z-40 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 animate-slide-up">
        <div className="max-w-md mx-auto">
          <div className="glass-strong rounded-t-[2rem] p-6 pb-8">
            {/* Handle bar */}
            <div className="w-12 h-1.5 bg-muted/30 rounded-full mx-auto mb-4" />
            
            {/* Close button */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-accent/50 transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-achievement-gold to-achievement-gold/60 flex items-center justify-center mx-auto mb-4 shadow-lg animate-float">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-headline text-foreground">Upgrade to Pro</h2>
              <p className="text-caption mt-1">
                Unlock the full potential of your city
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-6">
              {features.map((feature, i) => (
                <div 
                  key={i}
                  className="flex items-center gap-3 animate-fade-in"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <feature.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-body text-foreground">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Plan options */}
            <div className="space-y-3 mb-6">
              {/* Yearly - Highlighted */}
              <button
                onClick={() => setSelectedPlan('yearly')}
                className={cn(
                  "w-full p-4 rounded-2xl border-2 transition-all ios-press relative overflow-hidden",
                  selectedPlan === 'yearly'
                    ? "border-primary bg-primary/5"
                    : "border-border/50 bg-accent/20 hover:bg-accent/40"
                )}
              >
                {/* Best value badge */}
                <div className="absolute top-0 right-0">
                  <div className="bg-gradient-to-r from-success to-success/80 text-success-foreground text-xs font-bold px-3 py-1 rounded-bl-xl">
                    SAVE 43%
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                    selectedPlan === 'yearly'
                      ? "border-primary bg-primary"
                      : "border-muted"
                  )}>
                    {selectedPlan === 'yearly' && (
                      <Check className="w-4 h-4 text-primary-foreground" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-title text-foreground">Yearly</p>
                    <p className="text-caption">Billed annually</p>
                  </div>
                  <div className="text-right">
                    <p className="text-headline text-foreground">$3.99</p>
                    <p className="text-micro">/month</p>
                  </div>
                </div>
              </button>

              {/* Monthly */}
              <button
                onClick={() => setSelectedPlan('monthly')}
                className={cn(
                  "w-full p-4 rounded-2xl border-2 transition-all ios-press",
                  selectedPlan === 'monthly'
                    ? "border-primary bg-primary/5"
                    : "border-border/50 bg-accent/20 hover:bg-accent/40"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                    selectedPlan === 'monthly'
                      ? "border-primary bg-primary"
                      : "border-muted"
                  )}>
                    {selectedPlan === 'monthly' && (
                      <Check className="w-4 h-4 text-primary-foreground" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-title text-foreground">Monthly</p>
                    <p className="text-caption">Billed monthly</p>
                  </div>
                  <div className="text-right">
                    <p className="text-headline text-foreground">$6.99</p>
                    <p className="text-micro">/month</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Subscribe button */}
            <button
              onClick={handleSubscribe}
              disabled={isProcessing}
              className={cn(
                "w-full py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 transition-all",
                "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-button",
                "hover:opacity-95 active:scale-[0.98]",
                isProcessing && "opacity-70 cursor-wait"
              )}
            >
              {isProcessing ? (
                <div className="w-6 h-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  <span className="text-xl"></span>
                  Subscribe with Apple Pay
                </>
              )}
            </button>

            {/* Terms */}
            <p className="text-center text-micro mt-4">
              Cancel anytime. Terms apply.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
