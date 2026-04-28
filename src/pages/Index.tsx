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
import { VerifyTaskModal } from '@/components/VerifyTaskModal';
import { CouncilReportModal } from '@/components/CouncilReportModal';
import { BuildingCinematic } from '@/components/BuildingCinematic';
import { CityPostcardModal } from '@/components/CityPostcardModal';
import { MoodCheckIn } from '@/components/MoodCheckIn';
import { TaskCategory, TaskPriority, TaskDifficulty, Task, Building } from '@/types/game';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { haptic } from '@/lib/haptics';

type TabId = 'city' | 'tasks' | 'add' | 'schedule' | 'achievements' | 'leaderboard' | 'settings';
type WeatherType = 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>('city');
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [showDetailedCity, setShowDetailedCity] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  const [verifyingTask, setVerifyingTask] = useState<Task | null>(null);
  const beforePhotosRef = useRef<Record<string, string>>({});

  const [councilText, setCouncilText] = useState<string | null>(null);

  // New: cinematic, postcard, mood
  const [cinematicBuilding, setCinematicBuilding] = useState<Building | null>(null);
  const [showPostcard, setShowPostcard] = useState(false);
  const [showMood, setShowMood] = useState(false);
  const [moodLastShown, setMoodLastShown] = useLocalStorage<string>('flourish-mood-last-day', '');

  const {
    tasks,
    activeTasks,
    debtTasks,
    todaysTasks,
    cityStats,
    weather,
    addTask,
    completeTask,
    deleteTask,
    isCategoryOnCooldown,
    addCitizenDemand,
    dismissCitizenDemand,
    addCouncilReport,
    acknowledgeCrisis,
  } = useGameState();
  const { isPremium, plan, isDeveloper, subscribe, activateDeveloperMode, deactivateDeveloperMode } = usePremium();
  const { achievements, unlockedCount, totalCount, checkAchievements } = useAchievements(cityStats, tasks);
  const { theme, setTheme } = useTheme();
  const { scheduleByHour, activeReminders, scheduleTask, dismissReminder } = useSchedule(tasks);
  const { frame, frameId, setFrameId, frames } = useDeviceFrame();

  // Detect a brand-new building added to the city → cinematic + haptic
  const lastBuildingCountRef = useRef(cityStats.buildings.length);
  useEffect(() => {
    const prev = lastBuildingCountRef.current;
    const curr = cityStats.buildings.length;
    if (curr > prev) {
      const added = cityStats.buildings.slice(prev);
      const newCompleted = [...added].reverse().find(
        (b) => !b.state || b.state === 'completed',
      );
      if (newCompleted) {
        setCinematicBuilding(newCompleted);
        haptic('success');
      }
    }
    lastBuildingCountRef.current = curr;
  }, [cityStats.buildings]);

  // Mood check-in: once per day, after a short delay
  useEffect(() => {
    const today = new Date().toDateString();
    if (moodLastShown === today) return;
    const t = setTimeout(() => setShowMood(true), 1500);
    return () => clearTimeout(t);
  }, [moodLastShown]);

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

  const debtsWarnedRef = useRef(false);
  useEffect(() => {
    if (debtTasks.length >= 5 && !debtsWarnedRef.current) {
      debtsWarnedRef.current = true;
      toast({
        title: 'Faith is wavering',
        description: 'The scaffolding is overwhelming your skyline. Your people are losing faith.',
      });
    }
    if (debtTasks.length < 5) debtsWarnedRef.current = false;
  }, [debtTasks.length]);

  // Council report — fire once per mount if 7+ days have passed
  useEffect(() => {
    const last = cityStats.lastCouncilReportAt
      ? new Date(cityStats.lastCouncilReportAt).getTime()
      : 0;
    const sevenDays = 7 * 24 * 3600 * 1000;
    if (Date.now() - last < sevenDays) return;
    if (cityStats.totalTasksCompleted < 1) return;

    const completedThisWeek = tasks.filter(
      (t) => t.completed && t.completedAt && Date.now() - new Date(t.completedAt).getTime() < sevenDays,
    );
    const abandoned = tasks.filter((t) => t.status === 'abandoned').length;
    const hardest =
      completedThisWeek.find((t) => t.difficulty === 'hard')?.title ||
      completedThisWeek[0]?.title ||
      'a small step';

    supabase.functions
      .invoke('council-report', {
        body: {
          cityName: cityStats.cityName || 'Flourish',
          tasksCompleted: completedThisWeek.length,
          tasksAbandoned: abandoned,
          population: cityStats.population,
          happiness: cityStats.happiness,
          hardestTask: hardest,
          debts: debtTasks.length,
        },
      })
      .then(({ data, error }) => {
        if (error || !data?.text) return;
        setCouncilText(data.text);
        addCouncilReport(data.text);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Citizen demand every 3 completions
  const lastDemandAtRef = useRef(cityStats.totalTasksCompleted);
  useEffect(() => {
    if (cityStats.totalTasksCompleted === 0) return;
    if (cityStats.totalTasksCompleted % 3 !== 0) return;
    if (cityStats.totalTasksCompleted === lastDemandAtRef.current) return;
    lastDemandAtRef.current = cityStats.totalTasksCompleted;

    const recent = tasks
      .filter((t) => t.completed)
      .slice(0, 3)
      .map((t) => ({ title: t.title, category: t.category }));

    supabase.functions
      .invoke('citizen-demand', { body: { recentTasks: recent } })
      .then(({ data, error }) => {
        if (error || !data?.text) return;
        addCitizenDemand(data.text);
      });
  }, [cityStats.totalTasksCompleted, tasks, addCitizenDemand]);

  const [crisisOpen, setCrisisOpen] = useState(false);
  useEffect(() => {
    if (cityStats.happiness === 0 && !cityStats.decayShownCrisis) {
      setCrisisOpen(true);
    }
  }, [cityStats.happiness, cityStats.decayShownCrisis]);

  const handleAddTask = useCallback(
    (
      title: string,
      category: TaskCategory,
      priority: TaskPriority,
      scheduledDate: string | undefined,
      scheduledTime: string | undefined,
      opts: {
        estimatedDurationMinutes: number;
        difficulty: TaskDifficulty;
        isBigProject: boolean;
        bigProjectTotalSessions?: number;
        beforePhoto?: string;
      },
    ) => {
      const t = addTask(title, category, priority, scheduledDate, scheduledTime, {
        estimatedDurationMinutes: opts.estimatedDurationMinutes,
        difficulty: opts.difficulty,
        isBigProject: opts.isBigProject,
        bigProjectTotalSessions: opts.bigProjectTotalSessions,
        startNow: true,
      });
      if (opts.beforePhoto) {
        beforePhotosRef.current[t.id] = opts.beforePhoto;
      }
    },
    [addTask],
  );

  const handleCompleteTask = useCallback(
    (id: string) => {
      const t = tasks.find((x) => x.id === id);
      if (!t) return;
      if (t.estimatedDurationMinutes) {
        setVerifyingTask(t);
      } else {
        completeTask(id);
        setCelebrating(true);
        setTimeout(() => setCelebrating(false), 700);
      }
    },
    [tasks, completeTask],
  );

  const handleVerified = useCallback(() => {
    if (!verifyingTask) return;
    completeTask(verifyingTask.id);
    delete beforePhotosRef.current[verifyingTask.id];
    setVerifyingTask(null);
    setCelebrating(true);
    setTimeout(() => setCelebrating(false), 1200);
  }, [verifyingTask, completeTask]);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'city':
        return (
          <CityTab
            cityStats={cityStats}
            weather={weather as WeatherType}
            todaysTasks={todaysTasks}
            debtTasks={debtTasks}
            onCompleteTask={handleCompleteTask}
            onDeleteTask={deleteTask}
            onDismissDemand={dismissCitizenDemand}
            celebrating={celebrating}
            onZoomClick={() => setShowDetailedCity(true)}
            onPostcardClick={() => setShowPostcard(true)}
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

  const phoneContent = (
    <>
      <div className="h-12 flex items-center justify-center shrink-0">
        <div className="w-28 h-7 bg-foreground/10 rounded-full" />
      </div>

      {cityStats.happiness < 30 && cityStats.happiness > 0 && (
        <div className="px-5">
          <div className="glass-strong rounded-2xl px-4 py-2 text-sm text-destructive border border-destructive/30 text-center">
            ⚠️ Your citizens are struggling. They need you.
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto px-5 pb-4 scrollbar-hide relative">
        {renderActiveTab()}

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

      <div className="shrink-0 relative z-[200]">
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onAddClick={() => setShowAddSheet(true)}
        />
      </div>

      {activeReminders.map((reminder) => (
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
        isCategoryOnCooldown={isCategoryOnCooldown}
      />
      <SubscriptionSheet
        isOpen={showSubscription}
        onClose={() => setShowSubscription(false)}
        onSubscribe={subscribe}
        currentPlan={plan}
      />

      {verifyingTask && (
        <VerifyTaskModal
          task={verifyingTask}
          beforePhoto={beforePhotosRef.current[verifyingTask.id]}
          onClose={() => setVerifyingTask(null)}
          onVerified={handleVerified}
        />
      )}

      {councilText && (
        <CouncilReportModal text={councilText} onDismiss={() => setCouncilText(null)} />
      )}

      {crisisOpen && (
        <>
          <div className="fixed inset-0 overlay-blur-strong z-[140]" />
          <div className="fixed inset-x-6 top-1/2 -translate-y-1/2 z-[150] max-w-md mx-auto">
            <div className="glass-ultra rounded-[1.75rem] p-6 text-center">
              <div className="text-5xl mb-3">🌧️</div>
              <h2 className="text-headline mb-2 text-foreground">Flourish is in crisis</h2>
              <p className="text-caption mb-5">Your city has been abandoned.</p>
              <button
                onClick={() => { acknowledgeCrisis(); setCrisisOpen(false); }}
                className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-semibold"
              >
                I'm back — let's rebuild.
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );

  if (autoFit) {
    return (
      <div className="min-h-screen bg-background flex flex-col overflow-hidden">
        {phoneContent}
      </div>
    );
  }

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
