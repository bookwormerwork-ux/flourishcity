import { cn } from '@/lib/utils';
import { Home, CheckSquare, Calendar, BarChart3, Settings, Plus } from 'lucide-react';

type TabId = 'city' | 'tasks' | 'add' | 'stats' | 'settings';

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onAddClick: () => void;
}

export function BottomNav({ activeTab, onTabChange, onAddClick }: BottomNavProps) {
  const tabs = [
    { id: 'city' as TabId, icon: Home, label: 'City' },
    { id: 'tasks' as TabId, icon: CheckSquare, label: 'Tasks' },
    { id: 'add' as TabId, icon: Plus, label: 'Add', isAction: true },
    { id: 'stats' as TabId, icon: BarChart3, label: 'Stats' },
    { id: 'settings' as TabId, icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="glass-strong rounded-t-3xl px-2 py-2 safe-area-pb">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          
          if (tab.isAction) {
            return (
              <button
                key={tab.id}
                onClick={onAddClick}
                className="relative -mt-6 p-4 rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 active:scale-95 transition-all spring-bounce-sm"
              >
                <Icon className="w-6 h-6" />
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all spring-bounce-sm min-w-[64px]",
                activeTab === tab.id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-all",
                activeTab === tab.id && "bg-primary/10"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
