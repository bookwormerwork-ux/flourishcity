import { GlassPanel } from '@/components/GlassPanel';
import { CityStats } from '@/types/game';
import { Trash2, Download, Sparkles, Heart, Moon, Sun, Monitor, Crown, ChevronRight, Code, X, Check, Smartphone, LogIn, LogOut, UserIcon } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { SpotifyMiniPlayer } from '@/components/SpotifyMiniPlayer';
import type { DeviceFrame, DeviceFrameId } from '@/hooks/useDeviceFrame';

interface SettingsTabProps {
  cityStats: CityStats;
  onResetData: () => void;
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  isPremium: boolean;
  isDeveloper?: boolean;
  plan: 'free' | 'monthly' | 'yearly';
  onUpgradeClick: () => void;
  onActivateDeveloper: (password: string) => boolean;
  onDeactivateDeveloper: () => void;
  frameId?: DeviceFrameId;
  onFrameChange?: (id: DeviceFrameId) => void;
  frames?: DeviceFrame[];
}

export function SettingsTab({
  cityStats,
  onResetData,
  theme,
  onThemeChange,
  isPremium,
  isDeveloper,
  plan,
  onUpgradeClick,
  onActivateDeveloper,
  onDeactivateDeveloper,
  frameId,
  onFrameChange,
  frames
}: SettingsTabProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDevPanel, setShowDevPanel] = useState(false);
  const [devPassword, setDevPassword] = useState('');
  const [devError, setDevError] = useState(false);
  const [devSuccess, setDevSuccess] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

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

  const handleDevSubmit = () => {
    const success = onActivateDeveloper(devPassword);
    if (success) {
      setDevSuccess(true);
      setDevError(false);
      setTimeout(() => {
        setShowDevPanel(false);
        setDevPassword('');
        setDevSuccess(false);
      }, 1000);
    } else {
      setDevError(true);
      setTimeout(() => setDevError(false), 2000);
    }
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
      <GlassPanel className={isPremium ? "glass-premium" : ""} variant="strong">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
            isPremium 
              ? "bg-gradient-to-br from-achievement-gold to-achievement-gold/60" 
              : "bg-primary/10"
          )}>
            <Crown className={cn("w-6 h-6 transition-all duration-300", isPremium ? "text-white" : "text-primary")} />
          </div>
          <div className="flex-1">
            <h2 className="text-title text-foreground">
              {isDeveloper ? 'Developer Mode' : isPremium ? 'Pro Member' : 'Free Plan'}
            </h2>
            <p className="text-caption">
              {isDeveloper ? 'All features unlocked' : isPremium ? `${plan === 'yearly' ? 'Yearly' : 'Monthly'} subscription` : 'Upgrade to unlock all features'}
            </p>
          </div>
          {!isPremium && (
            <button onClick={onUpgradeClick} className="pill-primary text-sm transition-all duration-300 hover:scale-[1.02]">
              Upgrade
            </button>
          )}
        </div>
      </GlassPanel>

      {/* Account */}
      <GlassPanel variant="strong">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-title text-foreground">Account</h2>
            <p className="text-caption truncate">
              {user ? user.email ?? 'Signed in' : 'Sign in to join the online leaderboard'}
            </p>
          </div>
          {user ? (
            <button onClick={signOut} className="pill-secondary text-xs flex items-center gap-1">
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          ) : (
            <button onClick={() => navigate('/auth')} className="pill-primary text-xs flex items-center gap-1">
              <LogIn className="w-3.5 h-3.5" /> Sign in
            </button>
          )}
        </div>
      </GlassPanel>

      {/* Spotify */}
      <SpotifyMiniPlayer />

      {/* Theme selector */}
      <GlassPanel variant="strong">
        <h3 className="text-title text-foreground mb-3">Appearance</h3>
        <div className="flex gap-2">
          {themeOptions.map(option => (
            <button
              key={option.value}
              onClick={() => onThemeChange(option.value)}
              className={cn(
                "flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-500 ios-press",
                theme === option.value
                  ? "bg-primary/10 border-2 border-primary"
                  : "bg-accent/30 border-2 border-transparent hover:bg-accent/50"
              )}
            >
              <option.icon className={cn(
                "w-5 h-5 transition-all duration-300",
                theme === option.value ? "text-primary" : "text-muted-foreground"
              )} />
              <span className={cn(
                "text-micro transition-all duration-300",
                theme === option.value ? "text-primary font-semibold" : ""
              )}>
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </GlassPanel>

      {/* Device frame selector */}
      {frames && onFrameChange && (
        <GlassPanel variant="strong">
          <div className="flex items-center gap-2 mb-3">
            <Smartphone className="w-5 h-5 text-primary" />
            <h3 className="text-title text-foreground">Device Frame</h3>
          </div>
          <p className="text-caption mb-3">Preview Flourish at different screen sizes</p>
          <div className="grid grid-cols-2 gap-2">
            {frames.map(f => (
              <button
                key={f.id}
                onClick={() => onFrameChange(f.id)}
                className={cn(
                  "flex flex-col items-start gap-0.5 p-3 rounded-2xl transition-all duration-300 ios-press text-left",
                  frameId === f.id
                    ? "bg-primary/10 border-2 border-primary"
                    : "bg-accent/30 border-2 border-transparent hover:bg-accent/50"
                )}
              >
                <span className={cn(
                  "text-sm font-semibold",
                  frameId === f.id ? "text-primary" : "text-foreground"
                )}>
                  {f.label}
                </span>
                <span className="text-micro">
                  {f.id === 'fit' ? 'Full screen' : `${f.width} × ${f.height}`}
                </span>
              </button>
            ))}
          </div>
        </GlassPanel>
      )}

      {/* About */}
      <GlassPanel variant="strong">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center animate-breathe">
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
      <GlassPanel variant="strong">
        <h3 className="text-title text-foreground mb-3">Data</h3>
        <div className="space-y-2">
          <button onClick={handleExport} className="w-full flex items-center gap-3 p-3 rounded-xl bg-accent/30 hover:bg-accent/50 transition-all duration-300 ios-press">
            <Download className="w-5 h-5 text-primary" />
            <span className="flex-1 text-left text-body text-foreground">Export Data</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <button onClick={() => setShowResetConfirm(true)} className="w-full flex items-center gap-3 p-3 rounded-xl bg-destructive/10 hover:bg-destructive/20 transition-all duration-300 ios-press">
            <Trash2 className="w-5 h-5 text-destructive" />
            <span className="flex-1 text-left text-body text-destructive">Reset Everything</span>
          </button>
        </div>
      </GlassPanel>

      {/* Developer mode */}
      <GlassPanel variant="strong">
        <button 
          onClick={() => setShowDevPanel(true)}
          className="w-full flex items-center gap-3 p-3 rounded-xl bg-accent/30 hover:bg-accent/50 transition-all duration-300 ios-press"
        >
          <Code className="w-5 h-5 text-muted-foreground" />
          <span className="flex-1 text-left text-body text-foreground">Developer Mode</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </GlassPanel>

      {/* Reset confirmation */}
      {showResetConfirm && (
        <>
          <div className="fixed inset-0 overlay-blur-strong z-40 animate-fade-in" onClick={() => setShowResetConfirm(false)} />
          <div className="fixed inset-6 z-50 flex items-center justify-center">
            <div className="glass-ultra rounded-[2rem] p-6 max-w-sm animate-scale-in">
              <p className="text-body text-foreground mb-4">
                Are you sure? This will delete all your progress. This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setShowResetConfirm(false)} className="flex-1 pill-secondary transition-all duration-300">Cancel</button>
                <button onClick={handleReset} className="flex-1 py-2 px-4 rounded-full bg-destructive text-destructive-foreground font-semibold transition-all duration-300 hover:opacity-90">Reset</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Developer panel */}
      {showDevPanel && (
        <>
          <div className="fixed inset-0 overlay-blur-strong z-40 animate-fade-in" onClick={() => setShowDevPanel(false)} />
          <div className="fixed inset-6 z-50 flex items-center justify-center">
            <div className="glass-ultra rounded-[2rem] p-6 max-w-sm w-full animate-scale-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-title text-foreground">Developer Mode</h3>
                <button onClick={() => setShowDevPanel(false)} className="p-2 rounded-xl hover:bg-accent/50 transition-all duration-300">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              
              {isDeveloper ? (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-success" />
                  </div>
                  <p className="text-body text-foreground mb-4">Developer mode is active</p>
                  <button 
                    onClick={() => {
                      onDeactivateDeveloper();
                      setShowDevPanel(false);
                    }}
                    className="pill-secondary w-full transition-all duration-300"
                  >
                    Deactivate
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-caption mb-4">Enter developer password to unlock all features</p>
                  <input
                    type="password"
                    value={devPassword}
                    onChange={(e) => setDevPassword(e.target.value)}
                    placeholder="Password"
                    className={cn(
                      "w-full p-3 rounded-xl bg-accent/30 border-2 text-foreground placeholder:text-muted-foreground outline-none transition-all duration-300",
                      devError ? "border-destructive shake" : "border-transparent focus:border-primary"
                    )}
                    onKeyDown={(e) => e.key === 'Enter' && handleDevSubmit()}
                  />
                  {devError && (
                    <p className="text-destructive text-sm mt-2 animate-fade-in">Incorrect password</p>
                  )}
                  {devSuccess && (
                    <div className="flex items-center justify-center gap-2 mt-4 text-success animate-scale-in">
                      <Check className="w-5 h-5" />
                      <span>Activated!</span>
                    </div>
                  )}
                  {!devSuccess && (
                    <button 
                      onClick={handleDevSubmit}
                      className="pill-primary w-full mt-4 transition-all duration-300 hover:scale-[1.02]"
                    >
                      Activate
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </>
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
