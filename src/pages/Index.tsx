import { useState, useCallback } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { BottomNav } from '@/components/BottomNav';
import { AddTaskSheet } from '@/components/AddTaskSheet';
import { CityTab } from '@/components/views/CityTab';
import { TasksTab } from '@/components/views/TasksTab';
import { StatsTab } from '@/components/views/StatsTab';
import { SettingsTab } from '@/components/views/SettingsTab';
import { TaskCategory, TaskPriority } from '@/types/game';

type TabId = 'city' | 'tasks' | 'add' | 'stats' | 'settings';
type WeatherType = 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>('city');
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  const {
    tasks,
    activeTasks,
    completedTasks,
    todaysTasks,
    cityStats,
    weather,
    addTask,
    completeTask,
    deleteTask
  } = useGameState();

  const handleAddTask = useCallback((title: string, category: TaskCategory, priority: TaskPriority) => {
    addTask(title, category, priority);
  }, [addTask]);

  const handleCompleteTask = useCallback((id: string) => {
    completeTask(id);
    setCelebrating(true);
    setTimeout(() => setCelebrating(false), 600);
  }, [completeTask]);

  const handleResetData = useCallback(() => {
    // This will be handled by SettingsTab with a page reload
  }, []);

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
          />
        );
      case 'tasks':
        return (
          <TasksTab
            activeTasks={activeTasks}
            completedTasks={completedTasks}
            onCompleteTask={handleCompleteTask}
            onDeleteTask={deleteTask}
          />
        );
      case 'stats':
        return (
          <StatsTab
            cityStats={cityStats}
            tasks={tasks}
          />
        );
      case 'settings':
        return (
          <SettingsTab
            cityStats={cityStats}
            onResetData={handleResetData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/30 flex items-center justify-center p-4">
      {/* iPhone frame */}
      <div className="w-full max-w-[390px] h-[844px] bg-background rounded-[3rem] shadow-2xl overflow-hidden flex flex-col relative border border-border/50">
        {/* Status bar mockup */}
        <div className="h-12 flex items-center justify-center">
          <div className="w-32 h-6 bg-foreground/10 rounded-full" />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto px-5 pb-4">
          {renderActiveTab()}
        </main>

        {/* Bottom navigation */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onAddClick={() => setShowAddSheet(true)}
        />
      </div>

      {/* Add task sheet */}
      <AddTaskSheet
        isOpen={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        onAdd={handleAddTask}
      />
    </div>
  );
};

export default Index;
