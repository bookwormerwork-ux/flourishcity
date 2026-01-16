import { GlassPanel } from '@/components/GlassPanel';
import { CityStats } from '@/types/game';
import { 
  Trash2, 
  Download, 
  Info, 
  Sparkles,
  Heart
} from 'lucide-react';
import { useState } from 'react';

interface SettingsTabProps {
  cityStats: CityStats;
  onResetData: () => void;
}

export function SettingsTab({ cityStats, onResetData }: SettingsTabProps) {
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
    onResetData();
    setShowResetConfirm(false);
    window.location.reload();
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>

      {/* About */}
      <GlassPanel>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-foreground">Flourish</h2>
            <p className="text-sm text-muted-foreground">Version 1.0</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          A civilization-powered productivity app where your tasks help your city grow.
        </p>
      </GlassPanel>

      {/* Data management */}
      <GlassPanel>
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Info className="w-4 h-4" />
          Data Management
        </h3>
        
        <div className="space-y-3">
          <button
            onClick={handleExport}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-accent/30 hover:bg-accent/50 transition-colors text-left"
          >
            <Download className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Export Data</p>
              <p className="text-xs text-muted-foreground">Download your tasks and city progress</p>
            </div>
          </button>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-destructive/10 hover:bg-destructive/20 transition-colors text-left"
          >
            <Trash2 className="w-5 h-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Reset Everything</p>
              <p className="text-xs text-muted-foreground">Start fresh with a new city</p>
            </div>
          </button>
        </div>
      </GlassPanel>

      {/* Reset confirmation */}
      {showResetConfirm && (
        <GlassPanel className="border-2 border-destructive/30">
          <p className="text-sm text-foreground mb-4">
            Are you sure? This will delete all your tasks and reset your city. This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowResetConfirm(false)}
              className="flex-1 py-2 px-4 rounded-xl bg-accent text-foreground font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleReset}
              className="flex-1 py-2 px-4 rounded-xl bg-destructive text-destructive-foreground font-medium"
            >
              Reset
            </button>
          </div>
        </GlassPanel>
      )}

      {/* Credits */}
      <div className="text-center py-4">
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
          Made with <Heart className="w-3 h-3 text-destructive" /> for productive dreamers
        </p>
      </div>
    </div>
  );
}
