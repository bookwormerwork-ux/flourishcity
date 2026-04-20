import { useState, useCallback, useEffect, useRef, useLayoutEffect } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { usePremium } from '@/hooks/usePremium';
import { useAchievements } from '@/hooks/useAchievements';
import { useTheme } from '@/hooks/useTheme';
import { useSchedule } from '@/hooks/useSchedule';
import { useDeviceFrame } from '@/hooks/useDeviceFrame';
import { BottomNav } from '@/components/BottomNav';
import { AddTaskSheet } from '@/components/AddTaskSheet';
import { SubscriptionSheet } from '@/components/SubscriptionSheet';
import { DetailedCityView } from '@/components/DetailedCityView';
import { ReminderNotification } from '@/components/ReminderNotification';
import { CityTab } from '@/components/views/CityTab';
import { ScheduleTab } from '@/components/views/ScheduleTab';
import { AchievementsTab } from '@/components/views/AchievementsTab';
import { LeaderboardTab } from '@/components/views/LeaderboardTab';
import { SettingsTab } from '@/components/views/SettingsTab';
import { TaskCategory, TaskPriority } from '@/types/game';

type TabId = 'city' | 'tasks' | 'add' | 'schedule' | 'achievements' | 'leaderboard' | 'settings';
type WeatherType = 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>('city');
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [showDetailedCity, setShowDetailedCity] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  const { tasks, activeTasks, todaysTasks, cityStats, weather, addTask, completeTask, deleteTask } = useGameState();
  const { isPremium, plan, isDeveloper, subscribe, activateDeveloperMode, deactivateDeveloperMode } = usePremium();
  const { achievements, unlockedCount, totalCount, checkAchievements } = useAchievements(cityStats, tasks);
  const { theme, setTheme } = useTheme();
  const { scheduleByHour, activeReminders, scheduleTask, dismissReminder } = useSchedule(tasks);
  const { frame, frameId, setFrameId, frames } = useDeviceFrame();

  // Auto-fit scaling for the phone frame
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [autoFit, setAutoFit] = useState(false);

  useLayoutEffect(() => {
    if (frame.id === 'fit') {
      setAutoFit(true);
      setScale(1);
      return;
    }
    setAutoFit(false);
    const compute = () => {
      const padding = 32;
      const availW = window.innerWidth - padding;
      const availH = window.innerHeight - padding;
      const s = Math.min(1, availW / frame.width, availH / frame.height);
      setScale(s);
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, [frame.id, frame.width, frame.height]);

  useEffect(() => {
    checkAchievements();
  }, [cityStats.totalTasksCompleted, cityStats.streak, checkAchievements]);

  const handleAddTask = useCallback((
    title: string,
    category: TaskCategory,
    priority: TaskPriority,
    scheduledDate?: string,
    scheduledTime?: string
  ) => {
    addTask(title, category, priority, scheduledDate, scheduledTime);
  }, [addTask]);

  const handleCompleteTask = useCallback((id: string) => {
    completeTask(id);
    setCelebrating(true);
    setTimeout(() => setCelebrating(false), 700);
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
            tasks={tasks}
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
      case 'leaderboard':
        return (
          <LeaderboardTab
            cityStats={cityStats}
            isPremium={isPremium}
            onUpgradeClick={() => setShowSubscription(true)}
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
            isDeveloper={isDeveloper}
            plan={plan}
            onUpgradeClick={() => setShowSubscription(true)}
            onActivateDeveloper={activateDeveloperMode}
            onDeactivateDeveloper={deactivateDeveloperMode}
            frameId={frameId}
            onFrameChange={setFrameId}
            frames={frames}
          />
        );
      default:
        return null;
    }
  };

  // The actual phone content
  const phoneContent = (
    <>
      {/* Status bar */}
      <div className="h-12 flex items-center justify-center shrink-0">
        <div className="w-28 h-7 bg-foreground/10 rounded-full" />
      </div>

      {/* Main content - scrollable */}
      <main className="flex-1 overflow-y-auto px-5 pb-4 scrollbar-hide relative">
        {renderActiveTab()}

        {/* Detailed city view rendered INSIDE the phone frame */}
        {showDetailedCity && (
          <DetailedCityView
            isOpen={showDetailedCity}
            onClose={() => setShowDetailedCity(false)}
            stats={cityStats}
            weather={weather as WeatherType}
            activeTasks={activeTasks}
            isPremium={isPremium}
            onUpgradeClick={() => { setShowDetailedCity(false); setShowSubscription(true); }}
          />
        )}
      </main>

      {/* Bottom navigation - FIXED, never scrolls */}
      <div className="shrink-0 relative z-[200]">
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onAddClick={() => setShowAddSheet(true)}
        />
      </div>

      {/* Sheets and reminders inside the frame so they stay clipped */}
      {activeReminders.map(reminder => (
        <ReminderNotification
          key={reminder.id}
          reminder={reminder}
          onDismiss={dismissReminder}
          onComplete={handleCompleteTask}
        />
      ))}

      <AddTaskSheet
        isOpen={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        onAdd={handleAddTask}
      />
      <SubscriptionSheet
        isOpen={showSubscription}
        onClose={() => setShowSubscription(false)}
        onSubscribe={subscribe}
        currentPlan={plan}
      />
    </>
  );

  // Auto-fit mode: phone fills the whole screen
  if (autoFit) {
    return (
      <div className="min-h-screen bg-background flex flex-col overflow-hidden">
        {phoneContent}
      </div>
    );
  }

  // Framed mode: scale to fit viewport
  return (
    <div
      ref={wrapperRef}
      className="min-h-screen bg-gradient-to-b from-background via-background to-accent/20 flex items-center justify-center p-4 overflow-hidden"
    >
      <div
        style={{
          width: frame.width,
          height: frame.height,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          borderRadius: frame.radius,
        }}
        className="bg-background shadow-2xl overflow-hidden flex flex-col relative border border-border/30 transition-all duration-300"
      >
        {phoneContent}
      </div>
    </div>
  );
};

export default Index;
