import { useState, useCallback, useEffect } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { usePremium } from '@/hooks/usePremium';
import { useAchievements } from '@/hooks/useAchievements';
import { useTheme } from '@/hooks/useTheme';
import { useSchedule } from '@/hooks/useSchedule';
import { BottomNav } from '@/components/BottomNav';
import { AddTaskSheet } from '@/components/AddTaskSheet';
import { SubscriptionSheet } from '@/components/SubscriptionSheet';
import { DetailedCityView } from '@/components/DetailedCityView';
import { ReminderNotification } from '@/components/ReminderNotification';
import { CityTab } from '@/components/views/CityTab';
import { ScheduleTab } from '@/components/views/ScheduleTab';
import { AchievementsTab } from '@/components/views/AchievementsTab';
import { SettingsTab } from '@/components/views/SettingsTab';
import { TaskCategory, TaskPriority } from '@/types/game';

type TabId = 'city' | 'tasks' | 'add' | 'schedule' | 'achievements' | 'settings';
type WeatherType = 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>('city');
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [showDetailedCity, setShowDetailedCity] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  const { tasks, activeTasks, todaysTasks, cityStats, weather, addTask, completeTask, deleteTask } = useGameState();
  const { isPremium, plan, subscribe } = usePremium();
  const { achievements, unlockedCount, totalCount, checkAchievements } = useAchievements(cityStats, tasks);
  const { theme, setTheme } = useTheme();
  const { scheduleByHour, activeReminders, scheduleTask, dismissReminder } = useSchedule(tasks);

  // Check achievements when stats change
  useEffect(() => {
    checkAchievements();
  }, [cityStats.totalTasksCompleted, cityStats.streak, checkAchievements]);

  const handleAddTask = useCallback((title: string, category: TaskCategory, priority: TaskPriority) => {
    addTask(title, category, priority);
  }, [addTask]);

  const handleCompleteTask = useCallback((id: string) => {
    completeTask(id);
    setCelebrating(true);
    setTimeout(() => setCelebrating(false), 600);
  }, [completeTask]);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'city':
        return (
          <CityTab
            cityStats={cityStats}
            weather={weather as WeatherType}
            todaysTasks={todaysTasks}
            onCompleteTask={handleCompleteTask}
            onDeleteTask={deleteTask}
            celebrating={celebrating}
            onZoomClick={() => setShowDetailedCity(true)}
          />
        );
      case 'schedule':
        return (
          <ScheduleTab
            tasks={activeTasks}
            scheduleByHour={scheduleByHour}
            onScheduleTask={scheduleTask}
            onCompleteTask={handleCompleteTask}
            isPremium={isPremium}
            onUpgradeClick={() => setShowSubscription(true)}
          />
        );
      case 'achievements':
        return (
          <AchievementsTab
            achievements={achievements}
            unlockedCount={unlockedCount}
            totalCount={totalCount}
            isPremium={isPremium}
          />
        );
      case 'settings':
        return (
          <SettingsTab
            cityStats={cityStats}
            onResetData={() => {}}
            theme={theme}
            onThemeChange={setTheme}
            isPremium={isPremium}
            plan={plan}
            onUpgradeClick={() => setShowSubscription(true)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-accent/20 flex items-center justify-center p-4">
      {/* iPhone frame */}
      <div className="w-full max-w-[390px] h-[844px] bg-background rounded-[3rem] shadow-2xl overflow-hidden flex flex-col relative border border-border/30">
        {/* Status bar mockup */}
        <div className="h-12 flex items-center justify-center safe-area-pt">
          <div className="w-28 h-7 bg-foreground/10 rounded-full" />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto px-5 pb-4 scrollbar-hide">
          {renderActiveTab()}
        </main>

        {/* Bottom navigation */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onAddClick={() => setShowAddSheet(true)}
        />
      </div>

      {/* Reminder notifications */}
      {activeReminders.map(reminder => (
        <ReminderNotification
          key={reminder.id}
          reminder={reminder}
          onDismiss={dismissReminder}
          onComplete={handleCompleteTask}
        />
      ))}

      {/* Sheets */}
      <AddTaskSheet isOpen={showAddSheet} onClose={() => setShowAddSheet(false)} onAdd={handleAddTask} />
      <SubscriptionSheet isOpen={showSubscription} onClose={() => setShowSubscription(false)} onSubscribe={subscribe} currentPlan={plan} />
      <DetailedCityView isOpen={showDetailedCity} onClose={() => setShowDetailedCity(false)} stats={cityStats} weather={weather as WeatherType} activeTasks={activeTasks} isPremium={isPremium} onUpgradeClick={() => { setShowDetailedCity(false); setShowSubscription(true); }} />
    </div>
  );
};

export default Index;
