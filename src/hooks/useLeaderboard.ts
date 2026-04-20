import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface LeaderboardRow {
  user_id: string;
  xp: number;
  streak: number;
  tasks_completed: number;
  display_name: string;
  avatar: string;
}

export function useLeaderboard() {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase
      .from('leaderboard_scores')
      .select('user_id, xp, streak, tasks_completed, profiles!inner(display_name, avatar)')
      .order('xp', { ascending: false })
      .limit(100);

    if (data) {
      setRows(
        data.map((r: any) => ({
          user_id: r.user_id,
          xp: r.xp,
          streak: r.streak,
          tasks_completed: r.tasks_completed,
          display_name: r.profiles.display_name,
          avatar: r.profiles.avatar,
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel('leaderboard-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leaderboard_scores' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return { rows, loading, refresh: load };
}

export function useSyncMyScore(xp: number, streak: number, tasksCompleted: number) {
  const { user } = useAuth();
  useEffect(() => {
    if (!user) return;
    const t = setTimeout(() => {
      supabase
        .from('leaderboard_scores')
        .upsert({ user_id: user.id, xp, streak, tasks_completed: tasksCompleted, updated_at: new Date().toISOString() })
        .then(() => {});
    }, 500);
    return () => clearTimeout(t);
  }, [user, xp, streak, tasksCompleted]);
}
