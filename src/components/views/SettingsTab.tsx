import { GlassPanel } from '@/components/GlassPanel';
import { CityStats } from '@/types/game';
import { Trash2, Download, Sparkles, Heart, Moon, Sun, Monitor, Crown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface SettingsTabProps {
  cityStats: CityStats;
  onResetData: () => void;
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  isPremium: boolean;
  plan: 'free' | 'monthly' | 'yearly';
  onUpgradeClick: () => void;
}

export function SettingsTab({ cityStats, onResetData, theme, onThemeChange, isPremium, plan, onUpgradeClick }: SettingsTabProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleExport = () => {
    const data = {
      tasks: JSON.parse(localStorage.getItem('flourish-tasks') || '[]'),
      city: JSON.parse(localStorage.getItem('flourish-city') || '{}'),
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flourish-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    localStorage.removeItem('flourish-tasks');
    localStorage.removeItem('flourish-city');
    localStorage.removeItem('flourish-achievements');
    onResetData();
    setShowResetConfirm(false);
    window.location.reload();
  };

  const themeOptions = [
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
    { value: 'system' as const, icon: Monitor, label: 'Auto' },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-headline text-foreground">Settings</h1>

      {/* Premium status */}
      <GlassPanel className={isPremium ? "glass-premium" : ""}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center",
            isPremium 
              ? "bg-gradient-to-br from-achievement-gold to-achievement-gold/60" 
              : "bg-primary/10"
          )}>
            <Crown className={cn("w-6 h-6", isPremium ? "text-white" : "text-primary")} />
          </div>
          <div className="flex-1">
            <h2 className="text-title text-foreground">
              {isPremium ? 'Pro Member' : 'Free Plan'}
            </h2>
            <p className="text-caption">
              {isPremium ? `${plan === 'yearly' ? 'Yearly' : 'Monthly'} subscription` : 'Upgrade to unlock all features'}
            </p>
          </div>
          {!isPremium && (
            <button onClick={onUpgradeClick} className="pill-primary text-sm">
              Upgrade
            </button>
          )}
        </div>
      </GlassPanel>

      {/* Theme selector */}
      <GlassPanel>
        <h3 className="text-title text-foreground mb-3">Appearance</h3>
        <div className="flex gap-2">
          {themeOptions.map(option => (
            <button
              key={option.value}
              onClick={() => onThemeChange(option.value)}
              className={cn(
                "flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ios-press",
                theme === option.value
                  ? "bg-primary/10 border-2 border-primary"
                  : "bg-accent/30 border-2 border-transparent hover:bg-accent/50"
              )}
            >
              <option.icon className={cn(
                "w-5 h-5",
                theme === option.value ? "text-primary" : "text-muted-foreground"
              )} />
              <span className={cn(
                "text-micro",
                theme === option.value ? "text-primary font-semibold" : ""
              )}>
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </GlassPanel>

      {/* About */}
      <GlassPanel>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-title text-foreground">Flourish</h2>
            <p className="text-caption">Version 1.0</p>
          </div>
        </div>
        <p className="text-caption">
          A civilization-powered productivity app where your tasks help your city grow.
        </p>
      </GlassPanel>

      {/* Data management */}
      <GlassPanel>
        <h3 className="text-title text-foreground mb-3">Data</h3>
        <div className="space-y-2">
          <button onClick={handleExport} className="w-full flex items-center gap-3 p-3 rounded-xl bg-accent/30 hover:bg-accent/50 transition-colors ios-press">
            <Download className="w-5 h-5 text-primary" />
            <span className="flex-1 text-left text-body text-foreground">Export Data</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <button onClick={() => setShowResetConfirm(true)} className="w-full flex items-center gap-3 p-3 rounded-xl bg-destructive/10 hover:bg-destructive/20 transition-colors ios-press">
            <Trash2 className="w-5 h-5 text-destructive" />
            <span className="flex-1 text-left text-body text-destructive">Reset Everything</span>
          </button>
        </div>
      </GlassPanel>

      {/* Reset confirmation */}
      {showResetConfirm && (
        <GlassPanel className="border-2 border-destructive/30">
          <p className="text-body text-foreground mb-4">
            Are you sure? This will delete all your progress. This cannot be undone.
          </p>
          <div className="flex gap-2">
            <button onClick={() => setShowResetConfirm(false)} className="flex-1 pill-secondary">Cancel</button>
            <button onClick={handleReset} className="flex-1 py-2 px-4 rounded-full bg-destructive text-destructive-foreground font-semibold">Reset</button>
          </div>
        </GlassPanel>
      )}

      {/* Credits */}
      <div className="text-center py-4">
        <p className="text-micro flex items-center justify-center gap-1">
          Made with <Heart className="w-3 h-3 text-destructive animate-pulse" /> for productive dreamers
        </p>
      </div>
    </div>
  );
}
